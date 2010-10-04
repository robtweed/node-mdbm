var sys = require("sys");
var mdbmif = require("./mdbMumpsClient");

var mdbm = new mdbmif.Client({
   mdbId:'rob',
   mdbSecret:'xxxxxx',
   endPoint: '127.0.0.1'
});


mdbm.setJSON('mdbmTest4', ["this","is","cool"], false, 
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



mdbm.set('Set', 'mdbmTest', ["check","this","out"], "Too cool!",
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



mdbm.kill('mdbmTest4', ["2"],
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



mdbm.kill('mdbmTest4', [2],
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

// Kills the entire ^mdbmTest4 global
mdbm.kill('mdbmTest4', '',
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


function xset(i) {

var json = "{\"" + i + "\":" + i + "}";
json = JSON.parse(json);

 mdbm.setJSON('mdbmTest5', json, true,
   function(error, results) {
          if (error) { 
             sys.print('Error: ' + error + "\n");
             sys.puts(results.ErrorCode + ": " + results.ErrorMessage + "\n"); 
          }
          else {
            sys.puts(results.json + ".. " + results.ok);
          }
   }
 );
}

/*
sys.puts("starting loop");
for (i=1;i<20;i++) {
  xset(i);
  sys.puts("set " + i);
};
*/


mdbm.setJSON('mdbmTest3', 
 {'a':111,'b':'hello','arr':['hhjg','lkjklj','uyi'],'arr2':[{'l':'hello','k':'ssss'},{'l':'there','k':'again'}],'d':{'q':'qqqq','r':{'z':123,'x':222},'w':'wwwwww','e':'eeeee'},'c':'xxxxx'}, 
   true,
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



mdbm.getJSON('mdbmTest3','',
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


mdbm.getNextSubscript('mdbmTest3', ["arr2",2,"k"],
   function(error, results) {
          if (error) { 
             sys.print('Error: ' + error + "\n");
             sys.puts(results.ErrorCode + ": " + results.ErrorMessage + "\n"); 
          }
          else {
            sys.puts("F subscriptValue=" + results.subscriptValue + "\ndataStatus=" + results.dataStatus + "\ndataValue=" + results.dataValue);
          }
   }
);


mdbm.getPreviousSubscript("mdbmTest", ["check","this","out"],
   function(error, results) {
          if (error) { 
             sys.puts('Error: ' + error + "\n");
             sys.puts(results.ErrorCode + ": " + results.ErrorMessage + "\n"); 
          }
          else {
            sys.puts("B subscriptValue=" + results.subscriptValue + "\ndataStatus=" + results.dataStatus + "\ndataValue=" + results.dataValue);
          }
   }
);



mdbm.getAllSubscripts('mdbmTest3', ["a"],
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
