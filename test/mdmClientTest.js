var sys = require("sys");
var mdbmif = require("node-mdbm");

// change endPoint to a different IP address/domain name if GT.M is running on a different server to Node.js

var mdbm = new mdbmif.Client({
   mdbId:'<your M/DB Id here>',
   mdbSecret:'<your M/DB Secret key here>',
   endPoint: '127.0.0.1'
});


mdbm.increment('mdbmTest8', ["this"], 2,
   function(error, results) {
          if (error) { 
             sys.print('Error: ' + error + "\n");
             sys.puts(results.ErrorCode + ": " + results.ErrorMessage + "\n"); 
          }
          else {
            sys.puts('new value: ' + results.value + "\n");
          }
   }
);

   var action1 = {
      method:'setJSON',
      globalName:'mdbmTest9',
      subscripts:['a'],
      json:{this:{is:{too:'cool',really:"nice!"}}}
   };
   var action2 = {
      method:'kill',
      globalName:'mdbmTest9',
      subscripts:['b','c']
   };
   var json = [action1,action2];

    mdbm.transaction(json,
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

/*
mdbm.getAllSubscripts('mdbmTest7', ["this"],
   function(error, results) {
          if (error) { 
             sys.print('Error: ' + error + "\n");
             sys.puts(results.ErrorCode + ": " + results.ErrorMessage + "\n"); 
          }
          else {
            sys.puts("Subscripts=" + JSON.stringify(results));
          }
   }
);
*/
/*
mdbm.getPreviousSubscript('mdbmTest7', [""],
   function(error, results) {
          if (error) { 
             sys.print('Error: ' + error + "\n");
             sys.puts(results.ErrorCode + ": " + results.ErrorMessage + "\n"); 
          }
          else {
            sys.puts("subscriptValue=" + results.subscriptValue + "\ndataStatus=" + results.dataStatus + "\ndataValue=" + results.dataValue);
          }
   }
);
*/

/*
mdbm.getNextSubscript('mdbmTest7', ["this",5],
   function(error, results) {
          if (error) { 
             sys.print('Error: ' + error + "\n");
             sys.puts(results.ErrorCode + ": " + results.ErrorMessage + "\n"); 
          }
          else {
            sys.puts("subscriptValue=" + results.subscriptValue + "\ndataStatus=" + results.dataStatus + "\ndataValue=" + results.dataValue);
          }
   }
);
*/

/*
mdbm.kill('mdbmTest7', ["this"],
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
*/

/*
mdbm.getJSON('mdbmTest7',["this"],
   function(error, results) {
          if (error) { 
             sys.print('Error: ' + error + "\n");
             sys.puts(results.ErrorCode + ": " + results.ErrorMessage + "\n"); 
          }
          else {
            sys.puts("GetJSON: " + JSON.stringify(results));
          }
   }
);
*/

/*
mdbm.setJSON('mdbmTest7', '', {this:{is:{also:"very cool"}}}, true, 
   function(error, results) {
          if (error) { 
             sys.print('Error: ' + error + "\n");
             sys.puts(results.ErrorCode + ": " + results.ErrorMessage + "\n"); 
          }
          else {
            sys.puts('setJSON: ' + results.ok + "\n");
          }
   }
);
*/

/*
mdbm.setJSON('mdbmTest7', ["a","b"], {this:{is:{also:"very cool"}}}, false, 
   function(error, results) {
          if (error) { 
             sys.print('Error: ' + error + "\n");
             sys.puts(results.ErrorCode + ": " + results.ErrorMessage + "\n"); 
          }
          else {
            sys.puts('setJSON: ' + results.ok + "\n");
          }
   }
);
*/

/*
mdbm.get('mdbmTest', ["check","this","outxxx"],
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
*/

/*
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
*/

/*
mdbm.get('mdbmTest', '' ,
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
*/

/*
mdbm.set('mdbmTest', '' , "This value should be at the top level",
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
*/

/*
mdbm.set('mdbmTest', ["check","this","out"], "Node.js is so very cool!",
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
*/

/*
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
*/


