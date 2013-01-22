/*
 * FlatTurtle
 * @author: Jens Segers (jens@irail.be)
 * @license: AGPLv3
 */

 (function($){

	var collection = Backbone.Collection.extend({
		initialize : function(models, options) {
			options.data = JSON.parse(options.data);

			this.on("reconfigure", this.render);
		}
	});

	var view = Backbone.View.extend({

		initialize : function() {
			this.on("born", this.render);
		},
		render : function() {
			var self = this;

			$.get("turtles/signage/views/widget.html", function(template) {
				var data = {
					data : self.options.data
				};

				// render html
				self.$el.empty();
				self.$el.html(Mustache.render(template, data));
			});
		}
	});

	// register turtle
	Turtles.register("signage", {
		collection : collection,
		view : view
	});

})(jQuery);