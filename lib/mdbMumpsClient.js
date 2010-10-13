/*

mdbMumpsClient.js

Node.js client for M/DB:Mumps (HTTP-enabled GT.M or Cache instance)

Inspired by node-apac (my thanks to Dustin McQuay [dmcquay])

13 October 2010: Rob Tweed, M/Gateway Developments Ltd

------------------------------------------------------
Copyright (c) 2004-10 M/Gateway Developments Ltd,
Reigate, Surrey UK.
All rights reserved.

http://www.mgateway.com
Email: rtweed@mgateway.com

This program is free software: you can redistribute it
and/or modify it under the terms of the 
GNU Affero General Public License as published by the 
Free Software Foundation, either version 3 of the License, 
or (at your option) any later version.

This program is distributed in the hope that it will be 
useful, but WITHOUT ANY WARRANTY; without even the 
implied warranty of MERCHANTABILITY or FITNESS FOR A 
PARTICULAR PURPOSE.  See the GNU Affero General Public 
License for more details.

You should have received a copy of the GNU Affero 
General Public License along with this program.  
If not, see <http://www.gnu.org/licenses/>.
----------------------------------------------------------
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
    if (params.webLink) {
      this.mgwlpn = params.webLink.MGWLPN;
      this.mgwapp = params.webLink.MGWAPP;
    }
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
    //params.DeleteBeforeSave = 0;

    if (typeof(modifiers) !== 'undefined') {
       if (typeof(modifiers) === 'object') {
           if (modifiers.Reference) reference = modifiers.Reference;
           if (reference === '' && modifiers.GlobalName) reference = modifiers.GlobalName;
           if (modifiers.DeleteBeforeSave) params.DeleteBeforeSave = modifiers.DeleteBeforeSave;
           if (modifiers.Delta) params.Delta = modifiers.Delta;
           if (modifiers.Direction) params.Direction = modifiers.Direction;
           if (modifiers.Subscripts) params.Subscripts = JSON.stringify(modifiers.Subscripts);
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
    var uri = this.baseUri + '?' ;
    if (this.mgwlpn) uri = uri + 'MGWLPN=' + this.mgwlpn + '&';
    if (this.mgwapp) uri = uri + 'MGWAPP=' + this.mgwapp + '&';
    uri = uri + queryString;
    //sys.puts(uri);
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
            //sys.puts("status code: " + statusCode + ": " + responseBody);
       
            if (responseBody.indexOf("<html>")!==-1) statusCode = null;

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
              else if (responseBody.indexOf("<html>")!==-1) {
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
                //respObj = JSON.parse(responseBody);
            }
            callback(statusCode,respObj);
        });
    });
};

OperationHelper.prototype.getVersion = function(callback) {
  this.execute("GetVersion","","",callback);
};

OperationHelper.prototype.version = function(callback) {
  this.execute("GetVersion","","",callback);
};

OperationHelper.prototype.set = function(globalName, subscripts, dataValue, callback) {
  var json = {Subscripts:subscripts,DataValue:dataValue};
  this.execute("Set",globalName,json,callback);
};

OperationHelper.prototype.get = function(modifiers, json, callback) {
  this.execute("Get",modifiers,json,callback);
};

OperationHelper.prototype.setJSON = function(globalName, subscripts, json, deleteBeforeSave, callback) {
  var del = 0;
  if (deleteBeforeSave) del = 1;
  var modifiers = {GlobalName: globalName, Subscripts: subscripts, DeleteBeforeSave: del};
  this.execute("SetJSON",modifiers,json,callback);
};

OperationHelper.prototype.getJSON = function(modifiers, json, callback) {
  this.execute("GetJSON",modifiers,json,callback);
};

OperationHelper.prototype.kill = function(modifiers, json, callback) {
  this.execute("Kill",modifiers,json,callback);
};

OperationHelper.prototype.increment = function(globalName, json, delta, callback) {
  var modifiers = {GlobalName: globalName, Delta: delta};
  this.execute("Increment",modifiers,json,callback);
};

OperationHelper.prototype.decrement = function(globalName, json, delta, callback) {
  var modifiers = {GlobalName: globalName, Delta: delta};
  this.execute("Decrement",modifiers,json,callback);
};

OperationHelper.prototype.getNextSubscript = function(modifiers, json, callback) {
  this.execute("Order",modifiers,json,callback);
};

OperationHelper.prototype.getPreviousSubscript = function(globalName, json, callback) {
  var modifiers = {GlobalName:globalName,Direction:'back'};
  this.execute("Order",modifiers,json,callback);
};

OperationHelper.prototype.getAllSubscripts = function(modifiers, json, callback) {
  this.execute("OrderAll",modifiers,json,callback);
};

OperationHelper.prototype.remoteFunction = function(functionName, json, callback) {
  this.execute("Function",functionName,json,callback);
};

OperationHelper.prototype.transaction = function(json, callback) {
  this.execute("Transaction",'',json,callback);
};

OperationHelper.prototype.getGlobalList = function(json, callback) {
  this.execute("GetGlobals",'','',callback);
};

exports.Client = OperationHelper;
