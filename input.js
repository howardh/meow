var tikzInput = {
	onClickListeners: [],
	onDragListeners: [],
	onKeyPressListeners: [],
	init: function()
	{
		$("canvas").click(function(event)
		{
			var coords = getCoords(event);

			if (actions[getCurrentAction()].onClick)
				actions[getCurrentAction()].onClick(coords);

			redraw();
			updateCode();
		});
		$("body").keypress(function(event)
		{
			//Numbers 1-9
			if (event.which >= 49 && event.which <= 49+9)
			{
				setCurrentAction(event.which-48);
				redraw();
				return;
			}
			//ctrl+...
			if (event.ctrlKey)
			{
				//ctrl+z
				switch (event.which)
				{
					case 26: //ctrl+z
						actionHistory.undo();
						break;
					case 25: //ctrl+y
						actionHistory.redo();
						break;
				}
				redraw();
				return;
			}
			
			//All other actions
			if (actions[getCurrentAction()].onKeyPress)
				actions[getCurrentAction()].onKeyPress(event);
			redraw();
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
