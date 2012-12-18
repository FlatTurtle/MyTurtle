/*
 * FlatTurtle
 * The panes object will take care of the available panes
 *
 * @author: Jens Segers (jens@irail.be)
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
			var tab = $('<div class="nav" data-pane="' + id + '"><div class="progress"></div>' + pane.title + '</div>')
			header.append(tab);

			// check if first pane and mark as active if so
			if (header.find(".nav.active").length == 0) {
				tab.addClass("active bg-color");
			}
		}

		// append element
		group.append(pane.el);

		// make sure panes are in correct order
		sort(group.find(".pane"));

		// check if first pane and mark as active if so
		if (group.find(".pane.active").length == 0) {
			pane.el.addClass("active");
		}

		// create first timer for rotation if more than 2 panes
		if (group.find(".pane").length > 1 && timers[pane.type] == null) {
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
		var pane = panes[id];

		// remove element
		pane.el.remove();
	}

	/*
	 * Make a pane fullscreen
	 */
	function fullscreen(id, duration) {
		id = parseInt(id);
		duration = parseInt(duration);

		// default duration
		if (duration == undefined)
			duration = pane.duration;

		var pane = panes[id];

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
		var pane = panes[id];

		// remove fullscreen class
		pane.el.removeClass("fullscreen");
	}

	/*
	 * Change pane order
	 */
	function order(id, order) {
		var pane = panes[id];
		var group = $(".group." + pane.type);

		// set order on object
		pane.order = order;

		// change order attribute
		pane.el.attr("data-order", parseInt(order));

		// make sure panes are in correct order
		sort(group.find(".pane"));
	}

	/*
	 * Change pane display duration
	 */
	function duration(id, ms) {
		var pane = panes[id];

		// set duration on object
		pane.duration = ms;
	}

	/*
	 * Rotate to the next pane in a group
	 */
	function rotate(group) {
		// get the group and current active pane
		var group = $(".group." + group);
		var active = group.find(".pane.active");

		// get the next pane
		var next = active.next();
		if (next.length == 0) {
			next = group.find(".pane").first();
		}

		// show next pane
		show(next.data("id"));
	}

	/*
	 * Switch to a pane by id
	 */
	function show(id) {
		if (panes[id] == null)
			return;

		var pane = panes[id];
		var group = $(".group." + pane.type);

		// stop previous timeout if it is still running
		clearTimeout(timers[pane.type]);

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

		// mark pane as active and show
		group.find(".pane.active").removeClass("active");
		pane.el.addClass("active");

		// trigger event for turtles in this pane
		pane.el.find(".turtle").each(function() {
			Turtles.trigger($(this).data("id"), "shown");
		});

		// create timer for next rotation
		timers[pane.type] = setTimeout(function() {
			rotate(pane.type);
		}, pane.duration);
	}

	/*
	 * Get a panel by id
	 */
	function get(id) {
		return panes[id];
	}

	/*
	 * Append an element to a pane by id
	 */
	function append(id, element) {
		if (panes[id] == null)
			return;

		// append
		panes[id].el.append(element);

		// sort turtles
		sort(panes[id].el.find(".turtle"));
	}

	/*
	 * Check if a pane is active
	 */
	function isActive(id) {
		if (panes[id] == null)
			return;

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
		append : append,
		fullscreen : fullscreen,
		close : close,
		isActive : isActive
	};

}());