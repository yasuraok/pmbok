"use strict";

// web socketサーバーとの接続を管理する。
// サーバー側にあるデータを受信する、ブラウザ上のGUI操作に合わせてサーバーデータを更新する etc.
var Ctrl = function(){
  // initialize socket
  this.socket = io.connect(/*'http://localhost:8080'*/);
  this.socket.on("data", this.onMessageJson.bind(this));

  // initialize graph view
  this.graph = graphCreatorInit(window.d3, window.saveAs, window.Blob, this.sendToServer.bind(this));

  // request initial data
  this.socket.emit("request");
}

Ctrl.prototype.sendToServer = function(obj){
  this.socket.emit("data", obj);
}
Ctrl.prototype.onMessageJson = function(obj){
  this.graph.loads(obj);
}
