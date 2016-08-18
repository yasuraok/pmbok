module.exports = {
  ServerHost: ServerHost,
}

var os          = require('os');
var fs          = require("fs");
var http        = require('http');
var connect     = require('connect');
var serveStatic = require('serve-static');
var socketio    = require("socket.io");

var LISTEN_PORT  = 8000;
var PUBLIC_DIR   = __dirname + "/public";
// var dirHome      = process.env[process.platform == "win32" ? "USERPROFILE" : "HOME"];
var SETTING_FILE = __dirname + "/pmbok.json";

function Model(){ return {
  data: {},

  save: function(){
    var buf = JSON.stringify(this.data);
    fs.writeFile(SETTING_FILE, buf, "utf-8", function (err) {
      console.log("save");
		});
  },

  load: function(){
    if (fs.existsSync(SETTING_FILE)) {
      // 設定情報を読み込み
      var buf = fs.readFileSync(SETTING_FILE, "utf-8");
      try{
        this.data = JSON.parse(buf);
      }
      catch (e) {
        // no process
      }
    }
  },

}}


function ServerHost(){
  this.serverAddress = undefined;
  this.model         = Model();
  this.httpApp       = undefined;
  this.server        = undefined;
  this.io            = undefined;

  this.model.load();    // load data
  this.openWebSocket(); // setup connections
}

// JSONメッセージを受信する
ServerHost.prototype.onEditData = function(socket, obj){
  this.model.data = obj;
  console.log("message from input #" + socket, obj);
  this.io.sockets.emit("data", this.model.data);
  this.model.save();
},

ServerHost.prototype.openWebSocket = function(){
  this.httpApp= connect();
  this.httpApp.use(serveStatic(PUBLIC_DIR));

  this.server = http.createServer(this.httpApp);
  this.server.listen(LISTEN_PORT);

  // websocketとしてlistenして、応答内容を記述
  this.io = socketio.listen(this.server);
  this.io.sockets.on("connection", this.onConnection.bind(this));

  console.log("================================================");
  console.log("listening web socket on port " + LISTEN_PORT);
  var interfaces = os.networkInterfaces()
  for (var dev in interfaces) {
    interfaces[dev].forEach(function(iface){
      if ((! iface.internal) && iface.family === "IPv4"){
        console.log("connection control at http://" + iface.address + ":" + LISTEN_PORT + "/");
        this.serverAddress = iface.address;
      }
    }.bind(this));
  }
  console.log("================================================");
};

// websocketとしての応答内容を記述
ServerHost.prototype.onConnection = function(socket){
  // register web socket event handler
  socket.on("data",        this.onEditData.bind(this, socket) );   // JSONメッセージを受信する
};
