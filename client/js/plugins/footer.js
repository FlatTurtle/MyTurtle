/*
 * FlatTurtle
 * Footer RSS plugin
 *
 * @author: Jens Segers (jens@irail.be)
 * @license: AGPLv3
 */

var Footer = {

	element : null,

	enable : function(source) {
		// destroy previous message
		Footer.destroy();

		if (source.indexOf('http://') == 0 || source.indexOf('//') == 0) {
			$.getJSON("//www.google.com/reader/public/javascript/feed/" + source + "?callback=?", function(data) {
				var items = data.items.slice(0,5);

				// create marquee element
				Footer.element = $('<marquee id="message" class="text-color"></marquee>');

				// create content
				for(var i in items) {
					Footer.element.append('<span>' + items[i]['title'] + '</span>');
				}

				$("footer").append(Footer.element);
			});
		} else {
			// create marquee element
			Footer.element = $('<div id="message" class="text-color">' + source + '</div>');
			$("footer").append(Footer.element);
		}
	},

	disable : function() {
		// enable marquee style
		if (Footer.element)
			Footer.element.remove();
	},

	destroy : function() {
		Footer.disable();
	}

};