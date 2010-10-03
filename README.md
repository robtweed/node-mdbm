# node-mdbm
 
node.js client for M/DB:Mumps (HTTP-enabled GT.M or Cache instance)

Based on a modification of node-apac (Dustin McQuay [dmcquay])

29 September 2010, M/Gateway Developments Ltd

This is released as Open Source without restriction


This module will interface with a GT.M system onto which M/DB:Mumps and the m_apache
gateway has been installed (both products available from www.mgateway.com)

You can rapidly create a fully-configured, ready to run GT.M system on a Ubuntu Linux 
server, VM or EC2 machine, complete with M/DB:Mumps and m_apache by using Mike 
Clayton's M/DB Installer - details at www.mgateway.com

## APIs

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
