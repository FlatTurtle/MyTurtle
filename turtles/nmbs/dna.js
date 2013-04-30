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
            // prevents loss of 'this' inside methods
            _.bindAll(this, "refresh", "configure", "matchConnections");

            // bind events
            this.on("born", this.configure);
            this.on("born", this.refresh);
            this.on("refresh", this.refresh);
            this.on("reconfigure", this.configure);

            // default error value
            options.error = false;

            // keep hash of results
            this.liveboardhash = null;

            // array for holding open request and objects
            this.connectionsRequest = null;
            this.liveboard = [];

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
            // walking time
            if(this.options.time_walk >= 0){
                this.options.time_walk = formatTime(this.options.time_walk);
                this.trigger("reset");
            }else{
                this.options.time_walk = false;
            }

            // don't fetch if there is no location
            if (this.options.location == null || !this.options.location)
                return;

            // parse via points
            if(this.options.destination != null){
                this.options.destination = this.options.destination.split(',');
                for(var d in this.options.destination){
                    this.options.destination[d] = this.options.destination[d].toLowerCase().trim();
                }
            }

            var today = new Date();
            var query = encodeURIComponent(this.options.location) + "/" + today.format("{Y}/{m}/{d}/{H}/{M}");

            var self = this;
            $.getJSON("https://data.irail.be/NMBS/Liveboard/" + query + ".json", function(data) {
                if (data.Liveboard.location.name != undefined) {
                    self.options.station = data.Liveboard.location.name.capitalize();
                    self.trigger("reset");
                }
            });
        },
        refresh : function() {
            // don't fetch if there is no location
            if (this.options.location == null || !this.options.location)
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
            var today = new Date();
            var query = encodeURIComponent(this.options.location) + "/" + today.format("{Y}/{m}/{d}/{H}/{M}");

            return "https://data.irail.be/spectql/NMBS/Liveboard/" + query + "/departures.limit(" + parseInt(this.options.limit) + "):json";
        }
        ,
        parse : function(json) {
            var self = this;

            this.options.error = false;

            // only parse when the results are new
            var newhash = JSON.stringify(json.spectql).hashCode();
            if(newhash != this.liveboardhash){
                this.liveboardhash = newhash;

                // parse ajax results
                this.liveboard = null;
                this.liveboard = json.spectql;


                if(this.liveboard.length > 0){
                    // abort previous request
                    if(this.connectionsRequest)
                        this.connectionsRequest.abort();
                    this.connectionsRequest = null;

                    var vehicle = {};

                    // loop throught train results
                    for (var i in this.liveboard) {

                        // append vehicle to list
                        if(this.liveboard[i].vehicle){
                            var current_vehicle = encodeURIComponent(this.liveboard[i].vehicle);
                            if(current_vehicle.length > 0){
                                vehicle[current_vehicle] = true;
                            }
                        }

                        if(this.liveboard[i].time){
                            var time = new Date(this.liveboard[i].time * 1000);
                            this.liveboard[i].time = time.format("{H}:{M}");

                            if (this.liveboard[i].delay) {
                                this.liveboard[i].delay = formatTime(this.liveboard[i].delay/60);
                            }
                        }

                        if (this.liveboard[i].direction){
                            this.liveboard[i].direction = this.liveboard[i].direction.capitalize();
                        }

                        if (!this.liveboard[i].platform.name)
                            this.liveboard[i].platform.name = "-";

                        this.liveboard[i].type = this.liveboard[i].vehicle.match(/\.([a-zA-Z]+)[0-9]+$/)[1];
                        if (!this.liveboard[i].type)
                            this.liveboard[i].type = "-";
                    }


                    // If there is a via configured, fetch vehicle results
                    if(this.options.destination && $.isArray(this.options.destination)){
                        // build vehicle string from "set"
                        var vehicle_ids = "";
                        var first_vehicle = true;
                        for(var v in vehicle){
                            if(!first_vehicle){
                                vehicle_ids += ",";
                            }
                            vehicle_ids += v;
                            first_vehicle = false;
                        }

                        this.connectionsRequest = $.ajax({
                            url: "https://data.flatturtle.com/NMBS/Vehicles/"+ vehicle_ids + ".json",
                            async: true,
                            datatype: "json",
                            success: function(data){
                                self.matchConnections(data);
                            }
                        });
                    }

                    self.trigger("reset");
                }else{
                    this.options.error = true;
                }
            }

            return this.liveboard;
        },
        matchConnections : function(data){
            var self = this;
            data = data.Vehicles;

            // match results from vehicles stops with via's
            for (var i in this.liveboard) {
                if(this.liveboard[i].vehicle){
                    var current_vehicle = this.liveboard[i].vehicle;

                    // check if data contains the right information
                    if(data[current_vehicle] &&
                       data[current_vehicle].stops &&
                       data[current_vehicle].stops.stop &&
                       data[current_vehicle].stops.stop.length > 2){

                        var stoparray = data[current_vehicle].stops.stop;

                        // ignore the first value (start station)
                        var pastStart = false;
                        // loop through all but the last one (end station)
                        for(var j=0; j<stoparray.length-1 ; j++){
                            // only start counting when start station is passed in the route
                            if(!pastStart && stoparray[j].station.toLowerCase() == self.options.location.toLowerCase()){
                                pastStart = true;
                            }else if(pastStart && ($.inArray(stoparray[j].station.toLowerCase(), self.options.destination) >= 0)){
                                // found a match, now lets render it
                                if(!self.liveboard[i].via)
                                    self.liveboard[i].via = [];

                                var viaTime = new Date(stoparray[j].time * 1000);
                                stoparray[j].time = viaTime.format("{H}:{M}");
                                self.liveboard[i].via.push(stoparray[j]);
                                self.trigger("reset");
                            }
                        }
                    }
                }
            }
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
            if (this.template == null) {
                $.get("turtles/nmbs/views/list.html", function(template) {
                    self.template = template;
                    self.render();
                });
            }
        },
        render : function() {
            // only render when template file is loaded
            if (this.template) {
                var data = {
                    station : this.options.station || this.options.location,
                    entries : this.collection.liveboard,
                    color : this.options.color,
                    time_walk : this.options.time_walk,
                    error : this.options.error // have there been any errors?
                };

                // add html to container
                this.$el.empty();
                this.$el.html(Mustache.render(this.template, data));
            }
        }
    });

    // register turtle
    Turtles.register("nmbs", {
        collection : collection,
        view : view
    });

})(jQuery);
