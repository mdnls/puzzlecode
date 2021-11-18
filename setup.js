requirejs.config({
	paths: {
	    'bootstrap': 'https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.0.0/js/bootstrap.bundle.min',
	    'jquery': 'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min',
	    'd3': 'https://cdnjs.cloudflare.com/ajax/libs/d3/7.1.1/d3.min'
	},
	shim: {
	    'bootstrap': ['jquery'],
	}
    });
    require(['jquery', 'bootstrap', 'd3', 'bundle'], function ($, bootstrap, d3, bundle) {
	require(["main"], function (main) { main.main(); });
    });
    