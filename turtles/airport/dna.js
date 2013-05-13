/*
 * FlatTurtle
 * @author: Jens Segers (jens@irail.be)
 * @author: Michiel Vancoillie (michiel@irail.be)
 * @license: AGPLv3
 */

(function($) {

    var collection = Backbone.Collection.extend({
        initialize : function(models, options) {
            var self = this;
            log.debug("TURTLE - AIRPORT - Initialize");
            // prevents loss of 'this' inside methods
            _.bindAll(this, "refresh", "configure");

            // bind events
            this.on("born", this.configure);
            this.on("born", this.refresh);
            this.on("refresh", this.refresh);
            this.on("reconfigure", this.configure);

            // default error value
            options.error = false;

            // set type (departures | arrivals)
            if(!options.type || options.type != "arrivals"){
                options.type = "departures";
            }

            // default limit
            if (!options.limit)
                options.limit = 5;

            // automatic collection refresh each minute, this will
            // trigger the reset event
            setTimeout(function(){
                refreshInterval = setInterval(self.refresh, 60000);
            }, Math.round(Math.random()*5000));
        },
        configure : function() {
            log.debug("TURTLE - AIRPORT - Configure");
            // don't fetch if there is no location
            if (this.options.location == null || !this.options.location)
                return;

            this.options.location = this.options.location.toUpperCase();

            // get the airport name
            var self = this;
            $.ajax({
                url: "https://data.irail.be/spectql/Airports/Stations%7Bname,code,longitude,latitude%7D?code=='" + encodeURIComponent(self.options.location) + "':json",
                dataType: "json",
                success: function(data) {
                    if (data.spectql.length > 0) {
                        // detect airport name change
                        if (self.options.airport != data.spectql[0].name) {
                            self.options.airport = data.spectql[0].name;
                            self.trigger("reset");
                        }
                    }
                },
                error: function(jqXHR, textStatus) {
                    log.error("TURTLE - AIRPORT - Can't fetch station name: ", textStatus);
                }
            });
        },
        refresh : function() {
            log.debug("TURTLE - AIRPORT - Refresh");
            // don't fetch if there is no location
            if (this.options.location == null || !this.options.location)
                return;

            // refresh entries
            var self = this;
            self.fetch({
                error : function(jqXHR, e) {
                    log.error("TURTLE - AIRPORT - Can't fetch results: ", e.statusText);
                    // will allow the view to detect errors
                    self.options.error = true;

                    // if there are no previous items to show, display error message
                    if(self.length == 0) {
                        self.trigger("reset");
                    }
                }
            });
        },
        url : function() {
            log.debug("TURTLE - AIRPORT - Get URL");
            // Fetch the results from half an hour from now
            var today = new Date();

            // For arrivals remove quarter hour
            if(this.options.type == "arrivals"){
                today.addHours(-0.25);
            }else{
                // For departures add one hour
                today.addHours(1);
            }


            var query = encodeURIComponent(this.options.location) + "/" + today.format("{Y}/{m}/{d}/{H}/{M}");

            // remote source url
            // todo: add departures or arrivals
            return "https://data.irail.be/Airports/Liveboard/" + query + ".json?direction="+ this.options.type;
        },
        parse : function(json) {
            log.info("TURTLE - AIRPORT - Parse results");
            // parse ajax results
            var liveboard = json.Liveboard[this.options.type];
            this.options.error = false;

            liveboard = liveboard.slice(0, this.options.limit + 25);

            var today = new Date();
            today.addHours(-0.25);
            today = today.getTime()/1000;

            if(liveboard.length > 0){
                var i = liveboard.length;
                while(i--){
                    if(liveboard[i].time && liveboard[i].time > today){
                        var time = new Date(liveboard[i].time * 1000);
                        liveboard[i].time = time.format("{H}:{M}");

                        if (liveboard[i].delay) {
                            var delay = parseInt(liveboard[i].delay);
                            if(delay < 0){
                                delay = Math.abs(delay);
                                if(delay < 3600){
                                    // this one is early, add to delay to display in view
                                    liveboard[i].delay = new Object();
                                    liveboard[i].delay.early = formatTime(delay/60);
                                }else{
                                    liveboard[i].delay = false;
                                }
                            }else{
                                liveboard[i].delay = formatTime(delay/60);
                            }
                        }
                    }else{
                        liveboard.splice(i, 1);
                    }
                }
            }else{
                this.options.error = true;
            }
            liveboard = liveboard.slice(0, this.options.limit);

            return liveboard;
        }
    });

    var view = Backbone.View.extend({
        initialize : function() {
            log.debug("TURTLE - AIRPORT - Initialize view");
            // prevents loss of 'this' inside methods
            _.bindAll(this, "render");

            // bind render to collection reset
            this.collection.on("reset", this.render);

            var self = this;

            // pre-fetch template file and render when ready
            if (this.template == null) {
                $.get("turtles/airport/views/list.html", function(template) {
                    self.template = template;
                    self.render();
                });
            }
        },
        render : function() {
            log.debug("TURTLE - AIRPORT - Render view");
            // only render when template file is loaded
            if (this.template) {
                var data = {
                    airport : this.options.airport || this.options.location,
                    type: this.options.type.toUpperCase(),
                    entries : this.collection.toJSON(),
                    error : this.options.error // have there been any errors?
                };

                // add html to container
                this.$el.empty();
                this.$el.html(Mustache.render(this.template, data));
            }
        }
    });

    // register turtle
    Turtles.register("airport", {
        collection : collection,
        view : view
    });

})(jQuery);
