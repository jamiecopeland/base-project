
require.config({
	// Map libraries and longer path names to shorter ones
	paths: {
		'json2': '../libs/json2',
		'jquery': '../libs/jquery-1.8.2',
		'jquery-easing': '../libs/jquery-easing-1.3',
		'jquery-transit': '../libs/jquery-transit-0.1.3',
		'jquery-ui-custom-min': '../libs/jquery-ui-1.8.24.custom.min',
		'jquery-url-parser': '../libs/jquery-url-parser-2.2.1',
		// 'bootstrap': '../libs/bootstrap-2.1.1',
		'underscore': '../libs/underscore-1.4.2',
		'underscoreMixins': 'utils/UnderscoreMixins',
		'backbone': '../libs/backbone-0.9.9',
		'backbone-validation': '../libs/backbone-validation-0.6.2',
		'handlebars': '../libs/handlebars-1.0.rc.1',
		'jsonTranslator': '../libs/JSONTranslator',
		'multiloader': '../libs/multiloader',
		'templater': '../libs/templater',
		'lang': '../../copy',
		'text': '../libs/text-2.0.3',
		'domReady': '../libs/domReady-2.0.1',
		'templates': '../../templates'
	},
	// This helps wrap and capture the output from non-AMD files
	// Some will pollute the global scope but we clean them up in the boot module below
	shim: {
		'jquery-transit': {
			deps: ['jquery']
		},
		'jquery-easing': {
			deps: ['jquery', 'jquery-ui-custom-min']
		},
		'jquery-url-parser': {
			deps: ['jquery']
		},
		// 'bootstrap': {
		// 	deps: ['jquery']
		// },
		'underscore': {
			exports: '_'
		},
		'underscoreMixins': {
			deps: ['underscore']
		},
		'backbone': {
			deps: ['underscore'],
			exports: 'Backbone'
		},
		'backbone-validation': {
			deps: ['backbone']
		},
		'handlebars': {
			exports: 'Handlebars'
		},
		'jsonTranslator': {
			deps: ['underscore'],
			exports: 'JSONTranslator'
		},
		'multiloader': {
			deps: ['underscore', 'jquery'],
			exports: 'MultiLoader'
		},
		'templater': {
			deps: ['underscore', 'handlebars'],
			exports: 'Templater'
		},
		'lang': {
			exports: 'lang'
		}
	}
});

// This boot sequence front-loads all the libraries to ensure they've been added to the global
// window scope. We can then clean them up so they only exist in the requirejs scope.
require([
	'json2',
	'jquery',
	'jquery-easing',
	'jquery-url-parser',
	// 'bootstrap',
	'underscore',
	'underscoreMixins',
	'backbone',
	'backbone-validation',
	'handlebars',
	'jsonTranslator',
	'text',
	'domReady'
	// 'lang'
],function(
	json2,
	$,
	easing,
	jqueryUrlParser,
	// bootstrap,
	_,
	_mixins,
	Backbone,
	BackboneValidation,
	Handlebars,
	JSONTranslator,
	TextPlugin,
	domReady
	// lang
) {
	// Remove libraries from global window object. They will remain inside the requirejs scope.
	$.noConflict(true);
	_.noConflict();
	Backbone.noConflict();
	window.swfobject = undefined;
	// window.Handlebars = undefined; // Handlebars needs to be global :(

	// Provides CORS support for IE, which has problems with it when using localhost
	$.support.cors = true;

	// Explicitly set the require-scoped version of jQuery that Backbone should use
	Backbone.$ = $;

	// In order to load the correct main js file we use a data attribute on the require script node
	var platform = $('#requireScript').data('platform');

	// The main module is loaded separately, this ensures the library dependencies above are all
	// loaded and run before we start resolving the app's dependencies
	require(['main'], function(main) {
		// domReady will only call the function passed to it once the DOM has fully loaded
		// Note that the main module returns a function to run
		domReady(main);
	});
});