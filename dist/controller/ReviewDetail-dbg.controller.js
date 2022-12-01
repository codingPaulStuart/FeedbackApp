sap.ui.define([
        "feedbackapp/feedbackapp/controller/BaseController",
        "sap/ui/model/json/JSONModel",
        "feedbackapp/feedbackapp/model/models",
        "sap/m/MessageToast",
        "sap/m/library",
        "sap/m/GenericTile",
        "sap/ui/core/Fragment",
        "sap/viz/ui5/controls/common/feeds/FeedItem",
        "sap/viz/ui5/data/FlattenedDataset",
        "feedbackapp/feedbackapp/utils/FeedbackAppUtilityFile",
        "sap/ui/core/format/DateFormat"

    ],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, models, MessageToast, mobileLibrary, GenericTile, Fragment, FeedItem, FlattenedDataset,
        FeedbackAppUtilityFile, DateFormat, Filter, FilterOperator) {
        "use strict";

        var URLHelper = mobileLibrary.URLHelper;
        return Controller.extend("feedbackapp.feedbackapp.controller.ReviewDetail", {

            onAfterRendering: function () {
                // Radar Chart gets instantiated and the datasets get updated through other 
                // function calls all from this single method

                //Route Matching with ReviewDetail.view
                this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                this._oRouter.getRoute("ReviewDetail").attachMatched(this.handleRouteMatched, this);

                //Temporary fix when refreshing when looking at review details.
                var ReviewDetails = this.getView().getModel("FeedbackModel").getProperty("/ReviewDetails");
                if (ReviewDetails === undefined || ReviewDetails === null || ReviewDetails.length === 0) {

                    //Navigate back to Main.view
                    var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                    oRouter.navTo("Main");
                }
            },

            //Route matched to run this code everytime the view is visited
            handleRouteMatched: function (oEvent) {
                var selectedItem = this.getView().getModel("FeedbackModel").getProperty("/ReviewDetails");
                var selectedKey = this.getView().getModel("SettingsModel").getProperty("/ReviewsListSelectedKey");
                if (selectedKey === "Feedback") {
                    this.feedbackValueComparison(selectedItem);
                    this.setVizFrameRadar();
                    this.getView().getModel("FeedbackModel").setProperty("/NewGoal", models.createGoalTemplate());
                }
            },

            //Used by AnalyticDisplay.fragment for displaying the arrows next to the averages
            //Compares the currently selected feedback entry with the next most recent feedback entry for that employee.
            feedbackValueComparison: function (selectedItem) {
                var selectedKey = this.getView().getModel("SettingsModel").getProperty("/ReviewsListSelectedKey");
                var feedbackModel = this.getView().getModel("FeedbackModel");
                var feedbackArray = feedbackModel.getProperty("/Feedback");

                if (selectedKey === "Feedback") {

                    //Find the index of the selected feedback entry in the feedback array by employee name
                    var feedbackIndex = feedbackArray.findIndex(element => element.EmployeeName === selectedItem.EmployeeName);

                    //minus 1 to avoid itself
                    var feedbackIndex = feedbackIndex - 1;
                    for (var i = feedbackIndex; i >= 0; i--) {
                        //search for the employees most recent previous feedback entry and set to previous feedback summary.
                        if (feedbackArray[i].EmployeeName === selectedItem.EmployeeName) {
                            feedbackModel.setProperty("/PreviousFeedbackSummary", feedbackArray[i]);
                        }
                    }

                }
            },

            setVizFrameRadar: function () {
                var viz = this.byId("viz");
                // Perform any calculations/generate data for the chart
                FeedbackAppUtilityFile.createDataSets(viz, this);
                FeedbackAppUtilityFile.updateMeasures(this);
                // Initialize, set the chart and flatten the dataset 
                FeedbackAppUtilityFile.setChart(viz, this);
                // Generate and set the chart feeds
                FeedbackAppUtilityFile.setFeeds(viz, this);
            },

            //Used by AnalyticsDisplay.fragment
            //Display the the scores of the individual reviews when user clicks on a tile
            onTilePress: function (oEvent) {
                var oButtonHeader = oEvent.getSource().getHeader();
                var selectedKey = this.getView().getModel("SettingsModel").getProperty("/ReviewsListSelectedKey");
                var settingsModel = this.getView().getModel("SettingsModel");
                var feedbackModel = this.getView().getModel("FeedbackModel");
                var array = [];
                //If statements to remove the spaces so the paths can be accessed via the for loop
                if (selectedKey === "Feedback") {
                    if (oButtonHeader === "Business Knowledge") {
                        oButtonHeader = "BusinessKnowledge";
                    } else if (oButtonHeader === "Stakeholder Management") {
                        oButtonHeader = "StakeholderMGMT";
                    } else if (oButtonHeader === "User Requirements") {
                        oButtonHeader = "UserRequirements";
                    } else if (oButtonHeader === "Solution Design") {
                        oButtonHeader = "SolutionDesign";
                    } else if (oButtonHeader === "Technical Skills") {
                        oButtonHeader = "TechnicalSkills";
                    }
                }

                console.log(feedbackModel.getProperty("/ReviewStorage"));
                //For loop to access each individual review of the feedback summary and push its score into the array
                for (var i = 0; i < feedbackModel.getProperty("/ReviewStorage").length; i++) {
                    array.push(feedbackModel.getProperty("/ReviewStorage/" + i + "/" + oButtonHeader));
                    

                    //If statement to add the space back into the observation item names so they can be displayed on the popover
                    if (i === feedbackModel.getProperty("/ReviewStorage").length - 1 || feedbackModel.getProperty("/ReviewStorage").length === 0) {
                        if (oButtonHeader === "BusinessKnowledge") {
                            oButtonHeader = "Business Knowledge";
                        } else if (oButtonHeader === "StakeholderMGMT") {
                            oButtonHeader = "Stakeholder Management";
                        } else if (oButtonHeader === "UserRequirements") {
                            oButtonHeader = "User Requirements";
                        } else if (oButtonHeader === "SolutionDesign") {
                            oButtonHeader = "Solution Design";
                        } else if (oButtonHeader === "TechnicalSkills") {
                            oButtonHeader = "Technical Skills";
                        }
                    }
                }

                //Using SettingsModel to hold the tile names and their arrays
                settingsModel.setProperty("/TileName", oButtonHeader);
                console.log(settingsModel.getProperty("/TileName"));
                settingsModel.setProperty("/TileArray", array);
                this.managePopOver(oEvent, "feedbackapp.feedbackapp.view.fragments.PopoverForGraphDisplay");
            },

            //Used by ReviewDetails.views
            //Different actions based around which button has been clicked
            onReviewOptions: function (oEvent) {
                var feedbackModel = this.getView().getModel("FeedbackModel");
                var settingsModel = this.getView().getModel("SettingsModel");
                var userRole = settingsModel.getProperty("/UserRole");
                var ButtonText = oEvent.getSource().getText();
                var selectedItem = feedbackModel.getProperty("/ReviewDetails");
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                //Determining which version of the button has been clicked
                if (ButtonText === "Approve Feedback" || ButtonText === "Accept Feedback") {
                    if (userRole === "Admin") {
                        feedbackModel.setProperty("/ReviewDetails/DateSubmitted", DateFormat.getDateInstance({
                            pattern: "yyyyMMdd"
                        }).format(new Date()));
                    } else {
                        MessageToast.show("Feedback Accepted");
                    }
                    selectedItem.ReviewState = "Completed";
                    selectedItem.ReviewerName = "Admin";
                    // String Format the Scores in Utility Function before sending to DB, otherwise Errors
                    var selectedItemStr = FeedbackAppUtilityFile.stringifyScores(this, selectedItem);
                    MessageToast.show(selectedItemStr);

                    //Update Feedback after approval (admin) or acceptance(User)
                    this.getView().getModel("oDataFeedback").update("/Feedback(FeedbackID=" + selectedItem.FeedbackID +
                        ")",
                        selectedItemStr, {
                            success: function (data, oResponse) {
                                MessageToast.show("Success, Feedback updated!");
                                MessageToast.show("Feedback Updated!");
                                //	oRouter.navTo("Main");
                            },
                            error: function (error) {
                                MessageToast.show("Error, Feedback could not be updated!");
                            }
                        });

                    //User Submitting Review
                } else if (ButtonText === "Submit Review") {
                    FeedbackAppUtilityFile.reviewStateChange(this, "Completed");

                } else if (ButtonText === "Dispute Review") {
                    FeedbackAppUtilityFile.reviewStateChange(this, "Disputed");
                } else if (ButtonText === "Set back to Pending") {
                    FeedbackAppUtilityFile.reviewStateChange(this, "Pending");
                }
            },

            // Role Functions for Changing/Setting/updating ------------------------------------------------------------------------------------------------------

            // Sets the Role Title from the presets
            onSelectEmployeeRole: function (oEvent) {
                var feedbackModel = this.getView().getModel("FeedbackModel");
                feedbackModel.setProperty("/ReviewDetails/RoleName", oEvent.getParameters().value);
            },

            // Sets the Role Attribute Descriptors back to Default settings in the Text Fields
            resetRoleDef: function () {
                var feedbackModel = this.getView().getModel("FeedbackModel");
                var RoleIntuition = feedbackModel.getProperty("/RoleDefaults/RoleIntuition");
                feedbackModel.setProperty("/ReviewDetails/RoleIntuition", RoleIntuition);
                var RoleDocumentation = feedbackModel.getProperty("/RoleDefaults/RoleDocumentation");
                feedbackModel.setProperty("/ReviewDetails/RoleDocumentation", RoleDocumentation);
                var RoleCommunication = feedbackModel.getProperty("/RoleDefaults/RoleCommunication");
                feedbackModel.setProperty("/ReviewDetails/RoleCommunication", RoleCommunication);
                var RoleBusinessKnowledge = feedbackModel.getProperty("/RoleDefaults/RoleBusinessKnowledge");
                feedbackModel.setProperty("/ReviewDetails/RoleBusinessKnowledge", RoleBusinessKnowledge);
                var RoleStakeholderMGMT = feedbackModel.getProperty("/RoleDefaults/RoleStakeholderMGMT");
                feedbackModel.setProperty("/ReviewDetails/RoleStakeholderMGMT", RoleStakeholderMGMT);
                var RoleUserRequirements = feedbackModel.getProperty("/RoleDefaults/RoleUserRequirements");
                feedbackModel.setProperty("/ReviewDetails/RoleUserRequirements", RoleUserRequirements);
                var RoleFacilitation = feedbackModel.getProperty("/RoleDefaults/RoleFacilitation");
                feedbackModel.setProperty("/ReviewDetails/RoleFacilitation", RoleFacilitation);
                var RoleSolutionDesign = feedbackModel.getProperty("/RoleDefaults/RoleSolutionDesign");
                feedbackModel.setProperty("/ReviewDetails/RoleSolutionDesign", RoleSolutionDesign);
                var RoleVisibility = feedbackModel.getProperty("/RoleDefaults/RoleVisibility");
                feedbackModel.setProperty("/ReviewDetails/RoleVisibility", RoleVisibility);
                var RoleTechnicalSkills = feedbackModel.getProperty("/RoleDefaults/RoleTechnicalSkills");
                feedbackModel.setProperty("/ReviewDetails/RoleTechnicalSkills", RoleTechnicalSkills);
            },

            // Commits the Role Attributes and Role Name to the DB with update to oData
            onRoleSave: function (oEvent) {
                var feedbackModel = this.getView().getModel("FeedbackModel");
                var feedbackObj = feedbackModel.getProperty("/ReviewDetails");
                feedbackObj = FeedbackAppUtilityFile.stringifyScores(this, feedbackObj);
                this.getView().getModel("oDataFeedback").update("/Feedback(FeedbackID=" + feedbackObj.FeedbackID + ")", feedbackObj, {
                    success: function (data, oResponse) {
                        MessageToast.show("Job Role Description and Title updated");
                    },
                    error: function (error) {
                        MessageToast.show("job Role and Description could not be updated, error occurred");
                    },
                    refreshAfterChange: true
                });
            }

        });
    });