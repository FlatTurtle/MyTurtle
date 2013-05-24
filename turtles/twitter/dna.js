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

            // default hashtag
            if (!options.search)
                options.search = "flatturtle";

            // default limit
            if (!options.limit)
                options.limit = 3;
            else
                options.limit = options.limit.trim();

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
                error : function(d,e) {
                    console.log('errr');
                    // if there are no previous items to show, display a message
                    if(self.length == 0)
                        self.trigger("reset");
                }
            });
        },
        url : function() {
            return "https://data.flatturtle.com/2/twitter/search/" + encodeURIComponent(this.options.search) + "/" + this.options.limit + ".json";
        },
        parse : function(json) {
            var tweets = json.search.results;

            // process tweets
            for (var i in tweets) {
                // date
                var date = new Date(Date.parse(tweets[i].created_at));
                tweets[i].created_at = getTimestamp(date);

                // #tags
                tweets[i].text = tweets[i].text.replace(/(#[\w-_]+)/g, '<span class="text-color-dark text-shadow-light">$1</span>');
                // @replies
                tweets[i].text = tweets[i].text.replace(/(@[\w-_]+)/g, '<span class="text-color-dark text-shadow-light">$1</span>');
                // links                                  [   https://www.   |www.| domain.| ... ]
                tweets[i].text = tweets[i].text.replace(/((https?:\/\/(\w\.)*|\w\.)[^\s]+\.[^\s]+)/g, '<span class="text-color-dark text-shadow-light">$1</span>');
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
                    entries : this.collection.toJSON()
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
