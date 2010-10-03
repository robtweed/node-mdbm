<h2>node-mdbm</h2>
 
node.js client for M/DB:Mumps (HTTP-enabled GT.M or Cache instance)

Based on a modification of node-apac (Dustin McQuay [dmcquay])

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

<code>
   ^mdbmTest("check","this","out")="Too cool!"
</code>
   
and then retrieve the value again (note the asynchronous nature of node.js will 
not guarantee the order in which the APIs below are executed in the Mumps back-end)

<code>
var sys = require("sys");<br />
var mdbmif = require("./mdbMumpsClient");<br />
<br />
var mdbm = new mdbmif.Client({<br />
   mdbId:'rob',<br />
   mdbSecret:'xxxxxxxx',<br />
   endPoint: '127.0.0.1'<br />
});<br />
<br />
mdbm.execute('Set', 'mdbmTest', {<br />
      Subscripts:["check","this","out"],<br />
      DataValue:"Too cool!"<br />
   },<br />
   function(error, results) {<br />
          if (error) { <br />
             sys.print('Error: ' + error + "\n");<br />
             sys.puts(results.ErrorCode + ": " + results.ErrorMessage + "\n"); <br />
          }<br />
          else {<br />
            sys.puts(results.ok + "\n");<br />
          }<br />
   }<br />
);<br />
<br />
mdbm.execute('Get', 'mdbmTest', ["check","this","out"],<br />
   function(error, results) {<br />
          if (error) { <br />
             sys.print('Error: ' + error + "\n");<br />
             sys.puts(results.ErrorCode + ": " + results.ErrorMessage + "\n"); <br />
          }<br />
          else {<br />
            sys.puts("dataStatus=" + results.dataStatus + "\nvalue=" + results.value + "\n");<br />
          }<br />
   }<br />
);<br />
</code>

Note: this global node could also have been created using SetJSON:

<code>
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
</code>
 
and the original JSON could be retrieved using:

<code>
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
</code>

