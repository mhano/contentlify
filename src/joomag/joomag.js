import fetch from "node-fetch";
import sha256 from "js-sha256";
import uuidv4 from "uuid/v4";
import FaaSCache from "./faascache.js";

const { JOOMAG_API_ENDPOINT } = process.env;
const { JOOMAG_API_ID } = process.env;
const { JOOMAG_API_SECRET } = process.env;
const { JOOMAG_API_TIMEOUT_MS } = process.env;

const procid = uuidv4();
console.log({ ts: (new Date()).toISOString(), "event": "started", procid: procid });

function nameOf(obj) {
    return Object.keys(obj)[0];
}

const faasCache = new FaaSCache(60000, 30000, procid);

const regex = /^[A-Za-z0-9]{5,100}$/;

exports.handler = async (event, context) => {
    // environment / config variables
    if (!(JOOMAG_API_ENDPOINT && JOOMAG_API_ID && JOOMAG_API_SECRET)) {
        throw `Bad config/deployment, JOOMAG_API_* must be configured (${nameOf({ JOOMAG_API_ENDPOINT })}, ${nameOf({ JOOMAG_API_ID })}, ${nameOf({ JOOMAG_API_SECRET })})`;
    }
    const timeoutMs = parseInt(JOOMAG_API_TIMEOUT_MS) || 9000;

    // reuqest variables
    const pubid = event.queryStringParameters.pubid;
    if (!pubid || !pubid.match(regex)) {
        throw `Pubid parameter must be a basic alpha-numeric publication ID from joomag matching the following regex: ${regex}`;
    }

    var cresult = faasCache.get(pubid);

    console.log({ ts: (new Date()).toISOString(), "event": "request", procid, pubid, cacheHit: (cresult != null) });

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
    const sigHmac = sha256.hmac(JOOMAG_API_SECRET, `GET${apiEndpoint}`);

    const start = Date.now();

    return Promise.all([
            fetch(apiEndpoint, { headers: { key: JOOMAG_API_ID, sig: sigHmac }, timeout: timeoutMs }),
            // in parallel fetch latest and clear out old cache items (as in FaaS this is otherwise wasted paid for compute)
            faasCache.removeOldCacheEntriesAsync()
        ])
        .then(response => response[0].json())
        .then(function(data) {
            const responseJson = JSON.stringify(data.data);

            console.log({
                ts: (new Date()).toISOString(),
                "event": "apiCallSuccess",
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
        .catch(function(error) {
            const err = String(error);

            console.error({
                ts: (new Date()).toISOString(),
                "event": "apicallError",
                procid,
                duration: (Date.now() - start),
                pubid: pubid,
                status: "ERROR",
                "error": err
            });

            const result = { statusCode: 500, body: err };

            return result;
        });
};