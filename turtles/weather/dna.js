(function($) {

    var collection = Backbone.Collection.extend({
        initialize : function(models, options) {
            var self = this;
            log.debug("TURTLE - WEATHER - Initialize");
            // prevents loss of 'this' inside methods
            _.bindAll(this, "refresh");
            _.bindAll(this, "url");

            // bind refresh
            this.on("born", this.refresh);
            this.on("refresh", this.refresh);
            this.on("reconfigure", this.refresh);

            // default error value
            options.error = false;

            // automatic collection refresh each 5 minutes, this will
            // trigger the reset event
            setTimeout(function(){
                refreshInterval = setInterval(self.refresh, 300000);
            }, Math.round(Math.random()*5000));
        },
        refresh : function() {
            log.debug("TURTLE - WEATHER - Refresh");
            var self = this;
            // pick screen location when location is not set
            if(typeof self.options == "undefined" || self.options.location == null || self.options.location == ""){
                self.options.location = Screen.location.geocode;
                Screen.listeners[self.options.id] = true;
            }else{
                delete Screen.listeners[self.options.id];
            }

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
            log.debug("TURTLE - WEATHER - Create URL");
            var self = this;
            var latitude = self.options.location.split(',')[0];
            var longitude = self.options.location.split(',')[1];
            return "https://data.flatturtle.com/Weather/Rainfall/" + encodeURIComponent(latitude) + "/" + encodeURIComponent(longitude) + ".json";
        },
        parse : function(json) {
            log.info("TURTLE - WEATHER - Parse results");
            var data = json.Rainfall;

            // new array
            var results = new Array();
            var keep = new Array();
            // intervals in minutes to keep
            var keepMinutes = [30, 60, 90, 120, 160, 190];

            var raining = false;

            // now date object
            if(data.length > 0){
                var now = data[0].time;

                for (var i in data) {
                    // minutes from now
                    var delta = (data[i].time - now) / 60;
                    if(delta >= 0){
                        // format the time
                        if (delta == 0)
                            data[i].text = "now";
                        else if (delta > 60 && delta%60 == 0)
                            data[i].text = "in " + Math.round(delta/60) + " hours";
                        else if (delta > 60)
                            data[i].text = "in " + Math.floor(delta/60) + "h" + Math.floor(delta%60);
                        else if (delta == 60)
                            data[i].text = "in 1 hour";
                        else
                            data[i].text = "in " + delta + " min";

                        // raining?
                        data[i].regular = new Object();
                        data[i].regular.raining = parseInt(data[i].milimeter) != 0;

                        // select only the interesting results
                        if (i == 0) {
                            // first item
                            results.push(data[i]);
                        }else if(raining && !data[i].regular.raining) {
                            // sunshine
                            results.push(data[i]);
                        }else if(!raining && data[i].regular.raining) {
                            // raining
                            results.push(data[i]);
                        }else if(keepMinutes.indexOf(delta) > -1) {
                            // delta is a keep value
                            keep.push(data[i]);
                        }

                        raining = data[i].regular.raining;
                    }
                }
            }

            var show_expected = false;
            // Add another square to show expected (when there is no change in weather expected)
            if(results.length == 1){
                show_expected = true;
            }

            // Add other data or keepers if there is not enough change
            if(results.length < 4){
                var owmData = new Array();
                var latitude = this.options.location.split(',')[0];
                var longitude = this.options.location.split(',')[1];
                owmURL = 'https://data.flatturtle.com/Weather/City/' + encodeURIComponent(latitude) + '/' + encodeURIComponent(longitude)+ '.json';
                $.ajax({
                    url: owmURL,
                    async: false,
                    dataType: 'json',
                    success: function(data) {
                        if(data.City && data.City.length > 0)
                            owmData = data.City[0];
                    }
                });

                if(owmData.main){
                    var extra_data = new Object();
                    extra_data.text = "Temperature";
                    // Kelvin to °C
                    extra_data.data = Math.round(owmData.main.temp - 273.15) + " °C";
                    results.push(extra_data);


                    extra_data = new Object();
                    extra_data.text = "Wind speed";
                    // MPS to KM/H
                    var windspeed = owmData.wind.speed;
                    windspeed = Math.round(windspeed*60*60/1000);
                    if(windspeed < 100){
                        extra_data.data =  windspeed + "<span>km/h</span>";
                    }else{
                        extra_data.wind = "wind";
                        extra_data.data =  windspeed + "<p>km/h</p>";
                    }
                    results.push(extra_data);


                    extra_data = new Object();
                    extra_data.text = "Humidity";
                    extra_data.data = Math.round(owmData.main.humidity) + " %";
                    results.push(extra_data);
                }else{
                    results = results.concat(keep);
                    // Sort the new added results
                    results.sort(function(a, b){
                        return a.time > b.time;
                    });
                }
            }

            if(show_expected){
                var expected = jQuery.extend(true, {}, results[0]);
                expected.text = "expected";
                results = results.slice(0,3);
                results.push(expected);
            }

            return results.slice(0,4);
        }
    });

    var view = Backbone.View.extend({
        initialize : function() {
            log.debug("TURTLE - WEATHER - Initialize view");
            // prevents loss of 'this' inside methods
            _.bindAll(this, "render");

            // bind render to collection reset
            this.collection.on("reset", this.render);

            // pre-fetch template file and render when ready
            var self = this;
            if (this.template == null) {
                $.get("turtles/weather/views/list.html", function(template) {
                    self.template = template;
                    self.render();
                });
            }
        },
        render : function() {
            log.debug("TURTLE - WEATHER - Render view");
            // only render when template file is loaded
            if (this.template && this.collection.length) {

                var data = {
                    entries : this.collection.toJSON(),
                    error : this.options.error // have there been any errors?
                };

                // add html to container
                this.$el.empty();
                this.$el.html(Mustache.render(this.template, data));

                // change turtle padding
                this.$el.css('padding-bottom','0px');
            }
        }
    });

    // register turtle
    Turtles.register("weather", {
        collection : collection,
        view : view
    });

})(jQuery);
