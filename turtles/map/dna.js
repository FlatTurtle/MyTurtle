/*
 * FlatTurtle
 * @author: Jens Segers (jens@irail.be)
 * @license: AGPLv3
 */

(function($){

    var view = Backbone.View.extend({
        // hold google maps objects
        center : null,
        map : null,
        traffic : null,

        initialize : function() {
            var self = this;
            // prevents loss of "this" inside methods
            _.bindAll(this, "refresh");
            _.bindAll(this, "traffic");
            _.bindAll(this, "rezoom");

            // default zoom
            this.options.zoom = parseInt(this.options.zoom);
            if (!this.options.zoom)
                this.options.zoom = 13;

            // get the google maps api
            $.getScript("//maps.googleapis.com/maps/api/js?v=3.exp&sensor=false&callback=mapsLoaded");

            // render will be triggered when the google maps api is loaded
            this.on("render", this.render);
            this.on("shown", this.refresh);
            this.on("reconfigure", this.render);

            // which zoom level
            this.which = 1;
            // second zoom level, if 0 make equal to main zoom
            if(this.options.zoomalt == 0)
                this.options.zoomalt = this.options.zoom;
            // how fast do we zoom between the two
            if(this.options.zoomtime < 10)
                this.options.zoomtime = 10;
            // milliseconds
            this.options.zoomtime *= 1000;
            var zoomtime = this.options.zoomtime;
            
            setTimeout(function(){
                refreshInterval = setInterval(self.traffic, 240000);
                rezoomInterval = setInterval(self.rezoom, zoomtime);
            }, Math.round(Math.random()*5000));

        },
        traffic : function() {
            var self = this;

            if(self.traffic != null){
                // remove old layer
                self.traffic.setMap(null);
                delete self.traffic;
                self.traffic = null;
            }

            // source: http://stackoverflow.com/questions/7659072/google-maps-refresh-traffic-layer
            // add traffic layer
            setTimeout(function() {
                // add fresh layer
                self.traffic = new google.maps.TrafficLayer();
                self.traffic.setMap(self.map);
            }, 1000);

        },
        rezoom : function() {
            var self = this;
            if(self.options.zoom == self.options.zoomalt)
                return;
            if (self.which == 0){
                self.which = 1;
                self.zoom = self.options.zoom;
            }
            else{
                self.which = 0;
                self.zoom = self.options.zoomalt;
            }
            
            self.map.setZoom(parseInt(self.zoom)); 
        },
        refresh : function() {
            var self = this;
            
            if(typeof application !== "undefined"){
                application.clearCache();
            }

            if (self.map != null) {
                google.maps.event.trigger(self.map, "resize");
                self.map.setCenter(self.center);
            }
        },
        render : function() {
            var self = this;

            $.get("turtles/map/views/widget.html", function(template) {
                var data = {
                    location : self.options.location
                };

                // set window height to load
                self.$el.height("100%");

                // render html
                self.$el.empty();
                self.$el.html(Mustache.render(template, data));

                // change turtle padding
                self.$el.addClass("nopadding");

                // canvas element
                var canvas = self.$el.find("#canvas")[0];

                // map options
                var options = {
                    zoom : parseInt(self.options.zoom),
                    disableDefaultUI: true,
                    mapTypeId : google.maps.MapTypeId.ROADMAP
                };

                // create the google map object
                self.map = new google.maps.Map(canvas, options);

                // pick screen location when location is not set
                if(self.options.location == null || self.options.location == ""){
                    self.options.location = Screen.location.address;
                    Screen.listeners[self.options.id] = true;
                }else{
                    delete Screen.listeners[self.options.id];
                }

                // convert location to geocode
                var geocoder = new google.maps.Geocoder();
                geocoder.geocode({
                    "address" : self.options.location
                }, function(results, status) {
                    if (status == google.maps.GeocoderStatus.OK) {
                        self.center = results[0].geometry.location;
                        self.map.setCenter(self.center);

                        var marker = new google.maps.Marker({
                            map: self.map,
                            position: results[0].geometry.location
                        });

                        // add traffic layer
                        setTimeout(function() {
                            // add fresh layer
                            self.traffic = new google.maps.TrafficLayer();
                            self.traffic.setMap(self.map);
                        }, 1000);
                    }
                });
            });
        }
    });

    // register turtle
    Turtles.register("map", {
        view : view
    });

})(jQuery);

// callback when the google maps api is ready
if (typeof mapsLoaded != "function") {
    function mapsLoaded() {
        // trigger for all map turtles
        Turtles.trigger("map", "render");
    }
}
