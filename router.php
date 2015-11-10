<?php
$url = parse_url($_SERVER['REQUEST_URI']);
if (preg_match('/\.(?:js|css|html|php|handlebars|png|gif|jpg)$/', $url['path'])) {
    return false;    // serve the requested resource as-is.
}
include __DIR__.'/public/index.html';
