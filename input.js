var tikzInput = {
	init: function()
	{
		$("canvas").click(function(event)
		{
			var coords = getCoords(event);
			switch (getAction())
			{
				case "add":
					Node.addNode(coords);
					break;
				case "del":
					Node.delNodes(coords);
					break;
				case "addEdge":
					Edge.addEdge(coords);
					break;
				case "addCurve":
					Curve.addCurve(coords);
					break;
			}
			redraw();
			updateCode();
		});
		$("body").keypress(function(event)
		{
			if (event.which >= 49 && event.which <= 52)
			{
				setAction(event.which-48);
				return;
			}
			//alert(event.which + " " + event.ctrlKey);
		});
		$("input[name='voffset']").change(function()
		{
			tikzpicture.offset.y = parseInt($("input[name='voffset']").val(),10)/100*tikzpicture.gridSize;
		});
		$("input[name='hoffset']").change(function()
		{
			tikzpicture.offset.x = parseInt($("input[name='hoffset']").val(),10)/100*tikzpicture.gridSize;
		});
		$("input[name='gridsize']").change(function()
		{
			tikzpicture.gridSize = parseInt($("input[name='gridsize']").val(),10);
		});
		$("form").change(function()
		{
			redraw();
		});
	}
}
