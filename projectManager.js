module.exports = {
  ProjectManager: ProjectManager,
}

var project     = require("./project");
var fs          = require("fs");
var mkdirp      = require("mkdirp");
var path        = require("path")

var DATA_DIR = __dirname + "/data";

function ProjectManager(){
  this.prjList  = {};
  this.prjIdNum = 0;

  // 1. create directory (if not exists)
  mkdirp(DATA_DIR, function (err) {
    if (err){
      throw err;
    }
  })

  // 2. make project file list
  var files = fs.readdirSync(DATA_DIR);
  files.filter(function(file){
    return fs.statSync(this.fullPath(file)).isFile() && /.*\.json$/.test(file); //絞り込み
  }.bind(this)).forEach(function (file) {
    this.prjList[this.prjIdNum] = path.basename(file);
    this.prjIdNum += 1;
  }.bind(this));
}

ProjectManager.prototype.fullPath = function(basename){
  return DATA_DIR + "/" + basename;
}

ProjectManager.prototype.getPrjList = function(){
  return this.prjList;
}

ProjectManager.prototype.openPrject = function(prjId){
  var filePath = this.fullPath(this.prjList[prjId]);
  if (fs.existsSync(filePath)) {
    // 設定情報を読み込み
    var buf = fs.readFileSync(filePath, "utf-8");
    try{
      var onUpdate = this.storePrj.bind(this, prjId); // store when update
      var data     = JSON.parse(buf);
      return new project.Project(onUpdate, data);
    }
    catch (e) {
      return undefined;
      // no process
    }
  }
  return undefined;
}

ProjectManager.prototype.storePrj = function(prjId, data){
  var buf = JSON.stringify(data);
  var filePath = this.fullPath(this.prjList[prjId]);
  fs.writeFile(filePath, buf, "utf-8", function (err) {
    console.log("save");
	});
}
