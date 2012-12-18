/*
 * FlatTurtle
 * @author: Michiel Vancoillie
 * @license: AGPLv3
 */

(function($) {

	var collection = Backbone.Collection.extend({
		initialize : function(models, options) {
			// prevents loss of 'this' inside methods
			_.bindAll(this, "configure", "parse");

			// bind events
			this.on("born", this.configure);
			this.on("reconfigure", this.configure);

			// default error value
			options.error = false;

			// default limit
			if (!options.limit)
				options.limit = 3;
		},
		configure : function() {
			// reset results
			this.options.liveboard = null;
			this.options.connections = null;
			this.options.route = null;

			// don't fetch if there are no parameters
			if ((this.options.from == null || !this.options.from  || this.options.to == null || !this.options.to) &&
				(this.options.station == null))
				return;

			var self = this;

			if(this.options.station == null){
				// Get connection
				var url = "http://api.irail.be/connections/?to=" + encodeURIComponent(this.options.to) + "&from=" + encodeURIComponent(this.options.from) + "&format=json&results=" + this.options.limit;

				$.getJSON(url, function(data){
					self.parse(data);
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

				var url = "http://data.irail.be/NMBS/" + query + ".json";
				var self = this;
				$.getJSON(url, function(data){
					self.parse(data);
					self.trigger("reset");
				});
			}
		},
		parse : function(json) {
			var today = new Date();
			var timezoneOffset = today.getTimezoneOffset() * 60000;
			var delay;

			if(json.connection != null){
				// Parse connection results
				var data = json.connection;
				for(var i in data){
					var connection = data[i];
					var time = new Date(parseInt(connection.departure.time) * 1000);
					connection.departure.time = time.format("{H}:{M}");
					connection.departure.type = connection.departure.vehicle.match(/\.([a-zA-Z]+)[0-9]+$/)[1];
					if(connection.departure.delay && connection.departure.delay != 0){
						var delay = new Date(connection.departure.delay * 1000 + timezoneOffset);
						connection.departure.delay = delay.format("{H}:{M}");
					}else{
						connection.departure.delay = false;
					}
					time = new Date(parseInt(connection.arrival.time) * 1000);
					connection.arrival.time = time.format("{H}:{M}");
					connection.arrival.type = connection.arrival.vehicle.match(/\.([a-zA-Z]+)[0-9]+$/)[1];
					if(connection.arrival.delay && connection.arrival.delay != 0){
						var delay = new Date(connection.arrival.delay * 1000 + timezoneOffset);
						connection.arrival.delay = delay.format("{H}:{M}");
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
								var delay = new Date(via.departure.delay * 1000 + timezoneOffset);
								via.departure.delay = delay.format("{H}:{M}");
							}else{
								via.departure.delay = false;
							}
						}
					}
				}

				// calculate viapoints
				var interestpoints = new Array();
				var part = new Object();
				part.start = data[0].departure.station;

				if(data[0].vias != null){
					var count = parseInt(data[0].vias.number);
					if(count > 0){
						for(var i in data[0].vias.via){
							var via = data[0].vias.via[i];
							part.vehicle = via.vehicle;
							part.end = via.station;
							interestpoints.push(part);

							part = new Object();
							part.start = via.station;

							if(i < (count-2)){
								i++;
								var via = data[0].vias.via[i];
								part.vehicle = via.vehicle;
								part.end = via.station;
								i--;
							}
						}
					}
				}

				part.vehicle = data[0].arrival.vehicle;
				part.end = data[0].arrival.station;
				interestpoints.push(part);

				// calculate every stop
				var route = new Array();
				for(var i=0; i< interestpoints.length; i++){
					var ipoint = interestpoints[i];
					$.ajax({
						url: "http://api.irail.be/vehicle/?id="+ ipoint.vehicle + "&format=json",
						dataType: 'json',
						async: false,
						success: function(json) {
							var in_route = false;
							for(var j in json.stops.stop){
								var stop = json.stops.stop[j];
								if(stop.station == ipoint.start){
									in_route = true;
								}
								if(in_route){
									route.push(new Array(parseFloat(stop.stationinfo.locationY),
															parseFloat(stop.stationinfo.locationX)));
								}
								if(stop.station == ipoint.end){
									in_route = false;
								}
							}
						}
					});
				}
				var connections = new Object();
				connections.connection = data;
				this.options.connections = connections;
				this.options.route = route;
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
						var delay = new Date(data.results[i].delay * 1000 + timezoneOffset);
						data.results[i].delay = delay.format("{H}:{M}");
					}

					if (!data.results[i].platform.name)
						data.results[i].platform.name = "-";

					data.results[i].type = data.results[i].vehicle.match(/\.([a-zA-Z]+)[0-9]+$/)[1];
					if (!data.results[i].type)
						data.results[i].type = "-";
				}

				this.options.liveboard = data;
			}
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
			if (this.template && (this.options.connections != null || this.options.liveboard != null)) {
				var data = {
					liveboard : this.options.liveboard,
					connections : this.options.connections,
					route : this.options.route
				};

				// add html to container
				this.$el.empty();
				this.$el.html(Mustache.render(this.template, data));

				var self = this;
				// only draw map on correct type
				if(this.options.connections != null){
					// draw map with stops
					var canvas = this.$el.find(".map")[0];

					wax.tilejson('http://api.tiles.mapbox.com/v2/' + this.options.layer + '.jsonp',
						function(tilejson) {
							var map = new L.Map(canvas, {zoomControl:false})
							.addLayer(new wax.leaf.connector(tilejson))
							.setView(new L.LatLng(51.505, -0.09), 10);
							var	polyline = new L.Polyline(data.route, {color:'#'+Interface.config.color, weight: 6, opacity: 0.7}).addTo(map);
							for(var i in data.route){
								new L.CircleMarker(data.route[i],{fillColor: Interface.config.darkColor, weight: 0, fillOpacity: 0.9, radius: 5}).addTo(map);
							}
							map.fitBounds(polyline.getBounds());
						}
					);
				}
			}
		}
	});

	// register turtle
	Turtles.register("route", {
		collection : collection,
		view : view
	});

})(jQuery);