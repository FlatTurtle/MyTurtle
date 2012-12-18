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
			// prevents loss of "this" inside methods
			_.bindAll(this, "refresh");

			// default zoom
			if (!this.options.zoom)
				this.options.zoom = 13;

			// get the google maps api
			$.getScript("//maps.googleapis.com/maps/api/js?sensor=false&callback=mapsLoaded");

			// render will be triggered when the google maps api is loaded
			this.on("render", this.render);
			this.on("shown", this.refresh);

			refreshInterval = setInterval(this.refresh, 300000);
		},
		refresh : function() {
			var self = this;

			if(this.traffic != null){
				// remove old layer
				this.traffic.setMap(null);
				this.traffic = null;

				// source: http://stackoverflow.com/questions/7659072/google-maps-refresh-traffic-layer
				setTimeout(function() {
					// add fresh layer
					self.traffic = new google.maps.TrafficLayer();
					self.traffic.setMap(self.map);
				}, 100);
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
					}
				});

				// add traffic layer
				self.traffic = new google.maps.TrafficLayer();
				self.traffic.setMap(self.map);
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
