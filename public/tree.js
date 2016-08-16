"use strict";

// ************** Generate the tree diagram	 *****************
function Tree(treeData, onClicked){
  var margin = {top: 20, right: 120, bottom: 20, left: 120};
  this.width  = 960 - margin.right - margin.left;
  this.height = 500 - margin.top   - margin.bottom;

  this.duration = 200;
  this.posCount = 0; // treeの方向を調べるの使う通し番号(データのidとは別)

  this.tree = d3.layout.tree()
  	.size([this.height, this.width]);

  this.diagonal = d3.svg.diagonal()
  	.projection(function(d) { return [d.y, d.x]; });

  // body要素にsvgタグを追加する
  this.svg = d3.select("body").append("svg")
  	.attr("width",  this.width  + margin.right + margin.left  )
  	.attr("height", this.height + margin.top   + margin.bottom)
    .append("g") // グループ化するタグ
  	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  this.root = treeData;
  this.root.x0 = this.height / 2;
  this.root.y0 = 0;

  this.onClicked = onClicked;

  //============================================================================
  // Toggle children on click.
  this.click = function(d) {
    // console.log(d.id);
    // if (d.children) {
    // 	d._children = d.children;
    // 	d.children = null;
    // } else {
    // 	d.children = d._children;
    // 	d._children = null;
    // }

    this.onClicked(d); // eventlistenerをコール

    this.update(d);
  }

  this.reset = function(treeData){
    this.root = treeData;
    this.root.x0 = this.height / 2;
    this.root.y0 = 0;

    this.update(this.root);
  }

  //============================================================================
  // Compute the new tree layout.
  this.update = function(source){
    var nodes = this.tree.nodes(this.root).reverse(); // 配下全要素を逆順で取得
  	var links = this.tree.links(nodes);

    // Normalize for fixed-depth.
    nodes.forEach(function(d) { d.y = d.depth * 180; });

    // Update the nodes…
    var node = this.svg.selectAll("g.node")
  	  .data(nodes, function(d) { return d.pos || (d.pos = ++this.posCount); }.bind(this)); // ノードにidをつけていく

    // Enter any new nodes at the parent's previous position.
    var nodeEnter = node.enter().append("g")
  	  .attr("class", "node")
  	  .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
  	  .on("click", this.click.bind(this));

    nodeEnter.append("circle")
  	  .attr("r", 1e-6)
  	  .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

    nodeEnter.append("text")
  	  .attr("x", function(d) { return d.children || d._children ? -13 : 13; })
  	  .attr("dy", ".35em")
  	  .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
  	  .text(function(d) { return d.name; })
  	  .style("fill-opacity", 1e-6);

    // Transition nodes to their new position.
    var nodeUpdate = node.transition()
  	  .duration(this.duration)
  	  .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

    nodeUpdate.select("circle")
  	  .attr("r", 10)
  	  .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

    nodeUpdate.select("text")
  	  .style("fill-opacity", 1);

    // Transition exiting nodes to the parent's new position.
    var nodeExit = node.exit().transition()
  	  .duration(this.duration)
  	  .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
  	  .remove();

    nodeExit.select("circle")
  	  .attr("r", 1e-6);

    nodeExit.select("text")
  	  .style("fill-opacity", 1e-6);

    // Update the links…
    var link = this.svg.selectAll("path.link")
  	  .data(links, function(d) { return d.target.pos; });

    // Enter any new links at the parent's previous position.
    link.enter().insert("path", "g")
  	  .attr("class", "link")
  	  .attr("d", function(d) {
  		  var o = {x: source.x0, y: source.y0};
  		  return this.diagonal({source: o, target: o});
	    }.bind(this)
    );

    // Transition links to their new position.
    link.transition()
  	  .duration(this.duration)
  	  .attr("d", this.diagonal);

    // Transition exiting nodes to the parent's new position.
    link.exit().transition()
  	  .duration(this.duration)
  	  .attr("d", function(d) {
    		var o = {x: source.x, y: source.y};
    		return this.diagonal({source: o, target: o});
  	  }.bind(this))
  	  .remove();

    // Stash the old positions for transition.
    nodes.forEach(function(d) {
    	d.x0 = d.x;
    	d.y0 = d.y;
    });
  }

  this.update(this.root);

  d3.select(self.frameElement).style("height", "500px");

  return this;
}
