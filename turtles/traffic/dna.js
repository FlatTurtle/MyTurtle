/*
 * FlatTurtle
 * @author: Michiel Vancoillie
 * @license: AGPLv3
 */

(function($) {

    var collection = Backbone.Collection.extend({
        initialize : function(models, options) {
            var self = this;
            // prevents loss of "this" inside methods
            _.bindAll(this, "refresh");

            // fetch data when born
            this.on("born", this.refresh);
            this.on("refresh", this.refresh);
            this.on("reconfigure", this.refresh);

            // default error value
            options.error = false;
            options.feed = "http://www.verkeerscentrum.be/rss/1|100|101|102|103|2|4|5|21|78|80|82|22|83|81|79|23|24|25|26|43|56|57|31|32|33|34|30|66|67|29|68|69|27|28|44|70|71|45|73|72|51|50|46|47|39|40|38|37|48|74|75|49|76|77|36|35|62|63|58|59|52|53|64|65|42|41|60|61|54|55-INC|LOS|INF|PEVT.xml";

            // default limit
            if (!options.limit)
                options.limit = 10;

            // automatic collection refresh each minute, this will
            // trigger the reset event
            setTimeout(function(){
                refreshInterval = setInterval(self.refresh, 60000);
            }, Math.round(Math.random()*5000));
        },
        refresh : function() {
            // don't fetch if there is no feed
            if (this.options.feed == null || !this.options.feed)
                return;

            var self = this;
            self.fetch({
                error : function(jqXHR, textStatus, errorThrown) {
                    // will allow the view to detect errors
                    self.options.error = true;

                    // if there are no previous items to show, display error message
                    if (self.length == 0)
                        self.trigger("reset");
                }
            });
        },
        url : function() {
            // remote source url
            return "//www.google.com/reader/public/javascript/feed/" + this.options.feed + "?callback=?";
        },
        parse : function(json) {
            // Reverse order
            var items = [];
            for(i = json.items.length-1;i>=0;i--)
            {
                items.push(json.items[i]);
            }
            items = items.slice(0, this.options.limit - 1);

            for (var i in items) {
                var time = new Date(items[i].published * 1000);
                items[i].time = time.format("{H}:{m}");

                items[i].summary = items[i].summary.replace("\n", " ").replace("\r", "").replace("\r\n", "");

                var matches = items[i].summary.match(/(.*?):(.*?):(.*)/);
                items[i].road = matches[1].trim();
                items[i].desc = matches[2].trim().replace('->','&rarr;');
                items[i].summary = matches[3].trim();
            }

            // return only limited number if items
            return items;
        }
    });

    var view = Backbone.View.extend({
        initialize : function() {
            // prevents loss of "this" inside methods
            _.bindAll(this, "render");

            // bind render to collection reset
            this.collection.on("reset", this.render);

            // pre-fetch template file and render when ready
            var self = this;
            if(this.template == null) {
                $.get("turtles/traffic/views/widget.html", function(template) {
                    self.template = template;
                    self.render();
                });
            }
        },
        render : function() {
            // only render when template file is loaded
            if (this.template) {
                var data = {
                    error : this.options.error,
                    entries : this.collection.toJSON()
                };

                // add html to container
                this.$el.empty();
                this.$el.html(Mustache.render(this.template, data));
            }
        }
    });

    // register turtle
    Turtles.register("traffic", {
        collection : collection,
        view : view
    });

})(jQuery);
