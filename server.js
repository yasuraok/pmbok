//==============================================================================
// command line parse
//==============================================================================
var yargs       = require('yargs');
var argv = yargs
    .help   ('h').alias('h', 'help')
    .boolean('t').alias('t', 'test'   ).default('t', false)
    .boolean('v').alias('v', 'verbose').default('v', false)
    // .options('x', {alias : 'xxxx', default : ""})
    .argv;

// set verbose
//var verboseLog = argv.verbose ? console.log : function(){}

// set cpu usage
//var usage       = require('usage');
//if(argv.test){
//  setInterval(function (){
//    usage.lookup(process.pid, function(err, result) {
//      console.log('[USAGE] cpu: ' + result.cpu + ', memory: ' + result.memory);
//    });
//  }, 1000);
//}

//==============================================================================
// start server
//==============================================================================
var serverHost = require('./serverHost');
var g_server   = new serverHost.ServerHost();

//==============================================================================
// graceful shutdown
//==============================================================================

function graceful_shutdown(){
  process.exit();
}

// 例外
process.on('uncaughtException', function(err) {
    console.log(err.stack);
    graceful_shutdown();
});

// windowsのctrl-c
if (process.platform === "win32") {
  var rl = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.on("SIGINT", function () {
    console.log("Caught interrupt signal");
    graceful_shutdown();
  });
}

// それ以外のctrl-c
process.on("SIGINT", function () {
  //graceful shutdown
  console.log("Caught interrupt signal");
  graceful_shutdown();
});
