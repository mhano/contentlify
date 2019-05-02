'use strict';
import uuidv4 from "uuid/v4";

class FaaSCache {
	/**
	 * Usage, construct a global instance of FaaSCache, add/get items from it per normal memory cache, when spare cycles are available
	 * (such as during an async call like fetch typically just prior to adding the result to the cache) call removeOldCacheEntriesAsync 
	 * to clear out old cache items. e.g. Promise.all([myFetch(args), faasCache.removeOldCacheEntriesAsync()]).then(...);
	 * 
	 * Note* removeOldCacheEntriesAsync is essentially synchronous so should be added to the async queue last (after initiating fetches etc.).
	 * 
	 * FaaSCache is designed to reduce impact on down stream systems from spikes of front-end traffic. I.e. caching the result of a request that
	 * takes 100ms for a short period (e.g. seconds to minutes).
	 * 
	 * Cache suitable for hundreds to tens of thousands of items (in testing a modest desktop would do 1M+ expired cache item deletes per second). Unlikely
	 * to be sensible to have a single FaaS caching more than this. If you need heavier weight / longer lived cache items suggest redis et.al. (which
	 * you could use in combination with shorter lived caching in FaaS memory by FaaSCache).
	 * 
	 * @param {Int} maxAgeMs - Cache item max age / cache duration (use seperate FaaSCache instances for different items with different expiry periods)
	 * @param {Int} minCleanupIntervalMs - Don't cleanup memory cache more often than this
	 * @param {String} traceProcId - Process / FaaS instance ID for tracing / logging.
	 * @param {Int} forceSynchronousCleanupOnAddAfterMs - If cache cleanup is not being called regularly force a cleanup on add after this (to prevent never ending memory usage growth)
	 */
	constructor(maxAgeMs = 30000, minCleanupIntervalMs = 30000, traceProcId = null, forceSynchronousCleanupOnAddAfterMs = 90000) {
		// cache mechanism assumes all cache items stored with same timeout/max age
		// this makes the cache removal very efficient, can find find all items that
		// need removing and then stop.
		this.lastCacheCleanup = Date.now();
		this.minCleanupIntervalMs = minCleanupIntervalMs;
		this.maxAgeMs = maxAgeMs;
		this.forceSynchronousCleanupOnAddAfterMs = forceSynchronousCleanupOnAddAfterMs;
		this.cache = {};
		this.cacheByAge = new Array();
		this.traceProcId = traceProcId || uuidv4();
	}

	get(key) {
		const cacheItem = this.cache[key];
		const maxAge = Date.now() - this.maxAgeMs;

		if (((cacheItem && cacheItem.ts && cacheItem.ts > maxAge) === true)) {
			return cacheItem.value;
		}

		return null;
	}

	set(key, value) {
		const cacheItem = { ts: Date.now(), key: key, value: value };

		const currVal = this.cache[key];
		if (currVal) {
			// if we are to abandon a copy in cacheByAge, delete the value component to save memory
			// leaving only a pointer to be cleaned up (typically asynchronously)
			delete currVal.value;
		}

		this.cache[key] = cacheItem;
		this.cacheByAge.push(cacheItem);

		// prevents never ending memory growth (memory leak) if cache is miss-used or due to the opportunistic
		// clean-up calls not being made (or not frequently enough).
		if (this.lastCacheCleanup < (Date.now() - this.forceSynchronousCleanupOnAddAfterMs)) {
			console.warn({
				ts: (new Date()).toISOString(),
				"event": "synchronousCacheCleanupWarning",
				warning: `Asynchronouse cleanup not called sufficiently often, forcing synchronous cleanup.`,
				traceProcId: this.traceProcId
			});

			this.removeOldCacheEntries();
		}
	}

	async removeOldCacheEntriesAsync() {
		this.removeOldCacheEntries();
	}

	removeOldCacheEntries() {
		const now = Date.now();
		const maxAge = now - this.maxAgeMs;

		// only do a cache cleanup if we haven't in n milliseconds
		if (this.lastCacheCleanup < (Date.now() - this.minCleanupIntervalMs)) {
			this.lastCacheCleanup = Date.now();

			let deleteCount = 0;
			let deletedObjectCount = 0;
			let cacheItem = null;
			for (let i = 0; i < this.cacheByAge.length && (cacheItem = this.cacheByAge[i]).ts < maxAge; i++) {
				// cacheByAge can contain hangover pointers to old items, early in the array, don't want to 
				// delete a fresh cache item whilst we clean up old pointers (note, the data of these old items)
				// will already be cleared out.. the pointers are dropped with a bulk array.splice below.
				if (this.cache[cacheItem.key] === cacheItem) {
					delete this.cache[cacheItem.key];
					deletedObjectCount++;
				}
				deleteCount++;
			}

			if (deleteCount > 0) {
				this.cacheByAge.splice(0, deleteCount);
			}

			console.log({
				ts: (new Date()).toISOString(), "event": "cacheCleanup", traceProcId: this.traceProcId,
				objects: deletedObjectCount, pointers: deleteCount, duration: (Date.now() - now)
			});
		}
	}
}

export default FaaSCache;