import fetch from "node-fetch";
import sha256 from "js-sha256";

const { JOOMAG_API_ENDPOINT } = process.env;
const { JOOMAG_API_ID } = process.env;
const { JOOMAG_API_SECRET } = process.env;

// cache mechanism assumes all cache items stored with same timeout/max age
// this makes the cache removal very efficient, can find find all items that
// need removing and then stop.
var lastCacheCleanup = Date.now();
var maxCacheCleanupInterval = 30000;
var cacheMaxAgeMs = 30000;
var cache = {};
var cacheByAge = new Array();
async function removeOldCacheEntries(maxAge) {
	// only do a cache cleanup if we haven't in 
	if(lastCacheCleanup < (Date.now() - maxCacheCleanupInterval)) {
		lastCacheCleanup = Date.now();
		
		var deleteCount = 0;
		for(var i = 0; i< cacheByAge.length && cacheByAge[i].ts < maxAge; i ++) {
		  deleteCount++;
		}

		if(deleteCount > 0) {
			for(var i = 0; i < deleteCount; i++) {
				console.log(`Clearing: ${cacheByAge[i].key}, \n  ${cacheByAge[i].ts},\n  ${cache[cacheByAge[i].key].ts}`);
				if(cache[cacheByAge[i].key] === cacheByAge[i]) {
					delete cache[cacheByAge[i].key];
				}
			}
			cacheByAge.splice(0, deleteCount);
		}
		
		console.log(`Cleared ${deleteCount} cache items.`);
	}
}

exports.handler = async (event, context) => {
  var startDate = new Date();
  
  var maxAge = Date.now() - cacheMaxAgeMs;
  
  var regex = /^[A-Za-z0-9]{5,100}$/;
  
  var pubid = event.queryStringParameters.pubid;
  
  if(! pubid || !pubid.match(regex)) {
	  throw "pubid must be ^[a-zA-Z0-9]{5,100}$";
  }
  
  var cresult = cache[pubid];
  
  // 30 second cache
  if(cresult && cresult.ts && cresult.ts > maxAge) {
	console.log(`Cache hit: ${pubid}`);
	var result = 
	{
	  statusCode: 200,
	  headers: {
		  "Content-Type": "application/vnd.cpu.republivision.v1+json",
		  "Access-Control-Allow-Origin": "*",
		  "x-joomag-cache-status": "hit"
	  },
	  body: cresult.data
	};
	
	return result;
  } else {
	console.log(`Cache miss: ${pubid}`);
  }
  
  var apiEndpoint = JOOMAG_API_ENDPOINT + "/magazines/" + pubid + "/issues"
  var sigInput = "GET" + apiEndpoint;
  var sigHmac = sha256.hmac(JOOMAG_API_SECRET, sigInput);
  
  var start = Date.now();
  
  // in parallel fetch latest and clear out old cache items
  return Promise.all([
	fetch(apiEndpoint, {headers: {key: JOOMAG_API_ID, sig: sigHmac }}),
	removeOldCacheEntries(maxAge)
  ])
	.then(response => response[0].json())
    .then(function(data){
		var responseJson = JSON.stringify(data.data);
		
		console.log({
			ts: startDate.toISOString(),
			duration: (Date.now() - start),
			pubid: pubid, 
			status: "OK",
			length: responseJson.length,
			jmStatus: data.error,
			jmMsg: data.message,
			rsp100: responseJson.substr(0, 100)
			});
		
		var result = 
		{
		  statusCode: 200,
		  headers: {
			  "Content-Type": "application/vnd.cpu.republivision.v1+json",
			  "Access-Control-Allow-Origin": "*",
			  "x-joomag-cache-status": "miss"
		  },
		  body: responseJson
		};
		
		var cacheItem = {ts: Date.now(), key: pubid, data: responseJson};
		cache[pubid] = cacheItem;
		cacheByAge.push(cacheItem);
		
		return result;
	})
    .catch(function(error){
		var err = String(error);
		
		console.error({
			ts: startDate.toISOString(),
			duration: (Date.now() - start),
			pubid: pubid, 
			status: "ERROR",
			"error": err
			});
		
		var result = { statusCode: 500, body: err };
		
		return result;
	});
};

