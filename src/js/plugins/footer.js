/*
 * FlatTurtle
 * Footer RSS plugin
 *
 * @author: Jens Segers (jens@irail.be)
 * @author: Michiel Vancoillie (michiel@irail.be)
 * @license: AGPLv3
 */

var Footer = {

    element : null,

    enable : function(source) {
        // destroy previous message
        Footer.destroy();
        log.info("PLUGIN - FOOTER - Enable: " + source);


        if (source.indexOf('http://') == 0 || source.indexOf('//') == 0) {
            $.getJSON("//www.google.com/reader/public/javascript/feed/" + source + "?callback=?", function(data) {
                var items = data.items.slice(0,5);

                // create marquee element
                Footer.element = $('<div id="message" class="scroll-footer"><div class="fade left"></div><div class="fade right"></div><marquee class="text-color"></marquee>');

                // create content
                for(var i in items) {
                    Footer.element.find('marquee').append('<span>' + items[i]['title'] + '</span>');
                }

                $("footer").append(Footer.element);
            });
        } else {
            // create marquee element
            Footer.element = $('<div id="message" class="text-color">' + source + '</div>');
            $("footer").append(Footer.element);
        }
    },

    disable : function() {
        log.info("PLUGIN - FOOTER - Disable");
        // enable marquee style
        if (Footer.element)
            Footer.element.remove();
    },

    destroy : function() {
        Footer.disable();
    }

};