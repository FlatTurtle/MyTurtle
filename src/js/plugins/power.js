/*
 * FlatTurtle
 * Wrapper Qt Browser application object
 *
 * @author: Jens Segers (jens@irail.be)
 * @author: Michiel Vancoillie (michiel@irail.be)
 * @license: AGPLv3
 */

var Power = {

    enable : function() {
        log.info("PLUGIN - POWER - Enable");
        if (typeof application == "object")
            application.enableScreen(true);
    },

    disable : function() {
        log.info("PLUGIN - POWER - Disable");
        // MyTurtleSleep page will turn it off after 3s
        document.location.href = '../sleep';
    },

    destroy : function() {}

};