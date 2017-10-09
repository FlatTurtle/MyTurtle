<?php

// Log logs from an ajax call
$alias = preg_replace('/[^A-Za-z0-9_\-]/', '_', $_GET['alias']);
$log_file = "log".$alias;
$size = @filesize($log_file);
// Clear file if bigger than 5MB
if($size > 5242880){
    $fh = fopen($log_file, 'w') or die("Can't write to logs folder, make it writable");
    fclose($fh);
}
$fh = fopen($log_file, 'a') or die("Can't write to logs folder, make it writable");

// Add the log line to file
if (array_key_exists('data', $_POST)) {
    $data = $_POST['data'] . "\n";
    fwrite($fh, $data);
}

// Close
fclose($fh);
