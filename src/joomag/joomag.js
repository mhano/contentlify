import fetch from "node-fetch";
import sha256 from "js-sha256";

const { JOOMAG_API_ENDPOINT } = process.env;
const { JOOMAG_API_ID } = process.env;
const { JOOMAG_API_SECRET } = process.env;

exports.handler = async (event, context) => {
  var startDate = new Date();
  
  var regex = /^[A-Za-z0-9]{5,100}$/;
  
  var pubid = event.queryStringParameters.pubid;
  
  if(! pubid || !pubid.match(regex)) {
	  throw "pubid must be ^[a-zA-Z0-9]{5,100}$";
  }
  
  var apiEndpoint = JOOMAG_API_ENDPOINT + "/magazines/" + pubid + "/issues"
  var sigInput = "GET" + apiEndpoint;
  var sigHmac = sha256.hmac(JOOMAG_API_SECRET, sigInput);
  
  var start = Date.now();
  
  return fetch(apiEndpoint, {headers: {key: JOOMAG_API_ID, sig: sigHmac }})
    .then(response => response.json())
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
			  "Access-Control-Allow-Origin": "*"
		  },
		  body: responseJson
		};
		
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

