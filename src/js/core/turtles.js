/*
 * FlatTurtle
 * The core of the the flatturtle framework. Grow and manage turtles from this
 * basic interface, more functionality is added by prototype.
 *
 * @author: Jens Segers (jens@irail.be)
 * @author: Michiel Vancoillie (michiel@irail.be)
 * @license: AGPLv3
 */

window.Turtles = (function() {

    // all known registered turtles
    var turtles = {};

    // all active turtles
    var instances = {};

    /*
     * Register a new turtle interface
     */
    function register(type, turtle) {
        log.info("TURTLES -     Registering: " + type);
        log.debug("TURTLES -       Turtle: ", turtle);
        if (turtles[type] != null){
            log.warn("TURTLES -     Already registered: " + type);
            return false;
        }else if (typeof turtle != "object"){
            log.error("TURTLES -     Invalid type: " + type);
            return false;
        }else{
            turtles[type] = turtle;
        }

        return true;
    }

    /*
     * Check if a turtle is registered
     */
    function registered(type) {
        return turtles[type] != null;
    }

    /*
     * Trigger an event for a turtle by id or all turtles by type
     */
    function trigger(type, event) {
        if (isNaN(type)) {
            // trigger event turtle type
            log.info("TURTLES - Trigger event (" + event + ") for type: " + type);
            _(instances).each(function(instance, id) {
                if (instance.type == type) {
                    if (typeof instance.collection == "object")
                        instance.collection.trigger(event);
                    if (typeof instance.view == "object")
                        instance.view.trigger(event);
                }
            });
        }else {
            // trigger event for turtle id
            log.info("TURTLES - Trigger event (" + event + ") for #" + type);
            if (instances[type] == null){
                log.error("TURTLES - Unknown instance: #" + id);
                return;
            }

            var instance = instances[type];

            if (typeof instance.collection == "object")
                instance.collection.trigger(event);
            if (typeof instance.view == "object")
                instance.view.trigger(event);
        }
    }

    /*
     * Create a new turtle (backbone) instance
     */
    function instantiate(type, id, pane, options) {
        // get turtle specification
        var turtle = turtles[type];
        if(turtle == null){
            log.error("TURTLES - Type (" + type + ") is not registered");
            return;
        }
        log.info("TURTLES - Instantiate #"+ id + " (type: "+ type+ ", pane: #" + pane + ")");

        // perpare instance object
        var instance = {};
        instance.type = type;
        instance.id = parseInt(id);
        instance.pane = pane;
        instance.el = options.el;
        options.id = id;


        // assign model
        instance.model = turtle.model || Backbone.Model.extend();

        // build and assign collection
        if (typeof turtle.collection == "function") {
            instance.collection = new turtle.collection(turtle.models, options);

            if (instance.collection.model == null)
                instance.collection.model = instance.model;

            // link options
            instance.collection.options = options;
        }

        // build and assign view
        if (typeof turtle.view == "function") {
            instance.view = new turtle.view(_.extend(options, {
                collection : instance.collection,
                model : instance.model,
                el : options.el
            }));

            // link options
            instance.view.options = options;
        }

        // trigger born event
        if (typeof instance.collection == "object")
            instance.collection.trigger("born");
        if (typeof instance.view == "object")
            instance.view.trigger("born");

        // save instance
        instances[id] = instance;
        return instance;
    }

    /*
     * Load a turtle dna with a callback (async)
     */
    function load(type) {
        // dna location
        var source = "turtles/" + type + "/dna.js";
        log.info("TURTLES - Load DNA ("+ source+ ")");

        $.ajax({
            url : source,
            dataType : "script",
            async : false, // prevent duplicate javascript file loading
            error : function() {
                log.error("TURTLES - Unable to load DNA: " + type);
            }
        });
    }

    /*
     * Grows baby turtles.
     */
    function grow(type, id, pane, order, options) {
        id = parseInt(id);
        log.info("TURTLES - Grow #"+ id + " (type: "+ type+ ", pane: #" + pane + ", order: "+ order +")");

        // check if turtle already exists
        if (instances[id] != null){
            log.error("TURTLES - Already exists: " + id);
            return;
        }

        // load the turtle dna if needed
        if (!registered(type))
            load(type);

        // check if dna was loaded
        if (turtles[type] == null){
            log.error("TURTLES - Unknown DNA: " + type);
            return;
        }

        // options must be an object
        if (options == null || typeof options != "object") {
            options = {};
        }

        // create a placeholder
        var placeholder = $('<section class="turtle ' + type + '" data-id="' + id + '" data-order="' + parseInt(order) + '"></section>');
        options.el = placeholder;

        // append placeholder to pane
        Panes.append(pane, placeholder);

        // create a baby turtle
        var instance = instantiate(type, id, pane, options);

        // check if pane is active and trigger event
        if (Panes.isActive(pane)) {
            Turtles.trigger(id, "shown");
        }

        // return our baby turtle
        return instance;
    }

    /*
     * Change a turtle's order
     */
    function order(id, order) {
        id = parseInt(id);
        log.info("TURTLES - Reorder #"+ id + " (order: "+ order +")");
        if (instances[id] == null){
            log.error("TURTLES - Unknown instance: #" + id);
            return;
        }

        var turtle = instances[id];

        // change order attribute
        turtle.el.attr("data-order", parseInt(order));

        // sort turtles in this group
        sort(turtle.el.parent().find(".turtle"));
    }

    /*
     * Change a turtle's options object
     */
    function options(id, options) {
        id = parseInt(id);
        log.info("TURTLES - Set options for #"+ id);
        log.debug("TURTLES -   Options: ", options);
        if (instances[id] == null){
            log.error("TURTLES - Unknown instance: #" + id);
            return;
        }

        var turtle = instances[id];

        // update collection options
        if (typeof turtle.collection != 'undefined')
            turtle.collection.options = _.extend(turtle.collection.options, options);

        // update view options
        if (typeof turtle.view != 'undefined')
            turtle.view.options = _.extend(turtle.view.options, options);

        // trigger reconfigure event
        trigger(id, "reconfigure");
    }

    /*
     * Kill a turtle :(
     */
    function kill(id) {
        id = parseInt(id);
        log.info("TURTLES - Kill #"+ id);
        if (instances[id] == null){
            log.error("TURTLES - Unknown instance: #" + id);
            return;
        }

        var turtle = instances[id];

        // trigger destroy event
        trigger(id, "destroy");

        // remove placeholder
        turtle.el.remove();

        // delete backbone objects
        delete turtle.collection;
        delete turtle.view;
        delete turtle.model;

        // delete instance
        delete instances[id];
    }

    /*
     * Kill all turtles in a specific pane
     */
    function killByPane(pane_id) {
        pane_id = parseInt(pane_id);
        log.info("TURTLES - Kill all in pane #"+ pane_id);
        for(t in instances){
            turtle = instances[t];
            if(turtle.pane == pane_id){
                this.kill(t);
            }
        }
    }

    /*
     * Public interface to this object
     */
    return {
        register : register,
        registered : registered,
        trigger : trigger,
        grow : grow,
        kill : kill,
        killByPane : killByPane,
        options : options,
        order : order
    };

}());