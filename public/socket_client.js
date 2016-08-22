"use strict";

// web socketサーバーとの接続を管理する。
// サーバー側にあるデータを受信する、ブラウザ上のGUI操作に合わせてサーバーデータを更新する etc.
var Ctrl = function(){
  // initialize socket
  this.socket = io.connect(/*'http://localhost:8080'*/);
  this.setSocketAPI();

  // initialize graph view
  this.graph = graphCreatorInit(window.d3, window.saveAs, window.Blob, this.sendToServer.bind(this));

  // request project list
  this.socket.emit("requestProjects");
}

// =============================================================================
Ctrl.prototype.setSocketAPI = function(){
  this.socket.on("projects", this.onGetPrjList.bind(this));
  this.socket.on("data",     this.onGetData   .bind(this));
}

Ctrl.prototype.onGetPrjList = function(prjList){
  console.log("prjList", prjList);
  var elmt = document.getElementById('prjlist');
  elmt.textContent = null;
  for (var prjId in prjList){
    var text = document.createTextNode(prjList[prjId]);
    var a    = document.createElement('a');
    var li   = document.createElement('li');

    a.href = "javascript:void(0)";
    a.appendChild(text);
    a.addEventListener('click', function(_prjId){
      console.log("opening project #", _prjId);
      this.openProject(_prjId);
    }.bind(this, prjId));
    li.appendChild(a);
    elmt.appendChild(li);
  }
}

Ctrl.prototype.onGetData = function(obj){
  this.graph.loads(obj);
}

// =============================================================================
Ctrl.prototype.openProject = function(projectId){
  this.socket.emit("openProject", projectId);
}

Ctrl.prototype.sendToServer = function(obj){
  console.log("update");
  this.socket.emit("updateData", obj);
}
