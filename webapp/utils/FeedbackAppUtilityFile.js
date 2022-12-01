sap.ui.define([
    "sap/viz/ui5/controls/common/feeds/FeedItem",
    "sap/ui/model/json/JSONModel",
    "sap/viz/ui5/data/FlattenedDataset",
    "feedbackapp/feedbackapp/model/models",
    "sap/ui/core/format/DateFormat",
    "sap/ui/core/Item",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/m/Dialog",
    "sap/m/Text",
    "sap/m/TextArea",
    "sap/m/Label",
    "sap/m/Button",
    "sap/m/library",
    "sap/m/Select",
    "sap/ui/core/Fragment",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"

], function (FeedItem, JSONModel, FlattenedDataset, models, DateFormat, Item, MessageToast, MessageBox, Dialog, Text, TextArea, Label,
    Button,
    mobileLibrary, Select, Fragment, Filter, FilterOperator) {
    "use strict";

    return {
        //Utility file for ReviewDetail.controller

        // Radar Chart VizFrame Functions --------------------------------------------------------------------------------------

        createDataSets: function (viz, oController) {

            //Template dataSet to reset the vizframe dataset to empty.
            var blankDataSet = models.vizFrameDataSetTemplate();
            oController.getView().getModel("vizFrameModel").setProperty("/dataSet", blankDataSet.dataSet);

            // 2 Arrays with different structure, VizFrame needs rawData but in different format
            var rawData = oController.getView().getModel("FeedbackModel").getProperty("/ReviewStorage");
            var vizData = oController.getView().getModel("vizFrameModel").getProperty("/dataSet");

            var updatedVizData = [];
            var growReviewDataObj = "";
            // Function to create new reviews by ID and corresponding score
            var growReviewDataObj = (obj, key, value) => {
                obj[key] = value
            };

            // Object Variables for Each Attribute
            var intObj = vizData[0];
            var comObj = vizData[1];
            var docObj = vizData[2];
            var busObj = vizData[3];
            var stkObj = vizData[4];
            var usrObj = vizData[5];
            var facObj = vizData[6];
            var solObj = vizData[7];
            var visObj = vizData[8];
            var tecObj = vizData[9];

            // Call growReviewDataObj function on all the atributes to set the name of the measure object, these have to be set dynamically. 
            // Each measure Object represents an attribute, in each attribute there must be variance in object properties with corresponding scores
            // The names in the Measure Objects {Attribute: Intuition, reviewID-1: 4, reviewID-2: 3.5} that are passed into VizFrame then needs 
            // identical names passed into the FeedItem - Feeds. EG; values="reviewID-1,reviewID-2"
            for (var rawDataCount = 0; rawDataCount < rawData.length; rawDataCount++) {

                growReviewDataObj(intObj, "reviewID-" + rawData[rawDataCount].ReviewID, rawData[rawDataCount].Intuition);
                growReviewDataObj(docObj, "reviewID-" + rawData[rawDataCount].ReviewID, rawData[rawDataCount].Documentation);
                growReviewDataObj(comObj, "reviewID-" + rawData[rawDataCount].ReviewID, rawData[rawDataCount].Communication);
                growReviewDataObj(busObj, "reviewID-" + rawData[rawDataCount].ReviewID, rawData[rawDataCount].BusinessKnowledge);
                growReviewDataObj(stkObj, "reviewID-" + rawData[rawDataCount].ReviewID, rawData[rawDataCount].StakeholderMGMT);
                growReviewDataObj(usrObj, "reviewID-" + rawData[rawDataCount].ReviewID, rawData[rawDataCount].UserRequirements);
                growReviewDataObj(facObj, "reviewID-" + rawData[rawDataCount].ReviewID, rawData[rawDataCount].Facilitation);
                growReviewDataObj(solObj, "reviewID-" + rawData[rawDataCount].ReviewID, rawData[rawDataCount].SolutionDesign);
                growReviewDataObj(visObj, "reviewID-" + rawData[rawDataCount].ReviewID, rawData[rawDataCount].Visibility);
                growReviewDataObj(tecObj, "reviewID-" + rawData[rawDataCount].ReviewID, rawData[rawDataCount].TechnicalSkills);
            };

            updatedVizData.push(intObj);
            updatedVizData.push(comObj);
            updatedVizData.push(docObj);
            updatedVizData.push(busObj);
            updatedVizData.push(stkObj);
            updatedVizData.push(usrObj);
            updatedVizData.push(facObj);
            updatedVizData.push(solObj);
            updatedVizData.push(visObj);
            updatedVizData.push(tecObj);

            oController.getView().getModel("vizFrameModel").setProperty("/dataSet", updatedVizData);
            this.setAveragesData(updatedVizData, oController);
        },

        // Used to loop over the Attribute Names when setting new Object Properties in other functions
        getAttributeNames: function (oController) {
            var dataNames = oController.getView().getModel("vizFrameModel").getProperty("/dataSet");
            console.log(dataNames);
            var attributeNamesArray = Object.keys(dataNames[0]);
            return attributeNamesArray;
        },

        // Averages will always be done separately to the review scores as Averages will be static, the amount of reviews will vary.
        // Ensure the correct Attribute names are matching from raw data to the vizDataNew
        setAveragesData: function (vizDataNew, oController) {
            var feedbackModel = oController.getView().getModel("FeedbackModel");
            var rawData = oController.getView().getModel("FeedbackModel").getProperty("/Feedback/" + (feedbackModel.getProperty(
                "/ReviewDetails/FeedbackID") - 1));
            //ReviewDetails to grab the id -1
            try {
                var rawDataKeys = Object.keys(rawData);
            } catch (err) {
                rawDataKeys = 0;
            }
            // Loop the data set up for VizFrame format (Averages are all set to 0)
            for (var count = 0; count < vizDataNew.length; count++) {
                // For Each one of the attribute Objects, need to then loop through the rawData to find attribute name match
                // If successful then extract the score and write it to the corresponding VizFrame formatted Objects
                for (var count2 = 0; count2 < rawDataKeys.length; count2++) {
                    if (rawDataKeys[count2] === vizDataNew[count].Attribute) {
                        var attribName = rawDataKeys[count2];
                        vizDataNew[count].Averages = rawData[attribName];
                        break;
                    }
                }
            };
            oController.getView().getModel("vizFrameModel").setProperty("/dataSet", vizDataNew);
        },

        // The measure Objects need to be updated dynamically. The update dataset is about getting the scores, update measures is about setting up the names
        // and lets vizFrame know how many sets are being fed into the chart. It basically gives VizFrame the structure it needs, but not the values/data.
        updateMeasures: function (oController) {
            // Copy current data measures, this will then be updated after the for loop
            var dataMeasures = oController.getView().getModel("vizFrameModel").getProperty("/measures");
            // Only need 1 dataset to get the 'names' not the values, use Object.keys(), loop through them and assign the name: ' ' and value: { }
            // Should output - {name: ReviewID-1, value: {ReviewID-1}} Values are not needed for this, that is done in the createDataSets function
            var nameArray = this.getAttributeNames(oController);
            for (var i = 0; i < nameArray.length; i++) {
                var measureObj = {
                    name: nameArray[i],
                    value: "{" + nameArray[i] + "}"
                };
                // Push all of these new measure objects back to the model, this then gets referenced in the setVizFrameRadar function
                dataMeasures.push(measureObj);
                oController.getView().getModel("vizFrameModel").setProperty("/measures", dataMeasures);
            }
        },

        // This function is for the FeedItems which is an Aggregation of VizFrame. VizFrame needs to
        // Know how many sets of data will be 'fed' into the Chart
        // Once the Feeds are set they get assigned to VizFrame through the .addFeed() function
        setFeeds: function (vizControlElement, oController) {
            // Refresh feeds
            vizControlElement.removeAllFeeds();

            // All feeds for chart 
            var staticArr = oController.getView().getModel("vizFrameModel").getProperty("/dataSet");
            var nameArr = Object.keys(staticArr[0]);

            // Adding the feeds to the the Chart, these will vary and update dynamically by checking the length of the array
            var d = 1; // First X feeds added are dimensions
            for (var k = 0; k < nameArr.length; k++) {
                vizControlElement.addFeed(new FeedItem({
                    uid: k < d ? "categoryAxis" : "valueAxis",
                    type: k < d ? "Dimension" : "Measure",
                    values: [nameArr[k]]
                }));
            }
        },

        // Sets up the structure and puts all the data, feeds and measures/dimensions together in the vizFrame Control in XML View
        // This exectues once all previous functions are complete
        setChart: function (vizControlElement, oController) {
            // Initialize and set the charts data model
            vizControlElement.setModel(new JSONModel({
                data: oController.getView().getModel("vizFrameModel").getProperty("/dataSet")
            }));

            // Set chart config
            vizControlElement.setUiConfig(oController.getView().getModel("vizFrameModel").getProperty("/uiConfig"));

            // Generate and set chart flattended data set component
            vizControlElement.setDataset(new FlattenedDataset({
                dimensions: oController.getView().getModel("vizFrameModel").getProperty("/dimensions"),
                measures: oController.getView().getModel("vizFrameModel").getProperty("/measures"),
                data: "{/data}"
            }));
        },

        // Review/Feedback Functions --------------------------------------------------------------------------------------
        //Compare Function to sort the employee names array into alphabetical order to fields to the first entry in a select drop down.
        alphabeticalCompare: function (a, b) {
            let comparison = 0;
            if (a.name > b.name) {
                comparison = 1;
            } else if (a.name < b.name) {
                comparison = -1;
            }
            return comparison;
        },

        //Used by main.controller.js
        //Creates a dialog that allows creation of new feedback entry/review/Goal/Action Item
        //And sets the templates
        createNewEntryAndDialog: function (oEvent, oController) {
            var selectedKey = oController.getView().getModel("SettingsModel").getProperty("/ReviewsListSelectedKey");
            var feedbackModel = oController.getView().getModel("FeedbackModel");
            var feedbackArray = feedbackModel.getProperty("/Feedback");
            var employeeNamesArray = oController.getView().getModel("EmployeeNamesModel").getProperty("/Employee");
            employeeNamesArray.sort(this.alphabeticalCompare);
            var pdplanModel = oController.getView().getModel("PDPlanModel");
            var newEntry;
            //A Dev Item or action item is being created
            //Set the templates to new Item
            if (selectedKey === 'PDdevItems' || selectedKey === 'Action') {
                var parentItem = pdplanModel.getProperty("/CurrentPDPlan");
                if (selectedKey === 'PDdevItems') {
                    newEntry = models.createDevItemTemplate();
                } else {
                    newEntry = models.createGoalTemplate();
                    newEntry.DevItemID = (oEvent.getSource().getBindingContext("PDPlanModel").getObject()).DevItemID;
                }
                newEntry.PDplanID = parentItem.PDplanID;
                newEntry.DateCreated = DateFormat.getDateInstance({
                    pattern: "yyyyMMdd"
                }).format(new Date());
                pdplanModel.setProperty("/NewItem", newEntry);

                //A Feedback Report or Review is being created
            } else if (selectedKey === 'Feedback') {
                //Set the feedback template
                newEntry = models.createFeedbackTemplate();

                //Set the defaults
                newEntry.EmployeeName = employeeNamesArray[0].Displayname;
                newEntry.ManagerName = employeeNamesArray[0].Displayname;
                newEntry.ReviewerName = 'Admin';
                newEntry.DateCreated = DateFormat.getDateInstance({
                    pattern: "yyyyMMdd"
                }).format(new Date());

                feedbackModel.setProperty("/NewReview", newEntry);
            } else if (selectedKey === 'Reviews') {
                //Set the review template
                newEntry = models.createIndividualReviewTemplate();
                newEntry.ManagerName = employeeNamesArray[0].Displayname;
                newEntry.EmployeeName = employeeNamesArray[0].Displayname;
                newEntry.ReviewerName = employeeNamesArray[0].Displayname;
                if (feedbackArray.length > 0) {
                    newEntry.FeedbackID = feedbackArray[feedbackArray.length - 1].FeedbackID;
                    newEntry.DateCreated = DateFormat.getDateInstance({
                        pattern: "yyyyMMdd"
                    }).format(new Date());
                    feedbackModel.setProperty("/NewReview", newEntry);
                }

            }
            // create dialog, and check Base Controller for onDialogButtonsCreateItems for actual item creation.
            if (!oController.pDialog) {
                oController.pDialog = oController.loadFragment({
                    name: "feedbackapp.feedbackapp.view.fragments.CreateNewEntry",
                });
            }
            oController.pDialog.then(function (oDialog) {
                oDialog.open();
            });

        },

        //Used in Main.controller
        //Parse Floats into strings for backend database
        parseFloats: function (selectedReview) {

            selectedReview.Intuition = parseFloat(selectedReview.Intuition);
            selectedReview.Documentation = parseFloat(selectedReview.Documentation);
            selectedReview.Communication = parseFloat(selectedReview.Communication);
            selectedReview.BusinessKnowledge = parseFloat(selectedReview.BusinessKnowledge);
            selectedReview.StakeholderMGMT = parseFloat(selectedReview.StakeholderMGMT);
            selectedReview.UserRequirements = parseFloat(selectedReview.UserRequirements);
            selectedReview.Facilitation = parseFloat(selectedReview.Facilitation);
            selectedReview.SolutionDesign = parseFloat(selectedReview.SolutionDesign);
            selectedReview.Visibility = parseFloat(selectedReview.Visibility);
            selectedReview.TechnicalSkills = parseFloat(selectedReview.TechnicalSkills);
        },

        //Used in FeedbackAppUtilityFile.js 
        //Calculate the sum of individual review scores for extreme review score message box
        sumOfScores: function (currentReview) {
            var sumOfScores = 0;
            sumOfScores = sumOfScores + currentReview.Intuition;
            sumOfScores = sumOfScores + currentReview.Documentation;
            sumOfScores = sumOfScores + currentReview.Communication;
            sumOfScores = sumOfScores + currentReview.BusinessKnowledge;
            sumOfScores = sumOfScores + currentReview.StakeholderMGMT;
            sumOfScores = sumOfScores + currentReview.UserRequirements;
            sumOfScores = sumOfScores + currentReview.Facilitation;
            sumOfScores = sumOfScores + currentReview.SolutionDesign;
            sumOfScores = sumOfScores + currentReview.Visibility;
            sumOfScores = sumOfScores + currentReview.TechnicalSkills;

            return sumOfScores;
        },

        //Used by ReviewDetail.controller
        //Submit a review by updating the data of the currently selected review
        //or admin setting review back to pending.
        reviewStateChange: function (oController, action) {
            var feedbackModel = oController.getView().getModel("FeedbackModel");
            var oRouter = sap.ui.core.UIComponent.getRouterFor(oController);
            var userRole = oController.getView().getModel("SettingsModel").getProperty("/UserRole");
            var sumOfScores = 0;

            //Review is already in the array, and so just needs updating
            var currentReview = oController.getView().getModel("FeedbackModel").getProperty("/ReviewDetails");

            if (action === 'Completed') {
                currentReview.ReviewState = "Completed";
                currentReview.DateSubmitted = DateFormat.getDateInstance({
                    pattern: "yyyyMMdd"
                }).format(new Date());

            } else {
                if (action === 'Pending') {
                    currentReview.DateSubmitted = "";
                }
                currentReview.ReviewState = action;
            }

            sumOfScores = this.sumOfScores(currentReview);

            if ((sumOfScores <= 15 || sumOfScores >= 45) && userRole !== 'Admin') {
                MessageBox.warning(
                    "Extreme Reviews Scores Detected. Are You Sure? The admin knows who you are, and may or may not follow up on these scores.", {
                        actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                        title: "Extreme Review Scores",
                        onClose: function (oCloseAction) {
                            if (oCloseAction === MessageBox.Action.YES) {
                                oController.getView().getModel("oDataFeedback").update("/Reviews(ReviewID=" + currentReview.ReviewID + ")", currentReview, {
                                    success: function (data, oResponse) {
                                        //console.log("reviewStateChange Success!");
                                        //console.log("Review " + action);
                                        oController.loadFromBackend("/ReviewList", feedbackModel, 'Reviews');
                                    },
                                    error: function (error) {
                                        //console.log("Error! Trying to Submit Review");
                                        //console.log("Error! submit review");
                                    }
                                });
                            }
                        }.bind(this)
                    });
            } else {
                //Non Extreme review scores
                oController.getView().getModel("oDataFeedback").update("/Reviews(ReviewID=" + currentReview.ReviewID + ")", currentReview, {
                    success: function (data, oResponse) {
                        //console.log("reviewStateChange Success!");
                        //console.log("Review " + action);
                        oController.loadFromBackend("/ReviewList", feedbackModel, 'Reviews');
                        oRouter.navTo("Main");
                    },
                    error: function (error) {
                        //console.log("Error! Trying to Submit Review");
                        //console.log("Error! submit review");
                    }
                });
            }
        },

        // Load a Feedback set based on FeedbackID that is associated with a single review
        // Allows XML View for each review to display the Job Role Descriptors when user clicks on a selected Item
        readFeedBackToReview: function (oController, feedBack) {

            var settingsModel = oController.getView().getModel("SettingsModel");
            var path = "/Feedback(FeedbackID=" + feedBack.FeedbackID + ")";
            oController.getView().getModel("oDataFeedback").read(path, {
                success: function (data, oResponse) {
                    settingsModel.setProperty("/RoleAttributes", data);

                },
                error: function (error) {}
            });
        },

        // Delete a Feedback Entry and All its child entries from the DB when the 'x' icon is clicked on list in Main
        deleteFeedbackReport: function (oController, feedbackEntry) {
            var feedbackModel = oController.getView().getModel("FeedbackModel");

            feedbackEntry.ReviewState = "Archived";
            feedbackEntry.ReviewerName = "Admin";
            oController.getView().getModel("oDataFeedback").update("/Feedback(FeedbackID=" + feedbackEntry.FeedbackID +
                ")",
                feedbackEntry, {
                    success: function (data, oResponse) {
                        oController.loadFromBackend("/ReviewList", feedbackModel, 'Feedback');
                        //console.log("Feedback Entry Archived");
                    },
                    error: function (error) {
                        //console.log("Error occurred trying to archiving Feedback from DB");
                    },
                    refreshAfterChange: true
                });
        },

        deleteReviewSingular: function (oController, review) {
            var feedbackModel = oController.getView().getModel("FeedbackModel");
            var feedbackArray = feedbackModel.getProperty("/Feedback");
            var parentFeedback = this.getParentFeedback(oController, review);
            parentFeedback.ReviewerName = "";
            review.ReviewState = 'Archived';

            oController.getView().getModel("oDataFeedback").update("/Reviews(ReviewID=" + review.ReviewID + ")", review, {
                success: function (data, oResponse) {
                    parentFeedback.ReviewState = 'Pending';
                    oController.loadFromBackend("/ReviewList", feedbackModel, 'Reviews');
                    //console.log("Review Entry Archived");

                    //Update feedback ->pass through specific feedback entry
                    oController.getView().getModel("oDataFeedback").update("/Feedback(FeedbackID=" + review.FeedbackID + ")", parentFeedback, {
                        success: function (data, oResponse) {
                            //console.log('Feedback updated after review archived');
                        },
                        error: function (error) {
                            //console.log("Feedback could not be updated after review was deleted");
                        }
                    });
                },
                error: function (error) {
                    //console.log("Error occurred trying to delete Feedback from DB");
                },
                refreshAfterChange: true
            });
        },

        getParentFeedback: function (oController, review) {
            var feedbackModel = oController.getView().getModel("FeedbackModel");
            var feedbackArray = feedbackModel.getProperty("/Feedback");
            var parentFeedback;
            for (var i = 0; i < feedbackArray.length; i++) {
                if (feedbackArray[i].FeedbackID === review.FeedbackID) {
                    parentFeedback = feedbackArray[i];
                }
            };
            this.stringifyScores(this, parentFeedback);

            return parentFeedback;
        },

        // Goal Setting / Grow Functions ----------------------------------------------------------------------------

        //Used by GoalSetting.fragment
        //Called when user clicks 'onGoalAssignment' in Main
        //Create and set a new feedback summary
        createGoal: function (oController) {
            var feedbackModel = oController.getView().getModel("FeedbackModel");
            var feedbackLength = (feedbackModel.getProperty("/Goals").length) - 1;

            //Getting the Goals array from the model
            var goalsArray = feedbackModel.getProperty("/Goals");
            var newGoalEntry = models.createGoalTemplate();

            // Write to DB
            oController.getView().getModel("oDataFeedback").create("/Goals", newGoalEntry, {
                success: function (data, oResponse) {
                    //console.log("New Goal Created DB - Grow Conversation");
                    oController.loadFromBackend("/Goals", feedbackModel, 'Goals');
                },
                error: function (error) {
                    //console.log("Error Creating new Goal in DB");
                },
                refreshAfterChange: true
            });

        },

        // Submitting a goal by updating the data of the currently selected goal
        // Used by GoalSetting fragment in Main Controller, updates in DB
        updateGoal: function (oController) {
            var feedbackModel = oController.getView().getModel("FeedbackModel");
            // Goal already in Array, just needs updating
            var updatedGoal = feedbackModel.getProperty("/Goal");
            // Update to DB
            oController.getView().getModel("oDataFeedback").update("/Goals(GoalSettingID=" + updatedGoal.GoalSettingID + ")", updatedGoal, {
                success: function (data, oResponse) {
                    //console.log("Goal updated DB - Grow Conversation")
                    oController.loadFromBackend("/Goals", feedbackModel, 'Goals');
                },
                error: function (error) {
                    //console.log("Error for Goal update - Grow Conversation")
                }
            });
            this.loadNotes(oController);

        },

        // Submitting a goal by deleting the data of the currently selected goal
        // Used by GoalSetting fragment in Main Controller, deletes in DB
        deleteGoal: function (oController, goalDone) {
            var fbModel = oController.getView().getModel("FeedbackModel");
            oController.getView().getModel("oDataFeedback").remove("/Goals(" + goalDone.GoalSettingID + ")", {
                success: function (data, oResponse) {
                    oController.loadFromBackend("/Goals", fbModel, 'Goals');
                    //console.log("Goal Removed from DB");
                },
                error: function (error) {
                    //console.log("Goal could not be removed from DB, Error occurred");
                },
                refreshAfterChange: true
            });
            this.loadNotes(oController);
        },

        // Other Functions ------------------------------------------------------------------------------------

        //Used in Main.controller
        //Parse Floats into strings for backend database
        parseFloats: function (selectedReview) {

            selectedReview.Intuition = parseFloat(selectedReview.Intuition);
            selectedReview.Documentation = parseFloat(selectedReview.Documentation);
            selectedReview.Communication = parseFloat(selectedReview.Communication);
            selectedReview.BusinessKnowledge = parseFloat(selectedReview.BusinessKnowledge);
            selectedReview.StakeholderMGMT = parseFloat(selectedReview.StakeholderMGMT);
            selectedReview.UserRequirements = parseFloat(selectedReview.UserRequirements);
            selectedReview.Facilitation = parseFloat(selectedReview.Facilitation);
            selectedReview.SolutionDesign = parseFloat(selectedReview.SolutionDesign);
            selectedReview.Visibility = parseFloat(selectedReview.Visibility);
            selectedReview.TechnicalSkills = parseFloat(selectedReview.TechnicalSkills);
        },
        //Formats the Review Scores so DB accepts score values
        stringifyScores: function (controller, feedBackObject) {

            feedBackObject.Intuition = (feedBackObject.Intuition).toString();
            feedBackObject.Documentation = (feedBackObject.Documentation).toString();
            feedBackObject.Communication = (feedBackObject.Communication).toString();
            feedBackObject.BusinessKnowledge = (feedBackObject.BusinessKnowledge).toString();
            feedBackObject.StakeholderMGMT = (feedBackObject.StakeholderMGMT).toString();
            feedBackObject.UserRequirements = (feedBackObject.UserRequirements).toString();
            feedBackObject.Facilitation = (feedBackObject.Facilitation).toString();
            feedBackObject.SolutionDesign = (feedBackObject.SolutionDesign).toString();
            feedBackObject.Visibility = (feedBackObject.Visibility).toString();
            feedBackObject.TechnicalSkills = (feedBackObject.TechnicalSkills).toString();
            return feedBackObject;
        },

        // Collect Staff List from the Org structure CDS View, set to EmployeeNamesModel
        getMSGraphEmployees: function (oController) {
            var employeeNamesModel = oController.getView().getModel("EmployeeNamesModel");

            var filters = [];
            var query = oController.getView().getModel("SettingsModel").getProperty("/MasterSearchQuery");

            if (query && query.length > 0) {
                filters.push(new Filter({
                    filters: [
                        new Filter("Displayname", FilterOperator.Contains, query),
                        new Filter("Manager", FilterOperator.Contains, query),
                    ],
                    and: false
                }));
            }
            var oGlobalBusyDialog = new sap.m.BusyDialog();
            oGlobalBusyDialog.open();
            oController.getView().getModel("oDataFeedback").read("/ManagerDirectReports", {
                filters: filters,
                success: function (oData, oResponse) {
                    ////console.log("Employee Names Model Set");
                    employeeNamesModel.setProperty("/Employee", oData.results);
                    oGlobalBusyDialog.close();
                    ////console.log(employeeNamesModel.getProperty("/Employee"));
                },
                error: function (error) {
                    //console.log("Did not Read from MSGraph to set Employee Model");
                    ////console.log(error);
                }
            });
        },


        // Create Note Entry in DB for PD Action Plan - Notes saved against Action Items, attached to Development Items
        createNote: function (oController) {

            var model = oController.getView().getModel("PDPlanModel");
            var parentPDplan = model.getProperty("/CurrentPDPlan");
            var employeeNamesArray = oController.getView().getModel("EmployeeNamesModel").getProperty("/Employee");
            var defaultActionItem = model.getProperty("/ChooseActionList/0/ActionItemName");

            employeeNamesArray.sort(this.alphabeticalCompare);
            var todayDate = DateFormat.getDateInstance({
                pattern: "yyyyMMdd"
            }).format(new Date());
            model.setProperty("/NewNote/NoteDate", todayDate);

            // Write to DB
            var newNote = model.getProperty("/NewNote");
            // Check the ChooseActionList has only 1 entry
            if (newNote.ActionItem === "") {
                newNote.ActionItem = defaultActionItem;
            };
            newNote.GoalSettingID = parseInt(newNote.GoalSettingID);
            newNote.DevItemID = parseInt(newNote.DevItemID);
            newNote.PDplanID = parentPDplan.PDplanID;
            newNote.EmployeeID = employeeNamesArray[0].Displayname;


            //console.log(newNote);
            var that = this;
            oController.getView().getModel("oDataFeedback").create("/PDNotes", newNote, {
                success: function (data, oResponse) {
                    //console.log("New Note Saved against the Action Item Goal");
                    that.loadNotes(oController);

                },
                error: function (error) {
                    //console.log("Error Creating new Note in DB");
                    //console.log("error creating new note")
                },
                refreshAfterChange: true
            });

        },

        // Load PD Plan Notes from backend
        loadNotes: function (oController) {
            var model = oController.getView().getModel("PDPlanModel");
            var selectedPDP = model.getProperty("/CurrentPDPlan");
            oController.getPDPlanFromBackend("/DevelopmentItemsList", "PDplans(PDplanID=" + selectedPDP.PDplanID + ")",
                "to_DevItem/to_goals,to_DevItem/to_notes");
        },

        // Delete Note from DB
        deleteNote: function (oController, note) {
            var model = oController.getView().getModel("PDPlanModel");
            oController.getView().getModel("oDataFeedback").remove("/PDNotes(" + note.NoteID + ")", {
                success: function (data, oResponse) {
                    //console.log("PD Note Deleted and Feed Updated");
                },
                error: function (error) {
                    //console.log("Error Deleting PD Notes from DB");
                },
                refreshAfterChange: true
            });
            this.loadNotes(oController);
        },

        setPDPlanStaffNames: function (oController) {
            var namesList = [];
            var model = oController.getView().getModel("PDPlanModel");
            ////console.log("Staff Names Set");
        },

        //Strip away the association sets generated from url parameters before updating the selected item
        removeAssociationSets: function (selectedItem) {
            if (Object.hasOwn(selectedItem, "to_goals") === true) {
                delete selectedItem.to_goals;
            };
            if (Object.hasOwn(selectedItem, "to_notes") === true) {
                delete selectedItem.to_notes;
            }
            if (Object.hasOwn(selectedItem, "to_pdplans") === true) {
                delete selectedItem.to_pdplans;
            }
            if (Object.hasOwn(selectedItem, "to_DevItem") === true) {
                delete selectedItem.to_DevItem;
            }
        },

        //Update the selected item.
        updateEntitySet: function (oController, entitySet, entityID, itemPath, selectedItem) {

            this.removeAssociationSets(selectedItem);
            oController.getView().getModel("oDataFeedback").update("/" + entitySet + "(" + entityID + "=" + itemPath + ")",
                selectedItem, {
                    success: function (data, oResponse) {

                        //A PD plan was updated, refresh the list
                        if (entitySet === "PDplans") {
                            oController.getPDPlanFromBackend("/PDplansList", "PDplans", null);
                            oController.getView().getModel("PDPlanModel").setProperty("/CurrentPDPlan", models.createPDPlanTemplate());
                            oController.getView().getModel("PDPlanModel").setProperty("/DevelopmentItemsList", "");

                            //A Dev Item was updated, refresh the list
                        } else if (entitySet === "DevelopmentItemsList") {
                            debugger
                            oController.getPDPlanFromBackend("/DevelopmentItemsList", "PDplans(PDplanID=" + parentPDplan.PDplanID +
                                ")",
                                "to_DevItem/to_goals,to_DevItem/to_notes");

                            // Note was updatedm refresh the list
                        } else if (entitySet === "PDnotes") {
                            oController.loadNotes(oController);
                        }
                        MessageToast.show("Update Successful!");
                    },
                    error: function (error) {
                        //console.log("error trying to update");
                    }
                });
        },

        // Call MSGraph API using client
        callStaffMSGraph: function () {
            var {
                Client
            } = require("@microsoft/microsoft-graph-client");
            var {
                TokenCredentialAuthenticationProvider
            } = require("@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials");
            var {
                DeviceCodeCredential
            } = require("@azure/identity");

            var credential = new DeviceCodeCredential(tenantId, clientId, clientSecret);
            var authProvider = new TokenCredentialAuthenticationProvider(credential, {
                scopes: [scopes]
            });

            var client = Client.initWithMiddleware({
                debugLogging: true,
                authProvider
                // Use the authProvider object to create the class.
            });
        }
    };
});