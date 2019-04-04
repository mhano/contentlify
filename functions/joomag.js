import sha256 from 'js-sha256';
import fetch from "node-fetch";

const { JOOMAG_API_ENDPOINT } = process.env;
const { JOOMAG_API_ID } = process.env;
const { JOOMAG_API_SECRET } = process.env;

exports.handler = async (event, context) => {
  
  var pubid = event.queryStringParameters.pubid; // M0805154001554340774
  var apiEndpoint = API_ENDPOINT + "/magazines/" + pubid + "/issues"
  var sigInput = "GET" + url;
  var sigHmac = sha256.hmac(JOOMAG_API_SECRET, query);
  
  return fetch(apiEndpoint, {
	  key: JOOMAG_API_ID,
	  sig: sigHmac
	})
    .then(response => response.json())
    .then(data => ({
      statusCode: 200,
	  contentType: "application/vnd.cpu.republivision.v1+json",
      body: JSON.stringify(data)
    }))
    .catch(error => ({ statusCode: 422, body: String(error) }));
};