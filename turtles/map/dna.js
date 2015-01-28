/*
 * FlatTurtle
 * @author: Jens Segers (jens@irail.be)
 * @license: AGPLv3
 */

(function($){

    var view = Backbone.View.extend({

        initialize : function() {
            var self = this;

            // prevents loss of "this" inside methods
            _.bindAll(this, "refresh");
            _.bindAll(this, "rezoom");

            this.on("refresh", this.refresh);
            this.on("reconfigure", this.render);
            
            // which zoom level
            this.which = 1;
            
            // second zoom level, if 0 make equal to main zoom
            if(this.options.zoomalt == 0)
                this.options.zoomalt = this.options.zoom;

            // how fast do we zoom between the two
            if(this.options.zoomtime < 10)
                this.options.zoomtime = 10;
            // milliseconds
            this.options.zoomtime *= 1000;

            // render immediately
            this.render();

            setTimeout(function(){
                 rezoomInterval = setInterval(self.rezoom, this.options.zoomtime);
            }, Math.round(Math.random()*5000)); 
        },
        rezoom : function() {
            var self = this;
            if(self.options.zoom == self.options.zoomalt)
                return;
            if (self.which == 0){
                self.which = 1;
                self.zoom = self.options.zoom;
            }
            else{
                self.which = 0;
                self.zoom = self.options.zoomalt;
            }

            // refresh iframe with new zoom level
            var iframe = self.$el.find('iframe')[0];
            iframe.src = iframe.src.replace(/zoom=\d\d/,"zoom="+this.zoom);
        },
        refresh : function() {
            // refresh iframe
            var iframe = this.$el.find('iframe')[0];
            iframe.src = iframe.src;
        },
        render : function() {
            var self = this;

            // set height and remove padding
            self.$el.height("100%");
            self.$el.addClass("nopadding");

            $.get("turtles/map/views/widget.html", function(template) {
                var data = {
                    alias : Interface.config.alias,
                    zoom: self.options.zoom,
                };

                // render html
                self.$el.empty();
                self.$el.html(Mustache.render(template, data));
            });
        }
    });

    // register turtle
    Turtles.register("map", {
        view : view
    });

})(jQuery);
