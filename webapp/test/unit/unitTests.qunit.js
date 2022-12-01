/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"feedback_app/feedback-app/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
