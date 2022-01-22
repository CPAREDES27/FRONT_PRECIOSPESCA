/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"tasacom./estadodeprecios/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
