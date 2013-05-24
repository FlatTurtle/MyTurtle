/*
 * FlatTurtle
 * @author: Michiel Vancoillie
 * @license: AGPLv3
 */

(function($) {
    var collection = Backbone.Collection.extend({

        interval : null,

        initialize : function(models, options) {
            _.bindAll(this, "configure");
            _.bindAll(this, "nextSlide");
            _.bindAll(this, "shown");
            _.bindAll(this, "hide");

            // Set slide duration
            if(!options.duration)
                options.duration = 4000;

            this.on("shown", this.shown);
            this.on("hide", this.hide);
            this.on("born", this.configure);
            this.on("reconfigure", this.configure);
        },
        configure : function(){
            if(!this.options.urls){
                // TODO: show error
            }else{
                this.options.images = JSON.parse(this.options.urls);
            }

            this.trigger("render");
        },
        shown: function(){
            // Resume slideshow
            if(this.options.images && this.options.images.length > 1){
                this.interval = setInterval(this.nextSlide, this.options.duration);
            }
        },
        hide : function(){
            // Pause slideshow
            clearInterval(this.interval);
        },
        nextSlide: function(){
            // Show next slide
            var next = $('.turtle.image .slide');
            var current = $('.turtle.image .slide.active');

            // Check for which slide to show next
            $('.turtle.image .slide').each(function(){
                if($(this).hasClass('active')){
                    if($(this).next()[0]){
                        next = $(this).next();
                    }

                    // stop each
                    return false;
                }
            });

            current.removeClass('active');
            next.addClass('active');
        }
    });

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
                    images : this.options.images
                };

                // change turtle padding
                this.$el.addClass("nopadding");
                this.$el.css('height', '100%');

                // add html to container
                this.$el.empty();
                this.$el.html(Mustache.render(this.template, data));

                // set the first active slide
                this.$el.find('.slide:nth-child(1)').addClass('active');
            }
        }
    });

    // register turtle
    Turtles.register("image", {
        collection : collection,
        view : view
    });

})(jQuery);
