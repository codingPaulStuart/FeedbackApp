sap.ui.define([
        "feedbackapp/feedbackapp/controller/BaseController",
        "sap/ui/model/json/JSONModel",
        "feedbackapp/feedbackapp/model/models",
        "sap/m/MessageToast",
        "sap/m/library",
        "sap/ui/core/Fragment",
        "sap/ui/core/format/DateFormat",
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator",
        "feedbackapp/feedbackapp/utils/FeedbackAppUtilityFile",
        "sap/m/MessageBox",

    ],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, models, MessageToast, mobileLibrary, Fragment, DateFormat, Filter, FilterOperator,
        FeedbackAppUtilityFile, MessageBox) {
        "use strict";

        return Controller.extend("feedbackapp.feedbackapp.controller.Main", {

            onInit: function () {},

            //Used by main.view
            //Load the initial Lists, also Load up the Employee List from Back-end API call to MSGraph
            onAfterRendering: function () {
                this.onLoadReviewList();
                this.setEmployeeModel();
              //  this.getUserInfo();
            },

            // Set User Name for the Action Items and Notes
            getUserInfo: function () {
                const url = this.getBaseURL() + "/user-api/currentUser";
                var settingsMod = this.getView().getModel("SettingsModel");
                var mock = {
                    firstname: "Dummy",
                    lastname: "User",
                    email: "dummy.user@com",
                    name: "dummy.user@com",
                    displayName: "Dummy User (dummy.user@com)"
                };
                settingsMod.loadData(url);
                settingsMod.dataLoaded()
                    .then(() => {
                        //check if data has been loaded
                        if (!settingsMod.getData().email) {
                            settingsMod.setProperty("/LoggedInInfo", "userInfo");
                        }
                    })
                    .catch(() => {
                        settingsMod.setData(mock);
                        settingsMod.setProperty("/LoggedInInfo", "userInfo");
                    });

                // Set the user email and Name to the SettingsModel
                console.log(settingsMod);
            },

            getBaseURL: function () {
                var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
                var appPath = appId.replaceAll(".", "/");
                var appModulePath = jQuery.sap.getModulePath(appPath);
                return appModulePath;
            },

            // Display - Delete a Feedback or Review Item from the List in the main view when 'x' icon is pressed in the trash can column of Main View
            onListDeleteOptions: function (oEvent) {
                var feedbackModel = this.getView().getModel("FeedbackModel");
                // selected item from the feedback/review list, store in global variable in FB Model for access if user confirms delete
                var listItem = oEvent.getSource().getBindingContext("FeedbackModel").getObject();
                var reviewsListSelectedKey = this.getView().getModel("SettingsModel").getProperty("/ReviewsListSelectedKey");

                if (reviewsListSelectedKey === "Feedback") {
                    // MessageBox Warning for Feedback Delete
                    MessageBox.warning("This will archive the Feedback Report and all associated Child Reviews.", {
                        actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                        title: "Archiving Feedback Report and Review Entries",
                        onClose: function (oCloseAction) {
                            if (oCloseAction === MessageBox.Action.OK) {
                                FeedbackAppUtilityFile.deleteFeedbackReport(this, listItem);
                            }
                        }.bind(this)
                    });

                } else if (reviewsListSelectedKey === "Reviews") {
                    // MessageBox Warning for Feedback Delete
                    MessageBox.warning("This will Archive the Review Entry", {
                        actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                        title: "Review Entry",
                        onClose: function (oCloseAction) {
                            if (oCloseAction === MessageBox.Action.OK) {
                                FeedbackAppUtilityFile.deleteReviewSingular(this, listItem);
                            }
                        }.bind(this)
                    });
                }
            },

            //Used by main.view
            //Clicking on the tabs at the top of the Icon Tab Bar Selector
            onLoadReviewList: function () {
                var feedbackModel = this.getView().getModel("FeedbackModel");
                var settingsModel = this.getView().getModel("SettingsModel");
                var pdPlanModel = this.getView().getModel("PDPlanModel");
                var reviewsListSelectedKey = this.getView().getModel("SettingsModel").getProperty("/ReviewsListSelectedKey");
                //Grab the feedback or review and set it into ReviewsList to display on main.view
                this.loadFromBackend("/ReviewList", feedbackModel, reviewsListSelectedKey);
                FeedbackAppUtilityFile.getMSGraphEmployees(this);
                // Grab the PDPlans and set it into the the PDplans List to display on main.view
                var plans = "PDplans";
                this.loadFromBackend("/PDplansList", pdPlanModel, plans);

                // Conditional Check which Tab on Main Screen is selected
                if (reviewsListSelectedKey === "Feedback") {
                    this.loadFromBackend("/Reviews", feedbackModel, "IndividualReviews");
                    this.setEmpFilterSelectList();
                } else if (reviewsListSelectedKey === "Reviews") {
                    this.setEmpFilterSelectList();
                } else { // Load PD Plans into Separate Fragment List
                    this.onLoadPDplanList();
                }

                // User Roles Requests
                this.loadFromBackend("/UserRole", settingsModel, "Roles");
                this.getView().getModel("oDataFeedback").read("/Roles", {
                    success: function (oData, oResponse) {
                        try {
                            var oDataResults = oData.results[0].UserRole;
                        } catch (err) {
                            var oDataResults = "User";
                        }
                        settingsModel.setProperty("/UserRole", oDataResults);
                    }
                });
            },

            onLoadPDplanList: function () {
                var pdPlanModel = this.getView().getModel("PDPlanModel");
                // Read PD Plans from Db and set to Model Property
                this.getPDPlanFromBackend("ShowAll", "/PDplansList", "PDplans", null);

            },

            // Set the Temp Array in Feedback Model to only contain currently displaying Feedback Entries
            // This list is then bound to a Select Control on ReviewList View, Admin can allocate a specific Feedback to review.
            setEmpFilterSelectList: function () {
                var settingsModel = this.getView().getModel("SettingsModel");
                var feedbackArray = this.getView().getModel("FeedbackModel").getProperty("/Feedback");
                var newList = [];
                for (var i = 0; i < feedbackArray.length; i++) {
                    var object = {
                        FeedbackID: feedbackArray[i].FeedbackID
                    };
                    newList.push(object);
                }
                settingsModel.setProperty("/EmployeeFilteredSelectList", newList);
            },

            // API request to KeyedIn and Set to Employee Model
            setEmployeeModel: function () {
                FeedbackAppUtilityFile.getMSGraphEmployees(this);
            },

            // Selected PD Plan from the list, grab the event-binding and set to the current plan property for display
            onselectPDplanListItem: function (oEvent) {
                var selectedPDP = oEvent.getSource().getBindingContext("PDPlanModel").getObject();
                var pdPlanModel = this.getView().getModel("PDPlanModel");
                this.getView().getModel("SettingsModel").setProperty("/EmployeeName", selectedPDP.EmployeeID);
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                //Grab Goals and set it to Goals Property in PDPlanModel
                this.loadFromBackend("/Goals", pdPlanModel, "Goals");
                oRouter.navTo("PDPlanDetails");
                // Set Temp Variable of PD Plan for Notes Entity to Access and Assign to
                pdPlanModel.setProperty("/NotesPDPlan", selectedPDP);
                console.log(selectedPDP);
            },

            //Used by ReviewList.fragment
            //When user selects a review/feedback in the list
            onReviewListItemSelected: function (oEvent) {
                var feedbackModel = this.getView().getModel("FeedbackModel");
                var settingsModel = this.getView().getModel("SettingsModel");
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

                var selectedReview = oEvent.getSource().getBindingContext("FeedbackModel").getObject();
                var employeeNamesArray = this.getView().getModel("EmployeeNamesModel").getProperty("/Employee")
                var selectedKey = settingsModel.getProperty("/ReviewsListSelectedKey");
                var employeeIndex, reviewerIndex;

                //Parse the floats into strings to be used by the backend
                FeedbackAppUtilityFile.parseFloats(selectedReview);

                //Feedback Report Selected
                if (selectedKey === "Feedback") {

                    employeeIndex = employeeNamesArray.findIndex((Employee) => Employee.Displayname == selectedReview.EmployeeName);
                    //Set Role and Employee Name for T180 Header
                    settingsModel.setProperty("/RoleName", employeeNamesArray[employeeIndex].Jobtitle);
                    console.log(settingsModel.getProperty("/RoleName"));
                    settingsModel.setProperty("/EmployeeName", employeeNamesArray[employeeIndex].Displayname);

                    //Set the selected feedback to be displayed on the review details screen.
                    feedbackModel.setProperty("/ReviewDetails/", selectedReview);

                    //Filters for Feedback ID and ReviewState, used by the tiles from AnalyticsDisplay.fragment
                    var aFilter = [];
                    var createdFilterforID = new Filter({
                        path: "FeedbackID",
                        operator: FilterOperator.EQ,
                        value1: feedbackModel.getProperty("/ReviewDetails").FeedbackID
                    });
                    aFilter.push(createdFilterforID);
                    //
                    var createdFilterforState = new Filter({
                        path: "ReviewState",
                        operator: FilterOperator.EQ,
                        value1: 'Completed'
                    });
                    aFilter.push(createdFilterforState);

                    //Read Filtered Reviews from backend
                    this.getView().getModel("oDataFeedback").read("/IndividualReviews", {
                        filters: aFilter,
                        success: function (oData, oResponse) {
                            var oDataResults = oData.results;
                            feedbackModel.setProperty("/ReviewStorage", oDataResults);
                            console.log(feedbackModel.getProperty("/ReviewStorage"));
                            oRouter.navTo("ReviewDetail");
                        }
                    });

                    //Grab Goals and set it to Goals
                    this.loadFromBackend("/Goals", feedbackModel, "Goals");

                    //Review has been selected
                } else if (selectedKey === 'Reviews') {

                    //Setting values for the T180 header
                    employeeIndex = employeeNamesArray.findIndex((Employee) => Employee.Displayname == selectedReview.EmployeeName);
                    reviewerIndex = employeeNamesArray.findIndex((Employee) => Employee.Displayname == selectedReview.ReviewerName);
                    console.log(employeeNamesArray[employeeIndex]);
                    settingsModel.setProperty("/EmployeeName", employeeNamesArray[employeeIndex].Displayname);
                    settingsModel.setProperty("/ReviewerName", employeeNamesArray[reviewerIndex].Displayname);

                    //Set the selected review to review details to be displayed on screen.
                    feedbackModel.setProperty("/ReviewDetails/", selectedReview);

                    // Call the DB and set the Specific Feedback to the Model ("/FeedbackRoleDescriptor") 
                    // so it can bind to associated Review (ID) when user clicks on each one
                    //FeedbackAppUtilityFile.readFeedBackToReview(this, selectedReview);
                    settingsModel.setProperty("/EmployeeName", employeeNamesArray[employeeIndex].Displayname);
                    //
                    //Route to the ReviewDetail view
                    oRouter.navTo("ReviewDetail");

                    //User has selected an Employee
                } else if (selectedKey === 'PDplans') {
                    settingsModel.setProperty("/EmployeeSelected", true);
                    //Route to the ReviewDetail view
                    oRouter.navTo("PDPlanDetails");
                    // Load the Notes into the Front-End Model

                }
            },

            // On Click Event when user selects an Employee from the List under the Grow Conversations Tab
            onSelectEmployee: function (oEvent) {

                var selectedEmployee = oEvent.getSource().getBindingContext("EmployeeNamesModel").getObject();

                this.getView().getModel("SettingsModel").setProperty("/EmployeeName", selectedEmployee.Displayname);
                this.getView().getModel("SettingsModel").setProperty("/RoleName", selectedEmployee.Jobtitle);
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

                oRouter.navTo("PDPlanDetails");


            },

            //Used by ReviewList.fragment
            //When the datepicker or dropdown box is changed, then update the value
            //Function is called when RE-ASSIGNMENT of review to different FB-ID is set in dropdown
            onNameOrDateChange: function (oEvent) {
                var selectedKey = this.getView().getModel("SettingsModel").getProperty("/ReviewsListSelectedKey");
                var selectedItem = oEvent.getSource().getBindingContext("FeedbackModel").getObject();
                var feedbackModel = this.getView().getModel("FeedbackModel");
                var feedbackArray = feedbackModel.getProperty("/Feedback");
                var entitySet, entityID, itemPath;

                //A feedback element has been changed
                if (selectedKey === "Feedback") {
                    entitySet = "Feedback";
                    entityID = "Feedback";
                    itemPath = selectedItem.FeedbackID;
                    selectedItem.ReviewerName = "Admin";
                    selectedItem = FeedbackAppUtilityFile.stringifyScores(this, selectedItem);

                } else {
                    entitySet = "Reviews";
                    entityID = "Review";
                    itemPath = selectedItem.ReviewID;
                    selectedItem.FeedbackID = parseInt(oEvent.getSource().getBindingContext("FeedbackModel").getObject().FeedbackID);

                    //update reviewer name based on feedback name changes
                    for (var i = 0; i < feedbackArray.length; i++) {
                        if (feedbackArray[i].FeedbackID === selectedItem.FeedbackID) {
                            selectedItem.EmployeeName = feedbackArray[i].EmployeeName;
                        }
                    }
                }
                this.getView().getModel("oDataFeedback").update("/" + entitySet + "(" + entityID + "ID=" + itemPath + ")",
                    selectedItem, {
                        success: function (data, oResponse) {
                            MessageToast.show("Change Successful!");
                        },
                        error: function (error) {
                            MessageToast.show("Error trying to update!");
                        }
                    });
            },

            // Goal/Grow onClick Events from the GoalSetting.fragment View -----------------------------------------------------------------------

            // Admin or User wants to edit Goal in the GridList display, 
            // enable the Controls and populate the Fields
            onGoalEdit: function (oEvent) {
                // Enable the Form from onClick Event
                this.getView().getModel("SettingsModel").setProperty("/EnableGoalForm", true);
                var selectedGoal = oEvent.getSource().getBindingContext("FeedbackModel").getObject();
                this.getView().getModel("FeedbackModel").setProperty("/Goal", selectedGoal);
            },

            // Admin or User wants to save a new goal or an updated goal
            onGoalSave: function (oEvent) {
                // Write to DB
                FeedbackAppUtilityFile.updateGoal(this);
                // Reset the Form and Disable Fields
                this.getView().getModel("SettingsModel").setProperty("/EnableGoalForm", false);
                this.getView().getModel("FeedbackModel").setProperty("/Goal", models.createGoalTemplate());
            },

            // Closes off the Form Fields in GROW goals by setting the EnableGoalForm boolean
            onGoalCancel: function (oEvent) {
                this.getView().getModel("SettingsModel").setProperty("/EnableGoalForm", false);
                this.getView().getModel("FeedbackModel").setProperty("/Goal", models.createGoalTemplate());
            },

            // Buttons will stay locked unless user begins adjusting controls
            // Triggers this function to enable the save/cancel Buttons otherwise it is set to false
            onGoalEnableButtons: function (oEvent) {
                this.getView().getModel("SettingsModel").setProperty("/IsEditingGoal", true);
            }

        });
    });