<?php $rand = rand(); ?>
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

		<link rel="stylesheet" href="client/css/normalize.css?<?php echo $rand; ?>">
		<link rel="stylesheet" href="client/css/main.css?<?php echo $rand; ?>">
		<link rel="stylesheet" href="client/css/leaflet.css?<?php echo $rand; ?>">
   		<link type="text/css" rel="stylesheet" href="//fast.fonts.com/cssapi/66253153-9c89-413c-814d-60d3ba0d6ac2.css"/>
	</head>
	<body>
		<!--[if lt IE 7]>
			<p class="chromeframe">You are using an outdated browser. <a href="http://browsehappy.com/">Upgrade your browser today</a> or <a href="http://www.google.com/chromeframe/?redirect=true">install Google Chrome Frame</a> to better experience this site.</p>
		<![endif]-->

		<div id="container" class="clearfix">

		</div>

		<footer>
			<img src="client/css/images/ft_logo.jpg" alt="FlatTurtle" id="flatturtle-logo" />
			<img src="client/css/images/logo_placeholder.png" alt="Logo" id="client-logo" />
		</footer>

		<script src="client/js/libs/leaflet.js?<?php echo $rand; ?>"></script>
		<script src="client/js/libs/wax.leaf.min.js?<?php echo $rand; ?>"></script>
		<script src="client/js/libs/jquery.js?<?php echo $rand; ?>"></script>
		<script src="client/js/libs/underscore.js?<?php echo $rand; ?>"></script>
		<script src="client/js/libs/backbone.js?<?php echo $rand; ?>"></script>
		<script src="client/js/libs/mustache.js?<?php echo $rand; ?>"></script>
		<script src="client/js/libs/tinycolor.js?<?php echo $rand; ?>"></script>
		<script src="client/js/libs/later.js?<?php echo $rand; ?>"></script>
		<script src="client/js/libs/duration.js?<?php echo $rand; ?>"></script>

		<script src="client/js/core/functions.js?<?php echo $rand; ?>"></script>
		<script src="client/js/core/screen.js?<?php echo $rand; ?>"></script>
		<script src="client/js/core/interface.js?<?php echo $rand; ?>"></script>
		<script src="client/js/core/turtles.js?<?php echo $rand; ?>"></script>
		<script src="client/js/core/panes.js?<?php echo $rand; ?>"></script>
		<script src="client/js/core/jobs.js?<?php echo $rand; ?>"></script>

		<script src="client/js/plugins/clock.js?<?php echo $rand; ?>"></script>
		<script src="client/js/plugins/google.js?<?php echo $rand; ?>"></script>
		<script src="client/js/plugins/power.js?<?php echo $rand; ?>"></script>
		<script src="client/js/plugins/message.js?<?php echo $rand; ?>"></script>
		<script src="client/js/plugins/overlay.js?<?php echo $rand; ?>"></script>
		<script src="client/js/plugins/footer.js?<?php echo $rand; ?>"></script>

		<script>
			Screen.load('<?php echo $alias; ?>.json?<?php echo $rand; ?>');
		</script>

	</body>
</html>