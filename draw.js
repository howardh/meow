function redraw()
{
	//Parameters
	var rulerThickness = 20; //Ruler thickness in pixels
	
	//Get canvas and context
	var canvas = $("canvas")[0];
	var context = $("canvas")[0].getContext("2d");

	//Clear canvas
	clear(context);

	drawRulers(context);

	context.save();
		clipPicture(context);

		drawGrid(context); //Draw grid
		drawEdges(context); //Draw edges
		drawNodes(context); //Draw nodes
		drawCurves(context); //Draw curves
	context.restore();

	return;

	/*
	 *	Functions
	 */
	function clear(context)
	{
		context.save();
		context.setTransform(1, 0, 0, 1, 0, 0);
		context.clearRect(0, 0, canvas.width, canvas.height);
		context.restore();
	}

	function clipPicture(context)
	{
		context.beginPath();
		context.rect(rulerThickness,rulerThickness,canvas.width-rulerThickness,canvas.height-rulerThickness);
		context.clip();
	}

	function drawGrid(context)
	{
		context.save();
		context.setLineDash([2,5]);
		switch(getSnap())
		{
			case "grid":
				for (var x = -tikzpicture.gridSize; x < canvas.width; x+=tikzpicture.gridSize)
				{
					context.beginPath();
					context.moveTo(x+tikzpicture.offset.x, -tikzpicture.gridSize+tikzpicture.offset.y);
					context.lineTo(x+tikzpicture.offset.x, canvas.height+tikzpicture.offset.y);
					context.stroke();
				}
				for (var y = -tikzpicture.gridSize; y < canvas.height; y+=tikzpicture.gridSize)
				{
					context.beginPath();
					context.moveTo(-tikzpicture.gridSize+tikzpicture.offset.x, y+tikzpicture.offset.y);
					context.lineTo(canvas.width+tikzpicture.offset.x, y+tikzpicture.offset.y);
					context.stroke();
				}
				break;
			case "tri":
				//Horizontal lines
				var vertSep = Math.cos(Math.PI/6)*tikzpicture.gridSize;
				for (var y = -vertSep; y < canvas.height; y+=vertSep)
				{
					context.beginPath();
					context.moveTo(-tikzpicture.gridSize+tikzpicture.offset.x, y+tikzpicture.offset.y);
					context.lineTo(canvas.width+tikzpicture.offset.x, y+tikzpicture.offset.y);
					context.stroke();
				}

				//Diagonal lines
				var deltaX = (canvas.height+vertSep)*Math.tan(Math.PI/6);
				var mult = Math.ceil(Math.tan(Math.PI/6)*canvas.height)+1;
				for (var x = -tikzpicture.gridSize*mult; x < canvas.width; x+=tikzpicture.gridSize)
				{
					context.beginPath();
					context.moveTo(x+tikzpicture.offset.x, -tikzpicture.gridSize+tikzpicture.offset.y);
					context.lineTo(x+deltaX+tikzpicture.offset.x, canvas.height+tikzpicture.offset.y);
					context.stroke();
				}
				for (var x = tikzpicture.gridSize; x < canvas.width+tikzpicture.gridSize*mult; x+=tikzpicture.gridSize)
				{
					context.beginPath();
					context.moveTo(x+tikzpicture.offset.x, -tikzpicture.gridSize+tikzpicture.offset.y);
					context.lineTo(x-deltaX+tikzpicture.offset.x, canvas.height+tikzpicture.offset.y);
					context.stroke();
				}
				break;
			case "none":
				break;
		}
		context.restore();
	}
	function drawEdges(context)
	{
		context.save();
		context.lineWidth = 3;
		for (var i = 0; i < tikzpicture.edges.length; i++)
		{
			context.beginPath();
			//context.moveTo(tikzpicture.nodes[tikzpicture.edges[i].end1].coord.x,tikzpicture.nodes[tikzpicture.edges[i].end1].coord.y);
			//context.lineTo(tikzpicture.nodes[tikzpicture.edges[i].end2].coord.x,tikzpicture.nodes[tikzpicture.edges[i].end2].coord.y);
			context.moveTo(tikzpicture.edges[i].end1.coord.x, tikzpicture.edges[i].end1.coord.y);
			context.lineTo(tikzpicture.edges[i].end2.coord.x, tikzpicture.edges[i].end2.coord.y);
			context.stroke();
		}
		context.restore();
	}
	function drawNodes(context)
	{
		for (var i = 0; i < tikzpicture.nodes.length; i++)
		{
			context.beginPath();
			context.arc(tikzpicture.nodes[i].coord.x, tikzpicture.nodes[i].coord.y, tikzpicture.nodes[i].radius, 0, 2 * Math.PI, false);
			//context.closePath();
			if (tikzpicture.nodes[i] == tikzpicture.selectedNode)
				context.fillStyle="#ffdddd";
			else
				context.fillStyle="white";
			context.fill();
			context.stroke();
		}
	}
	function drawCurves(context)
	{
		for (var i = 0; i < tikzpicture.curves.length; i++)
		{
			var c = tikzpicture.curves[i];

			//If we don't have at least two points, skip this curve
			if (c.points.length < 2)
			{
				continue;
			}
			if (c.cycle)
			{
				context.moveTo(c.points[0].x, c.points[0].y);
				for (var j = 0; j < c.points.length+(c.isComplete-1); j++)
				{
					var cp = c.getControlPoints(j);
					context.beginPath();
					context.moveTo(c.points[j].x, c.points[j].y);
					context.bezierCurveTo(cp[0].x, cp[0].y, cp[1].x, cp[1].y, cp[2].x, cp[2].y);
					context.stroke();

					//Uncomment to show control points
					//context.fillRect(cp[0].x,cp[0].y,2,2);
					//context.fillRect(cp[1].x,cp[1].y,2,2);
				}
			}
		}
	}
	function drawRulers(context)
	{
		//Top left corner
		context.beginPath();
		context.rect(0,0,rulerThickness,rulerThickness);
		context.fillStyle="#c0c0c0";
		context.fill();

		//Horizontal ruler
		var rulerWidth = canvas.width - rulerThickness;
		context.save();
			context.translate(rulerThickness,0);
			context.rect(0,0,rulerWidth,rulerThickness);
			context.clip();

			context.beginPath();
			context.rect(0, 0, rulerWidth, rulerThickness);
			context.stroke();

			context.save();
			context.translate(-0.5, 0);
			//Ruler ticks
			for (var i = 0; i < rulerWidth; i += 50/10)
			{
				context.beginPath();
				context.moveTo(i,rulerThickness);
				if (i%50 == 0)
					context.lineTo(i,rulerThickness-10);
				else if (i%25 == 0)
					context.lineTo(i,rulerThickness-5);
				else
					context.lineTo(i,rulerThickness-3);
				context.stroke();
			}
			context.restore();
		context.restore();

		//Vertical ruler
		var rulerHeight = canvas.height- rulerThickness;
		context.save();
			context.translate(0,rulerThickness);
			context.rect(0,0,rulerThickness,rulerHeight);
			context.clip();

			context.beginPath();
			context.rect(0, 0, rulerThickness, rulerHeight);
			context.stroke();

			context.save();
			context.translate(0,-0.5);
			//Ruler ticks
			for (var i = 0; i < rulerHeight; i += 50/10)
			{
				context.beginPath();
				context.moveTo(rulerThickness,i);
				if (i%50 == 0)
					context.lineTo(rulerThickness-10,i);
				else if (i%25 == 0)
					context.lineTo(rulerThickness-5,i);
				else
					context.lineTo(rulerThickness-3,i);
				context.stroke();
			}
			context.restore();
		context.restore();

		//Meow
		//context.font = 'italic 40pt Computer Modern';
		//context.fillText('Hello World!', 39,100);
	}
}
