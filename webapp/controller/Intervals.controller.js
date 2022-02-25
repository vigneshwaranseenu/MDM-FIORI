sap.ui.define([
    "com/mdm/zmissint/controller/BaseController",
    "sap/ui/core/Fragment",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "com/mdm/zmissint/utils/Messages",
    "sap/m/MessageToast",
    "com/mdm/zmissint/utils/Constants",
    "sap/viz/ui5/api/env/Format",
    "sap/viz/ui5/format/ChartFormatter",
    "sap/ui/model/json/JSONModel"
],
    function (BaseController, Fragment, Filter, FilterOperator, MessageBox, Messages, MessageToast, Constants, Format, ChartFormatter, JSONModel) {
        "use strict";

        return BaseController.extend("com.mdm.zmissint.controller.Intervals", {

            /**
             * on init method of intervals controller
             */
            onInit: function () {
                this.getRouter().getRoute("RouteIntervals").attachPatternMatched(this._onRouteMatched, this);
            },

            /**
             * on route matched method of input screen controller
             * Setting the alignment for page title
             * Register data tab selected for icon tab bar
             */
            _onRouteMatched: function () {
                var oIntervalsPage = this.getView().byId("idIntervalsPage");
                oIntervalsPage.setTitleAlignment("Center");
                var oIconTabBar = this.getView().byId("idIconTabBar");
                oIconTabBar.setSelectedKey("registerData");
                this.onTabSelect();
            },

            /**
             * This method is triggered on press of to report screen button on footer
             * Data in all 4 models of 4 tables in icon tab filters are emptied
             * Navigation to validation reports screen 
             */
            _onBackButtonPress: function () {
                var oRegisterDataTblModel = this.getModel("oRegisterDataTblModel");
                oRegisterDataTblModel.setProperty("/registerDataTblData", []);
                var oValidationFailModel = this.getModel("oValidationFailModel");
                oValidationFailModel.setProperty("/validationFailData", []);
                var oAllIntervalModel = this.getModel("oAllIntervalModel");
                oAllIntervalModel.setProperty("/allIntervalData", []);
                var oMissingIntervalModel = this.getModel("oMissingIntervalModel");
                oMissingIntervalModel.setProperty("/missingIntervalData", []);
                var oDeviceAndProfileDataModel = this.getModel("oDeviceAndProfileDataModel");
                oDeviceAndProfileDataModel.setProperty("/deviceAndProfileData", []);
                var oProfileModel = this.getModel("oProfileModel");
                oProfileModel.setProperty("/profileData", []);
                var oDeviceDropdown = this.getView().byId("idDeviceDropdown");
                oDeviceDropdown.setSelectedKey("");
                var oProfileDropdown = this.getView().byId("idProfileDropdown");
                oProfileDropdown.setSelectedKeys([]);
                this.getRouter().navTo("RouteValidationReports");
            },

            /**
             * This method is triggered on press of search button in search field present in header of register data table
             * Register data table is filtered based on the search
             * @param oEvent 
             */
            handleRegisterDataTblSearch: function (oEvent) {
                var oSearchStr = oEvent.getSource().getValue();
                var oTable = this.getView().byId("idRegisterDataTbl");
                var oBinding = oTable.getBinding("items");
                if (oSearchStr.length !== 0) {
                    var oFilters = [
                        new Filter("regNo", FilterOperator.Contains, oSearchStr),
                        new Filter("mrDate", FilterOperator.Contains, oSearchStr),
                        new Filter("readReason", FilterOperator.Contains, oSearchStr),
                        new Filter("readValue", FilterOperator.Contains, oSearchStr),
                        new Filter("uom", FilterOperator.Contains, oSearchStr)
                    ];
                    var filterObj = new Filter(oFilters, false);
                    oBinding.filter(filterObj);
                } else {
                    oBinding.filter([]);
                }
            },

            /**
             * This method is triggered on press of sort button present in header of register data table
             * @param oEvent 
             */
            onRegisterDataTblSorting: function (oEvent) {
                this._getRegisterDataTblSortDialog().open();

            },

            /**
             * This method is called from onRegisterDataTblSorting method
             * This method is used to open the RegisterDataTblSort fragment for sorting
             */
            _getRegisterDataTblSortDialog: function () {
                var oRegisterDataTblmodel = this.getModel("oRegisterDataTblModel");
                if (!this._oRegisterDataTblSortDialog) {
                    this._oRegisterDataTblSortDialog = sap.ui.xmlfragment(this.createId("idRegisterDataTblSortFrag"),
                        "com.mdm.zmissint.view.fragments.RegisterDataTblSort",
                        this
                    );
                    this.getView().addDependent(this._oRegisterDataTblSortDialog);
                }
                return this._oRegisterDataTblSortDialog;
            },

            /**
             * This method is triggered on press of confirm button in RegisterDataTblSort fragment
             * Method to sort the table data based on selections made in the dialog
             * Ascending and Descending order sorting done on table data
             * @param oEvent 
             */
            onRegisterDataTblSortConfirm: function (oEvent) {
                var sPath = oEvent.getParameter("sortItem").getKey(),
                    bDescending = oEvent.getParameter("sortDescending");
                var oList = this.getView().byId("idRegisterDataTbl"),
                    oSortButton = this.getView().byId("idRegisterDataTblSort");
                this._oRegisterDataTblSortSelection = {
                    path: sPath,
                    desc: bDescending
                };
                oSortButton.setType("Emphasized");
                var oSorter = new sap.ui.model.Sorter(this._oRegisterDataTblSortSelection.path, this._oRegisterDataTblSortSelection.desc);
                oList.getBinding("items").sort(oSorter);
            },

            /**
             * This method is triggered on press of Go button
             * Service call to fetch and map data for 4 tables in 4 icon tab filters
             */
            getIntervalData: function () {
                var oModel = this.getOwnerComponent().getModel();
                var oDeviceDropdown = this.getView().byId("idDeviceDropdown");
                var sSelectedKey = oDeviceDropdown.getSelectedKey();
                var oProfileDropdown = this.getView().byId("idProfileDropdown");
                var aSelectedKeys = oProfileDropdown.getSelectedKeys();
                if (sSelectedKey === "" || sSelectedKey === null || sSelectedKey === undefined) {
                    MessageBox.error(this.getResourceBundle().getText("pleaseSelectDeviceText"));
                } else {
                    if (aSelectedKeys.length > 0 && aSelectedKeys.length <= 5) {
                        var oRegisterDataTblModel = this.getModel("oRegisterDataTblModel");
                        var oValidationFailModel = this.getModel("oValidationFailModel");
                        var oAllIntervalModel = this.getModel("oAllIntervalModel");
                        var oMissingIntervalModel = this.getModel("oMissingIntervalModel");
                        var oDeviceAndProfileDataModel = this.getModel("oDeviceAndProfileDataModel");
                        var aDeviceAndProfileData = oDeviceAndProfileDataModel.getProperty("/deviceAndProfileData");
                        var oProfileModel = this.getModel("oProfileModel");
                        var aProfileArr = oProfileModel.getProperty("/profileData");
                        var aFinalProfileArr = [];

                        for (var w = 0; w < aSelectedKeys.length; w++) {
                            for (var h = 0; h < aProfileArr.length; h++) {
                                if (aSelectedKeys[w] === aProfileArr[h].profile) {
                                    aFinalProfileArr.push(aProfileArr[h]);
                                }
                            }
                        }

                        var oIntervalObj = {};
                        for (var i = 0; i < aDeviceAndProfileData.length; i++) {
                            if (sSelectedKey === aDeviceAndProfileData[i].device) {
                                oIntervalObj.device = aDeviceAndProfileData[i].device;
                                oIntervalObj.installation = aDeviceAndProfileData[i].installation;
                                oIntervalObj.dateFrom = aDeviceAndProfileData[i].dateFrom;
                                oIntervalObj.dateTo = aDeviceAndProfileData[i].dateTo;
                            }
                        }
                        oIntervalObj.command = Constants.INTERVAL_TEXT;
                        oIntervalObj.devprofilenav = aFinalProfileArr;
                        oIntervalObj.registerreadnav = [
                            {
                                "device": "",
                                "regNo": "",
                                "mrDate": "",
                                "mrTime": "",
                                "readReason": "",
                                "readValue": "",
                                "uom": ""
                            }
                        ];
                        oIntervalObj.intervalreadnav = [
                            {
                                "device": "",
                                "profile": "",
                                "correctedInterval": "",
                                "validationState": "",
                                "validationReason": "",
                                "readDate": "",
                                "fromTime": "",
                                "toTime": "",
                                "read": "",
                                "uom": ""
                            }
                        ];
                        oIntervalObj.missingintervalsnav = [
                            {
                                "correctedInterval": "",
                                "device": "",
                                "profile": "",
                                "validationState": "",
                                "validationReason": "",
                                "readDate": "",
                                "fromTime": "",
                                "toTime": "",
                                "read": "",
                                "uom": ""
                            }
                        ];
                        oIntervalObj.invalidintervalsnav = [
                            {
                                "correctedInterval": "",
                                "device": "",
                                "profile": "",
                                "validationState": "",
                                "validationReason": "",
                                "readDate": "",
                                "fromTime": "",
                                "toTime": "",
                                "read": "",
                                "uom": ""
                            }
                        ];

                        this.getBusyDialog(null, this.getResourceBundle().getText("fetchingData")).open();

                        var me = this;
                        oModel.create("/IntervalsSet", oIntervalObj, {
                            success: $.proxy(function (oRes) {
                                me.getBusyDialog(null, null).close();
                                if (oRes.registerreadnav !== null && oRes.registerreadnav.results.length > 0) {
                                    oRegisterDataTblModel.setProperty("/registerDataTblData", oRes.registerreadnav.results);
                                } else {
                                    oRegisterDataTblModel.setProperty("/registerDataTblData", []);
                                }
                                if (oRes.invalidintervalsnav !== null && oRes.invalidintervalsnav.results.length > 0) {
                                    oRes.invalidintervalsnav.results.forEach(function (oRecord) {
                                        oRecord.readDate = me.getDateInFormat(oRecord.readDate);
                                        return oRecord;
                                    });
                                    oValidationFailModel.setProperty("/validationFailData", oRes.invalidintervalsnav.results);
                                } else {
                                    oValidationFailModel.setProperty("/validationFailData", []);
                                }
                                if (oRes.intervalreadnav !== null && oRes.intervalreadnav.results.length > 0) {
                                    oRes.intervalreadnav.results.forEach(function (oRecord) {
                                        oRecord.readDate = me.getDateInFormat(oRecord.readDate);
                                        return oRecord;
                                    });
                                    oAllIntervalModel.setProperty("/allIntervalData", oRes.intervalreadnav.results);
                                } else {
                                    oAllIntervalModel.setProperty("/allIntervalData", []);
                                }
                                if (oRes.missingintervalsnav !== null && oRes.missingintervalsnav.results.length > 0) {
                                    oRes.missingintervalsnav.results.forEach(function (oRecord) {
                                        oRecord.readDate = me.getDateInFormat(oRecord.readDate);
                                        return oRecord;
                                    });
                                    oMissingIntervalModel.setProperty("/missingIntervalData", oRes.missingintervalsnav.results);
                                } else {
                                    oMissingIntervalModel.setProperty("/missingIntervalData", []);
                                }
                            }, this),
                            error: $.proxy(function (oErr) {
                                me.getBusyDialog(null, null).close();
                                var oErrorMessage = Messages.getErrorMessage(oErr);
                                MessageBox.error(oErrorMessage);
                            }, this)
                        });
                    } else {
                        MessageBox.error(this.getResourceBundle().getText("profileErrorMsgText"));
                    }
                }
            },

            /**
             * This method is used to convert date in mm/dd/yyyy format for display
             * @param sValue 
             */
            getDateInFormat: function (sValue) {
                if (sValue) {
                    var month = sValue.slice(4, 6);
                    var day = sValue.slice(6, 8);
                    var year = sValue.slice(0, 4);
                    return month + "/" + day + "/" + year;
                }
            },

            /**
             * This method is triggered on press of buttons in All Interval icon tab
             * Service call to send data of the table to backend and map the data from response to table
             * @param sParam - indicator for type of operation in backend
             */
            onPressAllIntTabBtn: function (sParam) {
                var oModel = this.getOwnerComponent().getModel();
                var oAllIntervalModel = this.getModel("oAllIntervalModel");
                var oMissingIntervalModel = this.getModel("oMissingIntervalModel");
                var oValidationFailModel = this.getModel("oValidationFailModel");
                var oDeviceDropdown = this.getView().byId("idDeviceDropdown");
                var sSelectedKey = oDeviceDropdown.getSelectedKey();
                var oAllIntIconTab = this.getView().byId("idAllIntTab");
                var oExcelData = oAllIntIconTab.getContent()[1].getContent()[0].getData();
                var oMissingIntIconTab = this.getView().byId("idMissingIntTab");
                var oExcelData1 = oMissingIntIconTab.getContent()[1].getContent()[0].getData();
                var oInvalidIconTab = this.getView().byId("idInvalidTab");
                var oExcelData2 = oInvalidIconTab.getContent()[1].getContent()[0].getData();
                var oSelectedFlag = true, sValue = 0, sMsg, sBusyMsg;
                var aTableData = [],
                    aTableData1 = [],
                    aTableData2 = [];

                if (oExcelData.length > 0) {

                    // create payload for All Interval Tab excel Table

                    oExcelData.forEach(function (oRecord) {
                        oRecord.readDate = oRecord.readDate.split("/")[2] + oRecord.readDate.split("/")[0] + oRecord.readDate.split("/")[1];
                        return oRecord;
                    });
                    for (var i = 0; i < oExcelData.length; i++) {
                        aTableData.push({
                            "device": oExcelData[i].device,
                            "correctedInterval": oExcelData[i].correctedInterval,
                            "fromTime": oExcelData[i].fromTime,
                            "toTime": oExcelData[i].toTime,
                            "profile": oExcelData[i].profile,
                            "read": oExcelData[i].read,
                            "readDate": oExcelData[i].readDate,
                            "uom": oExcelData[i].uom,
                            "validationReason": oExcelData[i].validationReason,
                            "validationState": oExcelData[i].validationState
                        });

                        // if sValue is greater than 0 after loop ends, there are selected rows in excel table

                        if (oExcelData[i].correctedInterval === Constants.YES_TEXT) {
                            sValue = sValue + 1;
                        }
                    }

                    var oDeviceAndProfileDataModel = this.getModel("oDeviceAndProfileDataModel");
                    var aDeviceAndProfileData = oDeviceAndProfileDataModel.getProperty("/deviceAndProfileData");
                    var oIntervalObj = {};
                    for (var k = 0; k < aDeviceAndProfileData.length; k++) {
                        if (sSelectedKey === aDeviceAndProfileData[k].device) {
                            oIntervalObj.device = aDeviceAndProfileData[k].device;
                            oIntervalObj.installation = aDeviceAndProfileData[k].installation;
                            oIntervalObj.dateFrom = aDeviceAndProfileData[k].dateFrom;
                            oIntervalObj.dateTo = aDeviceAndProfileData[k].dateTo;
                        }
                    }
                    if (sParam === Constants.REEVALUATE_TEXT) {
                        oIntervalObj.command = Constants.REEVALUATE_ALL_TEXT;
                        sMsg = this.getResourceBundle().getText("reevaluateSuccessTxt");
                        sBusyMsg = this.getResourceBundle().getText("reevaluateBusyTxt");
                    }
                    if (sParam === Constants.SAVE_TEXT) {
                        oIntervalObj.command = Constants.SAVE_ALL_TEXT;
                        sMsg = this.getResourceBundle().getText("saveSuccessTxt");
                        sBusyMsg = this.getResourceBundle().getText("saveBusyTxt");
                    }
                    if (sParam === Constants.RESENT_TEXT) {
                        oIntervalObj.command = Constants.RESENT_ALL_TEXT;
                        sMsg = this.getResourceBundle().getText("resentSuccessTxt");
                        sBusyMsg = this.getResourceBundle().getText("resentBusyTxt");

                        // set status flag for rows selected in excel table

                        if (sValue === 0) {
                            oSelectedFlag = false;
                        } else {
                            oSelectedFlag = true;
                        }
                    }
                    if (sParam === Constants.REMOVE_TEXT) {
                        oIntervalObj.command = Constants.REMOVE_ALL_TEXT;
                        sMsg = this.getResourceBundle().getText("removeStatusSuccessTxt");
                        sBusyMsg = this.getResourceBundle().getText("removeStatusBusyTxt");

                        // set status flag for rows selected in excel table

                        if (sValue === 0) {
                            oSelectedFlag = false;
                        } else {
                            oSelectedFlag = true;
                        }
                    }

                    // create payload for Missing Interval Tab excel Table

                    if (oExcelData1.length > 0) {
                        oExcelData1.forEach(function (oRecord) {
                            oRecord.readDate = oRecord.readDate.split("/")[2] + oRecord.readDate.split("/")[0] + oRecord.readDate.split("/")[1];
                            return oRecord;
                        });
                        for (var d = 0; d < oExcelData1.length; d++) {
                            aTableData1.push({
                                "device": oExcelData1[d].device,
                                "correctedInterval": oExcelData1[d].correctedInterval,
                                "fromTime": oExcelData1[d].fromTime,
                                "toTime": oExcelData1[d].toTime,
                                "profile": oExcelData1[d].profile,
                                "read": oExcelData1[d].read,
                                "readDate": oExcelData1[d].readDate,
                                "uom": oExcelData1[d].uom,
                                "validationReason": oExcelData1[d].validationReason,
                                "validationState": oExcelData1[d].validationState
                            });
                        }
                    }


                    // create payload for Validation Fail Tab excel Table

                    if (oExcelData2.length > 0) {
                        oExcelData2.forEach(function (oRecord) {
                            oRecord.readDate = oRecord.readDate.split("/")[2] + oRecord.readDate.split("/")[0] + oRecord.readDate.split("/")[1];
                            return oRecord;
                        });
                        for (var m = 0; m < oExcelData2.length; m++) {
                            aTableData1.push({
                                "device": oExcelData2[m].device,
                                "correctedInterval": oExcelData2[m].correctedInterval,
                                "fromTime": oExcelData2[m].fromTime,
                                "toTime": oExcelData2[m].toTime,
                                "profile": oExcelData2[m].profile,
                                "read": oExcelData2[m].read,
                                "readDate": oExcelData2[m].readDate,
                                "uom": oExcelData2[m].uom,
                                "validationReason": oExcelData2[m].validationReason,
                                "validationState": oExcelData2[m].validationState
                            });
                        }
                    }

                    oIntervalObj.intervalreadnav = aTableData;
                    oIntervalObj.missingintervalsnav = aTableData1;
                    oIntervalObj.invalidintervalsnav = aTableData2;

                    // check if rows are selected for Remove and Re-Sent operations
                    // if rows are not selected, pop up message to select rows

                    if ((sParam === Constants.REMOVE_TEXT && oSelectedFlag === false) || (sParam === Constants.RESENT_TEXT && oSelectedFlag === false)) {
                        MessageBox.error(this.getResourceBundle().getText("pleaseSelectRow"));
                    } else {

                        this.getBusyDialog(null, sBusyMsg).open();

                        var me = this;
                        oModel.create("/IntervalsSet", oIntervalObj, {
                            success: $.proxy(function (oRes) {

                                me.getBusyDialog(null, null).close();

                                if (oRes.invalidintervalsnav !== null && oRes.invalidintervalsnav.results.length > 0) {
                                    oRes.invalidintervalsnav.results.forEach(function (oRecord) {
                                        oRecord.readDate = me.getDateInFormat(oRecord.readDate);
                                        return oRecord;
                                    });
                                    oValidationFailModel.setProperty("/validationFailData", oRes.invalidintervalsnav.results);
                                } else {
                                    oValidationFailModel.setProperty("/validationFailData", []);
                                }
                                if (oRes.intervalreadnav !== null && oRes.intervalreadnav.results.length > 0) {
                                    oRes.intervalreadnav.results.forEach(function (oRecord) {
                                        oRecord.readDate = me.getDateInFormat(oRecord.readDate);
                                        return oRecord;
                                    });
                                    oAllIntervalModel.setProperty("/allIntervalData", oRes.intervalreadnav.results);
                                } else {
                                    oAllIntervalModel.setProperty("/allIntervalData", []);
                                }
                                if (oRes.missingintervalsnav !== null && oRes.missingintervalsnav.results.length > 0) {
                                    oRes.missingintervalsnav.results.forEach(function (oRecord) {
                                        oRecord.readDate = me.getDateInFormat(oRecord.readDate);
                                        return oRecord;
                                    });
                                    oMissingIntervalModel.setProperty("/missingIntervalData", oRes.missingintervalsnav.results);
                                } else {
                                    oMissingIntervalModel.setProperty("/missingIntervalData", []);
                                }

                                MessageToast.show(sMsg);

                            }, this),
                            error: $.proxy(function (oErr) {
                                me.getBusyDialog(null, null).close();
                                var oErrorMessage = Messages.getErrorMessage(oErr);
                                MessageBox.error(oErrorMessage);
                            }, this)
                        });
                    }
                }
            },

            /**
             *This method is triggered on press of buttons in Missing Interval icon tab
             * Service call to send data of the table to backend and map the data from response to table
             * @param sParam - indicator for type of operation in backend 
             */
            onPressMissIntTabBtn: function (sParam) {
                var oModel = this.getOwnerComponent().getModel();
                var oMissingIntervalModel = this.getModel("oMissingIntervalModel");
                var oValidationFailModel = this.getModel("oValidationFailModel");
                var oAllIntervalModel = this.getModel("oAllIntervalModel");
                var oDeviceDropdown = this.getView().byId("idDeviceDropdown");
                var sSelectedKey = oDeviceDropdown.getSelectedKey();
                var oAllIntIconTab = this.getView().byId("idAllIntTab");
                var oExcelData = oAllIntIconTab.getContent()[1].getContent()[0].getData();
                var oMissingIntIconTab = this.getView().byId("idMissingIntTab");
                var oExcelData1 = oMissingIntIconTab.getContent()[1].getContent()[0].getData();
                var oInvalidIconTab = this.getView().byId("idInvalidTab");
                var oExcelData2 = oInvalidIconTab.getContent()[1].getContent()[0].getData();
                var oSelectedFlag = true, sValue = 0, sMsg, sBusyMsg;
                var aTableData = [],
                    aTableData1 = [],
                    aTableData2 = [];

                if (oExcelData1.length > 0) {

                    // create payload for All Interval Tab excel Table

                    oExcelData1.forEach(function (oRecord) {
                        oRecord.readDate = oRecord.readDate.split("/")[2] + oRecord.readDate.split("/")[0] + oRecord.readDate.split("/")[1];
                        return oRecord;
                    });
                    for (var i = 0; i < oExcelData1.length; i++) {
                        aTableData1.push({
                            "device": oExcelData1[i].device,
                            "correctedInterval": oExcelData1[i].correctedInterval,
                            "fromTime": oExcelData1[i].fromTime,
                            "toTime": oExcelData1[i].toTime,
                            "profile": oExcelData1[i].profile,
                            "read": oExcelData1[i].read,
                            "readDate": oExcelData1[i].readDate,
                            "uom": oExcelData1[i].uom,
                            "validationReason": oExcelData1[i].validationReason,
                            "validationState": oExcelData1[i].validationState
                        });

                        // if sValue is greater than 0 after loop ends, there are selected rows in excel table

                        if (oExcelData1[i].correctedInterval === Constants.YES_TEXT) {
                            sValue = sValue + 1;
                        }
                    }

                    var oDeviceAndProfileDataModel = this.getModel("oDeviceAndProfileDataModel");
                    var aDeviceAndProfileData = oDeviceAndProfileDataModel.getProperty("/deviceAndProfileData");
                    var oIntervalObj = {};
                    for (var k = 0; k < aDeviceAndProfileData.length; k++) {
                        if (sSelectedKey === aDeviceAndProfileData[k].device) {
                            oIntervalObj.device = aDeviceAndProfileData[k].device;
                            oIntervalObj.installation = aDeviceAndProfileData[k].installation;
                            oIntervalObj.dateFrom = aDeviceAndProfileData[k].dateFrom;
                            oIntervalObj.dateTo = aDeviceAndProfileData[k].dateTo;
                        }
                    }
                    if (sParam === Constants.REEVALUATE_TEXT) {
                        oIntervalObj.command = Constants.REEVALUATE_MISSING_TEXT;
                        sMsg = this.getResourceBundle().getText("reevaluateSuccessTxt");
                        sBusyMsg = this.getResourceBundle().getText("reevaluateBusyTxt");
                    }
                    if (sParam === Constants.SAVE_TEXT) {
                        oIntervalObj.command = Constants.SAVE_MISSING_TEXT;
                        sMsg = this.getResourceBundle().getText("saveSuccessTxt");
                        sBusyMsg = this.getResourceBundle().getText("saveBusyTxt");
                    }
                    if (sParam === Constants.RESENT_TEXT) {
                        oIntervalObj.command = Constants.RESENT_MISSING_TEXT;
                        sMsg = this.getResourceBundle().getText("resentSuccessTxt");
                        sBusyMsg = this.getResourceBundle().getText("resentBusyTxt");

                        // set status flag for rows selected in excel table

                        if (sValue === 0) {
                            oSelectedFlag = false;
                        } else {
                            oSelectedFlag = true;
                        }
                    }
                    if (sParam === Constants.REMOVE_TEXT) {
                        oIntervalObj.command = Constants.REMOVE_MISSING_TEXT;
                        sMsg = this.getResourceBundle().getText("removeStatusSuccessTxt");
                        sBusyMsg = this.getResourceBundle().getText("removeStatusBusyTxt");

                        // set status flag for rows selected in excel table

                        if (sValue === 0) {
                            oSelectedFlag = false;
                        } else {
                            oSelectedFlag = true;
                        }
                    }

                    // create payload for All Interval Tab excel Table

                    if (oExcelData.length > 0) {
                        oExcelData.forEach(function (oRecord) {
                            oRecord.readDate = oRecord.readDate.split("/")[2] + oRecord.readDate.split("/")[0] + oRecord.readDate.split("/")[1];
                            return oRecord;
                        });
                        for (var d = 0; d < oExcelData.length; d++) {
                            aTableData.push({
                                "device": oExcelData[d].device,
                                "correctedInterval": oExcelData[d].correctedInterval,
                                "fromTime": oExcelData[d].fromTime,
                                "toTime": oExcelData[d].toTime,
                                "profile": oExcelData[d].profile,
                                "read": oExcelData[d].read,
                                "readDate": oExcelData[d].readDate,
                                "uom": oExcelData[d].uom,
                                "validationReason": oExcelData[d].validationReason,
                                "validationState": oExcelData[d].validationState
                            });
                        }
                    }


                    // create payload for Validation Fail Tab excel Table

                    if (oExcelData2.length > 0) {
                        oExcelData2.forEach(function (oRecord) {
                            oRecord.readDate = oRecord.readDate.split("/")[2] + oRecord.readDate.split("/")[0] + oRecord.readDate.split("/")[1];
                            return oRecord;
                        });
                        for (var m = 0; m < oExcelData2.length; m++) {
                            aTableData1.push({
                                "device": oExcelData2[m].device,
                                "correctedInterval": oExcelData2[m].correctedInterval,
                                "fromTime": oExcelData2[m].fromTime,
                                "toTime": oExcelData2[m].toTime,
                                "profile": oExcelData2[m].profile,
                                "read": oExcelData2[m].read,
                                "readDate": oExcelData2[m].readDate,
                                "uom": oExcelData2[m].uom,
                                "validationReason": oExcelData2[m].validationReason,
                                "validationState": oExcelData2[m].validationState
                            });
                        }
                    }

                    oIntervalObj.intervalreadnav = aTableData;
                    oIntervalObj.missingintervalsnav = aTableData1;
                    oIntervalObj.invalidintervalsnav = aTableData2;

                    // check if rows are selected for Remove and Re-Sent operations
                    // if rows are not selected, pop up message to select rows

                    if ((sParam === Constants.REMOVE_TEXT && oSelectedFlag === false) || (sParam === Constants.RESENT_TEXT && oSelectedFlag === false)) {
                        MessageBox.error(this.getResourceBundle().getText("pleaseSelectRow"));
                    } else {

                        this.getBusyDialog(null, sBusyMsg).open();

                        var me = this;
                        oModel.create("/IntervalsSet", oIntervalObj, {
                            success: $.proxy(function (oRes) {

                                me.getBusyDialog(null, null).close();

                                if (oRes.invalidintervalsnav !== null && oRes.invalidintervalsnav.results.length > 0) {
                                    oRes.invalidintervalsnav.results.forEach(function (oRecord) {
                                        oRecord.readDate = me.getDateInFormat(oRecord.readDate);
                                        return oRecord;
                                    });
                                    oValidationFailModel.setProperty("/validationFailData", oRes.invalidintervalsnav.results);
                                } else {
                                    oValidationFailModel.setProperty("/validationFailData", []);
                                }
                                if (oRes.intervalreadnav !== null && oRes.intervalreadnav.results.length > 0) {
                                    oRes.intervalreadnav.results.forEach(function (oRecord) {
                                        oRecord.readDate = me.getDateInFormat(oRecord.readDate);
                                        return oRecord;
                                    });
                                    oAllIntervalModel.setProperty("/allIntervalData", oRes.intervalreadnav.results);
                                } else {
                                    oAllIntervalModel.setProperty("/allIntervalData", []);
                                }
                                if (oRes.missingintervalsnav !== null && oRes.missingintervalsnav.results.length > 0) {
                                    oRes.missingintervalsnav.results.forEach(function (oRecord) {
                                        oRecord.readDate = me.getDateInFormat(oRecord.readDate);
                                        return oRecord;
                                    });
                                    oMissingIntervalModel.setProperty("/missingIntervalData", oRes.missingintervalsnav.results);
                                } else {
                                    oMissingIntervalModel.setProperty("/missingIntervalData", []);
                                }

                                MessageToast.show(sMsg);

                            }, this),
                            error: $.proxy(function (oErr) {
                                me.getBusyDialog(null, null).close();
                                var oErrorMessage = Messages.getErrorMessage(oErr);
                                MessageBox.error(oErrorMessage);
                            }, this)
                        });
                    }
                }
            },

            /**
             * This method is triggered on press of buttons in Validation Fail icon tab
             * Service call to send data of the table to backend and map the data from response to table
             * @param sParam - indicator for type of operation in backend 
             */
            onPressInvalidTabBtn: function (sParam) {
                var oModel = this.getOwnerComponent().getModel();
                var oValidationFailModel = this.getModel("oValidationFailModel");
                var oMissingIntervalModel = this.getModel("oMissingIntervalModel");
                var oAllIntervalModel = this.getModel("oAllIntervalModel");
                var oDeviceDropdown = this.getView().byId("idDeviceDropdown");
                var sSelectedKey = oDeviceDropdown.getSelectedKey();
                var oAllIntIconTab = this.getView().byId("idAllIntTab");
                var oExcelData = oAllIntIconTab.getContent()[1].getContent()[0].getData();
                var oMissingIntIconTab = this.getView().byId("idMissingIntTab");
                var oExcelData1 = oMissingIntIconTab.getContent()[1].getContent()[0].getData();
                var oInvalidIconTab = this.getView().byId("idInvalidTab");
                var oExcelData2 = oInvalidIconTab.getContent()[1].getContent()[0].getData();
                var oSelectedFlag = true, sValue = 0, sMsg, sBusyMsg;
                var aTableData = [],
                    aTableData1 = [],
                    aTableData2 = [];

                if (oExcelData2.length > 0) {

                    // create payload for All Interval Tab excel Table

                    oExcelData2.forEach(function (oRecord) {
                        oRecord.readDate = oRecord.readDate.split("/")[2] + oRecord.readDate.split("/")[0] + oRecord.readDate.split("/")[1];
                        return oRecord;
                    });
                    for (var i = 0; i < oExcelData2.length; i++) {
                        aTableData2.push({
                            "device": oExcelData2[i].device,
                            "correctedInterval": oExcelData2[i].correctedInterval,
                            "fromTime": oExcelData2[i].fromTime,
                            "toTime": oExcelData2[i].toTime,
                            "profile": oExcelData2[i].profile,
                            "read": oExcelData2[i].read,
                            "readDate": oExcelData2[i].readDate,
                            "uom": oExcelData2[i].uom,
                            "validationReason": oExcelData2[i].validationReason,
                            "validationState": oExcelData2[i].validationState
                        });

                        // if sValue is greater than 0 after loop ends, there are selected rows in excel table

                        if (oExcelData2[i].correctedInterval === Constants.YES_TEXT) {
                            sValue = sValue + 1;
                        }

                    }

                    var oDeviceAndProfileDataModel = this.getModel("oDeviceAndProfileDataModel");
                    var aDeviceAndProfileData = oDeviceAndProfileDataModel.getProperty("/deviceAndProfileData");
                    var oIntervalObj = {};
                    for (var k = 0; k < aDeviceAndProfileData.length; k++) {
                        if (sSelectedKey === aDeviceAndProfileData[k].device) {
                            oIntervalObj.device = aDeviceAndProfileData[k].device;
                            oIntervalObj.installation = aDeviceAndProfileData[k].installation;
                            oIntervalObj.dateFrom = aDeviceAndProfileData[k].dateFrom;
                            oIntervalObj.dateTo = aDeviceAndProfileData[k].dateTo;
                        }
                    }
                    if (sParam === Constants.REEVALUATE_TEXT) {
                        oIntervalObj.command = Constants.REEVALUATE_INVALID_TEXT;
                        sMsg = this.getResourceBundle().getText("reevaluateSuccessTxt");
                        sBusyMsg = this.getResourceBundle().getText("reevaluateBusyTxt");
                    }
                    if (sParam === Constants.SAVE_TEXT) {
                        oIntervalObj.command = Constants.SAVE_INVALID_TEXT;
                        sMsg = this.getResourceBundle().getText("saveSuccessTxt");
                        sBusyMsg = this.getResourceBundle().getText("saveBusyTxt");
                    }
                    if (sParam === Constants.RESENT_TEXT) {
                        oIntervalObj.command = Constants.RESENT_INVALID_TEXT;
                        sMsg = this.getResourceBundle().getText("resentSuccessTxt");
                        sBusyMsg = this.getResourceBundle().getText("resentBusyTxt");

                        // set status flag for rows selected in excel table

                        if (sValue === 0) {
                            oSelectedFlag = false;
                        } else {
                            oSelectedFlag = true;
                        }
                    }
                    if (sParam === Constants.REMOVE_TEXT) {
                        oIntervalObj.command = Constants.REMOVE_INVALID_TEXT;
                        sMsg = this.getResourceBundle().getText("removeStatusSuccessTxt");
                        sBusyMsg = this.getResourceBundle().getText("removeStatusBusyTxt");

                        // set status flag for rows selected in excel table

                        if (sValue === 0) {
                            oSelectedFlag = false;
                        } else {
                            oSelectedFlag = true;
                        }
                    }

                    // create payload for Missing Interval Tab excel Table

                    if (oExcelData1.length > 0) {
                        oExcelData1.forEach(function (oRecord) {
                            oRecord.readDate = oRecord.readDate.split("/")[2] + oRecord.readDate.split("/")[0] + oRecord.readDate.split("/")[1];
                            return oRecord;
                        });
                        for (var d = 0; d < oExcelData1.length; d++) {
                            aTableData1.push({
                                "device": oExcelData1[d].device,
                                "correctedInterval": oExcelData1[d].correctedInterval,
                                "fromTime": oExcelData1[d].fromTime,
                                "toTime": oExcelData1[d].toTime,
                                "profile": oExcelData1[d].profile,
                                "read": oExcelData1[d].read,
                                "readDate": oExcelData1[d].readDate,
                                "uom": oExcelData1[d].uom,
                                "validationReason": oExcelData1[d].validationReason,
                                "validationState": oExcelData1[d].validationState
                            });
                        }
                    }


                    // create payload for All Interval Tab excel Table

                    if (oExcelData.length > 0) {
                        oExcelData.forEach(function (oRecord) {
                            oRecord.readDate = oRecord.readDate.split("/")[2] + oRecord.readDate.split("/")[0] + oRecord.readDate.split("/")[1];
                            return oRecord;
                        });
                        for (var m = 0; m < oExcelData.length; m++) {
                            aTableData.push({
                                "device": oExcelData[m].device,
                                "correctedInterval": oExcelData[m].correctedInterval,
                                "fromTime": oExcelData[m].fromTime,
                                "toTime": oExcelData[m].toTime,
                                "profile": oExcelData[m].profile,
                                "read": oExcelData[m].read,
                                "readDate": oExcelData[m].readDate,
                                "uom": oExcelData[m].uom,
                                "validationReason": oExcelData[m].validationReason,
                                "validationState": oExcelData[m].validationState
                            });
                        }
                    }

                    oIntervalObj.intervalreadnav = aTableData;
                    oIntervalObj.missingintervalsnav = aTableData1;
                    oIntervalObj.invalidintervalsnav = aTableData2;

                    // check if rows are selected for Remove and Re-Sent operations
                    // if rows are not selected, pop up message to select rows

                    if ((sParam === Constants.REMOVE_TEXT && oSelectedFlag === false) || (sParam === Constants.RESENT_TEXT && oSelectedFlag === false)) {
                        MessageBox.error(this.getResourceBundle().getText("pleaseSelectRow"));
                    } else {

                        this.getBusyDialog(null, sBusyMsg).open();

                        var me = this;
                        oModel.create("/IntervalsSet", oIntervalObj, {
                            success: $.proxy(function (oRes) {

                                me.getBusyDialog(null, null).close();

                                if (oRes.invalidintervalsnav !== null && oRes.invalidintervalsnav.results.length > 0) {
                                    oRes.invalidintervalsnav.results.forEach(function (oRecord) {
                                        oRecord.readDate = me.getDateInFormat(oRecord.readDate);
                                        return oRecord;
                                    });
                                    oValidationFailModel.setProperty("/validationFailData", oRes.invalidintervalsnav.results);
                                } else {
                                    oValidationFailModel.setProperty("/validationFailData", []);
                                }
                                if (oRes.intervalreadnav !== null && oRes.intervalreadnav.results.length > 0) {
                                    oRes.intervalreadnav.results.forEach(function (oRecord) {
                                        oRecord.readDate = me.getDateInFormat(oRecord.readDate);
                                        return oRecord;
                                    });
                                    oAllIntervalModel.setProperty("/allIntervalData", oRes.intervalreadnav.results);
                                } else {
                                    oAllIntervalModel.setProperty("/allIntervalData", []);
                                }
                                if (oRes.missingintervalsnav !== null && oRes.missingintervalsnav.results.length > 0) {
                                    oRes.missingintervalsnav.results.forEach(function (oRecord) {
                                        oRecord.readDate = me.getDateInFormat(oRecord.readDate);
                                        return oRecord;
                                    });
                                    oMissingIntervalModel.setProperty("/missingIntervalData", oRes.missingintervalsnav.results);
                                } else {
                                    oMissingIntervalModel.setProperty("/missingIntervalData", []);
                                }

                                MessageToast.show(sMsg);

                            }, this),
                            error: $.proxy(function (oErr) {
                                me.getBusyDialog(null, null).close();
                                var oErrorMessage = Messages.getErrorMessage(oErr);
                                MessageBox.error(oErrorMessage);
                            }, this)
                        });
                    }
                }
            },

            /**
             * This event is triggered when a tab is selected in icon tab bar
             * Visibility of check consumption button and input is set based on tab selected
             */
            onTabSelect: function () {
                var oIconTabBar = this.getView().byId("idIconTabBar");
                var sSelectedKey = oIconTabBar.getSelectedKey();
                var oButton = this.getView().byId("idCheckConsumptionBtn");
                var oInput = this.getView().byId("idCheckConsumptionInput");
                oInput.setValue("");
                var oIntervalConsumptionLbl = this.getView().byId("idIntervalConsumptionLbl");
                var oIntConsumptionInput = this.getView().byId("idIntConsumptionInput");
                oIntConsumptionInput.setValue("");
                if (sSelectedKey === Constants.REGISTER_DATA_TAB_KEY || sSelectedKey === Constants.ALL_INTERVAL_TAB_KEY) {
                    oButton.setVisible(true);
                    oInput.setVisible(true);
                    if (sSelectedKey === Constants.REGISTER_DATA_TAB_KEY) {
                        oIntervalConsumptionLbl.setVisible(true);
                        oIntConsumptionInput.setVisible(true);
                    } else {
                        oIntervalConsumptionLbl.setVisible(false);
                        oIntConsumptionInput.setVisible(false);
                    }
                } else {
                    oButton.setVisible(false);
                    oInput.setVisible(false);
                    oIntervalConsumptionLbl.setVisible(false);
                    oIntConsumptionInput.setVisible(false);
                }
            },

            /**
             * This method is triggered when check consumption button in the footer is pressed
             * Sum / difference of consumption of rows selected is calculated and displayed in input in footer
             */
            onCheckConsumptionPress: function () {
                var oIconTabBar = this.getView().byId("idIconTabBar");
                var sSelectedKey = oIconTabBar.getSelectedKey();
                var oInput = this.getView().byId("idCheckConsumptionInput");
                var oIntConsumptionInput = this.getView().byId("idIntConsumptionInput");
                var oModel = this.getOwnerComponent().getModel();
                var oDeviceDropdown = this.getView().byId("idDeviceDropdown");
                var sSelectedDevice = oDeviceDropdown.getSelectedKey();
                var oDeviceAndProfileDataModel = this.getModel("oDeviceAndProfileDataModel");
                var aDeviceAndProfileData = oDeviceAndProfileDataModel.getProperty("/deviceAndProfileData");
                var oAllIntIconTab = this.getView().byId("idAllIntTab");
                var oExcelData = oAllIntIconTab.getContent()[1].getContent()[0].getData();
                var aTableData = [];
                var oIntervalObj = {};
                var aRegisterDataArr = [];
                var sValue = 0;
                var sBusyMsg = this.getResourceBundle().getText("calculatingIntervalConsumption");
                if (sSelectedKey === Constants.REGISTER_DATA_TAB_KEY) {
                    var oRegDataTbl = this.getView().byId("idRegisterDataTbl");
                    var aSelectedItems = oRegDataTbl.getSelectedItems();
                    if (aSelectedItems.length > 0) {
                        if (aSelectedItems.length > 2) {
                            MessageBox.error(this.getResourceBundle().getText("pleaseSelectTwoRows"));
                        } else {
                            var oItem1 = aSelectedItems[0].getCells()[4].getText();
                            var oItem2 = aSelectedItems[1].getCells()[4].getText();
                            var oItem1Multiplier = aSelectedItems[0].getCells()[5].getText();
                            if (oItem1Multiplier === "") {
                                oItem1Multiplier = "1";
                            }
                            var oItem2Multiplier = aSelectedItems[1].getCells()[5].getText();
                            if (oItem2Multiplier === "") {
                                oItem2Multiplier = "1";
                            }
                            sValue = (Number(oItem1Multiplier) * Number(oItem1)) - (Number(oItem2Multiplier) * Number(oItem2));
                            oInput.setValue(Math.abs(sValue));

                            for (var k = 0; k < aDeviceAndProfileData.length; k++) {
                                if (sSelectedDevice === aDeviceAndProfileData[k].device) {
                                    oIntervalObj.device = aDeviceAndProfileData[k].device;
                                    oIntervalObj.installation = aDeviceAndProfileData[k].installation;
                                    oIntervalObj.dateFrom = aDeviceAndProfileData[k].dateFrom;
                                    oIntervalObj.dateTo = aDeviceAndProfileData[k].dateTo;
                                }
                            }
                            oIntervalObj.command = Constants.CONSUMPTION_TEXT;
                            aRegisterDataArr = [
                                {
                                    "device": oIntervalObj.device,
                                    "regNo": aSelectedItems[0].getCells()[0].getText(),
                                    "mrDate": aSelectedItems[0].getCells()[1].getText(),
                                    "mrTime": aSelectedItems[0].getCells()[2].getText(),
                                    "readReason": aSelectedItems[0].getCells()[3].getText(),
                                    "readValue": aSelectedItems[0].getCells()[4].getText(),
                                    "uom": aSelectedItems[0].getCells()[6].getText()
                                },
                                {
                                    "device": oIntervalObj.device,
                                    "regNo": aSelectedItems[1].getCells()[0].getText(),
                                    "mrDate": aSelectedItems[1].getCells()[1].getText(),
                                    "mrTime": aSelectedItems[1].getCells()[2].getText(),
                                    "readReason": aSelectedItems[1].getCells()[3].getText(),
                                    "readValue": aSelectedItems[1].getCells()[4].getText(),
                                    "uom": aSelectedItems[1].getCells()[6].getText()
                                }

                            ];

                            aRegisterDataArr.forEach(function (oRecord) {
                                oRecord.mrDate = oRecord.mrDate.split("/")[2] + oRecord.mrDate.split("/")[0] + oRecord.mrDate.split("/")[1];
                                oRecord.mrTime = oRecord.mrTime.split(":")[0] + oRecord.mrTime.split(":")[1];
                                return oRecord;
                            });

                            oIntervalObj.registerreadnav = aRegisterDataArr;

                            if (oExcelData.length > 0) {

                                // create payload for All Interval Tab excel Table

                                for (var p = 0; p < oExcelData.length; p++) {
                                    aTableData.push({
                                        "device": oExcelData[p].device,
                                        "correctedInterval": oExcelData[p].correctedInterval,
                                        "fromTime": oExcelData[p].fromTime,
                                        "toTime": oExcelData[p].toTime,
                                        "profile": oExcelData[p].profile,
                                        "read": oExcelData[p].read,
                                        "readDate": oExcelData[p].readDate,
                                        "uom": oExcelData[p].uom,
                                        "validationReason": oExcelData[p].validationReason,
                                        "validationState": oExcelData[p].validationState
                                    });
                                }
                                aTableData.forEach(function (oRecord) {
                                    oRecord.readDate = oRecord.readDate.split("/")[2] + oRecord.readDate.split("/")[0] + oRecord.readDate.split("/")[1];
                                    return oRecord;
                                });
                            }
                            oIntervalObj.intervalreadnav = aTableData;

                            this.getBusyDialog(null, sBusyMsg).open();

                            var me = this;
                            oModel.create("/IntervalsSet", oIntervalObj, {
                                success: $.proxy(function (oRes) {

                                    me.getBusyDialog(null, null).close();

                                    var sValue1 = 0;
                                    if (oRes.intervalreadnav !== null && oRes.intervalreadnav.results.length > 0) {
                                        for (var x = 0; x < oRes.intervalreadnav.results.length; x++) {
                                            sValue1 = sValue1 + Number(oRes.intervalreadnav.results[x].read);
                                        }
                                    }
                                    oIntConsumptionInput.setValue(sValue1);

                                }, this),
                                error: $.proxy(function (oErr) {
                                    me.getBusyDialog(null, null).close();
                                    var oErrorMessage = Messages.getErrorMessage(oErr);
                                    MessageBox.error(oErrorMessage);
                                }, this)
                            });

                        }
                    } else {
                        MessageBox.error(this.getResourceBundle().getText("pleaseSelectRow"));
                    }
                } if (sSelectedKey === Constants.ALL_INTERVAL_TAB_KEY) {
                    var oAllIntIconTab = this.getView().byId("idAllIntTab");
                    var oExcelData = oAllIntIconTab.getContent()[1].getContent()[0].getData();
                    if (oExcelData.length > 0) {
                        for (var j = 0; j < oExcelData.length; j++) {
                            if (oExcelData[j].correctedInterval === Constants.YES_TEXT) {
                                sValue = sValue + Number(oExcelData[j].read);
                            }
                        }
                        if (sValue > 0) {
                            oInput.setValue(sValue);
                        } else {
                            MessageBox.error(this.getResourceBundle().getText("pleaseSelectRowWithReadValues"));
                        }
                    }
                }
            },

            /**
             * This method is triggered on press of clear button in the register data table header
             * Row selections are removed and check consumption input at the footer is set empty
             */
            onRegisterDataTblClear: function () {
                var oRegDataTbl = this.getView().byId("idRegisterDataTbl");
                oRegDataTbl.removeSelections();
                var oInput = this.getView().byId("idCheckConsumptionInput");
                oInput.setValue("");
                var oIntConsumptionInput = this.getView().byId("idIntConsumptionInput");
                oIntConsumptionInput.setValue("");
            },

            /**
             * This method is triggered on press of clear button in all interval tab
             * Row selections are removed and check consumption input at the footer is set empty
             */
            onPressAllIntTabClearBtn: function () {
                var oButton = this.getView().byId("idAllIntervalTabSelectAllBtn");
                var oInput = this.getView().byId("idCheckConsumptionInput");
                oInput.setValue("");
                var oAllIntIconTab = this.getView().byId("idAllIntTab");
                var oExcelData = oAllIntIconTab.getContent()[1].getContent()[0].getData();
                if (oExcelData.length > 0) {
                    oExcelData.forEach(function (oRecord) {
                        oRecord.correctedInterval = Constants.NO_TEXT;
                        return oRecord;
                    });
                    oAllIntIconTab.getContent()[1].getContent()[0].setData(oExcelData);
                    oButton.setText(this.getResourceBundle().getText("selectAll"));
                }
            },

            /**
             * This method is used to convert time in HH:MM format for display
             * @param sValue 
             */
            getTimeInFormat: function (sValue) {
                if (sValue) {
                    return sValue.slice(0, 2) + ":" + sValue.slice(2, 4);
                }
            },

            /**
             * This method is triggered on press of select all / deselect all button in all tabs
             * Row selections are removed and check consumption input at the footer is set empty
             * @param oEvent
             */
            onPressSelectAllBtn: function (oEvent) {
                var oButton = oEvent.getSource();
                var oButtonTxt = oButton.getText();
                var oIconTabBar = this.getView().byId("idIconTabBar");
                var sSelectedKey = oIconTabBar.getSelectedKey();
                var oIconTab;
                if (sSelectedKey === Constants.ALL_INTERVAL_TAB_KEY) {
                    oIconTab = this.getView().byId("idAllIntTab");
                }
                if (sSelectedKey === Constants.MISSING_INTERVAL_TAB_KEY) {
                    oIconTab = this.getView().byId("idMissingIntTab");
                }
                if (sSelectedKey === Constants.VALIDATION_FAIL_TAB_KEY) {
                    oIconTab = this.getView().byId("idInvalidTab");
                }

                var oExcelData = oIconTab.getContent()[1].getContent()[0].getData();
                if (oExcelData.length > 0) {
                    if (oButtonTxt === this.getResourceBundle().getText("selectAll")) {
                        oExcelData.forEach(function (oRecord) {
                            oRecord.correctedInterval = Constants.YES_TEXT;
                            return oRecord;
                        });
                        oButton.setText(this.getResourceBundle().getText("deselectAll"));
                    } else {
                        oExcelData.forEach(function (oRecord) {
                            oRecord.correctedInterval = Constants.NO_TEXT;
                            return oRecord;
                        });
                        oButton.setText(this.getResourceBundle().getText("selectAll"));
                    }
                    oIconTab.getContent()[1].getContent()[0].setData(oExcelData);
                }
            },

            /**
             * Selection Change event of Device Dropdown
             * Profiles are populated in profile dropdown based on device selected
             * @param oEvent 
             */
            onDeviceSelectionChange: function (oEvent) {
                var sSelectedKey = oEvent.getSource().getSelectedKey();
                var oDeviceAndProfileDataModel = this.getModel("oDeviceAndProfileDataModel");
                var aDeviceAndProfileData = oDeviceAndProfileDataModel.getProperty("/deviceAndProfileData");
                var oProfileModel = this.getModel("oProfileModel");
                var oProfileDropdown = this.getView().byId("idProfileDropdown");
                var aProfileArr = [];
                if (sSelectedKey !== "" || sSelectedKey !== null || sSelectedKey !== undefined) {
                    for (var i = 0; i < aDeviceAndProfileData.length; i++) {
                        if (sSelectedKey === aDeviceAndProfileData[i].device) {
                            aProfileArr = aDeviceAndProfileData[i].validprofilesnav.results;
                        }
                    }
                    oProfileModel.setProperty("/profileData", aProfileArr);
                    oProfileDropdown.setModel(oProfileModel, "oProfileModel");
                } else {
                    oProfileModel.setProperty("/profileData", []);
                    oProfileDropdown.setModel(oProfileModel, "oProfileModel");
                }
            },

            /**
             * This method is triggered on press of chart button
             * The chart based on profile data is shown in a dialog in Intervals Chart fragment
             */
            onPressChartBtn: function () {
                var oAllIntervalModel = this.getModel("oAllIntervalModel");
                var oAllIntIconTab = this.getView().byId("idAllIntTab");
                var oExcelData = oAllIntIconTab.getContent()[1].getContent()[0].getData();
                if (oExcelData.length > 0) {
                    if (!this.oChartDialog) {
                        this.oChartDialog = sap.ui.xmlfragment("idChartDialogFrag",
                            "com.mdm.zmissint.view.fragments.IntervalsChart",
                            this
                        );
                        this.getView().addDependent(this.oChartDialog);
                        var oViz = Fragment.byId("idChartDialogFrag", "idVizFrame");
                        oViz.setModel(oAllIntervalModel, "oAllIntervalModel");
                    }
                    this.oChartDialog.open();
                }
            },

            /**
             * This method is triggered on press of close button in Intervals Chart fragment
             * Intervals Chart fragment is closed
             */
            onCloseChartDialog: function () {
                this.oChartDialog.close();
                this.oChartDialog.destroy();
                this.oChartDialog = null;
            }

        });
    });
