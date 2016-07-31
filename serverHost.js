module.exports = {
  create: ServerHost,
}

var os          = require('os');
var fs          = require("fs");
var http        = require('http');
var connect     = require('connect');
var serveStatic = require('serve-static');
var socketio    = require("socket.io");

var LISTEN_PORT  = 8000;
var PUBLIC_DIR   = __dirname + "/public";
var dirHome      = process.env[process.platform == "win32" ? "USERPROFILE" : "HOME"];
var SETTING_FILE = dirHome + "/pmbok.json";

function Model(){ return {
  data: {},

  saveSettings: function(){

    // 設定情報を保存
    var buf = JSON.stringify(this.data);
    fs.writeFile(SETTING_FILE, buf, "utf-8", function (err) {
      console.log("saveSettings");
		});
  },

  loadSettings: function(){
    // 設定の読み込み
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


function ServerHost(){ return{
  serverAddress: undefined,
  model: Model(),

  g_httpApp: undefined,
  g_server: undefined,
  g_io: undefined,

  // 初期化
  init : function(){
    this.model.loadSettings();
    this.openWebSocket();
  },

  // ネットワーク接続者一覧を表示する(socketだからサーバー側からpush可能)
  update : function(){
    this.g_io.sockets.emit("update", this.model.data);
  },

  // wsjsonクライアントとしてネットワークに参加する
  join_as_wsjson : function(socket, param) {
    var obj = {
      name: param ? param.name : socket.id,
      type: "json",
    };
    this.open_input(socket, obj, "wsjson");
    this.open_output(socket, obj, "wsjson");
  },

  // ネットワークから離脱する
  exit_wsjson : function(socket) {
    var inputExisted = this.clients.deleteClientInput (this.clients.socketId2InputClientId (socket.id));
    var outputExisted = this.clients.deleteClientOutput(this.clients.socketId2OutputClientId(socket.id));
    if(inputExisted || outputExisted){
      console.log("[Web Socket #'" + socket.id + "'] exited.");
    }
    this.update_list(); // ネットワーク更新
  },

  // JSONメッセージを受信する
  message_json : function(socket, obj){
    var inputId  = this.clients.socketId2InputClientId(socket.id);

    if (inputId >= 0) { // joinしたクライアントだけがメッセージのやり取りに参加できる
      // console.log("message from input #" + inputId);

      this.clients.deliver(inputId, obj); // 配信
    }
  },

  //------------------
  openWebSocket : function(){
    this.g_httpApp= connect();
    this.g_httpApp.use(serveStatic(PUBLIC_DIR));

    this.g_server = http.createServer(this.g_httpApp);
    this.g_server.listen(LISTEN_PORT);

    // documents
    // this.g_server.on('request', this.onRequestDocument.bind(this));

    // websocketとしてlistenして、応答内容を記述
    this.g_io = socketio.listen(this.g_server);
    this.g_io.sockets.on("connection", this.onWebSocket.bind(this));

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
  },

  // websocketとしての応答内容を記述
  onWebSocket : function(socket){
    socket.on("join_as_wsjson",      this.join_as_wsjson.bind(this, socket) ); // wsjsonクライアントとしてネットワークに参加する
    socket.on("exit_wsjson",         this.exit_wsjson.bind(this, socket) );    // ネットワークから離脱する
    socket.on("message_json",        this.message_json.bind(this, socket) );   // JSONメッセージを受信する

    socket.on("disconnect",   this.disconnect.bind(this, socket) );
  },
}};
