/*
 * FlatTurtle
 * Clock plugin
 *
 * @author: Jens Segers (jens@irail.be)
 * @author: Michiel Vancoillie (michiel@irail.be)
 * @license: AGPLv3
 */

var Clock = {

    element : $("#clock"),
    timer : null,

    enable : function() {
        log.info("PLUGIN - CLOCK - Enable");
        // check if clock element exists
        if (Clock.element.length == 0) {
            Clock.element = $('<div id="clock" class="bg-color"><span id="hour">00</span><span id="blink">:</span><span id="minutes">00</span></div>');
            $("body").append(Clock.element);
        }

        // start timer if needed
        if (Clock.timer == null) {
            Clock.timer = window.setInterval(Clock.refresh, 30000);
        }

        // adjust time
        Clock.refresh();

        // show element
        Clock.element.show();
    },

    disable : function() {
        log.info("PLUGIN - CLOCK - Disable");
        // hide clock
        Clock.element.hide();

        // stop timer
        clearInterval(Clock.timer);
        Clock.timer = null;
    },

    refresh : function() {
        var now = new Date();
        var hours = now.getHours();
        var minutes = now.getMinutes();

        hours = (hours < 10 ? "0" : "") + hours;
        minutes = (minutes < 10 ? "0" : "") + minutes;

        Clock.element.find("#hour").html(hours);
        Clock.element.find("#minutes").html(minutes);
    },

    destroy : function() {
        // remove element
        Clock.element.empty();
        Clock.element.remove();

        // clear timer
        window.clearInterval(Clock.timer);
        Clock.timer = null;
    }

};

// default behaviour
Clock.enable();