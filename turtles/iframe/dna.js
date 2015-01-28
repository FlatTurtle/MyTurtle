/*
 * FlatTurtle
 * @author: Johan Dams (johan.dams@wrdsystems.co.uk)
 * @license: AGPLv3
 */

(function($){

	var collection = Backbone.Collection.extend({
		initialize : function(models, options) {
			_.bindAll(this, "configure");

			this.on("born", this.configure);
			this.on("reconfigure", this.configure);
	
		},
		configure : function(){
			this.trigger("render");
		}
	});

    var view = Backbone.View.extend({
        initialize : function() {
			// prevents loss of 'this' inside methods
			_.bindAll(this, "render");
            
            // check variables
            if(this.options.zoom == '')
                this.options.zoom = 0.5;
            if(this.options.link == '')
                this.options.link = 'http://www.yeri.be';

			// bind render to collection reset
			this.collection.on("render", this.render);
        },
        render : function(){
			var self = this;

		    var zoom = this.options.zoom;

            var zoompercent = 100/parseFloat(zoom);
            zoompercent = zoompercent + '%';

	        $.get('turtles/iframe/views/widget.html', function(template) {
				var data = {
			 	    link  : self.options.link,
                    zpercent: zoompercent,
                    zoom: zoom
				};
					
                self.$el.empty();
				self.$el.height('100%');
				self.$el.addClass('nopadding');
				self.$el.html(Mustache.render(template, data));
			});
        }
    });

    // register turtle
    Turtles.register("iframe", {
		collection : collection,
        view : view
    });

})(jQuery);

