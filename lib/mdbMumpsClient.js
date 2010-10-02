/*

mdbMumpsClient.js

node.js client for M/DB:Mumps (HTTP-enabled GT.M or Cache instance)

Based on a modification of node-apac by Dustin McQuay (dmcquay)

29 September 2010, M/Gateway Developments Ltd

This is released as Open Source without restriction


This module will interface with a GT.M system onto which M/DB:Mumps and the m_apache
gateway has been installed (both products available from www.mgateway.com)

You can rapidly create a fully-configured, ready to run GT.M system on a Ubuntu Linux 
server, VM or EC2 machine, complete with M/DB:Mumps and m_apache by using Mike 
Clayton's M/DB Installer - details at www.mgateway.com


APIs are as follows:

- Set       (sets a global, using the specified subscripts and data value)
- Get       (gets a global node, using the specified subscripts)
- SetJSON   (maps a JSON object to a Mumps global)
- GetJSON   (returns a JSON object from Mumps global storage)
- Kill      (deletes a global node, using the specified subscripts)
- Order     (returns the next subscript at a specified level of global subscripting)
- OrderAll  (returns an array containing all subscript values for a specified level of subscripting)
- Increment (Atomically increments a global node, using the specified subscripts)
- Decrement (Atomically decrements a global node, using the specified subscripts)
- Version   (returns the M/DB:Mumps build number and date)

eg

To set the global:  

   ^mdbmTest("check","this","out")="Too cool!"

and then retrieve the value again (note the asynchronous nature of node.js will 
not guarantee the order in which the APIs below are executed in the Mumps back-end)

****************************

var sys = require("sys");
var mdbmif = require("./mdbMumpsClient");

var mdbm = new mdbmif.Client({
   mdbId:'rob',
   mdbSecret:'xxxxxxxx',
   endPoint: '127.0.0.1'
});

mdbm.execute('Set', 'mdbmTest', {
      Subscripts:["check","this","out"],
      DataValue:"Too cool!"
   },
   function(error, results) {
          if (error) { 
             sys.print('Error: ' + error + "\n");
             sys.puts(results.ErrorCode + ": " + results.ErrorMessage + "\n"); 
          }
          else {
            sys.puts(results.ok + "\n");
          }
   }
);

mdbm.execute('Get', 'mdbmTest', ["check","this","out"],
   function(error, results) {
          if (error) { 
             sys.print('Error: ' + error + "\n");
             sys.puts(results.ErrorCode + ": " + results.ErrorMessage + "\n"); 
          }
          else {
            sys.puts("dataStatus=" + results.dataStatus + "\nvalue=" + results.value + "\n");
          }
   }
);

*************************

Note: this global node could also have been created using SetJSON:

 var json = {"check":{"this":{"out":"Too cool!"}}};

 mdbm.execute('SetJSON', 'mdbmTest', json,
   function(error, results) {
          if (error) { 
             sys.print('Error: ' + error + "\n");
             sys.puts(results.ErrorCode + ": " + results.ErrorMessage + "\n"); 
          }
          else {
            sys.puts(results.ok);
          }
   }
 );

and the original JSON could be retrieved using:

mdbm.execute('GetJSON', 'mdbmTest','',
   function(error, results) {
          if (error) { 
             sys.print('Error: ' + error + "\n");
             sys.puts(results.ErrorCode + ": " + results.ErrorMessage + "\n"); 
          }
          else {
            sys.puts(JSON.stringify(results));
          }
   }
);


*/

var http = require('http');
var crypto = require('crypto');

var sys = require("sys");

var OperationHelper = function(params) {
    this.init(params);
};

OperationHelper.defaultMethod = 'GET';
OperationHelper.version = '2009-04-15';
OperationHelper.defaultEndPoint = '127.0.0.1';
OperationHelper.defaultBaseUri = '/mdb/request.mgwsi';

OperationHelper.prototype.init = function(params) {
    params = params || {};

    // check requried params
    if (typeof(params.mdbId)     === 'undefined') { throw 'Missing M/DB User Key Id param' }
    if (typeof(params.mdbSecret) === 'undefined') { throw 'Missing M/DB Secret param' }


    // set instance variables from params
    this.httpMethod = params.httpMethod || OperationHelper.defaultMethod;
    this.mdbId     = params.mdbId;
    this.mdbSecret = params.mdbSecret;
    this.endPoint  = params.endPoint || OperationHelper.defaultEndPoint;
    this.baseUri   = params.baseUri || OperationHelper.defaultBaseUri;
};


OperationHelper.prototype.generateParams = function(operation, reference, params) {
    params.Version = OperationHelper.version;
    params.Action = operation;
    params.MDBAccessKeyId = this.mdbId;
    params.OutputFormat = 'JSON';
    params.Reference = reference;
    params.SignatureVersion = 2;
    params.SignatureMethod = 'HmacSHA1';
    params.db = 'mdbm';
    return params;
};

OperationHelper.prototype.digest = function(x) {
    var secretKey = this.mdbSecret;
    var hmac = crypto.createHmac('sha1', secretKey);
    hmac.update(x);
    return hmac.digest('base64');
};

OperationHelper.prototype.sign = function(params) {
    // append params
    params.Timestamp = this.generateTimestamp();

    // generate signature
    var canonical = this.canonicalize(params);
    var stringToSign = [
        this.httpMethod,
        this.endPoint,
        this.baseUri,
        canonical
    ].join("\n");

    params.Signature = this.digest(stringToSign);
    return params;
};

OperationHelper.prototype.zeroPad = function(num, length) {
    num = num + '';
    while (num.length < length) {
        num = '0' + num;
    }
    return num;
};

OperationHelper.prototype.generateTimestamp = function() {
    var now = new Date(),
        year = now.getFullYear(),
        month = this.zeroPad(now.getUTCMonth() + 1, 2),
        day = this.zeroPad(now.getUTCDate(), 2),
        hours = this.zeroPad(now.getUTCHours(), 2),
        mins = this.zeroPad(now.getUTCMinutes(), 2),
        secs = this.zeroPad(now.getUTCSeconds(), 2);
    return [year, month, day].join('-') + 'T' +
        [hours, mins, secs].join(':') + 'Z';
};

OperationHelper.prototype.escape = function(x) {
    return escape(x).replace(/%7E/g, '~').replace(/\*/g, '%2A').replace(/\+/g, '%2B');
};

OperationHelper.prototype.canonicalize = function(params) {
    var parts = [];
    for (var key in params) {
        parts.push([this.escape(key), this.escape(params[key])].join('='));
    }
    return parts.sort().join('&');
};

OperationHelper.prototype.execute = function(operation, modifiers, json, callback) {
    if (typeof(operation) === 'undefined') { throw 'Missing operation parameter' }
    var params = {};
    var reference = '';
    params.DeleteBeforeSave = 0;

    if (typeof(modifiers) !== 'undefined') {
       if (typeof(modifiers) === 'object') {
           if (modifiers.Reference) reference = modifiers.Reference;
           if (reference === '' && modifiers.GlobalName) reference = modifiers.GlobalName;
           if (modifiers.DeleteBeforeSave) params.DeleteBeforeSave = 1;
       }
       else {
          reference = modifiers;
          modifiers = {};
       }
    }
    else {
       modifiers = {};
    }

   //sys.puts("reference=" + reference);
   params = this.generateParams(operation, reference, params);

    if (typeof(json) !== 'undefined') {
       if (json !== '') {
          //sys.puts('json=' + json);
          params.JSON = JSON.stringify(json);
          //sys.puts('json string=' + params.JSON);
       }
    }

    params = this.sign(params);
    var queryString = this.canonicalize(params);
    var uri = this.baseUri + '?' + queryString;
    var host = this.endPoint;
    var mdbClient = http.createClient(80, host);
    var request = mdbClient.request('GET', uri, {'host':host});
    request.end();
    request.on('response', function(response) {
        var responseBody = '';
        response.setEncoding('utf8');
        response.on('data', function(chunk) {
            responseBody += chunk.toString();
        });
        response.on('end', function() {
            var respObj = {};
            var statusCode = response.statusCode == 200 ? null : response.statusCode;
            //sys.puts(responseBody);
            if (statusCode === null) {
              if (responseBody === '') {
                if (statusCode === null) statusCode = 999;
                respObj.ErrorCode = "EmptyResponseBody"
                respObj.ErrorMessage = "An empty response body was returned";
              }
              else if (responseBody.indexOf("<HTML>")!==-1) {
                if (statusCode === null) statusCode = 999;
                respObj.ErrorCode = "HTMLResponseBody"
                respObj.ErrorMessage = responseBody;
              }
              else if (responseBody.indexOf("Error calling web function")!==-1) {
                if (statusCode === null) statusCode = 999;
                respObj.ErrorCode = "HTMLResponseBody"
                respObj.ErrorMessage = responseBody;
              }
              else {
                respObj = JSON.parse(responseBody);
              }
            }
            else {
                respObj = JSON.parse(responseBody);
            }
            callback(statusCode,respObj);
        });
    });
};

exports.Client = OperationHelper;

