/*
 * FlatTurtle
 * @author: Michiel Vancoillie (michiel@irail.be)
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
            if(!this.options.data)
                return false;

            this.trigger("render");
        }
    });

    var view = Backbone.View.extend({

        initialize : function() {
            // prevents loss of 'this' inside methods
            _.bindAll(this, "render");

            // bind render to collection reset
            this.collection.on("render", this.render);
        },
        render : function() {
            var self = this;

            // set window height to 100%
            self.$el.addClass("fullheight");

            $.get("turtles/info/views/widget.html", function(template) {
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
    Turtles.register("info", {
        collection : collection,
        view : view
    });

})(jQuery);