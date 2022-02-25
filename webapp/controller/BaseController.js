sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/IconColor",
    "sap/ui/core/MessageType",
    "sap/m/MessageToast",
    "sap/ui/core/ValueState",
    "sap/m/MessageBox",
    "sap/ui/core/routing/History",
    "sap/ui/core/Fragment",
    "sap/ui/core/message/Message",
    "sap/ui/core/format/DateFormat",
    "sap/ui/Device",
    "com/mdm/zmissint/model/models",
    "com/mdm/zmissint/model/errorHandling",
    "sap/m/StandardListItem"
], function (Controller, JSONModel, Filter, FilterOperator, IconColor, MessageType, MessageToast,
    ValueState, MessageBox, History, Fragment, Message, DateFormat, Device, models, errorHandling,
    StandardListItem) {

    return Controller.extend("com.mdm.zmissint.controller.BaseController", {

        /**
         * Convenience method for accessing the router.
         * @public
         * @returns {sap.ui.core.routing.Router} the router for this component
         */
        getRouter: function () {
            return this.getOwnerComponent().getRouter();
        },

        /* =========================================================== */
        /* Model Methods                                              */
        /* =========================================================== */

        /**
         * Convenience method for getting the view model by name.
         * @public
         * @param {string} [sName] the model name
         * @returns {sap.ui.model.Model} the model instance
         */
        getModel: function (sName) {
            return this.getView().getModel(sName);
        },

        /**
         * Convenience method for setting the view model.
         * @public
         * @param {sap.ui.model.Model} oModel the model instance
         * @param {string} sName the model name
         * @returns {sap.ui.mvc.View} the view instance
         */
        setModel: function (oModel, sName) {
            return this.getView().setModel(oModel, sName);
        },

        /**
         * Getter for the resource bundle.
         * @public
         * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
         */
        getResourceBundle: function () {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle();
        },

        /**
         * Navigates back to one step if history is available otherwise takes you to app homepage
         * @public
         */
        onNavBack: function () {
            var sPreviousHash = History.getInstance().getPreviousHash();

            if (sPreviousHash !== undefined) {
                // The history contains a previous entry
                history.go(-1);
            } else {
                // Otherwise we go backwards with a forward history
                var bReplace = true;
                this.getRouter().navTo("Shell-home", {}, bReplace);
            }
        },

        /**
         * gets the content density class as per the device
         * @public
         * @returns {string} density css class based on device
         */
        getContentDensityClass: function () {
            return this.getOwnerComponent().getContentDensityClass();
        },

        /**
         * Check if input is empty or invalid
         * @param {object} oInput - Input to be checked
         * @returns {boolean}
         * @private
         */
        checkInputField: function (oInput) {
            var oBinding = oInput.getBinding("value");
            try {
                oBinding.getType().validateValue(oInput.getValue());
            } catch (oException) {
                return true;
            }
            return false;
        },

        /* =========================================================== */
        /* Dialog Methods                                              */
        /* =========================================================== */

        /**
         * method which returns the Busy dialog instance
         * @param   {string}       sTitle optional parameter
         * @param   {string}       sText  optional parameter
         * @returns {sap.m.Dialog} - Busy Dialog Instance
         */
        getBusyDialog: function (sTitle, sText) {
            if (!this._oBusyDialog) {
                // Create dialog using fragment factory
                this._oBusyDialog = sap.ui.xmlfragment(this._getBusyDialogId(),
                    "com.mdm.zmissint.view.fragments.BusyDialog", this);

                // Connect dialog to view
                this.getView().addDependent(this._oBusyDialog);
            }
            if (sTitle || sTitle === null) {
                this._oBusyDialog.setTitle(sTitle);
            }
            if (sText || sTitle === null) {
                this._oBusyDialog.setText(sText);
            }
            return this._oBusyDialog;
        },

        /**
         * method to create the Id for Busy dialog
         * @returns {string} - ID of fragment
         * @private
         */
        _getBusyDialogId: function () {
            return this.createId("id_Miss_Int_BusyDialogFrag");
        },

        /**
         * Returns Fragment control based on provided fragment and control id
         * @param   {string}              sFragId    Fragment ID
         * @param   {string}              sControlId Control ID
         * @returns {sap.ui.core.Control} Control inside fragment id
         * @public
         */
        getFragmentControlById: function (sFragId, sControlId) {
            return this.byId(Fragment.createId(sFragId, sControlId));
        },

        /**
         * Uses createid method to get the control inside fragment
         * @param {string} sFragId    fragment id
         * @param {string} sControlId control id
         */
        getFragmentControlByCreateId: function (sFragId, sControlId) {
            return this.byId(Fragment.createId(this.createId(sFragId), sControlId));
        },

        /* =========================================================== */
        /* Date & Formatting Methods                                   */
        /* =========================================================== */

        /**
         * Parses the provided date to local timezone
         * @param   {object} oDate Javascript date object that needs to be parsed
         * @param {string} sPattern	pattern for the timezone to fetch
         * @returns {object} Parsed date as Javascript with local timezone
         * @private
         */
        parseDate: function (oDate, sPattern) {
            if (!sPattern) {
                sPattern = "yyyy-MM-dd'T'hh:mm:ss.SSSXXX";
            }
            var oDateFormat = DateFormat.getDateInstance({
                pattern: sPattern
            });
            return oDateFormat.parse(oDateFormat.format(oDate), true);
        },

        /**
         * Parses the provided date to local timezone
         * @param   {object} oDate Javascript date object that needs to be parsed
         * @param {string} sPattern	pattern for the timezone to fetch
         * @returns {object} Format date as Javascript with local string
         * @private
         */
        formatDate: function (oDate, sPattern) {
            if (!sPattern) {
                sPattern = "yyyy-MM-dd'T'hh:mm:ss.SSSXXX";
            }
            var oDateFormat = DateFormat.getDateInstance({
                pattern: sPattern
            });
            return oDateFormat.format(oDate);
        },

        /**
         * Parses the provided date to local timezone
         * @param   {object} oDate Javascript date object that needs to be parsed
         * @param {string} sPattern	pattern for the timezone to fetch
         * @returns {object} Format date as Javascript with local string
         * @private
         */
        formatABAPDate: function (oDate, sPattern) {
            if (!sPattern) {
                sPattern = "yyyy-MM-dd'T'hh:mm:ss.SSSXXX";
            }
            var oDateFormat = DateFormat.getDateInstance({
                pattern: sPattern
            });
            var _date = oDateFormat.parse(oDate);
            var _dateFormat = DateFormat.getDateInstance({
                pattern: "yyyyMMdd"
            });
            return _dateFormat.format(_date);
        },

        /**
         * Parses the provided date to local timezone
         * @param   {object} oDate    Javascript date object that needs to be parsed
         * @param {string} sPattern	pattern for the timezone to fetch
         * @returns {object} Parsed date as Javascript with local timezone
         *                            @private
         */
        parseFormattedDate: function (oDate, sPattern) {
            if (!sPattern) {
                sPattern = "yyyy-MM-dd'T'hh:mm:ss.SSSXXX";
            }
            var oDateFormat = DateFormat.getDateInstance({
                pattern: sPattern
            });
            return oDateFormat.parse(oDate, true);
        },



    });
});