/*
 * FlatTurtle
 * @author: Michiel Vancoillie (michiel@irail.be)
 * @license: AGPLv3
 */

(function($) {

    var collection = Backbone.Collection.extend({
        initialize : function(models, options) {
            var self = this;
            // prevents loss of 'this' inside methods
            _.bindAll(this, "refresh", "configure");

            // bind events
            this.on("born", this.configure);
            this.on("born", this.refresh);
            this.on("refresh", this.refresh);
            this.on("reconfigure", this.configure);

            setTimeout(function(){
                refreshInterval = setInterval(self.refresh, 120000);
            }, Math.round(Math.random()*5000));
        },
        configure : function() {


            this.trigger("reset");
        },
        refresh : function() {
            // don't fetch if there is no url
            if (this.options.url == null || !this.options.url)
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
            var url = this.options.url;
            url = url.replace(/\//gi, '+');

            return "https://data.flatturtle.com/2/Calendar/ICal/" + url + ".json";
        },
        parse : function(json) {

            // parse ajax results
            var data = json.ical;
            var calendar = [];
            var now = new Date();
            now_unix = now.getTime();


            for(var i in data){
                // Check if event is happening now or in the future
                if(data[i].end*1000 > now_unix){
                    calendar.push(data[i]);
                }else{
                    // Skip passed events
                    continue;
                }

                var start = new Date((data[i].start * 1000));
                var end = new Date((data[i].end * 1000));
                data[i].start_time = start.format("{H}:{M}");
                data[i].start_date = start.format("{d}/{m}/{y}");
                data[i].end_time = end.format("{H}:{M}");
                data[i].end_date = end.format("{d}/{m}/{y}");
            }

            return calendar;
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
            if (this.template == null) {
                $.get("turtles/calendar/views/list.html", function(template) {
                    self.template = template;
                    self.render();
                });
            }
        },
        render : function() {
            // only render when template file is loaded
            if (this.template) {
                var data = {
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
    Turtles.register("calendar", {
        collection : collection,
        view : view
    });

})(jQuery);
