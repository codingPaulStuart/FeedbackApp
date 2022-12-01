sap.ui.define([
        "sap/ui/model/json/JSONModel",
        "sap/ui/Device"
    ],
    /**
     * provide app-view type models (as in the first "V" in MVVC)
     * 
     * @param {typeof sap.ui.model.json.JSONModel} JSONModel
     * @param {typeof sap.ui.Device} Device
     * 
     * @returns {Function} createDeviceModel() for providing runtime info for the device the UI5 app is running on
     * --
     * Reviews will be in this format
                    Reviews[{
                        review1: feedbackID1,
                        review2: feedbackID2,
                        review3: feedbackID3
                    }],
     */
    function (JSONModel, Device) {
        "use strict";

        return {
            createDeviceModel: function () {
                var oModel = new JSONModel(Device);
                oModel.setDefaultBindingMode("OneWay");
                return oModel;
            },
            vizFrameDataSetTemplate: function () {
                return {
                    dataSet: [{
                        Attribute: "Intuition",
                        Averages: 0
                    }, {
                        Attribute: "Communication",
                        Averages: 0
                    }, {
                        Attribute: "Documentation",
                        Averages: 0
                    }, {
                        Attribute: "Business Knowledge",
                        Averages: 0
                    }, {
                        Attribute: "Stakeholder Management",
                        Averages: 0
                    }, {
                        Attribute: "User Requirements",
                        Averages: 0
                    }, {
                        Attribute: "Facilitation",
                        Averages: 0
                    }, {
                        Attribute: "Solution Design",
                        Averages: 0
                    }, {
                        Attribute: "Visibility",
                        Averages: 0
                    }, {
                        Attribute: "Technical Skills",
                        Averages: 0
                    }]
                };
            },

            createVizFrameModel: function () {
                return {
                    uiConfig: {
                        "applicationSet": "fiori"
                    },
                    dataSet: [{
                        Attribute: "Intuition",
                        Averages: 0
                    }, {
                        Attribute: "Communication",
                        Averages: 0
                    }, {
                        Attribute: "Documentation",
                        Averages: 0
                    }, {
                        Attribute: "BusinessKnowledge",
                        Averages: 0
                    }, {
                        Attribute: "StakeholderMGMT",
                        Averages: 0
                    }, {
                        Attribute: "UserRequirements",
                        Averages: 0
                    }, {
                        Attribute: "Facilitation",
                        Averages: 0
                    }, {
                        Attribute: "SolutionDesign",
                        Averages: 0
                    }, {
                        Attribute: "Visibility",
                        Averages: 0
                    }, {
                        Attribute: "TechnicalSkills",
                        Averages: 0
                    }],
                    dimensions: [{
                        // axis: 1,
                        name: "Attribute",
                        value: "{Attribute}"
                    }],
                    measures: [{
                        name: "Averages",
                        value: "{Averages}"
                    }],
                    data: {
                        path: "/data"
                    },
                    properties: {
                        feedingZone: {},
                        interaction: {
                            selectability: {}
                        },
                        plotArea: {
                            dataPoint: {
                                stroke: {
                                    color: "#ef5e37"
                                }
                            },
                            dataLabel: {
                                visible: false,
                                showTotal: true
                            },
                            drawingEffect: "normal",
                            colorPalette: ["#ef5e37"],
                            gridline: {
                                color: "#333333",
                                size: .3
                            },
                            line: {
                                visible: true,
                                width: 1
                            },
                            marker: {
                                shape: "circle",
                                size: 3,
                                visible: true
                            },
                            polarAxis: {
                                axisLine: {
                                    size: 0.3,
                                    visible: true
                                },
                                color: "#333333",
                                hoverShadow: {
                                    color: ""
                                },
                                label: {
                                    style: {
                                        color: "#333333",
                                        fontFamily: "'Open Sans', Arial, Helvetica, sans-serif",
                                        fontSize: "12px",
                                        fontStyle: "normal",
                                        fontWeight: "Bold"
                                    },
                                    visible: true
                                },
                                labelRenderer: null
                            },
                            primaryScale: {
                                autoMaxValue: 5,
                                autoMinValue: 1,
                                fixedRange: true,
                                maxValue: 5,
                                minValue: 1
                            },
                            seriesStyle: null,
                            valueAxis: {
                                label: {
                                    style: {
                                        color: "#bcbcbc",
                                        fontFamily: "'Open Sans', Arial, Helvetica, sans-serif ",
                                        fontSize: "12",
                                        fontStyle: "normal",
                                        fontWeight: "normal"
                                    },
                                    visible: true
                                }
                            }
                        },
                        propertyZone: {},
                        title: {
                            text: "Feedback",
                            style: {
                                color: "#ef5e37",
                                fontFamily: "'Open Sans', Arial, Helvetica, sans-serif ",
                                fontSize: "12px",
                                fontStyle: "normal",
                                fontWeight: "bold"
                            },
                            visible: false
                        },
                        tooltip: {},
                        legendGroup: {
                            layout: {
                                alignment: "center",
                                height: null,
                                maxHeight: 0.25,
                                maxWidth: 0.25,
                                width: "100px",
                                position: "bottom",
                                respectPlotPosition: false
                            }
                        },
                        legend: {
                            drawingEffect: "normal",
                            itemMargin: 1,
                            label: {
                                style: {
                                    color: "#000000",
                                    fontFamily: "'Open Sans', Arial, Helvetica, sans-serif",
                                    fontSize: "10px",
                                    fontStyle: "italic",
                                    fontWeight: "normal"
                                }
                            },
                            marker: {
                                size: "10px",
                                maxNumOfItems: 10
                            }
                        },
                        general: {
                            accDescription: null,
                            background: {},
                            groupData: false,
                            layout: {
                                isFixedPadding: false,
                                padding: 0,
                                paddingBottom: 50,
                                paddingLeft: 50,
                                paddingRight: 50,
                                paddingTop: 30
                            },
                            respectOrderInGroup: false,
                            tabIndex: 0
                        }
                    },
                    attributeNames: [
                        "Intuition",
                        "Documentation",
                        "Communication",
                        "BusinessKnowledge",
                        "StakeholderMGMT",
                        "UserRequirements",
                        "Facilitation",
                        "SolutionDesign",
                        "Visibility",
                        "TechnicalSkills"
                    ]
                };
            },

            createNewRoleTemplate: function () {
                return {
                    RoleID: 0,
                    RoleTitle: "",
                    IntuitionDefinition: "",
                    DocumentationDefinition: "",
                    CommunicationDefinition: "",
                    BusinessKnowledgeDefinition: "",
                    StakeholderMGMTDefinition: "",
                    UserRequirementsDefinition: "",
                    FacilitationDefinition: "",
                    SolutionDesignDefinition: "",
                    VisibilityDefinition: "",
                    TechnicalSkillsDefinition: ""
                };
            },

            Feedback: function () {
                return {
                    DetailScreen: {
                        EmployeeName: "",
                        Goals: []
                    },
                    Feedback: [],
                    NewReview: {},
                    DeleteReviewsFB: [],
                    EmployeeFilteredSelectList: [],
                    FeedbackRoleDescriptor: {},
                    FeedbackStorage: [],
                    ReviewDetails: [],
                    ReviewStorage: [],
                    ReviewList: [],
                    Reviews: [],
                    Goals: [],
                    GoalTypes: [{
                        Type: "Short Term (next 12-months)",
                        Icon: "sap-icon://goal"
                    }, {
                        Type: "Long Term (1-5 Years)",
                        Icon: "sap-icon://activity-assigned-to-goal"
                    }],
                    Goal: {
                        GoalSettingID: 0,
                        GoalName: "",
                        StaffGoalID: "",
                        GrowConvDate: "",
                        SetDate: "",
                        DueDate: "",
                        LengthType: "",
                        Completed: "false",
                        Description: "",
                        MeasuredBy: "",
                        Notes: "",
                        DaysRemaining: 0
                    },
                    ListItemDelete: {},
                    Roles: [{
                        id: "ADMIN",
                        name: "Finance & Administration"
                    }, {
                        id: "ARC GIS",
                        name: "Arc GIS"
                    }, {
                        id: "BA_CON",
                        name: "Business Analyst - Contractor"
                    }, {
                        id: "BA_EMP",
                        name: "Business Analyst - Employee"
                    }, {
                        id: "BASIS",
                        name: "Basis Consultant"
                    }, {
                        id: "BUS_DEV",
                        name: "Business Development"
                    }, {
                        id: "C4C",
                        name: "SAP CRM (C4C) "
                    }, {
                        id: "CONCUR",
                        name: "Concur"
                    }, {
                        id: "CS",
                        name: "Content Server"
                    }, {
                        id: "D_NAGLE",
                        name: "Portfolio Manager"
                    }, {
                        id: "EST_CON",
                        name: "Estimating Consultant - Employee"
                    }, {
                        id: "FULLSTACK",
                        name: "Full Stack Developer"
                    }, {
                        id: "FUNC",
                        name: "Functional Analyst"
                    }, {
                        id: "GRADDE",
                        name: "Graduate Developer"
                    }, {
                        id: "HANACOCKPIT",
                        name: "HANA Cockpit"
                    }, {
                        id: "IAS",
                        name: "Identity Authentication (IAS)"
                    }, {
                        id: "ISU",
                        name: "ISU"
                    }, {
                        id: "PC_DD",
                        name: "Project Controller"
                    }, {
                        id: "PM_CON",
                        name: "Project Manager - Contractor"
                    }, {
                        id: "PM_EMP",
                        name: "Project Manager - Employee"
                    }, {
                        id: "PM_S",
                        name: "Project Manager (Senior)"
                    }, {
                        id: "SAP_BA_S",
                        name: "SAP Business Analyst (Senior)"
                    }, {
                        id: "SAP_DEV",
                        name: "SAP Developer"
                    }, {
                        id: "SAP_DEV_S",
                        name: "SAP Developer (Senior)"
                    }, {
                        id: "SAP_FUN_FI_S",
                        name: "SAP Functional Analyst FI (Senior)"
                    }, {
                        id: "SAP_FUN_HR_S",
                        name: "SAP Functional Analyst HR (Senior)"
                    }, {
                        id: "SAP_FUN_PS_S",
                        name: "SAP Functional Analyst PS (Senior)"
                    }, {
                        id: "SAP_SOL_S",
                        name: "SAP Solution Architect (Senior)"
                    }, {
                        id: "SAPABAP",
                        name: "SAP ABAP - Adelaide"
                    }, {
                        id: "SAPABREMOTE",
                        name: "SAP ABAP - Remote"
                    }, {
                        id: "SAPADS",
                        name: "SAP Adobe Document Service (Java Stack)"
                    }, {
                        id: "SAPBASIS",
                        name: "SAP Basis"
                    }, {
                        id: "SAPBO",
                        name: "SAP Business Objects"
                    }, {
                        id: "SAPBPC",
                        name: "SAP BPC"
                    }, {
                        id: "SAPBW",
                        name: "SAP BW"
                    }, {
                        id: "SAPBWWH",
                        name: "SAP BW - hosting, S/4 conversion"
                    }, {
                        id: "SAPCC",
                        name: "SAP Cloud Connector"
                    }, {
                        id: "SAPCPI",
                        name: "SAP Cloud Platform Integration (CPI)"
                    }, {
                        id: "SAPDS",
                        name: "SAP Data Services"
                    }, {
                        id: "SAPEHO",
                        name: "SAP ERP Hosting"
                    }, {
                        id: "SAPEP",
                        name: "SAP External Portal"
                    }, {
                        id: "SAPERPHOSTING",
                        name: "SAPERPhosting"
                    }, {
                        id: "SAPERPS/4CONVERSION",
                        name: "SAPERPS/4 conversion"
                    }, {
                        id: "SAPERPS4",
                        name: "SAPERPS/4 conversion"
                    }, {
                        id: "SAPFICO",
                        name: "SAP FICO"
                    }, {
                        id: "SAPFIORI",
                        name: "SAP Fiori"
                    }, {
                        id: "SAPGRC",
                        name: "SAP Access Control (GRC)"
                    }, {
                        id: "SAPHANADM",
                        name: "SAP HANA DM (Agile Analytics)"
                    }, {
                        id: "SAPHR",
                        name: "SAP HR "
                    }, {
                        id: "SAPIS",
                        name: "SAP Information Steward"
                    }, {
                        id: "SAPLE",
                        name: "SAP LE"
                    }, {
                        id: "SAPMM",
                        name: "SAP MM"
                    }, {
                        id: "SAPMP/WM",
                        name: "SAP Mobile Platform / Work manager"
                    }, {
                        id: "SAPNW",
                        name: "SAP NW Gateway"
                    }, {
                        id: "SAPNWDI",
                        name: "SAP NWDI"
                    }, {
                        id: "SAPPA",
                        name: "SAP Predictive Analytics"
                    }, {
                        id: "SAPPM",
                        name: "SAP PM "
                    }, {
                        id: "SAPPO",
                        name: "SAP PO"
                    }, {
                        id: "SAPPS",
                        name: "SAP PS"
                    }, {
                        id: "SAPSD",
                        name: "SAP SD"
                    }, {
                        id: "SCO_CON",
                        name: "SAP Consultant - Contractor"
                    }, {
                        id: "SCO_DIR",
                        name: "SAP Consultant - Director"
                    }, {
                        id: "SCO_EMP",
                        name: "SAP Consultant - Employee"
                    }, {
                        id: "SDI",
                        name: "SDI Agents"
                    }, {
                        id: "SDM",
                        name: "ServiceDeliveryManager "
                    }, {
                        id: "SF",
                        name: "Success Factors"
                    }, {
                        id: "SFP",
                        name: "Success Factors Payroll Central"
                    }, {
                        id: "SM",
                        name: "Scrum Master"
                    }, {
                        id: "SNR_EST_CON",
                        name: "Senior Estimating Consultant - Employee"
                    }, {
                        id: "SNRCON",
                        name: "Snr Consultant Other"
                    }, {
                        id: "SOLMAN",
                        name: "Solution Manager"
                    }, {
                        id: "SUCCESS FACTORS",
                        name: "Success Factors Employee Central"
                    }, {
                        id: "TESTAN",
                        name: "Test Analyst"
                    }, {
                        id: "UX",
                        name: "UI/UX Engineer"
                    }, {
                        id: "WEBIDE",
                        name: "WEB IDE (CLOUD SUPPORT)"
                    }],
                    RolesKeyedIn: [],
                    RoleDefaults: {
                        RoleName: "",
                        RoleIntuition: "Is my work good enough?",
                        RoleDocumentation: "Accuracy, spelling, grammar?",
                        RoleCommunication: "Asking questions, listening?",
                        RoleBusinessKnowledge: "Understanding email requests, following procedures?",
                        RoleStakeholderMGMT: "Keeping others informed?",
                        RoleUserRequirements: "Understanding email requests, following procedures?",
                        RoleFacilitation: "Working with people to achieve a result?",
                        RoleSolutionDesign: "Understanding the requirement, output fit for purpose?",
                        RoleVisibility: "Performance Under Pressure?",
                        RoleTechnicalSkills: "Knowledge on systems, development?"
                    },
                    RoleTitle: "",
                    DisplayRoleBinder: {}
                };
            },

            Settings: function () {
                return {
                    UserRole: "User",
                    ReviewsListSelectedKey: "PDplans",
                    TileName: "",
                    TileArray: [],
                    EnableGoalForm: false,
                    IsEditingGoal: false,
                    MasterSearchQuery: "",
                    EmployeeName: "",
                    ReviewerName: "",
                    RoleName: "",
                    EmployeeFilteredSelectList: [{}],
                    RoleAttributes: {},
                    ShowArchived: false,
                    UpdatePDplan: true,
                    LastPDupdate: "",
                    LoggedInInfo: {}
                };
            },

            createDevItemTemplate: function () {
                return {
                    DevItemID: 0,
                    PDplanID: 0,
                    Need: "",
                    Strategy: "",
                    DateCreated: "",
                    LengthType: "Short Term (next 12-months)",
                    Status: "Pending"
                };
            },

            createNoteTemplate: function () {
                return {
                    NoteID: 0,
                    GoalSettingID: 0,
                    PDplanID: 0,
                    EmployeeID: "",
                    DevItemID: 0,
                    NoteDate: "",
                    Note: "",
                    ActionItem: ""
                };
            },

            createPDPlanTemplate: function () {
                return {
                    PDplanID: 0,
                    EmployeeID: "",
                    ManagerID: "",
                    EmployeeName: "",
                    ManagerName: "",
                    DateAgreed: "",
                    DateShortTerm: "",
                    DateLongTerm: "",
                    MainStrength: "",
                    EmployeeComment: "",
                    ManagerComment: "",
                    EmployeeAccept: "False",
                    EmployeeAcceptDate: "",
                    ManagerAccept: "False",
                    ManagerAcceptDate: "",
                    LastReviewDate: "",
                    Status: "Pending"
                };
            },
            PerformanceDevelopmentPlan: function () {
                return {
                    PDplansList: [],
                    CurrentPDPlan: {},
                    DevelopmentItemsList: [],
                    ActionItemsList: [],
                    NotesList: [],
                    NotesPDPlan: {},
                    NewItem: {},
                    Goals: [],
                    StaffNames: [],
                    TempStorage: [],
                    ArchivedDevelopmentItemsList: [],
                    ChooseActionList: []
                };
            },

            createGoalTemplate: function () {
                return {
                    GoalSettingID: 0,
                    DevItemID: 0,
                    PDplanID: 0,
                    ActionItemName: "",
                    EmployeeID: "",
                    DateCreated: "",
                    DateDue: "",
                    LengthType: "",
                    Completed: "Pending",
                    Description: ""
                };
            },

            createIndividualReviewTemplate: function () {
                return {
                    ReviewID: 0,
                    FeedbackID: 0,
                    ReviewState: "Pending",
                    DateCreated: new Date().toISOString(),
                    EmployeeName: "",
                    ReviewerName: "",
                    DateDue: "",
                    DateSubmitted: "",
                    Intuition: 1,
                    Documentation: 1,
                    Communication: 1,
                    BusinessKnowledge: 1,
                    StakeholderMGMT: 1,
                    UserRequirements: 1,
                    Facilitation: 1,
                    SolutionDesign: 1,
                    Visibility: 1,
                    TechnicalSkills: 1,
                    SummaryComment: "",
                    WhatWorkedWell: "",
                    Improvements: "",
                    ActionsToImprove: "",
                    RoleName: "",
                    RoleIntuition: "",
                    RoleDocumentation: "",
                    RoleCommunication: "",
                    RoleBusinessKnowledge: "",
                    RoleStakeholderMGMT: "",
                    RoleUserRequirements: "",
                    RoleFacilitation: "",
                    RoleSolutionDesign: "",
                    RoleVisibility: "",
                    RoleTechnicalSkills: "",
                    Description: "",
                    ManagerName: "",
                };
            },

            // Feedback Template with Roles
            createFeedbackTemplate: function () {
                return {
                    FeedbackID: 0,
                    ReviewState: "Pending",
                    DateCreated: "",
                    EmployeeName: "",
                    DisputeComment: "",
                    DateDue: "",
                    DateSubmitted: "",
                    Intuition: "0",
                    Documentation: "0",
                    Communication: "0",
                    BusinessKnowledge: "0",
                    StakeholderMGMT: "0",
                    UserRequirements: "0",
                    Facilitation: "0",
                    SolutionDesign: "0",
                    Visibility: "0",
                    TechnicalSkills: "0",
                    SummaryComment: "",
                    WhatWorkedWell: "",
                    Improvements: "",
                    ActionsToImprove: "",
                    ReviewerName: "",
                    RoleName: "",
                    RoleIntuition: "",
                    RoleDocumentation: "",
                    RoleCommunication: "",
                    RoleBusinessKnowledge: "",
                    RoleStakeholderMGMT: "",
                    RoleUserRequirements: "",
                    RoleFacilitation: "",
                    RoleSolutionDesign: "",
                    RoleVisibility: "",
                    RoleTechnicalSkills: "",
                    Description: "",
                    ManagerName: ""
                };
            },

            //Staff Members to Choose from DropDown Selector and allocation to scores
            EmployeeNames: function () {
                return {
                    Employee: []
                };
            }
        };
    });