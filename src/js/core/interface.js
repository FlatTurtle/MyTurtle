/*
 * FlatTurtle
 * The panes object will take care of the interface elements and colors
 *
 * @author: Jens Segers (jens@irail.be)
 * @author: Michiel Vancoillie (michiel@irail.be)
 * @license: AGPLv3
 */

window.Interface = (function() {

    // Interface configuration
    var config = {};

    /*
     * Execute all functions for passed config
     */
    function setup(config) {
        log.info(" Start initializing interface");
        Interface.config = config;

        if (config.color)
            color(config.color);

        if (config.logo)
            logo(config.logo);
    }

    /*
     * Change the ui color
     */
    function color(value) {
        log.info("    Update interface color");
        log.debug("      Color: ", value);
        // just return the color value if no value is given
        if (value == null)
            return Interface.config.color;

        // set to config
        Interface.config.color = value.replace('#', '');

        // style element
        var custom = $('body style#custom');
        if (custom.length == 0) {
            custom = $('<style type="text/css" id="custom"></style>');
            $('body').prepend(custom);
        }

        // custom color shades
        var lightFactor = 0.25;
        var shadeFactor = 0.55;
        var color = tinycolor(value).toRgb();

        var lightColor = tinycolor({
            r: ((255 - color.r)*lightFactor) + color.r,
            g: ((255 - color.g)*lightFactor) + color.g,
            b: ((255 - color.b)*lightFactor) + color.b
        });

        var darkColor = tinycolor({
            r: (color.r*shadeFactor),
            g: (color.g*shadeFactor),
            b: (color.b*shadeFactor)
        });

        var style = '\
            .text-color { color: ' + value + '; } \
            .text-color-light { color: ' + lightColor.toHexString() + '; } \
            .text-color-dark { color: ' + darkColor.toHexString() + '; } \
            .bg-color { background-color: ' + value +  '!important; } \
            .bg-color-light { background-color: ' + lightColor.toHexString() + '; } \
            .bg-color-dark { background-color: ' + darkColor.toHexString() + '; } \
            .border-color { border-color: ' + value + '; } \
            .border-color-light { border-color: ' + lightColor.toHexString() + '; } \
            .text-shadow-light { text-shadow: 1px 1px 1px ' + tinycolor.saturate(value).toRgbString() + '; } \
            .text-shadow-dark { text-shadow: 1px 1px 1px ' + darkColor.toRgbString() + '; } \
            ';

        // add to body
        custom.html(style);
        log.debug("      Color CSS: ", style);

        Interface.config.darkColor = darkColor;
        Interface.config.lightColor = lightColor;
    }

    /*
     * Set the footer logo url
     */
    function logo(url) {
        log.info("    Update interface logo");
        log.debug("      Logo: ", url);
        $('footer #client-logo').css('background-image', 'url("' + url + '")');
    }

    /*
     * Public interface to this object
     */
    return {
        config : config,
        setup : setup,
        color : color,
        logo : logo
    };

}());