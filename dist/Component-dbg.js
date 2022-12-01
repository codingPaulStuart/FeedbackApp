sap.ui.define([
        "sap/ui/core/UIComponent",
        "sap/ui/Device",
        "feedbackapp/feedbackapp/model/models",
        "sap/ui/model/json/JSONModel"
    ],
    function (UIComponent, Device, models,JSONModel) {
        "use strict";

        return UIComponent.extend("feedbackapp.feedbackapp.Component", {
            metadata: {
                manifest: "json"
            },

            /**
             * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
             * @public
             * @override
             */
            init: function () {

                //Call the base component's init function
                UIComponent.prototype.init.apply(this, arguments);
    
                //Enable routing
                this.getRouter().initialize();
    
                //Set the device model
                this.setModel(models.createDeviceModel(), "device");
    
                //Instantiating FeedbackModel
                this.setModel(new JSONModel(models.Feedback()), "FeedbackModel");
    
                //Instantiating EmployeeNames
                this.setModel(new JSONModel(models.EmployeeNames()), "EmployeeNamesModel");
    
                //Instantiating Settings
                this.setModel(new JSONModel(models.Settings()), "SettingsModel");
    
                //Model for Chart
                this.setModel(new JSONModel(models.createVizFrameModel()), "vizFrameModel");
    
                //Instantiating PerformanceDevelopmentPlan
                this.setModel(new JSONModel(models.PerformanceDevelopmentPlan()), "PDPlanModel");
            }
        });
    }
);