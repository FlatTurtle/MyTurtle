/*
 * FlatTurtle
 * Google Analytics plugin
 *
 * @author: Jens Segers (jens@irail.be)
 * @author: Michiel Vancoillie (michiel@irail.be)
 * @license: AGPLv3
 */

var _gaq = _gaq || [];

var Google = {

    enable : function(account, domain) {
        log.info("PLUGIN - GOOGLE - Enable (account: " + account + ", domain: " + domain + ")");

        (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
        (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
        m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
        })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

        ga('create', account, domain);
        ga('send', 'pageview');
    },

    disable : function() {
        log.info("PLUGIN - GOOGLE - Disable");
        // There is not point disabling this plugin
    },

    destroy : function() {}

};

// Default behaviour
Google.enable('UA-31282630-3', 'flatturtle.com');