/*
 * FlatTurtle
 * @author: Jens Segers (jens@irail.be)
 * @license: AGPLv3
 */

(function($) {

    var collection = Backbone.Collection.extend({
        initialize : function(models, options) {
            var self = this;
            // prevents loss of 'this' inside methods
            _.bindAll(this, "refresh");

            // fetch data when born
            this.on("born", this.refresh);
            this.on("refresh", this.refresh);
            this.on("reconfigure", this.refresh);

            // default error value
            options.error = false;

            // default hashtag
            if (!options.search)
                options.search = "flatturtle";

            // default limit
            if (!options.limit)
                options.limit = 3;

            // automatic collection refresh each minute, this will
            // trigger the reset event
            setTimeout(function(){
                refreshInterval = setInterval(self.refresh, 60000);
            }, Math.round(Math.random()*5000));
        },
        refresh : function() {
            // don't fetch if there is no search
            if (this.options.search == null || !this.options.search)
                return;

            var self = this;
            self.fetch({
                error : function() {
                    // will allow the view to detect errors
                    self.options.error = true;

                    // if there are no previous items to show, display error message
                    if(self.length == 0)
                        self.trigger("reset");
                }
            });
        },
        url : function() {
            // remote source url
            return "https://data.irail.be/spectql/twitter/search/" + encodeURIComponent(this.options.search) + "/results.limit(" + this.options.limit + "):json";
        },
        parse : function(json) {
            var tweets = json.spectql;

            // process tweets
            for (var i in tweets) {
                // #tags
                tweets[i].text = tweets[i].text.replace(/(#[\w-_]+)/g, '<span class="text-color">$1</span>');
                // @replies
                tweets[i].text = tweets[i].text.replace(/(@[\w-_]+)/g, '<span class="text-color">$1</span>');
                // links                                  [   https://www.   |www.| domain.| ... ]
                tweets[i].text = tweets[i].text.replace(/((https?:\/\/(\w\.)*|\w\.)[^\s]+\.[^\s]+)/g, '<span class="text-color">$1</span>');
            }

            return tweets;
        }
    });

    var view = Backbone.View.extend({
        initialize : function() {
            // prevents loss of 'this' inside methods
            _.bindAll(this, "render");

            // bind render to collection reset
            this.collection.on("reset", this.render);

            // pre-fetch template file and render when ready
            var self = this;
            if(this.template == null) {
                $.get("turtles/twitter/views/widget.html", function(template) {
                    self.template = template;
                    self.render();
                });
            }
        },
        render : function() {
            // only render when template file is loaded
            if(this.template) {
                var data = {
                    search : this.options.search,
                    entries : this.collection.toJSON(),
                    error : this.options.error
                };

                // add html to container
                this.$el.empty();
                this.$el.html(Mustache.render(this.template, data));
            }
        }
    });

    // register turtle
    Turtles.register("twitter", {
        collection : collection,
        view : view
    });

})(jQuery);
