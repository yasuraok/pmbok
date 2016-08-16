"use strict";

// 本体
var Ctrl = function(){
  // ソケットの初期化
  this.socket = io.connect(/*'http://localhost:8080'*/);
  this.socket.on("message_json", this.onMessageJson.bind(this));
}

Ctrl.prototype.onMessageJson = function(obj){
  this.addMessage(obj);
}
