import fetch from "node-fetch";
import sha256 from "js-sha256";
import uuidv4 from "uuid/v4";
import FaaSCache from "./faascache.js";
import AbortController from 'abort-controller';

const { JOOMAG_API_ENDPOINT } = process.env;
const { JOOMAG_API_ID } = process.env;
const { JOOMAG_API_SECRET } = process.env;

const procid = uuidv4();
console.log({ ts: (new Date()).toISOString(), "event": "started", procid: procid });

function nameOf(obj) {
    return Object.keys(obj)[0];
}

const faasCache = new FaaSCache(60000, 30000, procid);

const regex = /^[A-Za-z0-9]{5,100}$/;

exports.handler = async (event, context) => {
    const pubid = event.queryStringParameters.pubid;

    if (!(JOOMAG_API_ENDPOINT && JOOMAG_API_ID && JOOMAG_API_SECRET)) {
        throw `bad config/deployment, JOOMAG_API_* must be configured (${nameOf({ JOOMAG_API_ENDPOINT })}, ${nameOf({ JOOMAG_API_ID })}, ${nameOf({ JOOMAG_API_SECRET })})`;
    }

    if (!pubid || !pubid.match(regex)) {
        throw `pubid parameter must be a basic alpha-numeric publication ID from joomag matching the following regex: ${regex}`;
    }

    var cresult = faasCache.get(pubid);

    const cacheHit = (cresult != null);
    console.log({ ts: (new Date()).toISOString(), "event": "request", procid, pubid, cacheHit });

    if (cresult != null) {
        return ({
            statusCode: 200,
            headers: {
                "Content-Type": "application/vnd.cpu.republivision.v1+json",
                "x-joomag-cache-status": "hit"
            },
            body: cresult
        });
    }

    const apiEndpoint = `${JOOMAG_API_ENDPOINT}/magazines/${pubid}/issues`;
    const sigInput = `GET${apiEndpoint}`;
    const sigHmac = sha256.hmac(JOOMAG_API_SECRET, sigInput);

	const start = Date.now();

    const controller = new AbortController();
    const timeout = setTimeout(
        () => { controller.abort(); },
        1500,
    );

    return Promise.all([
            fetch(apiEndpoint, { headers: { key: JOOMAG_API_ID, sig: sigHmac }, signal: controller.signal }),
            // in parallel fetch latest and clear out old cache items (as in FaaS this is otherwise wasted paid for compute)
            faasCache.removeOldCacheEntriesAsync()
        ])
        .then(response => response[0].json())
        .then(function (data) {
            const responseJson = JSON.stringify(data.data);

            console.log({
                ts: (new Date()).toISOString(),
                "event": "apicallresult",
                procid,
                duration: (Date.now() - start),
                pubid: pubid,
                status: "OK",
                length: responseJson.length,
                jmStatus: data.error,
                jmMsg: data.message,
                rsp100: responseJson.substr(0, 100)
            });

            const result =
            {
                statusCode: 200,
                headers: {
                    "Content-Type": "application/vnd.cpu.republivision.v1+json",
                    "x-joomag-cache-status": "miss"
                },
                body: responseJson
            };

            faasCache.set(pubid, responseJson);

            return result;
        })
        .catch(function (error) {
            const err = String(error);

            console.error({
                ts: (new Date()).toISOString(),
                "event": "apicallerror",
                procid,
                duration: (Date.now() - start),
                pubid: pubid,
                status: "ERROR",
                "error": err
            });

            const result = { statusCode: 500, body: err };

            return result;
		}).then(() => { // finally
            clearTimeout(timeout);
        });;
};

// exports.handler({ queryStringParameters: { pubid: "M0045150001555469988" } });

