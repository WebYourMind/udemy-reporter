(function() {

  angular.module('myApp').controller('ReportController', ReportController);

  /* @ngInject */ 
  function ReportController($scope, ReportService, currentAuth, params, FirebaseService){
    var ReportCtrl = this;
    ReportCtrl.reportName = params.reportName;
    ReportCtrl.reportLabel = params.reportLabel;
    ReportCtrl.reportType = params.reportType;
    ReportCtrl.showSpinner = true;
    console.info("ReportCtrl.reportName [%s] - ReportCtrl.reportType [%s]", ReportCtrl.reportName, ReportCtrl.reportType);

    ReportService.drawChart(params);
    // Stop & hide the spinner element
    ReportCtrl.showSpinner = false;  
  } 
})();
