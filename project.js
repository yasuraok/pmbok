module.exports = {
  Project: Project,
}

var consts = {
  defaultTitle: "new task"
};

function Project(onUpdate, data){
  this.onUpdate = onUpdate;  // (this.prjId, this.data)
  this.data     = data || {
    nodes: [],
    edges: [],
  };
  var ids = this.data.nodes.map(function(node){return node.id;});
  this.idCount  = Math.max.apply(null, ids) + 1;
}


Project.prototype.getData = function(){
  return this.data;
};

// add new node
// in order to set unique id, this operation must be done at server-side
Project.prototype.addNewNode = function(x, y, title){
  var node = {
    id   : this.idCount++,
    title: title || consts.defaultTitle,
    x    : x,
    y    : y
  };
  this.data.nodes.push(node);
  this.onUpdate(this.data); // notify to manager
}

// update all graph data
Project.prototype.updateAllData = function(obj){
  this.data = obj;
  this.onUpdate(this.data); // notify to manager
};
