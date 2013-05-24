/*
 * FlatTurtle
 * The panes object will take care of the available panes
 *
 * @author: Jens Segers (jens@irail.be)
 * @author: Michiel Vancoillie (michiel@irail.be)
 * @license: AGPLv3
 */

window.Panes = (function() {

    // the container element
    var container = $("div#container");

    // current panes
    var panes = [];

    // hold a list of timers for each group
    var timers = {};


    /*
     * Create a new pane
     */
    function add(id, pane) {
        id = parseInt(id);

        log.info("PANES - Creating #" + id + " (" + pane.type + ")");
        // save pane
        panes[id] = pane;

        // create dom element
        pane.el = $('<section class="pane" data-id="' + id + '" data-order="' + pane.order + '"></section>');

        // search group
        var group = $(".group." + pane.type);

        // create group if needed
        if (group.length == 0) {
            group = $('<section class="group ' + pane.type + '"></section>');
            container.append(group);
        }

        // widget mode
        if (pane.type == "widget") {
            // add color to group
            group.addClass("bg-color");

            // check if the header element exists
            var header = group.find("header");
            if (header.length == 0) {
                header = $("<header></header>");
                group.prepend(header);
            }

            // append header
            pane.tab = $('<div class="nav" data-pane="' + id + '"><div class="progress"></div><span class="title">' + pane.title + '<span></div>');
            header.append(pane.tab);

            // check if first pane and mark as active if so
            if (header.find(".nav.active").length == 0) {
                pane.tab.addClass("active bg-color");
            }
        }

        // append element
        group.append(pane.el);

        // make sure panes are in correct order
        sort(group.find(".pane"));

        // check if first pane and mark as active if so
        if (group.find(".pane.active").length == 0) {
            log.info("PANES -   First in line: #" + id);
            pane.el.addClass("active");
        }

        // create first timer for rotation if more than 2 panes
        if (group.find(".pane").length > 1 && timers[pane.type] == null) {
            log.info("PANES -  Added timer for #" + id);
            // get the previous pane
            var active = group.find(".pane.active").data('id');

            // start the progress bar
            show(active);

            timers[pane.type] = setTimeout(function() {
                rotate(pane.type);
            }, panes[active].duration);
        }
    }

    /*
     * Remove a pane
     */
    function remove(id) {
        log.info("PANES - Removing #" + id);
        var pane = get(id);
        if(!pane){ return; }


        // stop previous timeout if it is still running
        clearTimeout(timers[pane.type]);

        // remove tab
        if (pane.type == "widget") {
            pane.tab.remove();
        }
        // remove element
        pane.el.remove();
        var group = $(".group." + pane.type);

        delete panes[id];

        // kill all the turtles inside
        Turtles.killByPane(id);

        // rotate to next pane
        this.rotate(pane.type);

        if (group.find(".pane").length > 1 && timers[pane.type] == null) {
            // create next timer
            timers[pane.type] = setTimeout(function() {
                rotate(pane.type);
            }, pane.duration);
        }
    }

    /*
     * Make a pane fullscreen
     */
    function fullscreen(id, duration) {
        duration = parseInt(duration);

        // default duration
        if (duration == undefined)
            duration = pane.duration;

        log.info("PANES - Make #" + id + " fullscreen (" + duration + ")");

        var pane = get(id);
        if(!pane){ return; }

        // add fullscreen class
        pane.el.addClass("fullscreen");

        // trigger event for turtles in this pane
        pane.el.find(".turtle").each(function() {
            Turtles.trigger($(this).data("id"), "shown");
        });

        if(timers['fullscreen'] != null)
            clearTimeout(timers['fullscreen']);

        // remove
        if (duration != 0) {
            timers['fullscreen'] = setTimeout(function() {
                pane.el.removeClass("fullscreen");
            }, duration);
        }
    }

    /*
     * Reset a pane from fullscreen
     */
    function close(id) {
        log.info("PANES - Close #" + id + " from fullscreen");
        var pane = get(id);
        if(!pane){ return; }

        // clear timer
        clearTimeout(timers['fullscreen']);

        // remove fullscreen class
        pane.el.removeClass("fullscreen");
    }

    /*
     * Change pane order
     */
    function order(id, order) {
        order = parseInt(order);

        log.info("PANES - Reorder #" + id + ": " + order);
        var pane = get(id);
        if(!pane){ return; }
        var group = $(".group." + pane.type);

        // set order on object
        pane.order = order;

        // change order attribute
        group.find(".nav[data-pane="+id+"]").attr("data-order", parseInt(order));

        // make sure panes and navigation are in correct order
        sort(group.find(".nav"));

        // mark as tab active and put in front
        var header = group.find("header");
        header.find(".active").prependTo(header)
    }

    /*
     * Change pane display duration
     */
    function duration(id, ms) {
        ms = parseInt(ms);

        log.info("PANES - Change duration for #" + id + ": " + ms);
        var pane = get(id);
        if(!pane){ return; }

        // set duration on object
        pane.duration = ms;
    }

    /*
     * Change pane options
     */
    function options(id, options) {
        log.info("PANES - Change options for #" + id);
        log.debug("PANES -   New options: " + options);
        var pane = get(id);
        if(!pane){ return; }

        // Duration
        if(options.duration)
            this.duration(id, parseInt(options.duration));

        // Update title
        if(options.title){
            $('.nav[data-pane='+id+'] .title', container).html(options.title);
        }
    }

    /*
     * Rotate to the next pane in a group
     */
    function rotate(type) {
        log.info("PANES - Rotate group (" + type +")");

        // get the group and current active pane
        var group = $(".group." + type);
        if(group.length > 0){
            var active = group.find(".pane.active");

            // get the next pane
            var next = active.next();
            if (next.length == 0) {
                next = group.find(".pane").first();
            }

            // show next pane
            show(next.data("id"));
        }else{
            log.warn("PANES - Non existing group: " + type);
        }
    }

    /*
     * Switch to a pane by id
     */
    function show(id) {
        log.info("PANES - Show #" + id);

        var pane = get(id);
        if(!pane){ return; }

        var group = $(".group." + pane.type);

        // stop previous timeout if it is still running
        clearTimeout(timers[pane.type]);
        delete timers[pane.type];

        // switch tabs
        if (pane.type == "widget") {
             var header = group.find("header");

             if (group.find(".pane").length > 1) {
                 // mark as tab active and put in front
                 header.find(".active").appendTo(header).removeClass("active bg-color");
                 header.find('.nav[data-pane="' + id + '"]').addClass("active bg-color").prependTo(header);

                 // start animation
                 jQuery.fx.interval = 250;
                 header.find(".progress").stop().width(0);
                 header.find(".active .progress").animate({width:"100%"}, parseInt(pane.duration), function() {
                     $(this).width(0);
                 });
             } else {
                 header.find('.nav[data-pane="' + id + '"]').addClass("active bg-color").prependTo(header);
             }
        }

        // get previous pane
        var prefpane = group.find(".pane.active");

        // trigger event for turtles in previous pane
        prefpane.find(".turtle").each(function() {
            Turtles.trigger($(this).data("id"), "hide");
        });
        prefpane.removeClass("active");


        // mark pane as active and show
        pane.el.addClass("active");

        // trigger event for turtles in this pane
        pane.el.find(".turtle").each(function() {
            Turtles.trigger($(this).data("id"), "shown");
        });


        if (group.find(".pane").length > 1 && timers[pane.type] == null) {
            // create timer for next rotation
            timers[pane.type] = setTimeout(function() {
                rotate(pane.type);
            }, pane.duration);
        }
    }

    /*
     * Get a panel by id
     */
    function get(id) {
        id = parseInt(id);
        var pane = panes[id];
        if (pane == null){
            log.warn("PANES -   Unknown instance #" + id);
            return false;
        }
        return pane;
    }

    /*
     * Append an element to a pane by id
     */
    function append(id, element) {
        var pane = get(id);
        if(!pane){ return; }

        // append
        panes[id].el.append(element);

        // sort turtles
        sort(panes[id].el.find(".turtle"));
    }

    /*
     * Check if a pane is active
     */
    function isActive(id) {
        var pane = get(id);
        if(!pane){ return; }

        return panes[id].el.hasClass("active");
    }

    /*
     * Public interface to this object
     */
    return {
        show : show,
        rotate : rotate,
        add : add,
        remove : remove,
        get : get,
        order : order,
        duration : duration,
        options : options,
        append : append,
        fullscreen : fullscreen,
        close : close,
        isActive : isActive
    };

}());