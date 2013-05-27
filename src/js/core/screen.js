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
        log.info("Start building the screen");

        // populate screen location properties
        Screen.location =  {
                address : config['interface'].location,
                latitude : config['interface'].latitude,
                longitude : config['interface'].longitude,
                geocode : config['interface'].latitude + "," + config['interface'].longitude
        };
        log.info(" Populated location properties");
        log.debug(" Screen.location: ",  Screen.location);

        // setup interface
        Interface.setup(config['interface']);
        log.info(" Done initializing interface");

        // create panes
        log.info(" Start creating panes");
        for (var id in config.panes) {
            var pane = config.panes[id];
            Panes.add(id, pane);
        }
        log.info(" Done adding panes");

        // add a shadow div
        $("#container").prepend('<div id="shadow-mid"></div>');


        // create turtles
        log.info(" Start creating turtles");
        for (var id in config.turtles) {
            var turtle = config.turtles[id];
            Turtles.grow(turtle.type, id, turtle.pane, turtle.order, turtle.options);
        }
        log.info(" Done adding turtles");

        // enable plugins
        log.info(" Start adding plugins");
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
        log.info(" Done adding plugins");

        // create jobs
        log.info(" Start adding cronjobs");
        for(var id in config.jobs) {
            var job = config.jobs[id];
            Jobs.add(job);
        }
        log.info(" Done adding cronjobs");
    }

    /*
     * Fetch the configuration from the api source
     */
    function load(api) {
        log.info("Loading JSON");
        $.ajax({
            url : api,
            dataType: "json",
            success : function(config){
                log.info("Done loading JSON");
                log.debug(config);
                Screen.config = config;
                build(config);
            },
            error: function(xhr, ajaxOptions, e){
                log.error("Error while loading JSON: ", e);
            }
        });
    }

    /**
     * Update screen settings
     */
    function update(options){
        log.info("Update pane with given options");
        log.debug("  Pane options: ", options);
        this.location =  {
                address : options.location,
                latitude : options.latitude,
                longitude : options.longitude,
                geocode : options.latitude + "," + options.longitude
        };

        // Notify all listening turtles
        log.info("Notify turtles of new pane options");
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