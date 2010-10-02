var mdbmClient = require("./mdbMumpsClient");
var sys = require("sys");

var mdbm = new mdbmClient.OperationHelper({
   mdbId:'rob',
   mdbSecret:'xxxxx',
   endPoint: '127.0.0.1'
});

mdbm.execute('GetVersion', '', '', 
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

mdbm.execute('Set', '', {GlobalName: "mdbmTest",Subscripts:["check","","out"],DataValue:"Too cool!"},
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

mdbm.execute('SetJSON', 'mdbmTest2', {check:{this:{out:"Too cool!"}}},
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

mdbm.execute('SetJSON','mdbmTest3', 
 {'a':111,'b':'hello','arr':['hhjg','lkjklj','uyi'],'arr2':[{'l':'hello','k':'ssss'},{'l':'there','k':'again'}],'d':{'q':'qqqq','r':{'z':123,'x':222},'w':'wwwwww','e':'eeeee'},'c':'xxxxx'}, 
  
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

mdbm.execute('SetJSON', 'mdbmTest4', ["this","is","cool"],
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

mdbm.execute('GetVersion', '', '',
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