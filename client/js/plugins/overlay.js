/*
 * FlatTurtle
 * Put fullscreen image on the screen
 *
 * @author: Michiel Vancoillie
 * @license: AGPLv3
 */

var Overlay = {

	element : null,

	enable : function(url) {
		if (this.element != null) {
			this.element.remove();
		};

		this.element = $('<div id="black-screen" style="background-image:url(\''+url+'\');"></div>');
		$("body").append(this.element);

		this.element.fadeIn();
	},

	disable : function() {
		var self = this;
		this.element.fadeOut(200, function(){
			self.element.remove();
		});
	}

};