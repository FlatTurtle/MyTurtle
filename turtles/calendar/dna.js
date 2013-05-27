/*
 * FlatTurtle
 * @author: Michiel Vancoillie (michiel@irail.be)
 * @license: AGPLv3
 */

(function($) {

    var collection = Backbone.Collection.extend({

        data: null,

        initialize : function(models, options) {
            var self = this;
            // prevents loss of 'this' inside methods
            _.bindAll(this, "refresh", "configure", "refreshData");

            // bind events
            this.on("born", this.configure);
            this.on("born", this.refresh);
            this.on("refresh", this.refresh);
            this.on("reconfigure", this.configure);

            setTimeout(function(){
                refreshInterval = setInterval(self.refresh, 300000);
            }, Math.round(Math.random()*5000));


            setTimeout(function(){
                refreshInterval = setInterval(self.refreshData, 60000);
            }, Math.round(Math.random()*5000));
        },
        configure : function() {

            this.trigger("reset");
        },
        refresh : function() {
            // don't fetch if there is no url
            if (this.options.url == null || !this.options.url)
                return;

            if (this.options.header == null || !this.options.header)
                this.options.header = "Calendar";


            this.options.error = false;

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
            this.data = json.ical;
            this.refreshData();
        },
        refreshData: function(){
            var data = this.data;

            var calendar = [];
            var now = new Date();
            now_unix = now.getTime();

            for(var i in data){
                // Check if event is happening now or in the future
                if(data[i].end*1000 > now_unix){
                    // Check filter based on location
                    if((this.options.filter && this.options.filter.length > 0 && data[i].location.toLowerCase() == this.options.filter.toLowerCase()) ||
                        (!this.options.filter || this.options.filter == "")){
                        calendar.push(data[i]);
                    }
                }else{
                    // Skip passed events
                    continue;
                }

                var start = new Date((data[i].start * 1000));
                var end = new Date((data[i].end * 1000));
                data[i].start_time = start.format("{H}:{M}");
                data[i].start_date = start.formatDateString();
                data[i].end_time = end.format("{H}:{M}");
                data[i].end_date = end.formatDateString();

                // Event starts and ends on same day
                if(data[i].end_date == data[i].start_date)
                    data[i].end_date = null;

                // Handle events that take all day, or multiple days
                if(data[i].start_time == data[i].end_time && data[i].end_time == '00:00'){
                    data[i].start_time = data[i].start_date;
                    data[i].start_date = null;
                    data[i].end_time = data[i].end_date;
                    data[i].end_date = null;


                    if(end.getTime() - start.getTime() == 1000*60*60*24){
                        data[i].end_time = null;
                    }
                }

                // Replace \n
                data[i].description = data[i].description.replace(/\\n/gi,"<br/>");


                data[i].now = false;
                data[i].next = false;

                // Check if an event is happening now
                if(start.getTime() <= now_unix &&
                     end.getTime() >= now_unix){
                    data[i].label_class = "now";
                    data[i].now = true;
                }else if(start.getTime() - now_unix < 1000*60*15){
                    // Check if an event is coming up
                    data[i].label_class = "now";
                    data[i].next = true;
                }
            }

            this.options.events = calendar;
            this.trigger("reset");
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
                    entries : this.options.events,
                    error : this.options.error,
                    header: this.options.header,
                    size: this.options.size,
                    filter: this.options.filter
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
