'use strict';

require.config({
	shim: {
		threejs: {
			exports: 'THREE'
		},
		'threejs-stats': {
			exports: 'Stats',
			deps: ['threejs']
		},
		'threejs-detector': {
			exports: 'Detector',
			deps: ['threejs']
		},
		'threejs-trackball': {
			exports: 'THREE.TrackballControls',
			deps: ['threejs']
		}
	},
	paths: {
		jquery: 'vendor/jquery',
		threejs: 'vendor/three',
		'threejs-stats': 'http://stemkoski.github.com/Three.js/js/Stats',
		'threejs-detector': 'http://stemkoski.github.com/Three.js/js/Detector',
		'threejs-trackball': 'vendor/three.trackball'
	}
});

define(function(require) {
	require('main');
});
