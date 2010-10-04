var mdbmClient = require("./mdbMumpsClient");
var sys = require("sys");

var mdbm = new mdbmClient.OperationHelper({
   mdbId:'rob',
   mdbSecret:'xxxxx',
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


// This will return an error because subscripts cannot be null
mdbm.set("mdbmTest", ["check","","out"], "Too cool!",
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

mdbm.setJSON('mdbmTest2', {check:{this:{out:"Too cool!"}}}, true,
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

mdbm.setJSON('mdbmTest3', 
 {'a':111,'b':'hello','arr':['hhjg','lkjklj','uyi'],'arr2':[{'l':'hello','k':'ssss'},{'l':'there','k':'again'}],'d':{'q':'qqqq','r':{'z':123,'x':222},'w':'wwwwww','e':'eeeee'},'c':'xxxxx'}, true,
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

mdbm.setJSON('mdbmTest4', ["this","is","cool"], true,
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

