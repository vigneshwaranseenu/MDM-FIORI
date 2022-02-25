sap.ui.define([
    "com/mdm/zmissint/controller/BaseController",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "com/mdm/zmissint/utils/Messages",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "com/mdm/zmissint/utils/Constants"
],
    function (BaseController, MessageToast, MessageBox, Messages, Filter, FilterOperator, Constants) {
        "use strict";

        return BaseController.extend("com.mdm.zmissint.controller.InputScreen", {

            /**
            * on init method of input screen controller
            */
            onInit: function () {
                this.getRouter().getRoute("RouteInputScreen").attachPatternMatched(this._onRouteMatched, this);
            },

            /**
            * on route matched method of input screen controller
            * Setting the alignment for page title
            */
            _onRouteMatched: function () {
                var oInputPage = this.getView().byId("idInputPage");
                oInputPage.setTitleAlignment("Center");
            },

            /**
             * This method is triggered on press of check status button on the footer
             * Service call is done to fetch data
             * This data is stored in a model to be mapped to table in validation reports screen
             * Navigation to validation reports screen
             */
            _onCheckStatusBtnPress: function () {
                var oView = this.getView();
                var oModel = this.getOwnerComponent().getModel();
                var oBillingCycleInputVal = oView.byId("idBillingCycleInput").getValue(),
                    oFromDateInputVal = oView.byId("idFromDateInput").getValue(),
                    oToDateInputVal = oView.byId("idToDateInput").getValue(),
                    oContractAccountInputVal = oView.byId("idContractAccountInput").getValue(),
                    oInstallationInputVal = oView.byId("idInstallationInput").getValue(),
                    oDeviceInputVal = oView.byId("idDeviceInput").getValue(),
                    oProfileNumberInputVal = oView.byId("idProfileNumberInput").getValue();

                if (oFromDateInputVal === "" && oToDateInputVal === "") {
                    MessageBox.error(this.getResourceBundle().getText("pleaseEnterBothFromAndToDates"));
                } else {
                    if ((oFromDateInputVal !== "" && oToDateInputVal === "") || (oFromDateInputVal === "" && oToDateInputVal !== "")) {
                        MessageBox.error(this.getResourceBundle().getText("pleaseEnterBothFromAndToDates"));
                    } else {
                        if (oBillingCycleInputVal === "" && oContractAccountInputVal === "" && oInstallationInputVal === "" && oDeviceInputVal === "" && oProfileNumberInputVal === "") {
                            MessageBox.error(this.getResourceBundle().getText("pleaseEnterValueMsg"));
                        } else {
                            var aFromDtArr = oFromDateInputVal.split("-");
                            var oFromDtValue = aFromDtArr[0] + aFromDtArr[1] + aFromDtArr[2];
                            var aToDtArr = oToDateInputVal.split("-");
                            var oToDtValue = aToDtArr[0] + aToDtArr[1] + aToDtArr[2];
                            var oValidationReportsTableModel = this.getModel("oValidationReportsTableModel");
                            var urlParameter = {
                                "$expand": "validinstallationsnav/validprofilesnav"
                            };

                            var oFilters = new Filter({
                                filters: [
                                    new Filter("dateFrom", FilterOperator.EQ, oFromDtValue),
                                    new Filter("dateTo", FilterOperator.EQ, oToDtValue),
                                    new Filter("cycle", FilterOperator.EQ, oBillingCycleInputVal),
                                    new Filter("contract", FilterOperator.EQ, oContractAccountInputVal),
                                    new Filter("device", FilterOperator.EQ, oDeviceInputVal),
                                    new Filter("installation", FilterOperator.EQ, oInstallationInputVal),
                                    new Filter("profile", FilterOperator.EQ, oProfileNumberInputVal),
                                    new Filter("command", FilterOperator.EQ, Constants.VALIDATION_TEXT)
                                ],
                                and: true
                            });

                            this.getBusyDialog(null, this.getResourceBundle().getText("fetchingData")).open();

                            oModel.read("/ValidationSet", {
                                filters: [oFilters],
                                urlParameters: urlParameter,
                                success: $.proxy(function (oResponse) {
                                    var oData = oResponse.results;
                                    this.getBusyDialog(null, null).close();
                                    if (oData.length > 0) {
                                        oValidationReportsTableModel.setProperty("/validationReportsTableData", oData);
                                        this.getRouter().navTo("RouteValidationReports");
                                    } else {
                                        MessageBox.error(this.getResourceBundle().getText("noDataFound"));
                                    }
                                }, this),
                                error: $.proxy(function (oErr) {
                                    this.getBusyDialog(null, null).close();
                                    var oErrorMessage = Messages.getErrorMessage(oErr);
                                    MessageBox.error(oErrorMessage);
                                }, this)
                            });
                        }
                    }
                }
            }
        });
    });
