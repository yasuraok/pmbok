module.exports = {
  Project: Project,
}

function Project(onUpdate, data){
  this.onUpdate = onUpdate;  // (this.prjId, this.data)
  this.data     = data || {};
}

Project.prototype.getData = function(){
  return this.data;
};

Project.prototype.updateData = function(obj){
  this.data = obj;
  this.onUpdate(this.data);
};
