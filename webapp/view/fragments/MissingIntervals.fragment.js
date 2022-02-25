sap.ui.jsfragment("com.mdm.zmissint.view.fragments.MissingIntervals", {
    createContent: function (oController) {
        return new sap.m.Page(this.createId("homepage"), {
            showHeader: false,
            content: [
                new ExcelGrid("grid", {
                    data: "{oMissingIntervalModel>/missingIntervalData}",  //binding the model
                    options: {
                        minSpareRows: 0, colHeaders: ["  ", "Profile", "Validation State", "Validation Reason", "Date", "From Time", "To Time", "Interval Read", "Unit"],
                        columns: [
                            {
                                data: 'correctedInterval',
                                type: 'checkbox',
                                checkedTemplate: 'Yes',
                                uncheckedTemplate: 'No',
                                colWidths: 50

                            },
                            {
                                data: 'profile',
                                readOnly: true
                            },
                            {
                                data: 'validationState',
                                readOnly: true

                            },
                            {
                                data: 'validationReason',
                                readOnly: true
                            },
                            {
                                data: 'readDate',
                                readOnly: true
                            },
                            {
                                data: 'fromTime',
                                readOnly: true
                            },
                            {
                                data: 'toTime',
                                readOnly: true
                            },
                            {
                                data: 'read'
                            },
                            {
                                data: 'uom',
                                readOnly: true
                            }
                        ],
                        contextMenu: false,
                        rowHeaders: true,
                        height: 1000,
                        manualColumnResize: true,
                        selection: 'multiple',
                        scrollV : 'auto',
                        licenseKey: 'non-commercial-and-evaluation'
                    }
                })
            ],
            headerContent: new sap.m.ObjectStatus(this.createId("objectStatus"), {
                text: "OK",
                state: "Success",
                inverted: true,
                visible: "{= !!${/visibility}}"
            }).addStyleClass("sapMObjectStatusLarge"),
        }).addStyleClass("sapUiResponsivePadding--header sapUiResponsiveContentPadding sapUiResponsivePadding--content");
    }
})