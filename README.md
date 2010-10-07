# node-mdbm
 
node.js client for M/DB:Mumps (HTTP-enabled GT.M or Cache instance)

Inspired by node-apac (thanks to Dustin McQuay [dmcquay])

Rob Tweed <rtweed@mgateway.com>  
29 September 2010, M/Gateway Developments Ltd

Twitter: @rtweed

## Installing node-mdbm

       npm install node-mdbm

		
##  Mumps?

Mumps is a little-known, but extremely versatile, high-performance NoSQL database technology.  It stores data in sparse hierarchical array-like structures known as "globals".  These are extremely flexible: unlike other NoSQL databases that are designed with one particular storage model in mind, the Mumps database is more like a "Swiss Army Knife of databases".  You can use a Mumps database to store simple key/value pairs, tabular data (cf BigTable, SimpleDB, Cassandra), documents (cf CouchDB, MongoDB) or more complex data such as graphs or DOMs.  Mumps databases use sophisticated mechanisms for automatically ensuring that the data you require most frequently is cached in memory: you get in-memory key/value store performance with the security and integrity of an on-disk database.

GT.M is one such implementation of the Mumps database that is available as a Free Open Source version.  For more information on GT.M, see [http://fisglobal.com/Products/TechnologyPlatforms/GTM/index.htm](http://fisglobal.com/Products/TechnologyPlatforms/GTM/index.htm)

I've developed *node-mbdm* to make it possible for the growing Node.js community to benefit from this great database technology. The combination of Node.js and Mumps is truly remarkable, and I'm hoping node-mdm will result in Mumps becoming much better known.

OK, enough of the hyperbole! :-)

##  Installing the Mumps back-end System

In order to use node-mdbm you'll need to have a Linux system with GT.M installed and also:

- M/DB (latest version from the repository: *robtweed/mdb*)
- M/DB:Mumps (latest version from the repository: *robtweed/mdb*)
- EWD (latest version from the respository: *robtweed/EWD*)
- Apache and our *m_apache* gateway.

Don't worry if you're new to Mumps and don't know what these components are or how to install them.  The easiest way to get a Mumps back-end system going is to use Mike Clayton's M/DB installer for Ubuntu Linux which will create you a fully-working environment within a few minutes.  You'll then just need to update M/DB, M/DB:Mumps and EWD and you'll have a Mumps server that's ready for use with Node.js and node-mdbm.  Node.js and node-mdm can reside on the same server as GT.M or on a different server.

The instructions below assume you'll be installing Node.js and node-mdbm on the same server.

You can apply Mike's installer to a Ubuntu Linux system running on your own hardware, or running as a virtual machine.  However, I find Amazon EC2 servers to be ideal for trying this kind of stuff out.

So, for example, to create an M/DB Appliance using Amazon EC2:

- Start up a Ubuntu Lucid (10.04) instance, eg use ami-6c06f305 and, to keep costs down, select a t1.micro instance
- Now follow the instructions for installing the M/DB Appliance at [http://gradvs1.mgateway.com/main/index.html?path=mdb/mdbDownload](http://gradvs1.mgateway.com/main/index.html?path=mdb/mdbDownload)

If you point a browser at the domain name/IP address assigned to the Ubuntu machine, you should now get the M/DB welcome screen.  **You'll need to initialise M/DB before you can use node-mdbm**.  Follow the instructions that you'll see in your browser for creating the */usr/MDB/MDB.conf* file and initialising M/DB.

The M/DB system should now be working.  In order to enable it for use with Node.js and node-mdbm, you'll need to upgrade MDB.m, MDBMumps.m and EWD as follows:

- Install git - we'll be needing this to fetch the various resources we need.  Here I've created a new directory */git* which is where I'll put all the respositories I download, but you can use whatever directory you wish:

       sudo apt-get install git-core
       cd /
       sudo mkdir git
	   sudo chmod 777 git
       cd git

- Update M/DB and M/DB:Mumps

	   git clone git://github.com/robtweed/mdb.git
    
  Then copy the files *MDB.m* and *MDBMumps.m* from */usr/git/mdb* to */usr/local/gtm/ewd*, overwriting the original versions.

	    cp /git/mdb/MDB*.m /usr/local/gtm/ewd

- Update EWD routines.  These provide M/DB:Mumps and M/DB with a variety of utility functions, eg for JSON processing

	   git clone git://github.com/robtweed/EWD.git
    
  Then copy the routine files from */usr/git/EWD* to */usr/local/gtm/ewd*, overwriting the original versions.

	    cp /git/EWD/*.m /usr/local/gtm/ewd
	   
At this point you have a GT.M-based Mumps server that is ready to access from a Node.js system via HTTP.

If you want to make a completely self-contained test system that also includes Node.js and node-mdbm, then continue as follows:
	      
- Install node.js:

       sudo apt-get install g++ curl openssl libssl-dev apache2-utils
       git clone git://github.com/ry/node.git
       cd node
       ./configure
       make
       sudo make install

  Test it by running *node -v*.  If everything is installed and working correctly you'll see:
  
        $ node -v  
        v0.3.0-pre

  
- Install npm (Node.js Package manager)

        cd /git
		sudo chown -R $USER /usr/local
		curl http://npmjs.org/install.sh | sh
	
	Now install npm

        npm install node-mdbm
	
OK! That's it all installed. You should now be ready to try out node-mdbm!

## Testing node-mdbm

  In */usr/local/gtm/ewd* create a file named *test1.js* containing:
  
    var sys = require("sys");
    var mdbmif = require("node-mdbm");
    var mdbm = new mdbmif.Client({
       mdbId:'<yourId>',
       mdbSecret:'<your secret key>',
       endPoint: '127.0.0.1'
    });
    mdbm.version( 
       function(error, results) {
          if (error) { 
             sys.print('Error: ' + error + "\n");
             sys.puts(results.ErrorCode + ": " + results.ErrorMessage + "\n"); 
          }
          else {
            sys.puts(results.Name + "\n" + results.Build + "\n" + results.Date + "\n");
          }
       }
    );
	
**Replace the *mdbId* and *mdbSecret* values with the ones you used in the MDB.conf file that initialised the M/DB Appliance**
	
Now run it (from within */usr/local/gtm/ewd*).  If everything is working properly, you should see:

    ubuntu@domU-12-31-39-09-B8-03:/usr/local/gtm/ewd$ node test1.js
    M/DB:Mumps
    5
    04 October 2010

If this is what you get, then you have Node.js successfully communicating with your GT.M Mumps database.
	
## Running node-mdbm

To use node-mdbm in your Node.js applications, you must add:

        var mdbmif = require("node-mdbm");
		
Then create a new instance of the node-mdbm client object:

      var mdbm = new mdbmif.Client({
         mdbId:'<yourId>',
         mdbSecret:'<your secret key>',
         endPoint: '127.0.0.1'
      });
	
You must specify a valid M/DB User ID and Secret Key.  Use the values you put in the MDB.conf file when you initialised M/DB.  (*If you using a self-contained M/DB Appliance-based system, the endPoint should be 127.0.0.1, but you can access a remote GT.M system from Node.js by specifying its IP Address or Domain Name.  Note that in order to access a remote GT.M system using node-mdbm you must install M/DB, M/DB:Mumps and EWD on the GT.M system*)
	
Now you can use any of the node-mdbm APIs.


## APIs

- set       (sets a global, using the specified subscripts and data value)
- get       (gets a global node, using the specified subscripts)
- setJSON   (maps a JSON object to a Mumps global)
- getJSON   (returns a JSON object from Mumps global storage)
- kill      (deletes a global node, using the specified subscripts)
- getNextSubscript     (returns the next subscript at a specified level of global subscripting)
- getPreviousSubscript     (returns the next subscript at a specified level of global subscripting)
- getAllSubscripts  (returns an array containing all subscript values below a specified level of subscripting)
- increment (Atomically increments a global node, using the specified subscripts)
- decrement (Atomically decrements a global node, using the specified subscripts)
- remoteFunction   (Execute a function within the Mumps system and return the response)
- version   (returns the M/DB:Mumps build number and date)

With the exception of *version*, the APIs follow the same pattern:

## Commands

- mdbm.version(function(error, results) {});

    Returns the current build number and date in the results object:
	
	    results.Build = build number  
	    results.Date = build date
	
	
- mdbm.set(globalName, subscripts, value, function(error, results) {});
	
	Sets a global node:
	
	globalName = name of Mumps global (literal)  
	subscripts = array specifying the subscripts ('' if value to be set at top of global)
	    eg ["a","b","c"]
	value = the data value to be set at the specified global node
	
	Returns ok=true if successful, ie:
	
       results.ok = true

- mdbm.get(globalName, subscripts, function(error, results) {});

	Gets the value for a global node:
	
	globalName = name of Mumps global (literal)  
	subscripts = optional array specifying the subscripts ('' if value at top of global to be returned)
	    eg ["a","b","c"]
	
	Returns the value (if any) and the status of the specified node
	
       results.value
	   results.dataStatus
	   
	   If the specified node does not exist, results.dataStatus = 0 and results.value = ''
	   If the specified node exists, has lower-level subscripts but no data value, results.dataStatus = 10 and results.value = ''
	   If the specified node exists, has lower-level subscripts has a data value, results.dataStatus = 11 and results.value = the value of the node
	   If the specified node exists, has no lower-level subscripts and has a data value, results.dataStatus = 1 and results.value = the value of the node
	   
- mdbm.setJSON(globalName, subscripts, json, deleteBeforeSave, function(error, results) {});

    Maps the specified JSON object and saves it into a Mumps global node.  The JSON object can be saved into the top node of a Mumps global, or merged under a specified subscript level within a Mumps global.  Optionally you can clear down any existing data at the specified global node.  The default is the new JSON object gets merged with existing data in the global.
	
	globalName = name of Mumps global (literal)  
	subscripts = optional array specifying the subscripts ('' if JSON to be stored at top level of global)
	    eg ["a","b","c"]
	json = the JSON object to be saved (object literal)  
	deleteBeforeSave = true|false (default = false)
	
	Returns ok=true if successful, ie:
	
       results.ok = true
	   
- mdbm.getJSON(globalName, subscripts, function(error, results) {});

    Gets the data stored at and under the specified global node, and maps it to a JSON object before returning it.
	
	globalName = name of Mumps global (literal)  
	subscripts = optional array specifying the subscripts ('' if JSON to be stored at top level of global)
	    eg ["a","b","c"]

	
	Returns the JSON object as results
	
       results = returned JSON object
	   
- mdbm.kill(globalName, subscripts, function(error, results) {});
	
	Deletes a global node and the sub-tree below it:
	
	globalName = name of Mumps global (literal)  
	subscripts = array specifying the subscripts ('' if the entire global is to be deleted)
	    eg ["a","b","c"]
	
	Returns ok=true if successful, ie:
	
       results.ok = true
	
- mdbm.getNextSubscript(globalName, subscripts, function(error, results) {});
	
	Gets the next subscript value (if any) in collating sequence at the specified level of subscripting, following the last specified subscript:
	
	globalName = name of Mumps global (literal)  
	subscripts = array specifying the subscripts ('' if the first 1st subscript is to be returned)
	    eg ["a","b","c"]  will return the value of the 3rd subscript the follows the value "c" where subscript1 = "a" and subscript2 = "b"
	
	Returns:
	
	    results.subscriptValue = the value of the next subscript
		results.dataStatus = the data status at the next subscript:
					10 = no data at the next subscripted node but child subscripts exist
					11 = data at the next subscripted node, and child subscripts exist
					1  = data at the next subscripted node, but no child subscripts exist
		results.dataValue = the value (if any) at the next subscript

- mdbm.getPreviousSubscript(globalName, subscripts, function(error, results) {});
	
	Gets the previous subscript value (if any) in collating sequence at the specified level of subscripting, preceding the last specified subscript:
	
	globalName = name of Mumps global (literal)  
	subscripts = array specifying the subscripts ('' if the last 1st subscript is to be returned)
	    eg ["a","b","c"]  will return the value of the 3rd subscript the precedes the value "c" where subscript1 = "a" and subscript2 = "b"
	
	Returns:
	
	    results.subscriptValue = the value of the previous subscript
		results.dataStatus = the data status at the previous subscript:
					10 = no data at the previous subscripted node but child subscripts exist
					11 = data at the previous subscripted node, and child subscripts exist
					1  = data at the previous subscripted node, but no child subscripts exist
		results.dataValue = the value (if any) at the previous subscript

- mdbm.getAllSubscripts(globalName, subscripts, function(error, results) {});
	
	Gets all the values of the subscripts that exist below the specified subscript(s):
	
	globalName = name of Mumps global (literal)  
	subscripts = array specifying the required subscripts ('' if all 1st subscript values are to be returned)
	    eg ["a","b","c"]  will return an array of all subscripts that exist below this level of subscripting
		
	
	Returns:
	
	    results = array of all subscripts found immediately below the specified global node.

- mdbm.increment(globalName, subscripts, delta, function(error, results) {});
	
	Atomically increments the speficied global node by the specified amount.  If the node does not exist, it is created and its initial value is assumed to be zero:
	
	globalName = name of Mumps global (literal)  
	subscripts = array specifying the required subscripts ('' if the top-level global node is to be incremented)
	    eg ["a","b","c"] 
	delta: the amount by which the specified global node is to be incremented (default = 1)	
	
	Returns:
	
	    results.value = the new value of the incremented node

- mdbm.decrement(globalName, subscripts, delta, function(error, results) {});
	
	Atomically decrements the speficied global node by the specified amount.  If the node does not exist, it is created and its initial value is assumed to be zero:
	
	globalName = name of Mumps global (literal)  
	subscripts = array specifying the required subscripts ('' if the top-level global node is to be decremented)
	    eg ["a","b","c"] 
	delta: the amount by which the specified global node is to be decremented (default = 1)	
	
	Returns:
	
	    results.value = the new value of the decremented node

- mdbm.remoteFunction(functionName, parameters, function(error, results) {});
	
	Execute a Mumps function.  This is usually for legacy applications:
	
	functionName = function name/reference (literal), eg 'myFunc&#94;theRoutine'  
	parameters = array specifying the values for the remote function's parameters ('' if no parameters required)
	    eg ["a","b","c"] 
	
	Returns:
	
	    results.value = the response/result returned by the remote function
		
## Examples

To set the global:  


    ^mdbmTest("check","this","out")="Too cool!"

   
and then retrieve the value again (note the asynchronous nature of node.js will 
not guarantee the order in which the APIs below are executed in the Mumps back-end)


    var sys = require("sys");
    var mdbmif = require("node-mdbm");
    
    var mdbm = new mdbmif.Client({
       mdbId:'<your Id>',
       mdbSecret:'<your secret key>',
       endPoint: '127.0.0.1'
    });
    mdbm.set('mdbmTest', ["check","this","out"], "Too cool!",
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
    mdbm.get('mdbmTest', ["check","this","out"],
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

Note: this global node could also have been created using SetJSON:

    var json = {"check":{"this":{"out":"Too cool!"}}};
    mdbm.setJSON('mdbmTest', '', json, true,
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

    mdbm.getJSON('mdbmTest','',
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
	
## License

Copyright (c) 2004-10 M/Gateway Developments Ltd,
Reigate, Surrey UK.
All rights reserved.

http://www.mgateway.com
Email: rtweed@mgateway.com

This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License along with this program.  If not, see <http://www.gnu.org/licenses/>.

