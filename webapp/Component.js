sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/Device",
    "com/mdm/zmissint/model/models",
    "sap/ui/model/json/JSONModel"
],
    function (UIComponent, Device, models, JSONModel) {
        "use strict";
        return UIComponent.extend("com.mdm.zmissint.Component", {
            metadata: {
                manifest: "json"
            },

            /**
             * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
             * @public
             * @override
             */
            init: function () {
                // call the base component's init function
                UIComponent.prototype.init.apply(this, arguments);

                // enable routing
                this.getRouter().initialize();

                // set the device model
                this.setModel(models.createDeviceModel(), "device");

                // set the Validation Reports Table Model
                this.setModel(new JSONModel({
                    "validationReportsTableData": []
                }), "oValidationReportsTableModel");

                // set the Register Data Table Model
                this.setModel(new JSONModel({
                    "registerDataTblData": []
                }), "oRegisterDataTblModel");

                // set the Device Dropdown Model
                this.setModel(new JSONModel({
                    "deviceAndProfileData": []
                }), "oDeviceAndProfileDataModel");

                // set the Validation Fail Model
                this.setModel(new JSONModel({
                    "validationFailData": []
                }), "oValidationFailModel");

                // set the All Interval Model
                this.setModel(new JSONModel({
                    "allIntervalData": []
                }), "oAllIntervalModel");

                // set the Missing Interval Model
                this.setModel(new JSONModel({
                    "missingIntervalData": []
                }), "oMissingIntervalModel");

                // set the Profile Model
                this.setModel(new JSONModel({
                    "profileData": []
                }), "oProfileModel");
            }
        });
    }
);