/*
 * FlatTurtle
 * @author: Michiel Vancoillie
 * @license: AGPLv3
 */

(function($) {
	var view = Backbone.View.extend({
		initialize : function() {
			// prevents loss of "this" inside methods
			_.bindAll(this, "render");

			// pre-fetch template file and render when ready
			var self = this;
			if(this.template == null) {
				$.get("turtles/image/views/widget.html", function(template) {
					self.template = template;
					self.render();
				});
			}
		},
		render : function() {
			// only render when template file is loaded
			if (this.template) {
				var data = {
					image : this.options.url
				};

				// change turtle padding
				this.$el.addClass("nopadding");
				this.$el.css('height', '100%');

				// add html to container
				this.$el.empty();
				this.$el.html(Mustache.render(this.template, data));
			}
		}
	});

	// register turtle
	Turtles.register("image", {
		view : view
	});

})(jQuery);
