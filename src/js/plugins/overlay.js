/*
 * FlatTurtle
 * Put fullscreen image on the screen
 *
 * @author: Michiel Vancoillie
 * @license: AGPLv3
 */

var Overlay = {

    element : null,

    enable : function(url) {
        log.info("PLUGIN - OVERLAY - Enable (url: + " + url + ")");
        if (this.element != null) {
            this.element.remove();
        };

        this.element = $('<div id="black-screen" style="background-image:url(\''+url+'\');"></div>');
        $("body").append(this.element);

        this.element.fadeIn();
    },

    disable : function() {
        log.info("PLUGIN - OVERLAY - Disable");
        var self = this;
        this.element.fadeOut(200, function(){
            self.element.remove();
        });
    }

};