sap.ui.define([
    "feedbackapp/feedbackapp/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "feedbackapp/feedbackapp/model/models",
    "sap/m/MessageToast",
    "feedbackapp/feedbackapp/utils/FeedbackAppUtilityFile",
    "sap/ui/core/format/DateFormat"

], function (Controller, JSONModel, models, MessageToast, FeedbackAppUtilityFile, DateFormat) {
    "use strict";

    return Controller.extend("feedbackapp.feedbackapp.controller.PDPlanDetails", {

        onAfterRendering: function () {
            //Pull the required devItems and Action items
            this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            this._oRouter.getRoute("PDPlanDetails").attachMatched(this.handleRouteMatched, this);
        },

        //Route matched to run this code everytime the view is visited
        handleRouteMatched: function (oEvent) {

            var settingsModel = this.getView().getModel("SettingsModel");
            var selectedKey = settingsModel.getProperty("/ReviewsListSelectedKey");
            var pdplanModel = this.getView().getModel("PDPlanModel");
            if (selectedKey === "PDplans") {
                settingsModel.setProperty("/EmployeeSelected", true);
            }
        },

        //'E-Sign' Checkboxes
        onCheckBoxSelected: function (oEvent, buttonText) {
            var pdplanModel = this.getView().getModel("PDPlanModel");
            var currentPDPlan = pdplanModel.getProperty("/CurrentPDPlan");
            var selected = oEvent.getParameter("selected");

            //Checkbox selected, check who selected and update
            if (selected === true) {
                if (buttonText === "MANAGER") {
                    currentPDPlan.ManagerAcceptDate = DateFormat.getDateInstance({
                        pattern: "yyyyMMdd"
                    }).format(new Date());
                    currentPDPlan.ManagerAccept = String(selected);
                } else if (buttonText === "EMPLOYEE") {
                    currentPDPlan.EmployeeAccept = String(selected);
                    currentPDPlan.EmployeeAcceptDate = DateFormat.getDateInstance({
                        pattern: "yyyyMMdd"
                    }).format(new Date());
                }
            } else {
                if (buttonText === "MANAGER") {
                    currentPDPlan.ManagerAcceptDate = "";
                    currentPDPlan.ManagerAccept = String(selected);

                } else if (buttonText === "EMPLOYEE") {
                    currentPDPlan.EmployeeAcceptDate = "";
                    currentPDPlan.EmployeeAccept = String(selected);
                }
            }
        },

        //Admin Creates PD plan
        //Creates a blank entry into the database and should display it on the PD list
        onCreatePDPlan: function (oEvent, buttonText) {
            var settingsModel = this.getView().getModel("SettingsModel");
            var newPDplan = models.createPDPlanTemplate();

            //Set the default Values for Names
            var employeeNamesArray = this.getView().getModel("EmployeeNamesModel").getProperty("/Employee");
            employeeNamesArray.sort(FeedbackAppUtilityFile.alphabeticalCompare);
            newPDplan.EmployeeName = settingsModel.getProperty("/EmployeeName");
            newPDplan.ManagerName = employeeNamesArray[0].Displayname;
            var that = this;
            this.getView().getModel("oDataFeedback").create("/PDplans", newPDplan, {
                success: function (data, oResponse) {
                    console.log("Performance Development Plan Created");
                    that.getPDPlanFromBackend("FilterOutArchived", "/PDplansList", "PDplans", null);
                   
                },
                error: function (error) {
                    console.log("Error Creating PD Plan");
                },
                refreshAfterChange: true
            });
            settingsModel.setProperty("/UpdatePDplan", false);
        },

        // Admin User wants to create new Goal in the GridList display and write to DB for user to edit later
        onGoalCreate: function () {
            // Write Blank Goal to DB
            var pdplanModel = this.getView().getModel("PDPlanModel");
            var devItemArray = pdplanModel.getProperty("/DevelopmentItemsList");
            var newDevItem = models.createDevItemTemplate();
            devItemArray.push(newDevItem);
            pdplanModel.setProperty("/DevelopmentItemsList", devItemArray);
        },

        //Determines which Development Type is being created
        //Set the selectedKey for expression binding purposes on the dialog.
        onCreateDevItem: function (oEvent, buttonText) {

            var settingsModel = this.getView().getModel("SettingsModel");
            var selectedItem = (oEvent.getSource().getBindingContext("PDPlanModel").getObject());
            settingsModel.setProperty("/ReviewsListSelectedKey", buttonText);
            FeedbackAppUtilityFile.createNewEntryAndDialog(oEvent, this);
        },

        //Admin wants to either create a PD plan or update an existing PD plan
        onPDplanDecision: function (oEvent) {
            var currentPDplan = this.getView().getModel("PDPlanModel").getProperty("/CurrentPDPlan");
            var areWeUpdatingPDplan = this.getView().getModel("SettingsModel").getProperty("/UpdatePDplan");

            // Date Stamp the Current Plan each time for the 'LASTREVIEWDATE' Column
            currentPDplan.LastReviewDate = DateFormat.getDateInstance({
                pattern: "yyyyMMdd"
            }).format(new Date());

            // Set the Managers Name and Employees Name, use Base Controller Function
            //currentPDplan.Manager = this.searchStaffNames(currentPDplan.ManagerID, "id");
            //currentPDplan.Name = this.searchStaffNames(currentPDplan.EmployeeID, "id");

            //Admin intends to update the currently selected PD plan
            if (areWeUpdatingPDplan === true) {

                //check if both 'E-Signatures' are completed, then set the PD plan to completed
                if (currentPDplan.EmployeeAccept === "true" && currentPDplan.ManagerAccept === "true") {
                    currentPDplan.Status = "Completed";
                } else {
                    currentPDplan.Status = "Pending";
                }

                FeedbackAppUtilityFile.updateEntitySet(this, "PDplans", "PDplanID", currentPDplan.PDplanID, currentPDplan);

                //User wants to create the currently selected PD plan
            } else if (areWeUpdatingPDplan === false) {
                console.log(currentPDplan);
                this.getView().getModel("oDataFeedback").create("/PDplans", currentPDplan, {
                    success: function (data, oResponse) {
                        console.log("Performance Development Plan Created");
                    },
                    error: function (error) {
                        console.log("Error Creating PD Plan");
                    },
                    refreshAfterChange: true
                });
            }
        },


        onDevItemOptions: function (oEvent, buttonText) {
            // Chosen Goal from GridList
            var pdplanModel = this.getView().getModel("PDPlanModel");
            var selectedGoal = oEvent.getSource().getBindingContext("PDPlanModel").getObject();
            var settingsModel = this.getView().getModel("SettingsModel");

            if ((buttonText === "COMPLETE" && selectedGoal.Status === "Pending") || buttonText === "ARCHIVE") {
                if (buttonText === "COMPLETE") {
                    selectedGoal.Status = "Completed";
                } else if (buttonText === "ARCHIVE") {
                    selectedGoal.Status = "Archived";
                }
                FeedbackAppUtilityFile.updateEntitySet(this, "PDdevItems", "DevItemID", selectedGoal.DevItemID, selectedGoal);
            } else if (buttonText === "EDIT_DEVITEM" || buttonText === "EDIT_ACTIONITEM") {
                if (buttonText === "EDIT_DEVITEM") {
                    settingsModel.setProperty("/ReviewsListSelectedKey", "PDdevItems");
                } else if (buttonText === "EDIT_ACTIONITEM") {
                    settingsModel.setProperty("/ReviewsListSelectedKey", "Action");
                }
                pdplanModel.setProperty("/NewItem", selectedGoal);
                settingsModel.setProperty("/ReviewsListSelectedKey", "PDdevItems");
                settingsModel.setProperty("/IsEditingGoal", true);
                //code to update the dev item
                // create dialog
                if (!this.pDialog) {
                    this.pDialog = this.loadFragment({
                        name: "feedbackapp.feedbackapp.view.fragments.CreateNewEntry"
                    });
                }
                this.pDialog.then(function (oDialog) {
                    oDialog.open();
                });
            }
        },

        //When user clicks on Show Current Goals or Show Archived toggle button
        onShowGoals: function (oEvent, buttonText) {
            var buttonState = oEvent.getSource().getPressed();
            var parentPDplan = this.getView().getModel("PDPlanModel").getProperty("/CurrentPDPlan");

            if (buttonState === true) {
                //	this.getView().getModel("SettingsModel").setProperty("/ShowArchived", false);
                //	this.getPDPlanItemsFromBackend("FilterOutArchived", "/CurrentPDPlan", "PDplans(PDplanID=" + parentPDplan.PDplanID + ")",
                //		"to_DevItem/to_goals/to_PDNotes");
            } else if (buttonState === false) {
                //	this.getView().getModel("SettingsModel").setProperty("/ShowArchived", true);
                //	this.getPDPlanItemsFromBackend("ShowArchived", "/CurrentPDPlan", "PDplans(PDplanID=" + parentPDplan.PDplanID + ")",
                //		"to_DevItem/to_goals/to_PDNotes");
            }
        },

        // Notes Section of PD Plan - Event Handlers, Save a new commented Note with reference to specific Action Item to DB, Feed List updates on Display
        onNotePost: function (oEvent) {
            var oView = this.getView();
            var pdplanModel = this.getView().getModel("PDPlanModel");
            var DevItem = oEvent.getSource().getBindingContext("PDPlanModel").getObject();
            var notePDPlan = pdplanModel.getProperty("/CurrentPDPlan");
            var newNote = models.createNoteTemplate();
            // Set New Note to the Default template

            // Set the PD Plan ID and the Employee ID to the Note
            newNote.PDplanID = DevItem.PDplanID;
            newNote.DevItemID = DevItem.DevItemID;
            newNote.EmployeeID = notePDPlan.EmployeeID;

            // Set the Action Items in the Current Dev Item to the dropdown list for assigning notes
            pdplanModel.setProperty("/ChooseActionList", DevItem.to_goals.results);
            pdplanModel.setProperty("/NewNote", newNote);

            // Check Dialog doesn't exist otherwise create new and open
            if (!this.newNoteDialog) {
                // Instantiate the Dialog Fragment
                //HERE should create a new function
                this.newNoteDialog = sap.ui.xmlfragment("feedbackapp.feedbackapp.view.fragments.NoteDialog", this);
                oView.addDependent(this.newNoteDialog);
                this.newNoteDialog.open();
            }
            this.newNoteDialog.open();
        },

        // Save Option in the Note Dialog Box
        onSaveNote: function (oEvent) {
            FeedbackAppUtilityFile.createNote(this);
            this.newNoteDialog.close();
        },

        // Cancel Option in the Note Dialog Box
        onNoteDialogCancel: function () {
            console.log("Note Creation Cancelled by User");
            this.newNoteDialog.close();
        },

        // Assign the Chosen Action Item to the Note for Display
        onActionChosen: function (oEvent) {
            var pdplanModel = this.getView().getModel("PDPlanModel");
            var newNote = pdplanModel.getProperty("/NewNote");
            var actionItem = oEvent.getSource().getBindingContext("PDPlanModel").getObject();
            var goalsList = this.getView().getModel("PDPlanModel").getProperty("/ChooseActionList");
            var chosenItem = goalsList.find(goal => goal.GoalSettingID == actionItem.GoalSettingID);
            newNote.ActionItem = chosenItem.ActionItemName;
            console.log(newNote);
        }
    });
});