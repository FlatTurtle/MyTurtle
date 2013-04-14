/*
 * FlatTurtle
 * @author: Jens Segers (jens@irail.be)
 * @author: Michiel Vancoillie (michiel@irail.be)
 * @license: AGPLv3
 */

(function($) {

    var collection = Backbone.Collection.extend({
        initialize : function(models, options) {
            log.debug("TURTLE - RSS - Initialize");
            // prevents loss of "this" inside methods
            _.bindAll(this, "refresh");

            // fetch data when born
            this.on("born", this.refresh);
            this.on("refresh", this.refresh);
            this.on("reconfigure", this.refresh);

            // default error value
            options.error = false;

            // default limit
            if (!options.limit)
                options.limit = 5;

            // automatic collection refresh each 4 minutes, this will
            // trigger the reset event
            refreshInterval = window.setInterval(this.refresh, 240000);
        },
        refresh : function() {
            log.debug("TURTLE - RSS - Refresh");
            // don't fetch if there is no feed
            if (this.options.feed == null || !this.options.feed)
                return;

            var self = this;
            self.fetch({
                error : function(jqXHR, e) {
                    log.error("TURTLE - RSS - Can't fetch results: ", e.statusText);
                    // will allow the view to detect errors
                    self.options.error = true;

                    // if there are no previous items to show, display error message
                    if (self.length == 0)
                        self.trigger("reset");
                }
            });
        },
        url : function() {
            log.debug("TURTLE - RSS - Create URL");
            // remote source url
            return "//www.google.com/reader/public/javascript/feed/" + encodeURIComponent(this.options.feed) + "?callback=?";
        },
        parse : function(json) {
            log.info("TURTLE - RSS - Parse results");

            var entries = new Object();

            try{
                this.options.source = json.title;
                var items = json.items.slice(0, this.options.limit - 1);

                for (var i in items) {
                    var time = new Date(items[i].published * 1000);
                    items[i].time = time.format("{H}:{M}");

                    // Determine type
                    if(items[i].enclosure && items[i].enclosure.href != null && !items[i].summary){
                        entries.type_images = true;
                        if(!entries.rss_images)
                            entries.rss_images = new Array();
                        entries.rss_images.push(items[i]);
                    }else{
                        if(!entries.rss_feeds)
                            entries.rss_feeds = new Array();
                        entries.rss_feeds.push(items[i]);
                    }
                }
            }catch(e){
                log.warn("TURTLE - RSS - Can't parse results");
            }

            // return only limited number if items
            return entries;
        }
    });

    var view = Backbone.View.extend({
        initialize : function() {
            log.debug("TURTLE - RSS - Initialize view");
            // prevents loss of "this" inside methods
            _.bindAll(this, "render");

            // bind render to collection reset
            this.collection.on("reset", this.render);

            // pre-fetch template file and render when ready
            var self = this;
            if(this.template == null) {
                $.get("turtles/rss/views/widget.html", function(template) {
                    self.template = template;
                    self.render();
                });
            }
        },
        render : function() {
            log.debug("TURTLE - RSS - Refresh view");
            // only render when template file is loaded
            if (this.template) {
                var data = {
                    error : this.options.error,
                    source : this.options.source,
                    entries : this.collection.toJSON()
                };

                // add html to container
                this.$el.empty();
                this.$el.html(Mustache.render(this.template, data));

                if(data.entries.length > 0 && data.entries[0].type_images){
                    // change turtle padding for imagewall
                    this.$el.addClass("nopadding");
                }else{
                    this.$el.removeClass("nopadding");
                }
            }
        }
    });

    // register turtle
    Turtles.register("rss", {
        collection : collection,
        view : view
    });

})(jQuery);
