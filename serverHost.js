module.exports = {
  ServerHost: ServerHost,
}

var projectManager = require('./projectManager');
var setting        = require('./setting');
var os          = require("os");
var http        = require('http');
var connect     = require('connect');
var serveStatic = require('serve-static');
var socketio    = require("socket.io");

var LISTEN_PORT  = 8000;
var PUBLIC_DIR   = __dirname + "/public";

function ServerHost(){
  this.serverAddress  = undefined;
  this.projectManager = new projectManager.ProjectManager();
  this.projects       = {}; // prjId  => project;
  this.socket2prjId   = {}; // socket => projectId;
  this.httpApp        = undefined;
  this.server         = undefined;
  this.io             = undefined;

  this.openWebSocket(); // setup connections
}

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

// register web socket event handler
ServerHost.prototype.onConnection = function(socket){
  // for project manager
  socket.on("requestProjects", this.onRequestProjects.bind(this, socket) );
  // socket.on("newProject",  this.onNewProject .bind(this, socket) );
  socket.on("openProject",     this.onOpenProject    .bind(this, socket) );

  // for project
  socket.on("requestData",   this.onRequestData  .bind(this, socket) );
  socket.on("addNewNode",    this.onAddNewNode   .bind(this, socket) );
  socket.on("updateAllData", this.onUpdateAllData.bind(this, socket) );

  // remove client connection when disconnect
  socket.on('disconnect', function(socketId) {
    delete this.socket2prjId[socketId];
    console.log("disconnect: ", this.socket2prjId);
  }.bind(this, socket.id));

  // send init configuration
  socket.emit("init", setting.setting, this.projectManager.getPrjList());
};

// send current project list
ServerHost.prototype.onRequestProjects = function(socket){
  // console.log(this.projectManager.getPrjList());
  socket.emit("projects", this.projectManager.getPrjList());
}

// open project for the socket and send initial data
ServerHost.prototype.onOpenProject = function(socket, prjId){
  var prj = this.projectManager.openPrject(prjId);
  if (prj){
    this.socket2prjId[socket.id] = prjId;
    this.projects[prjId]         = prj;
    socket.emit("data", prj.getData());
  }
};

// return current data when being requested by client
ServerHost.prototype.onRequestData = function(socket){
  var prj = this.projects[this.socket2prjId[socket.id]];
  if (prj){
    socket.emit("data", prj.getData());
  }
};

ServerHost.prototype.onAddNewNode = function(socket, x, y, title){
  var prjId = this.socket2prjId[socket.id];
  var prj   = this.projects[prjId];
  if (prj){
    prj.addNewNode(x, y, title);
    this.sync(prjId);
  }

};

// receive new data
ServerHost.prototype.onUpdateAllData = function(socket, data){
  var prjId = this.socket2prjId[socket.id];
  var prj   = this.projects[prjId];
  if (prj){
    prj.updateAllData(data);
    console.log("message from input #" + socket.id, data);

    this.sync(prjId);
  }
};

//share data with all clients who are seeing the same project
ServerHost.prototype.sync = function(prjId){
  var prj   = this.projects[prjId];
  if (prj){
    for (var sid in this.socket2prjId){
      if (prjId == this.socket2prjId[sid]){
        console.log("sync to socket:", sid);
        this.io.sockets.to(sid).emit("data", prj.getData());
      }
    }
  }
};
