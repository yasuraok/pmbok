"use strict";

// web socketサーバーとの接続を管理する。
// サーバー側にあるデータを受信する、ブラウザ上のGUI操作に合わせてサーバーデータを更新する etc.
var Ctrl = function(){
  // initialize socket
  this.socket = io.connect(/*'http://localhost:8080'*/);
  this.setSocketAPI();

  // initialized after receive "init" message from sever
  this.graph   = undefined;
  this.setting = undefined;

  // request project list
  // this.socket.emit("requestProjects");
}

// =============================================================================
Ctrl.prototype.setSocketAPI = function(){
  this.socket.on("init",     this.onInit      .bind(this));
  this.socket.on("projects", this.onGetPrjList.bind(this));
  this.socket.on("data",     this.onGetData   .bind(this));
}

Ctrl.prototype.onInit = function(setting, prjList){
  this.setting = setting;

  this.graph = new GraphCreator(
    window.d3,
    window.saveAs,
    window.Blob,

    function(x, y, title){
      this.socket.emit("addNewNode", x, y, title);
    }.bind(this),

    function(obj        ){
      this.socket.emit("updateAllData", obj     );
    }.bind(this)
  );

  this.onGetPrjList(prjList);
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
