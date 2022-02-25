sap.ui.define([
    "com/mdm/zmissint/controller/BaseController",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
],
    function (BaseController, Filter, FilterOperator) {
        "use strict";

        return BaseController.extend("com.mdm.zmissint.controller.ValidationReports", {

            /**
             * on init method of validation reports controller
             */
            onInit: function () {
                this.getRouter().getRoute("RouteValidationReports").attachPatternMatched(this._onRouteMatched, this);
            },

            /**
             * on route matched method of validation report controller
             * Table is mapped to the data stored in model
             * This data was set in model in input screen on press of check status button
             */
            _onRouteMatched: function () {
                var oReportsPage = this.getView().byId("idReportsPage");
                oReportsPage.setTitleAlignment("Center");
                var oValidationReportsTableModel = this.getModel("oValidationReportsTableModel");
                var oTable = this.getView().byId("idValidationReportsTable");
                oTable.removeSelections();
                oTable.setModel(oValidationReportsTableModel, "oValidationReportsTableModel");

            },

            /**
             * This method is triggered on press of to input screen button at the footer
             * Navigation to input screen takes place
             */
            onBackButtonPress: function () {
                this.getRouter().navTo("RouteInputScreen");
            },

            /**
             * This method is triggered when row is selected in validation reports table
             * The device and profile data related to installation number of the selected record is set in a model
             * This model will be mapped to device dropdown to display list of devices for selection
             * Navigation to Intervals screen
             */
            onRowSelect: function () {
                var oTable = this.getView().byId("idValidationReportsTable");
                var sSelectedItem = oTable.getSelectedItem();
                var sInstallationVal = sSelectedItem.getCells()[1].getText();
                var oTableData = this.getModel("oValidationReportsTableModel").getProperty("/validationReportsTableData");
                var aDeviceArr = [], aDropdownArr = [];
                var oDeviceAndProfileDataModel = this.getModel("oDeviceAndProfileDataModel");
                if (sSelectedItem !== "" && sSelectedItem !== null && sSelectedItem !== undefined) {
                    for (var i = 0; i < oTableData.length; i++) {
                        for (var k = 0; k < oTableData[i].validinstallationsnav.results.length; k++) {
                            aDeviceArr.push(oTableData[i].validinstallationsnav.results[k]);
                        }
                    }
                    for (var j = 0; j < aDeviceArr.length; j++) {
                        if (sInstallationVal === aDeviceArr[j].installation) {
                            aDropdownArr.push(aDeviceArr[j]);
                        }
                    }
                    oDeviceAndProfileDataModel.setProperty("/deviceAndProfileData", aDropdownArr);
                    this.getRouter().navTo("RouteIntervals");
                }
            },

            /**
             * This method is triggered on press of search button in search field present in header of table
             * Table data is filtered based on the search
             * @param oEvent 
             */
            handleValidationReportsTableSearch: function (oEvent) {
                var oSearchStr = oEvent.getSource().getValue();
                var oTable = this.getView().byId("idValidationReportsTable");
                var oBinding = oTable.getBinding("items");
                if (oSearchStr.length !== 0) {
                    var oFilters = [
                        new Filter("premise", FilterOperator.Contains, oSearchStr),
                        new Filter("installation", FilterOperator.Contains, oSearchStr),
                        new Filter("cycle", FilterOperator.Contains, oSearchStr),
                        new Filter("customerName", FilterOperator.Contains, oSearchStr),
                        new Filter("groupLabel", FilterOperator.Contains, oSearchStr),
                        new Filter("billingPeriod", FilterOperator.Contains, oSearchStr),
                        new Filter("remark", FilterOperator.Contains, oSearchStr)
                    ];
                    var filterObj = new Filter(oFilters, false);
                    oBinding.filter(filterObj);
                } else {
                    oBinding.filter([]);
                }
            },

            /**
             * This method is triggered on press of sort button present in header of table
             * @param oEvent 
             */
            onValidReportsTableSorting: function (oEvent) {
                this._getValidReportsTableSortDialog().open();
            },

            /**
             * This method is called from onValidReportsTableSorting method
             * This method is used to open the ValidReportsTableSort fragment for sorting
             */
            _getValidReportsTableSortDialog: function () {
                var oValidReportsTablemodel = this.getModel("oValidationReportsTableModel");
                if (!this._oValidReportsTableSortDialog) {
                    this._oValidReportsTableSortDialog = sap.ui.xmlfragment(this.createId("idValidReportsTableSortFrag"),
                        "com.mdm.zmissint.view.fragments.ValidReportsTableSort",
                        this
                    );
                    this.getView().addDependent(this._oValidReportsTableSortDialog);
                }
                return this._oValidReportsTableSortDialog;
            },

            /**
             * This method is triggered on press of confirm button in ValidReportsTableSort fragment
             * Method to sort the table data based on selections made in the dialog
             * Ascending and Descending order sorting done on table data 
             * @param oEvent 
             */
            onValidReportsTableSortConfirm: function (oEvent) {
                var sPath = oEvent.getParameter("sortItem").getKey(),
                    bDescending = oEvent.getParameter("sortDescending");
                var oList = this.getView().byId("idValidationReportsTable"),
                    oSortButton = this.getView().byId("idValidationReportsTableSort");
                this._oValidReportsTableSortSelection = {
                    path: sPath,
                    desc: bDescending
                };
                oSortButton.setType("Emphasized");
                var oSorter = new sap.ui.model.Sorter(this._oValidReportsTableSortSelection.path, this._oValidReportsTableSortSelection.desc);
                oList.getBinding("items").sort(oSorter);
            }

        });
    });
