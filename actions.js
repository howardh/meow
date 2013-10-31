function addActions()
{
	for (var a in actions)
	{
		if (!addAction(a))
			console.log("Error: Action " + a);
	}
}

function addAction(action)
{
	//Check if action has all the required functions
	if (!actions[action].name)
		return false;
	if (!actions[action].onSelect)
		return false;
	if (!actions[action].onDeselect)
		return false;
	if (!actions[action].undoAction)
		return false;
	if (!actions[action].init)
		return false;

	//Action is valid. Add action.
	interface.menu += "<input type='radio' name='action' value='"+action+"'> "+actions[action].name+" <br/>";
	interface.submenu += "<div id='"+action+"Menu'>"+actions[action].submenu+"</div>";

	return true;
}

function getAction(n) //FIXME: This should not take O(n) time.
{
	for (var a in actions)
	{
		if (n == 1) return a;
		n--;
	}
}

var actions = actions || {};

actions.addNode = {
	name: "Add Node",
	submenu: "Radius: <input type='textfield' name='radius' value='15'><br/>",
	onSelect: function(){},
	onDeselect: function(){},
	onClick: function(coords){
		var n = Node.addNode(coords);
		var a = new Action();
		a.type = "addNode";
		a.data.push(n);
		actionHistory.add(a);
	},
	undoAction: function(a){
		var index = tikzpicture.nodes.indexOf(a.data[0]);
		tikzpicture.nodes.splice(index,1);
	},
	redoAction: function(a){
		tikzpicture.nodes.push(a.data[0]);
	},
	init: function(){}
};

actions.delNode = {
	name: "Delete Node",
	submenu: "",
	onSelect: function(){},
	onDeselect: function(){},
	onClick: function(coords){
		var n = Node.delNodes(coords);
		var a = new Action();
		a.type = "delNode";
		a.data = n;
		actionHistory.add(a);
	},
	undoAction: function(a){
		for (var i = 0; i < a.data[0].length; i++)
			tikzpicture.nodes.push(a.data[0][i]);
		for (var i = 0; i < a.data[1].length; i++)
			tikzpicture.edges.push(a.data[1][i]);
	},
	redoAction: function(a){
		for (var i = 0; i < a.data[0].length; i++)
		{
			var index = tikzpicture.nodes.indexOf(a.data[0][i]);
			tikzpicture.nodes.splice(index,1);
		}
		for (var i = 0; i < a.data[1].length; i++)
		{
			var index = tikzpicture.edges.indexOf(a.data[1][i]);
			tikzpicture.edges.splice(index,1);
		}
	},
	init: function(){}
};

actions.addEdge = {
	name: "Add Edge",
	submenu: "<input type='checkbox' value='dir'/> Directed<br/>",
	onSelect: function(){},
	onDeselect: function()
	{
		tikzpicture.selectedNode = null;
	},
	onClick: function(coords){
		var e = Edge.addEdge(coords);
		if (e != null)
		{
			var a = new Action();
			a.type = "addEdge";
			a.data.push(e);
			actionHistory.add(a);
		}
	},
	undoAction: function(a){
		var index = tikzpicture.edges.indexOf(a.data[0]);
		tikzpicture.edges.splice(index,1);
	},
	redoAction: function(a){
		tikzpicture.edges.push(a.data[0]);
	},
	init: function(){}
};

actions.addCurve = {
	name: "Add Curve",
	submenu: "",
	onSelect: function(){},
	onDeselect: function()
	{
		Curve.completeLastCurve();
	},
	onClick: function(coords){
		Curve.addCurve(coords);
	},
	undoAction: function(){},
	redoAction: function(){},
	init: function(){}
};

actions.meow = {};
