/*
 * FlatTurtle
 * @author: Johan Dams (johan.dams@wrdsystems.co.uk)
 * @license: AGPLv3
 */

(function($){

	var collection = Backbone.Collection.extend({
		initialize : function(models, options) {

            _.bindAll(this, "configure");
            _.bindAll(this, "shown");
            _.bindAll(this, "hide");

            // Set slide duration
            if(!options.duration)
                options.duration = 4000;

            // How many
            if(!options.limit)
                options.limit = 20;

            this.on("shown", this.shown);
            this.on("hide", this.hide);
            this.on("born", this.configure);
            this.on("reconfigure", this.configure);
            this.on("refresh", this.refresh);
            options.images = new Array();
		},
		configure : function(){
            var self = this;
            
            self.options.flickrApiKey = 'a59dd4b0e5f753a691ef9a2926b52cb1';
            self.options.apiCall = 'https://api.flickr.com/services/rest/?format=json&method=flickr.photos.search&user_id='+self.options.userid+'&api_key='+self.options.flickrApiKey+'&jsoncallback=?&per_page='+self.options.limit;
            
            this.trigger("refresh");
            
		},
        url: function(){
            var self = this;
            return self.options.apiCall;
        },
        refresh: function(){
            var self = this;
            self.fetch();
        },
        parse: function(json) {
            var self = this;
            $.each(json.photos.photo, function(i,photo){
                var img_src = "https://farm" + photo.farm + ".static.flickr.com/" + photo.server + "/" + photo.id + "_" + photo.secret + "_b.jpg";
                self.options.images.push(img_src);
            });
        },

	    shown: function(){
            // Resume slideshow
            var self = this;
            this.interval = setInterval(function(){
                self.trigger("nextSlide");
            }, this.options.duration);
       },
       hide : function(){
            // Pause slideshow
            clearInterval(this.interval);
       }

	});

    var view = Backbone.View.extend({
        initialize : function() {
			// prevents loss of 'this' inside methods
			_.bindAll(this, "render", "nextSlide");

			// bind render to collection reset
			this.collection.on("nextSlide", this.nextSlide);
        
            // pre-fetch template file and render when ready
            var self = this;
            if(this.template == null) {
                $.get("turtles/flickr/views/widget.html", function(template) {
                    self.template = template;
                    self.render();
                });
            }

            this.collection.on("reset", this.render);
        },
        render : function(){
            var self = this;
           // only render when template file is loaded
           if (this.template) {
                var data = {
                    images : self.options.images
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
        },
        nextSlide: function(){
            // Show next slide
            var next = $('.slide', this.$el);
            var current = $('.slide.active', this.$el);
            
            // Check for which slide to show next
            $('.slide', this.$el).each(function(){
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

    // register turtle
    Turtles.register("flickr", {
		collection : collection,
        view : view
    });


})(jQuery);

