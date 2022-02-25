/*global QUnit*/

sap.ui.define([
	"commdm./z_miss_int/controller/InputScreen.controller"
], function (Controller) {
	"use strict";

	QUnit.module("InputScreen Controller");

	QUnit.test("I should test the InputScreen controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
