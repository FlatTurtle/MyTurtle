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
            this.bind("hide", this.bind);
        },
        render : function(){
            // change turtle padding
            this.$el.addClass('nopadding');


            /* Fullscreen check */
            var width = $("#videocanvas").width();

            if(width > 1100){
                $("#playerobject").css({"top":"14%","margin-top":"80px","height":"56%"});
            }
            else{
                $("#playerobject").css({"top":"0%","margin-top":"0px","height":"100%"});
            }

        },
        shown : function(){
                if(typeof application !== 'undefined'){
                    //make sure music is turned off
                    application.soundControl("stop");

                    /* Play the video */
                    $("#playerobject").get(0).playfile("/home/flatturtle/" + this.options.location);
            }else{
                $("#videotag").get(0).play();
            }
        },
        hide : function(){
            $("#playerobject").stop();
        }
    });

    // register turtle
    Turtles.register("video", {
        view : view
    });

})(jQuery);

