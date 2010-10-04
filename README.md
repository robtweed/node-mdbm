# node-mdbm
 
node.js client for M/DB:Mumps (HTTP-enabled GT.M or Cache instance)

Inspired by node-apac (thanks to Dustin McQuay [dmcquay])

29 September 2010, M/Gateway Developments Ltd

This is released as Open Source without restriction

## Installing node-mdbm

    npm install node-mdbm
	
##  Installing the Mumps back-end System

In order to use node-mdbm you'll need to have a Linux system with the GT.M (Mumps) database installed and also:

- M/DB (latest version from the repository: *robtweed/mdb*)
- M/DB:Mumps (latest version from the repository: *robtweed/mdb*)
- Apache and our *m_apache* gateway.

For more information on GT.M, see [http://fisglobal.com/Products/TechnologyPlatforms/GTM/index.htm](http://fisglobal.com/Products/TechnologyPlatforms/GTM/index.htm)


In fact, the easiest way to get a test system going is to use Mike Clayton's M/DB installer which will create you a fully-working Mumps environment within a few minutes.  You'll then just need to update M/DB and M/DB:Mumps and install Node.js and node-mdbm.

For example, to create an M/DB Appliance using Amazon EC2:

- Start up a Ubuntu Lucid (10.04) instance, eg use ami-6c06f305 and, to keep costs down, select a t1.micro instance
- Follow the instructions for installing the M/DB Appliance at [http://gradvs1.mgateway.com/main/index.html?path=mdb/mdbDownload](http://gradvs1.mgateway.com/main/index.html?path=mdb/mdbDownload)

If you point a browser at the domain name/IP address assigned to the Ubuntu machine, you should now get the M/DB welcome screen.  You'll need to initialise M/DB before you can use node-mdbm.  Follow the instructions that you'll see in your browser.

The M/DB system should now be ready to use.  You'll now need to install Node.js, node-mdbm and upgrade two Mumps routines (MDB.m and MDBMumps.m) as follows:

- Install node.js:

       sudo apt-get install g++ curl openssl libssl-dev apache2-utils
       sudo apt-get install git-core
       cd /
       sudo mkdir git
       cd git
       git clone git://github.com/ry/node.git
       cd node
       ./configure
       make
       sudo make install

  Test it by running: node -v
  
- Install npm (Node.js package manager)

       sudo chown -R $USER /usr/local
       curl http://npmjs.org/install.sh | sh

- Install node-mdbm:

       npm install node-mdbm

- Update M/DB and M/DB:Mumps

       cd /git
	   git clone git://github.com/robtweed/mdb.git
    
  Then copy the files *MDB.m* and *MDBMumps.m* from */usr/git/mdb* to */usr/local/gtm/ewd*, overwriting the original versions.
	
You should now be ready to try out node-mdbm!

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
	
Replace the *mdbId* and *mdbSecret* values with the ones you used to initialise the M/DB Appliance
	
Now run it.  If everything is working properly, you should see:

    ubuntu@domU-12-31-39-09-B8-03:/usr/local/gtm/ewd$ node test1.js
    M/DB:Mumps
    5
    01 October 2010

If this is what you get, then you have Node.js successfully communicating with your GT.M Mumps database.
	
## APIs

- set       (sets a global, using the specified subscripts and data value)
- get       (gets a global node, using the specified subscripts)
- setJSON   (maps a JSON object to a Mumps global)
- getJSON   (returns a JSON object from Mumps global storage)
- kill      (deletes a global node, using the specified subscripts)
- getNextSubscript     (returns the next subscript at a specified level of global subscripting)
- getAllSubscripts  (returns an array containing all subscript values for a specified level of subscripting)
- getPreviousSubscript     (returns the next subscript at a specified level of global subscripting)
- increment (Atomically increments a global node, using the specified subscripts)
- decrement (Atomically decrements a global node, using the specified subscripts)
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
	   
## Examples

To set the global:  


    ^mdbmTest("check","this","out")="Too cool!"

   
and then retrieve the value again (note the asynchronous nature of node.js will 
not guarantee the order in which the APIs below are executed in the Mumps back-end)


    var sys = require("sys");
    var mdbmif = require("./mdbMumpsClient");
    
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
