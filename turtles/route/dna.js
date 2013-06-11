/*
 * FlatTurtle
 * @author: Michiel Vancoillie
 * @license: AGPLv3
 */

(function($) {

    var collection = Backbone.Collection.extend({
        initialize : function(models, options) {
            // prevents loss of 'this' inside methods
            _.bindAll(this, "configure", "parse", "shown");

            // bind events
            this.on("born", this.configure);
            this.on("reconfigure", this.configure);
            this.on("shown", this.shown);

            // default error value
            options.error = false;
            options.limit = 25;

            if(!options.route_type)
                options.route_type = "nmbs";
            else
                options.route_type =  options.route_type.toLowerCase();
        },
        configure : function() {
            // reset results
            this.options.liveboard = null;
            this.options.connections = null;
            this.options.route = null;
            this.options.error = false;

            if(this.options.route_type == "nmbs"){

                // don't fetch if there are no parameters
                if ((this.options.from == null || !this.options.from  || this.options.to == null || !this.options.to) &&
                    (this.options.station == null))
                    return;

                var self = this;

                if(this.options.station == null){
                    // Get connection
                    var url = "http://api.irail.be/connections/?to=" + encodeURIComponent(this.options.to) + "&from=" + encodeURIComponent(this.options.from) + "&format=json&fast=true";

                    $.getJSON(url, function(data){
                        self.parse(data);
                        self.trigger("reset");
                    }).error(function(){
                        self.options.error = true;
                        self.trigger("reset");
                    });
                }else{
                    // Get liveboard
                    if(this.options.type != null){
                        this.options.type = this.options.type.capitalize();
                    }
                    if(this.options.type == null || (this.options.type != 'Departures' && this.options.type != 'Arrivals')){
                        this.options.type = "Departures";
                    }

                    var today = new Date();
                    var query = this.options.type + "/" + encodeURIComponent(this.options.station) + "/" + today.format("{Y}/{m}/{d}/{H}/{M}");

                    var url = "https://data.irail.be/NMBS/" + query + ".json";
                    var self = this;
                    $.getJSON(url, function(data){
                        self.parse(data);
                        self.trigger("reset");
                    }).error(function(){
                        self.options.error = true;
                        self.trigger("reset");
                    });
                }
            }else{
                var datasetURI = 'DeLijn';
                if(this.options.route_type == "mivb"){
                    datasetURI = 'MIVBSTIB';
                }

                this.options.station = this.options.station.capitalize();

                if(this.options.type == null || (this.options.type != 'Departures' && this.options.type != 'Arrivals')){
                    this.options.type = "Departures";
                }

                var self = this;
                $.getJSON("http://data.irail.be/" + datasetURI + "/Stations.json?name=" + encodeURIComponent(this.options.station), function(data) {
                    if (data.Stations[0] != undefined) {
                        self.options.location = data.Stations[0].name.capitalize();
                        self.trigger("reset");
                    }
                });

                var today = new Date();
                var query = encodeURIComponent(this.options.station) + "/" + today.format("{Y}/{m}/{d}/{H}/{M}");

                var url = "http://data.irail.be/" + datasetURI + "/"+ this.options.type + "/" + query + ".json?offset=0&rowcount=" + parseInt(this.options.limit);

                $.getJSON(url, function(data){
                    self.parse(data);
                    self.trigger("reset");
                }).error(function(){
                        self.options.error = true;
                        self.trigger("reset");
                });
            }
        },
        shown : function(){
            this.trigger("reset");
        },
        parse : function(json) {
            var today = new Date();
            var delay;

            if(this.options.route_type == "nmbs"){

                if(json.connection != null){
                    // Parse connection results
                    var data = json.connection;
                    for(var i in data){
                        var connection = data[i];
                        var time = new Date(parseInt(connection.departure.time) * 1000);
                        connection.departure.time = time.format("{H}:{M}");
                        connection.departure.type = connection.departure.vehicle.match(/\.([a-zA-Z]+)[0-9]+$/)[1];
                        if(connection.departure.delay && connection.departure.delay != 0){
                            connection.departure.delay = formatTime(connection.departure.delay/60);
                        }else{
                            connection.departure.delay = false;
                        }
                        time = new Date(parseInt(connection.arrival.time) * 1000);
                        connection.arrival.time = time.format("{H}:{M}");
                        connection.arrival.type = connection.arrival.vehicle.match(/\.([a-zA-Z]+)[0-9]+$/)[1];
                        if(connection.arrival.delay && connection.arrival.delay != 0){
                            connection.arrival.delay = formatTime(connection.arrival.delay/60);
                        }else{
                            connection.arrival.delay = false;
                        }
                        if(connection.vias != null){
                            for(var j in connection.vias.via){
                                var via = connection.vias.via[j];
                                time = new Date(parseInt(via.departure.time) * 1000);
                                via.departure.time = time.format("{H}:{M}");
                                time = new Date(parseInt(via.arrival.time) * 1000);
                                via.arrival.time = time.format("{H}:{M}");
                                if(via.departure.delay && via.departure.delay != 0){
                                    via.departure.delay = formatTime(via.departure.delay/60);
                                }else{
                                    via.departure.delay = false;
                                }
                            }
                        }
                    }

                    var connections = new Object();
                    connections.connection = data;
                    this.options.connections = connections;
                }else if(json.Departures != null || json.Arrivals != null){
                    // Parse liveboard results
                    var data = json.Departures;
                    if(data == null){
                        data = json.Arrivals;
                        data.type = "Arrivals";
                        data.results = data.arrivals;
                        data.arrivals = null;
                    }else{
                        data.type = "Departures";
                        data.results = data.departures;
                        data.departures = null;
                    }

                    for(var i in data.results){
                        var time = new Date(data.results[i].time * 1000);
                        data.results[i].time = time.format("{H}:{M}");

                        if (data.results[i].delay) {
                            data.results[i].delay = formatTime(data.results[i].delay/60);
                        }

                        if (!data.results[i].platform.name)
                            data.results[i].platform.name = "-";

                        data.results[i].type = data.results[i].vehicle.match(/\.([a-zA-Z]+)[0-9]+$/)[1];
                        if (!data.results[i].type)
                            data.results[i].type = "-";
                    }

                    data.route_type = "NMBS";
                    data.nmbs = true;
                    this.options.liveboard = data;
                }

            }else{
                var data = new Object();
                data.results = json.Departures;
                if(data.results == null){
                    data.results = json.Arrivals;
                    data.type = "Arrivals";
                    data.arrivals = null;
                }else{
                    data.type = "Departures";
                    data.departures = null;
                }

                for (var i in data.results) {

                    var time = new Date(data.results[i].time * 1000);
                    data.results[i].time = time.format("{H}:{M}");

                    if (data.results[i].delay) {
                        data.results[i].delay = formatTime(data.results[i].delay/60);
                    }

                    if (!data.results[i].long_name) {
                        data.results[i].long_name = "-";
                    } else {
                        data.results[i].long_name = data.results[i].long_name.capitalize();

                        if (data.results[i].long_name.split("-").length == 2)
                            data.results[i].long_name = data.results[i].long_name.split("-")[1];
                    }
                }

                data.route_type = "De Lijn";
                if(this.options.route_type == "mivb"){
                    data.route_type = "MIVB/STIB";
                }

                data.mivb = true;
                this.options.liveboard = data;
            }

            this.options.from = null;
            this.options.to = null;
            this.options.station = null;
            this.options.type = null;
        }
    });

    var view = Backbone.View.extend({
        map: null,

        initialize : function() {
            // prevents loss of "this" inside methods
            _.bindAll(this, "render");
            var self = this;

            // bind render to collection reset
            this.collection.on("reset", this.render);

            // mapbox layer id
            if (!this.options.layer)
                this.options.layer = 'examples.map-vyofok3q';


            // pre-fetch template file and render when ready
            if (this.template == null) {
                $.get("turtles/route/views/fullscreen.html", function(template) {
                    self.template = template;
                    self.render();
                });
            }
        },
        render : function() {
            // only render when template file is loaded
            if (this.template && (this.options.error || this.options.connections != null || this.options.liveboard != null)) {
                if(this.options.route_type != "nmbs"){
                    this.options.liveboard.location = new Object();
                    this.options.liveboard.location.name = this.options.location;
                }

                var data = {
                    liveboard : this.options.liveboard,
                    connections : this.options.connections,
                    error: this.options.error
                };

                // add html to container
                this.$el.empty();
                this.$el.html(Mustache.render(this.template, data));

                // reset results
                this.options.liveboard = null;
                this.options.connections = null;
                this.options.route = null;
                this.options.error = false;
            }else{
                this.$el.empty();
                this.$el.html("<div class='loading bg-color'><div class='message'>Calculating...</div></div>");
            }
        }
    });

    // register turtle
    Turtles.register("route", {
        collection : collection,
        view : view
    });

})(jQuery);
