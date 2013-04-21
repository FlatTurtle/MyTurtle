<?php
    // Disable all the caching with a random variable
    $rand = rand();

    // Load some config variables
    $config = @parse_ini_file("config.ini");

    // Clear previous log file
    $safe_alias = preg_replace('/[^A-Za-z0-9_\-]/', '_', $alias);
    $log_file = "client/logs/log". $safe_alias;
    if(ENVIRONMENT == 'development'){
        $log_file = "client/logs/log";
        $safe_alias = "";
    }
    $fh = fopen($log_file, 'w') or die("Can't write to logs folder, make it writable");
    fclose($fh);
?>
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
        <title>InfoScreen</title>
        <meta name="description" content="MyTurtle">
        <meta name="viewport" content="width=device-width, user-scalable=no" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <!-- Place favicon.ico and apple-touch-icon.png in the root directory -->

        <link rel="stylesheet" href="client/css/style.css?<?php echo $rand; ?>">
        <link type="text/css" rel="stylesheet" href="//fast.fonts.com/cssapi/66253153-9c89-413c-814d-60d3ba0d6ac2.css"/>
    </head>
    <body>
        <!--[if lt IE 7]>
            <p class="chromeframe">You are using an outdated browser. <a href="http://browsehappy.com/">Upgrade your browser today</a> or <a href="http://www.google.com/chromeframe/?redirect=true">install Google Chrome Frame</a> to better experience this site.</p>
        <![endif]-->

        <div id="container" class="clearfix"></div>

        <footer>
            <div id='flatturtle-logo' class='logo' style='background-image:url("client/images/logo.jpg")'></div>
            <div id='client-logo' class='logo' style='background-image:url("client/images/logo_placeholder.png")'></div>
        </footer>

        <script src="client/js/log4javascript.min.js?<?php echo $rand; ?>"></script>
        <script>
            // Overwrite alerts
            window.alert = function(text) {
                console.log( 'Tried to alert: ' + text );
                return true;
            };

            // Setup the logger
            var log = log4javascript.getLogger("MyTurtle");
            log.setLevel(log4javascript.Level.WARN);
            // Turn off nasty alerts
            log4javascript.logLog.setQuietMode(true);

            // Log pattern
            var logPattern = new log4javascript.PatternLayout("%d{HH:mm:ss SSS} - %-6p > %m{10}");

            // Create an ajaxAppender
            var ajaxAppender = new log4javascript.AjaxAppender("client/logs/logger.php?alias=<?php echo $safe_alias ?>");
            ajaxAppender.setLayout(logPattern);

            // Create a browserAppender
            var browserAppender = new log4javascript.BrowserConsoleAppender();
            browserAppender.setLayout(logPattern);

            // Add the appender(s) to the logger
            log.addAppender(ajaxAppender);
            log.addAppender(browserAppender);

            log.info("Setup logging");

            // Overwrite default error function
            window.onerror = function(message, url, lineNumber) {
                log.fatal("HOUSTON, WE HAVE A PROBLEM: " + message + " (line "+ lineNumber + ")");
                return true;
            };

            // Add config array
            <?php
                if(!empty($config)){
                    echo "var config = ". json_encode($config);
                }
            ?>

            log.info("Start loading libraries");
        </script>
<?php
    if(ENVIRONMENT != "development"){
        // Load minified javascript
?>
        <script type="text/javascript" src="client/js/script.min.js?<?php echo $rand; ?>"></script>
<?php
    }else{
        // Load unminified javascript files
?>
        <script src="src/js/libs/leaflet.js?<?php echo $rand; ?>"></script>
        <script src="src/js/libs/wax.leaf.js?<?php echo $rand; ?>"></script>
        <script src="src/js/libs/jquery.min.js?<?php echo $rand; ?>"></script>
        <script src="src/js/libs/underscore.js?<?php echo $rand; ?>"></script>
        <script src="src/js/libs/backbone.js?<?php echo $rand; ?>"></script>
        <script src="src/js/libs/mustache.js?<?php echo $rand; ?>"></script>
        <script src="src/js/libs/tinycolor.js?<?php echo $rand; ?>"></script>
        <script src="src/js/libs/later.js?<?php echo $rand; ?>"></script>

        <script type="text/javascript">
            log.info("Done loading libraries");
            log.info("Start loading core files");
        </script>

        <script src="src/js/core/functions.js?<?php echo $rand; ?>"></script>
        <script src="src/js/core/screen.js?<?php echo $rand; ?>"></script>
        <script src="src/js/core/interface.js?<?php echo $rand; ?>"></script>
        <script src="src/js/core/turtles.js?<?php echo $rand; ?>"></script>
        <script src="src/js/core/panes.js?<?php echo $rand; ?>"></script>
        <script src="src/js/core/jobs.js?<?php echo $rand; ?>"></script>

        <script type="text/javascript">
            log.info("Done loading core files");
            log.info("Start loading plugin files");
        </script>

        <script src="src/js/plugins/clock.js?<?php echo $rand; ?>"></script>
        <script src="src/js/plugins/google.js?<?php echo $rand; ?>"></script>
        <script src="src/js/plugins/power.js?<?php echo $rand; ?>"></script>
        <script src="src/js/plugins/message.js?<?php echo $rand; ?>"></script>
        <script src="src/js/plugins/overlay.js?<?php echo $rand; ?>"></script>
        <script src="src/js/plugins/footer.js?<?php echo $rand; ?>"></script>
<?php
    }
?>
        <script type="text/javascript">
            // Here we go!
            log.info("Booting!");
            log.debug("Alias: <?php echo $alias; ?>");

            Screen.load('<?php echo $alias; ?>.json?<?php echo $rand; ?>');
        </script>
    </body>
</html>