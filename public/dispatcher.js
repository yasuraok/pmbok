"use strict";

// クライアント側で起きる全UI操作に対して、イベントを取得して状態変更して結果をviewに反映させる
// 一番みんなを知っている
// 必要に応じて状態変更ではweb socketサーバーと通信する。
// サーバー側にあるデータを受信する、ブラウザ上のGUI操作に合わせてサーバーデータを更新する etc.
var Dispatcher = function(){
  this.setting  = undefined; // initialized after receive "init" from sever

  // initialize socket
  this.socket = io.connect(/*'http://localhost:8080'*/);
  this.socket.on("init",     this.onInit      .bind(this));
  this.socket.on("projects", this.onGetPrjList.bind(this));
  this.socket.on("data",     this.onGetData   .bind(this));

  // initialize graph view
  this.graph = new GraphCreator(
    window.d3,
    window.saveAs,
    window.Blob,

    // set graph View APIs
    this.onAddNewNode   .bind(this),
    this.onUpdateAllData.bind(this)
  );

  // initialize edit view
  this.editView = new EditView(
    this.onNameChanged    .bind(this),
    this.onProgressChanged.bind(this)
  )

  this.debug();
}

Dispatcher.prototype.debug = function(){
  document.getElementById('edit_debug_open')
    .addEventListener("click", function(){
      this.editView.showStatusPopup(true,[
        { field: "name",     orig: "abc"},
        { field: "progress", orig: 1}
      ], this.setting);
    }.bind(this));

  document.getElementById('edit_debug_close')
    .addEventListener("click", function(){
      this.editView.showStatusPopup(false);
    }.bind(this));
}

// =============================================================================
Dispatcher.prototype.onInit = function(setting, prjList){
  this.setting = setting;

  this.onGetPrjList(prjList);
}

// =============================================================================
Dispatcher.prototype.onNameChanged = function(name){
  console.log("name", name);
}

Dispatcher.prototype.onProgressChanged = function(progress){
  console.log("progress", progress);
}

Dispatcher.prototype.onAddNewNode = function(x, y, title){
  // directly send to server
  this.socket.emit("addNewNode", x, y, title);
}

Dispatcher.prototype.onUpdateAllData = function(obj){
  // directly send to server
  this.socket.emit("updateAllData", obj     );
}

Dispatcher.prototype.onGetPrjList = function(prjList){
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

Dispatcher.prototype.onGetData = function(obj){
  this.graph.loads(obj);
}

// =============================================================================
Dispatcher.prototype.openProject = function(projectId){
  this.socket.emit("openProject", projectId);
}
