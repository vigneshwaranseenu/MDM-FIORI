sap.ui.define([
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel"
], function (MessageToast, MessageBox, JSONModel) {
    "use strict";

    return {

		/** 
		 * Shows error message
		 * @param oErr
		 */
        showErrorMessage: function (oErr) {
            var oErrorMsg = "Something went wrong. Please contact IT Support Desk";
            if (oErr && oErr.responseText) {
                try {
                    oErrorMsg = JSON.parse(oErr.responseText).error.message.value;
                } catch (ex) {
                    try {
                        var xmlDoc = $.parseXML(oErr.responseText);
                        var $xml = $(xmlDoc);
                        var $errMsg = $xml.find("message");
                        if ($errMsg.length > 1) {
                            oErrorMsg = $errMsg[1].textContent;
                        } else {
                            oErrorMsg = $errMsg.text();
                        }
                    } catch (e) {
                        oErrorMsg = oErr.responseText;
                    }
                }
            }
            MessageToast.show(oErrorMsg);
        },

		/** 
		 * Returns error message
		 * @param oErr
		 * @returns
		 */
        getErrorMessage: function (oErr) {
            var oErrorMsg = "Something went wrong. Please contact IT Support Desk";
            if (oErr && oErr.responseText) {
                try {
                    oErrorMsg = JSON.parse(oErr.responseText).error.message.value;
                } catch (ex) {
                    try {
                        var xmlDoc = $.parseXML(oErr.responseText);
                        var $xml = $(xmlDoc);
                        var $errMsg = $xml.find("message");
                        if ($errMsg.length > 1) {
                            oErrorMsg = $errMsg[1].textContent;
                        } else {
                            oErrorMsg = $errMsg.text();
                        }
                    } catch (e) {
                        oErrorMsg = oErr.responseText;
                    }
                }
            }
            return oErrorMsg;
        }

    };

});