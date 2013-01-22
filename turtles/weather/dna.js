(function($) {

	var collection = Backbone.Collection.extend({
		initialize : function(models, options) {
			// prevents loss of 'this' inside methods
			_.bindAll(this, "refresh");

			// bind refresh
			this.on("born", this.refresh);
			this.on("refresh", this.refresh);
			this.on("reconfigure", this.refresh);

			// default error value
			options.error = false;

			// automatic collection refresh each 5 minutes, this will
			// trigger the reset event
			refreshInterval = window.setInterval(this.refresh, 300000);
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
			// pick screen location when location is not set
			if(self.options.location == null || self.options.location == ""){
				self.options.location = Screen.location.geocode;
				Screen.listeners[self.options.id] = true;
			}else{
				delete Screen.listeners[self.options.id];
			}

			var latitude = this.options.location.split(',')[0];
			var longitude = this.options.location.split(',')[1];

			return "https://data.flatturtle.com/Weather/Rainfall/" + encodeURIComponent(latitude) + "/" + encodeURIComponent(longitude) + ".json";
		},
		parse : function(json) {
			var data = json.Rainfall;

			// new array
			var results = new Array();
			var raining;

			// now date object
			var now = data[0].time;
			var date = new Date();

			for (var i in data) {
				// first item
				if (results.length == 0) {
					raining = parseInt(data[i].milimeter) != 0;
					data[i].text = "now";
					data[i].raining = raining;

					results.push(data[i]);
					continue;
				}

				// get date difference
				var diff = new Date((data[i].time - now)* 1000 + date.getTimezoneOffset() * 60000);

				if (diff.getHours() > 1)
					data[i].text = diff.format("in {h} hours");
				else if (diff.getHours() == 1)
					data[i].text = diff.format("in 1 hour");
				else
					data[i].text = diff.format("in {i} minutes");

				// only add entries with change
				if (raining && parseInt(data[i].milimeter) == 0) {
					raining = false;
					data[i].raining = raining;

					results.push(data[i]);
				}
				else if (!raining && parseInt(data[i].milimeter) != 0) {
					raining = true;
					data[i].raining = raining;

					results.push(data[i]);
				}
			}

			return results.slice(0,2);
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
				$.get("turtles/weather/views/list.html", function(template) {
					self.template = template;
					self.render();
				});
			}
		},
		render : function() {
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