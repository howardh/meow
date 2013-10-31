window.onload = main;

var ACTIONS = [["add","Add node"],
			   ["del","Delete node"],
			   ["addEdge", "Add edge"],
			   ["addCurve", "Add curve"]];
var SNAP = [["grid","Snap to square grid"],
			["tri","Snap to triangular grid"],
			["none", "No snap"]];

var tikzpicture = {
	gridSize : 50,			//float
	offset : new Coord(),

	nodes : [], 			//Coord
	selectedNode : null, 	//Coord

	edges : [], 			//Edge
	curves : [],			//Curve

	code : ""
}

var actionHistory = (function(){
	var actionStackSize = 20;
	var past = [];		//Stack of actions
	var future = [];	//Stack of actions
	//current : null	//Action

	return new function(){
		this.undo = function(){
			if (past.length == 0)
				return;
			var a = past.pop();
			actions[a.type].undoAction(a);
			future.push(a);
		}
		this.redo = function(){
			if (future.length == 0)
				return;
			var a = future.pop();
			actions[a.type].redoAction(a);
			past.push(a);
		}
		this.add = function(a){
			past.push(a);
			future = [];
		}
	}
})();

function main()
{
	addActions();

	var content = "";

	content += "<div class='main'>";

	content += "<div class='canvas'>";
	content += "<canvas></canvas>";
	content += "</div>";

	content += "<div class='form'>";
	content += "<form>";
	content += "Action: <br/>";
	content += interface.menu;
	content += "Snap: <br/>";
	for (var i = 0; i < SNAP.length; i++)
	{
		content += "<input type='radio' name='snap' value='"+SNAP[i][0]+"'> "+SNAP[i][1]+" <br/>";
	}
	content += "Grid size: <input type='textfield' name='gridsize' value=" + tikzpicture.gridSize + "><br/>";
	content += "Vertical offset: <input type='range' name='voffset' min='0' max='100' value='0'><br/>";
	content += "Horizontal offset: <input type='range' name='hoffset' min='0' max='100' value='0'><br/>";
	content += "<div class='submenu'>";

	content += interface.submenu;

	content += "</div>";
	content += "</form>";
	content += "</div>";

	content += "</div>";

	content += "<br/><textarea cols=80 rows=30></textarea><br/>";

	$(document.body).append(content);

	$("canvas")[0].width = $("div.canvas").width();
	$("canvas")[0].height= $("div.canvas").height();

	redraw();

	tikzInput.init();
}

function updateCode()
{
	tikzpicture.code = "";
	for (var i = 0; i < tikzpicture.nodes.length; i++)
	{
		tikzpicture.code += "\\node[circle, draw] (" + i + ") at (" + tikzpicture.nodes[i].coord.x/tikzpicture.gridSize + "," + -tikzpicture.nodes[i].coord.y/tikzpicture.gridSize + ") {};\n";
		tikzpicture.nodes[i].index = i;
	}
	for (var i = 0; i < tikzpicture.edges.length; i++)
	{
		tikzpicture.code += "\\draw (" + tikzpicture.edges[i].end1.index + ") edge (" + tikzpicture.edges[i].end2.index + ");\n";
	}
	$("textarea").text(tikzpicture.code);
}

function getSnap()
{
	return $("input[name='snap']:checked").val();
}

function getCurrentAction()
{
	return $("input[name='action']:checked").val();
}

/**
* @param {number} num
*	number pressed
*/
function setCurrentAction(num)
{
	var prev = getCurrentAction();
	if (prev) 
	{
		//Hide submenu (If something was previously selected)
		$("#"+prev+"Menu").hide();
		$("#"+prev+"Menu").css("visibility", "hidden");

		actions[prev].onDeselect(); //Do stuff for switching away from an action
	}

	//Set to new action
	action = getAction(num);
	actions[action].onSelect();
	$("input:radio[name='action']").val([action]); //Update radio button

	//Show new submenu
	$("#"+action+"Menu").css("visibility","visible");
	$("#"+action+"Menu").show();
}

function getCoords(event)
{
	var a = new Coord();
	a.x = event.pageX - $("canvas").offset().left;
	a.y = event.pageY - $("canvas").offset().top;
	return a;
}

function snapToGrid(coord)
{
	coord.x = coord.x - tikzpicture.offset.x;
	coord.y = coord.y - tikzpicture.offset.y;

	switch (getSnap())
	{
		case "grid":
			//Find closest x
			coord.x = Math.round(coord.x/tikzpicture.gridSize)*tikzpicture.gridSize;
			coord.y = Math.round(coord.y/tikzpicture.gridSize)*tikzpicture.gridSize;
			break;
		case "tri":
			var vertSep = Math.cos(Math.PI/6)*tikzpicture.gridSize;
			var y = Math.round(coord.y/vertSep);
			if (y%2 == 1)
			{
				coord.x = Math.round(coord.x/tikzpicture.gridSize)*tikzpicture.gridSize;
			}
			else
			{
				coord.x = (Math.round(0.5+coord.x/tikzpicture.gridSize)-0.5)*tikzpicture.gridSize;
			}
			coord.y = Math.round(coord.y/vertSep)*vertSep;
			break;
		case "none":
			break;
	}
	coord.x = coord.x + tikzpicture.offset.x;
	coord.y = coord.y + tikzpicture.offset.y;
	return coord;
}

/*
 *	Objects
 */

function Action()
{
	this.type = "";		//String representing the action type (e.g. "addNode")
	this.data = [];
}

function Coord()
{
	this.x = 0;
	this.y = 0;
	this.equals = function(c)
	{
		return ((this.x == c.x) && (this.y == c.y));
	}
	this.dist2 = function(coord)
	{
		return (this.x-coord.x)*(this.x-coord.x)+(this.y-coord.y)*(this.y-coord.y);
	}
	this.dist = function(coord)
	{
		return Math.sqrt(this.dist2(coord));
	}
	this.magnitude = function()
	{
		return this.dist(new Coord());
	}
	this.normalize = function()
	{
		var mag = this.magnitude();
		this.x /= mag;
		this.y /= mag;
	}
	this.add = function(coord)
	{
		this.x += coord.x;
		this.y += coord.y;
	}
	this.times = function(n)
	{
		this.x *= n;
		this.y *= n;
	}
}

function Node()
{
	this.coord = new Coord();
	this.radius = 15;
	this.content = "";

	this.index = 0; //Updated in updateCode() for use immediately after
}
Node.addNode = function(coord)
{
	coord = snapToGrid(coord);
	var n = new Node();
	n.coord = coord;
	n.radius = $("input[name=radius]").val();
	tikzpicture.nodes.push(n); 
	return n;
}
/**
 * @param {Coord} coord
 * @return the node closest to coord
 */
Node.getNodes = function(coord)
{
	results = [];
	for (var i = tikzpicture.nodes.length-1; i >= 0; i--)
	{
		var diff = new Coord();
		diff.x = coord.x - tikzpicture.nodes[i].coord.x;
		diff.y = coord.y - tikzpicture.nodes[i].coord.y;
		var dist = diff.x*diff.x + diff.y*diff.y;
		if (dist < tikzpicture.nodes[i].radius*tikzpicture.nodes[i].radius)
		{
			results.push(tikzpicture.nodes[i]);
		}
	}
	return results;
}
Node.delNodes = function(coord)
{
	var n = Node.getNodes(coord);
	var e = [];
	for (var i = 0; i < n.length; i++)
	{
		//Check for edges containing this node
		for (var j = tikzpicture.edges.length-1; j >= 0; j--)
		{
			if (tikzpicture.edges[j].contains(n[i]))
			{
				e.push(tikzpicture.edges[j]);
				tikzpicture.edges.splice(j,1);
			}
		}
		//Remove the node and return it
		var index = tikzpicture.nodes.indexOf(n[i]);
		tikzpicture.nodes.splice(index,1);
	}
	return [n,e];
}

function Edge()
{
	this.end1;	//Reference to node object
	this.end2;	//Reference to node object

	/**
	 * @param {Node} e
	 */
	this.contains = function(e)
	{
		return ((this.end1 == e) || (this.end2 == e));
	}
}
Edge.addEdge = function(coord)
{
	var n = Node.getNodes(coord);

	if (n.length == 0)
		return;

	if (tikzpicture.selectedNode == null)
	{
		tikzpicture.selectedNode = n[0];
		return null;
	}

	if (tikzpicture.selectedNode == n[0])
	{
		tikzpicture.selectedNode = null;
		return null;
	}

	//TODO: Check for repeated edges
	
	//Add edge between selectedNode and n[0]
	var temp = new Edge();
	temp.end1 = tikzpicture.selectedNode;
	temp.end2 = n[0];
	tikzpicture.edges.push(temp);
	tikzpicture.selectedNode = null;
	return temp;
}

function Curve()
{
	this.points = []; //Array of Coord
	this.tension = 25;
	this.cycle = 1;	//If true, joins the first and last point
	this.isComplete = 0; //If false, the next click will add another point to this curve
	this.getLastPoint = function()
	{
		return this.points[this.points.length-1];
	}
	this.getControlPoints = function(index)
	{
		var n = this.points.length;
		var result = [];

		//Control point 1
		var prev = (index-1+n)%n;
		var next = (index+1)%n;
		var v = new Coord();
		v.x = this.points[next].x - this.points[prev].x;
		v.y = this.points[next].y - this.points[prev].y;
		v.normalize();
		v.times(this.tension);
		v.add(this.points[index]);
		result.push(v);

		//Control point 2
		index = (index+1)%n;
		var prev = (index-1+n)%n;
		var next = (index+1)%n;
		var v = new Coord();
		v.x = this.points[prev].x - this.points[next].x;
		v.y = this.points[prev].y - this.points[next].y;
		v.normalize();
		v.times(this.tension);
		v.add(this.points[index]);
		result.push(v);

		//End point
		result.push(this.points[index]);

		return result;
	}
}
Curve.addCurve = function(coord)
{
	var index = tikzpicture.curves.length-1; //Adding to the last curve

	//Check if we're in the middle of making a curve
	//If not, then make a new curve so that we can add a point to it
	if (tikzpicture.curves.length == 0 || Curve.getLastCurve().isComplete)
	{
		tikzpicture.curves.push(new Curve());
	}

	//Check for double clicks
	if (Curve.getLastCurve().points.length > 0)
	{
		if (Curve.getLastCurve().getLastPoint().dist2(coord) < 2)
		{
			//tikzpicture.curves[index].isComplete = 1;
			Curve.completeLastCurve();
			return;
		}
	}

	//Where do we add the point?
	Curve.getLastCurve().points.push(coord);
}
Curve.completeLastCurve = function()
{
	var c = Curve.getLastCurve();
	if (c != null)
		c.isComplete = 1;
}
Curve.getLastCurve = function()
{
	if (tikzpicture.curves.length == 0)
		return null;
	return tikzpicture.curves[tikzpicture.curves.length-1];
}
