(function($){

    var view = Backbone.View.extend({

        initialize : function() {
            var self = this;
            $.get('turtles/video/views/widget.html', function(template) {
                var data = {
                    location : self.options.location
                };
                // set window height to load
                self.$el.height('100%');

                // render html
                self.$el.html(Mustache.render(template, data));

                //make a difference between the Qt Browser used by FlatTurtle customers and normal browser users
                if(typeof application === 'undefined'){
                    //for normal browsers, let's use HTML5
                    $("#videocanvas").html("<video id='videotag' src='https://my.flatturtle.com/uploads/hub/" + self.options.location + "' width=100% height=100%></video>"); //TODO: replace hub with alias name
                }

                self.render();
            });
            this.bind("shown", this.shown);
        },
        render : function(){
            // change turtle padding
            this.$el.addClass('nopadding');
        },
        shown : function(){
                if(typeof application !== 'undefined'){
                    //make sure music is turned off
                    application.soundControl("stop");
                    $("#playerobject").get(0).playfile("/home/flatturtle/" + this.options.location);
            }else{
                $("#videotag").get(0).play();
            }
        }
    });

    // register turtle
    Turtles.register("video", {
        view : view
    });

})(jQuery);

