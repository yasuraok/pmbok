"use strict";

// 本体
var Ctrl = function(){
  // ソケットの初期化
  this.socket = io.connect(/*'http://localhost:8080'*/);
  this.socket.on("data", this.onMessageJson.bind(this));

  this.graph = graphCreatorInit(window.d3, window.saveAs, window.Blob, this.sendToServer.bind(this));
}

Ctrl.prototype.sendToServer = function(obj){
  this.socket.emit("data", obj);
}
Ctrl.prototype.onMessageJson = function(obj){
  this.graph.loads(obj);
}
