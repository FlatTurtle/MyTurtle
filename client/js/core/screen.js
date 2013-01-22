/*
 * FlatTurtle
 * The Screen object will delegate from the DISS configuration array to other object
 *
 * @author: Jens Segers (jens@irail.be)
 * @author: Michiel Vancoillie (michiel@irail.be)
 * @license: AGPLv3
 */

window.Screen = (function() {

	// DISS configuration
	var config = {};

	// Screen location
	var location = {};

	// Screen location listeners
	var location_listeners = {};

	/*
	 * Initialize the UI with a DISS configuration array
	 */
	function build(config) {

		// populate screen location properties
		Screen.location =  {
				address : config.interface.location,
				latitude : config.interface.latitude,
				longitude : config.interface.longitude,
				geocode : config.interface.latitude + "," + config.interface.longitude
		};

		// setup interface
		Interface.setup(config.interface);

		// create panes
		for (var id in config.panes) {
			var pane = config.panes[id];
			Panes.add(id, pane);
		}


		// create turtles
		for (var id in config.turtles) {
			var turtle = config.turtles[id];
			Turtles.grow(turtle.type, id, turtle.pane, turtle.order, turtle.options);
		}

		// enable plugins
		for (var name in config.plugins) {
			// try uppercase or lowercase
			if (window[plugin] == null) {
				var plugin = window[name.charAt(0).toUpperCase() + name.slice(1)];
			} else {
				var plugin = window[name];
			}

			if (config.plugins[name] != null && config.plugins[name] != 0 && plugin != null) {
				if(config.plugins[name] == 1){
					plugin.enable();
				}else{
					plugin.enable(config.plugins[name]);
				}
			} else {
				if(plugin != null)
					plugin.disable();
			}
		}

		// create jobs
		for(var id in config.jobs) {
			var job = config.jobs[id];
			Jobs.add(job);
		}
	}

	/*
	 * Fetch the configuration from the api source
	 */
	function load(api) {
		$.ajax({
			url : api,
			dataType: "json",
			success : function(config) {
				Screen.config = config;
				build(config);
			}
		});
	}

	/**
	 * Update screen settings
	 */
	function update(options){
		this.location =  {
				address : options.location,
				latitude : options.latitude,
				longitude : options.longitude,
				geocode : options.latitude + "," + options.longitude
		};

		// Notify all listening turtles
		for(var turtle_id in this.listeners){
			Turtles.options(turtle_id, {location:''});
		}
	}


	/*
	 * Public interface to this object
	 */
	return {
		config : config,
		load : load,
		update : update,
		location : location,
		listeners : location_listeners
	}

}());