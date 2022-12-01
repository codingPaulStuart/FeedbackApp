sap.ui.define([
        "sap/ui/core/mvc/Controller",
        "sap/ui/model/json/JSONModel",
        "feedbackapp/feedbackapp/model/models",
        "sap/ui/core/Fragment",
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator",
        "sap/m/MessageToast",
        "feedbackapp/feedbackapp/utils/FeedbackAppUtilityFile"
    ],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, models, Fragment, Filter, FilterOperator, MessageToast, FeedbackAppUtilityFile) {
        "use strict";

        return Controller.extend("feedbackapp.feedbackapp.controller.BaseController", {

            //When clicking the back arrow		
            onBack: function () {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                this.getView().getModel("SettingsModel").setProperty("/EmployeeSelected", false);
                oRouter.navTo("Main");
            },

            //Buttons for submitting or cancel the create new entry (feedback/review/goal/actionitem) dialog box.
            //Used to create the items after the dialog has opended.
            onDialogButtonsCreateItems: function (oEvent, buttonText) {
                var feedbackModel = this.getView().getModel("FeedbackModel");
                var pdplanModel = this.getView().getModel("PDPlanModel");
                var settingsModel = this.getView().getModel("SettingsModel");
                var selectedKey = settingsModel.getProperty("/ReviewsListSelectedKey");
                var parentPDplan = pdplanModel.getProperty("/CurrentPDPlan");
                //
                var newEntry;
                var entitySet, entityID, idNumber;

                //User is creating a review,feedback report, goal or action item
                if (settingsModel.getProperty("/IsEditingGoal") === false && buttonText === 'CREATE') {
                    //User wants to create a Feedback report or Review
                    if (selectedKey === "Feedback" || selectedKey === "Reviews") {
                        newEntry = feedbackModel.getProperty("/NewReview");

                    //User wants to create a Dev Item or an Action Item
                    } else if (selectedKey === "PDdevItems" || selectedKey === "Action") {
                        newEntry = pdplanModel.getProperty("/NewItem");
                        newEntry.PDplanID = parentPDplan.PDplanID;
                        if (selectedKey === "Action") {
                            selectedKey = "Goals";
                        }
                        //User doesn't want to create a feedback report, review, dev item or action item.
                        //Reset the new Item storage properties
                    } else if (buttonText === "CANCEL") {
                        feedbackModel.setProperty("/NewReview", "");
                        pdplanModel.setProperty("/NewItem", "");
                        settingsModel.setProperty("/IsEditingGoal", false);

                        if (selectedKey === 'Action') {
                            this.getView().getModel("SettingsModel").setProperty("/ReviewsListSelectedKey", 'PDdevItems');
                        }
                        this.byId("createNewEntryDialog").close();
                    }

                    var that = this;
                    console.log(selectedKey);
                    this.getView().getModel("oDataFeedback").create("/" + selectedKey, newEntry, {
                        success: function (data, oResponse) {
                            console.log("Success! createNewEntry");
                            MessageToast.show("Successfully Created!");
                            that.getView().getModel("oDataFeedback").read("/" + selectedKey, {
                                success: function (oData, Response) {
                                    var oDataResults = oData.results;
                                    if (selectedKey === 'Feedback' || selectedKey === 'Reviews') {
                                        feedbackModel.setProperty("/ReviewList", oDataResults);
                                        console.log(feedbackModel.getProperty("/ReviewList"));
                                        console.log("successful read");
                                    } else {
                                        that.getPDPlanFromBackend("ShowAll", "/DevelopmentItemsList", "PDplans(PDplanID=" + parentPDplan.PDplanID + ")",
                                            "to_DevItem/to_goals,to_DevItem/to_notes");
                                    }
                                },
                                error: function (oData, Response) {
                                    MessageToast.show("Error: Reading Dev Items");
                                }
                            });

                        },
                        error: function (error) {
                            MessageToast.show("Error! createNewEntry");
                        }
                    });

                    //user is updating a goal, or action item
                } else if (settingsModel.getProperty("/IsEditingGoal") === true) {

                    //User has cancelled the update so revert changes
                    if (buttonText === "CANCEL") {
                        feedbackModel.setProperty("/NewReview", "");
                        settingsModel.setProperty("/IsEditingGoal", false);
                        this.loadFromBackend("/DevelopmentItemsList", pdplanModel, "PDdevItems");
                        this.byId("createNewEntryDialog").close();

                        MessageToast.show("Update Cancelled");
                        //User is wanting to update a development item
                    } else if (selectedKey === 'PDdevItems') {
                        newEntry = pdplanModel.getProperty("/NewItem");
                        entitySet = "PDdevItems";
                        entityID = "DevItemID";
                        idNumber = newEntry.DevItemID;

                        //User wants to update an action item
                    } else if (selectedKey === 'Action') {
                        newEntry = pdplanModel.getProperty("/NewItem");
                        entitySet = "Goals";
                        entityID = "GoalSettingID";
                        idNumber = newEntry.GoalSettingID;
                    }

                    FeedbackAppUtilityFile.updateEntitySet(this, entitySet, entityID, idNumber, newEntry);
                    settingsModel.setProperty("/IsEditingGoal", false);

                }
                this.byId("createNewEntryDialog").close();

            },

            //Used by ReviewList.fragment
            //User has clicked on Assign new review or create new feedback summary
            onReviewAssignment: function (oEvent) {

                 //create new dialog for creating feedback entry
                FeedbackAppUtilityFile.createNewEntryAndDialog(oEvent, this);
            },

            //Used by AnalyticsDisplay.fragment and ReviewDetails.view
            //create and close the popover
            managePopOver: function (oEvent, PopOverPath) {
                var oButton = oEvent.getSource(),
                    oView = this.getView();
                // create popover
                if (!this._pPopover) {
                    this._pPopover = Fragment.load({
                        id: oView.getId(),
                        name: PopOverPath,
                        controller: this
                    }).then(function (oPopover) {
                        oView.addDependent(oPopover);
                        return oPopover;
                    });
                }
                this._pPopover.then(function (oPopover) {
                    oPopover.openBy(oButton);
                });
            },

            //Used by main.controller.js and FeedbackAppUltilityFile.js
            //Function to read oData from the backend and set it to feedbackModel
            loadFromBackend: function (destination, model, requestedOdata) {
                var filters = [];
                var query = this.getView().getModel("SettingsModel").getProperty("/MasterSearchQuery");

                if (query && query.length > 0) {
                    filters.push(new Filter({
                        filters: [
                            new Filter("EmployeeName", FilterOperator.Contains, query),
                            new Filter("ReviewerName", FilterOperator.Contains, query),
                        ],
                        and: false
                    }));
                }
                this.getView().getModel("oDataFeedback").read("/" + requestedOdata, {
                    filters: filters,
                    success: function (oData, oResponse) {
                        var oDataResults = oData.results;
                        //Set filtered Reviews to /Reviews in feedback model.
                        if (requestedOdata === "IndividualReviews") {
                            requestedOdata = "Reviews";
                        }

                        //Populate the review list only when requested.
                        model.setProperty("/" + requestedOdata, oDataResults);
                        if (destination === "/ReviewList") {
                            model.setProperty(destination, oDataResults);
                        }
                    }
                });
            },
            //Get PD plans from back end and filter based on status
            getPDPlanFromBackend: function (filter, destination, whatWeWantFromBackend, getAssociated) {
                var pdplanModel = this.getView().getModel("PDPlanModel");
                var aFilter = [];
                var createdFilterforArchived;
                var developmentItemsArray;
                var notesStorageArray = [];

                if (getAssociated !== null) {
                    this.getView().getModel("oDataFeedback").read("/" + whatWeWantFromBackend, {
                        filters: aFilter,
                        urlParameters: {
                            "$expand": getAssociated
                        },
                        success: function (oData, oResponse) {

                            if (oData.results === undefined) {
                                var oDataResults = oData;
                            } else {
                                var oDataResults = oData.results;
                            }
                            if (destination !== "/CurrentPDPlan") {
                                pdplanModel.setProperty(destination, oDataResults.to_DevItem.results);
                            } else {
                                pdplanModel.setProperty(destination, oDataResults);
                                console.log("PD plan loaded");
                                console.log(pdplanModel);
                            }

                            //Collate the notes to display them in the Action Items Notes History
                            developmentItemsArray = pdplanModel.getProperty("/DevelopmentItemsList");
                            for (var i = 0; i < developmentItemsArray.length; i++) {
                                for (var j = 0; j < (developmentItemsArray[i].to_notes.results).length; j++) {
                                    notesStorageArray.push(developmentItemsArray[i].to_notes.results[j]);
                                }
                            }
                            pdplanModel.setProperty("/NotesList", notesStorageArray);

                        }
                    });
                } else {
                    this.getView().getModel("oDataFeedback").read("/" + whatWeWantFromBackend, {
                        success: function (oData, oResponse) {
                            var oDataResults = oData.results;
                            pdplanModel.setProperty(destination, oDataResults);
                        }
                    });
                }
            },

            // Selected PD Plan from the list, grab the event-binding and set to the current plan property for display
            onselectPDplanListItem: function (oEvent) {
                var selectedPDP = oEvent.getSource().getBindingContext("PDPlanModel").getObject();
                //only want to grab the specific PD plan that was selected and grab the equvalent info (Dev Items -> goals -> notes)
                //pdplanModel.setProperty("/CurrentPDPlan", selectedPDP);
                this.getPDPlanFromBackend("FilterOutArchived", "/CurrentPDPlan", "PDplans(PDplanID=" + selectedPDP.PDplanID + ")", "to_DevItem");
                this.getPDPlanFromBackend("FilterOutArchived", "/DevelopmentItemsList", "PDplans(PDplanID=" + selectedPDP.PDplanID + ")",
                    "to_DevItem/to_goals,to_DevItem/to_notes");

                this.getView().getModel("SettingsModel").setProperty("/UpdatePDplan", true);
            },

            //test button
            switchMode: function () {
                var settingsModel = this.getView().getModel("SettingsModel");
                var selectedKey = settingsModel.getProperty("/UserRole");
                var userRole = "";
                if (selectedKey === "Admin") {
                    userRole = "User";
                } else {
                    userRole = "Admin";
                }
                settingsModel.setProperty("/UserRole", userRole);
            },

            //test Button for directly accessing PD plan view
            accessPDPlan: function () {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("PDPlanDetails");
            }

        });
    });