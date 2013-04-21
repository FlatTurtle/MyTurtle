/*
 * FlatTurtle
 * Flash message plugin
 *
 * @author: Jens Segers (jens@irail.be)
 * @author: Michiel Vancoillie (michiel@irail.be)
 * @license: AGPLv3
 */

var Message = {

    element : $("#message"),
    timer : null,

    enable : function(text, duration) {
        log.info("PLUGIN - MESSAGE - Enable (text: " + text + ", duration: " + duration + ")");
        // default duration
        if (duration == undefined)
            duration = 30000;

        // check if clock element exists
        if (Message.element.length == 0) {
            Message.element = $('<div id="black-screen"><h1 class="text-color"></h1></div>');
            $("body").append(Message.element);
        }

        var msg = Message.element.find("h1");
        msg.html(text);
        msg.css("margin-top", "-" + (msg.height()/2) + "px");

        // remove
        if (duration != 0) {
            clearTimeout(Message.timer);
            Message.timer = setTimeout(Message.disable, duration);
        }

        Message.element.fadeIn();
    },

    disable : function() {
        log.info("PLUGIN - MESSAGE - Disable");
        // hide message
        Message.element.fadeOut();
        clearTimeout(Message.timer);
    },

    destroy : function() {
        // remove element
        Message.element.remove();
        clearTimeout(Message.timer);
    }

};