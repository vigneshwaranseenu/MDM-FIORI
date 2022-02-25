/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"commdm./z_miss_int/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
