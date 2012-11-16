/*
 * Wrapper Qt Browser application object
 */
var Power = {
		
	element : null,

	enable : function() {
		if (Power.element.length != 0) {
			Power.element.remove();
			Power.element = null;
		}
		
		if (typeof application == "object")
			application.enableScreen(true);
	},

	disable : function() {
		if (Power.element == null) {
			Power.element = $('<div id="black-screen"></div>');
			$("body").append(Power.element);
		}
		
		if (typeof application == "object")
			application.enableScreen(false);
	}

};