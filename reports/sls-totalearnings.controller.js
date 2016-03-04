(function() {

angular
    .module('myApp')
    .controller('ReportTotalEarningsController', ReportTotalEarningsController);
    
/* @ngInject */ 
function ReportTotalEarningsController($scope, $log, ReportService, currentAuth, $rootScope){
    
    var ReportTotalEarningsCtrl = this;     
    ReportTotalEarningsCtrl.showSpinner = true;
   
    if ( typeof ReportTotalEarningsCtrl.items  == 'undefined' ) {
      
        ReportTotalEarningsCtrl.items;
        ReportTotalEarningsCtrl.items = ReportService.getTotalEarnings();
    }

    $rootScope.$on("TotalEarnings", function(event, args){
        ReportTotalEarningsCtrl.items = args;
        ReportTotalEarningsCtrl.showSpinner = false
        ReportTotalEarningsCtrl.data = [{
            values: args,                     
            key: 'Revenue' 
        }];
    });

    /* Chart options */
    ReportTotalEarningsCtrl.options = { 
            chart: {
                type: 'discreteBarChart',
                height: 500,
                margin : {
                    top: 20,
                    right: 20,
                    bottom: 50,
                    left: 55
                },
                x: function(d){                        
                    return d.revenuechannel;                
                },
                y: function(d){ 
                    return d.total; 
                },
                useInteractiveGuideline: true,
                dispatch: {
                    stateChange: function(e){ console.log("stateChange"); },
                    changeState: function(e){ console.log("changeState"); },
                    tooltipShow: function(e){ console.log("tooltipShow"); },
                    tooltipHide: function(e){ console.log("tooltipHide"); }
                },
                xAxis: {
                    axisLabel: 'Revenue Channel'//,
                    //axisLabelDistance: -5000          
                },
                yAxis: {
                    axisLabel: 'Earnings ($)',
                    axisLabelDistance: -10
                },
                callback: function(chart){
                    console.log("!!! lineChart callback !!!");
                }
            },
            title: {
                enable: true,
                text: 'Total Earnings'
            }
    };

    /* Chart data */
    ReportTotalEarningsCtrl.data = [{
                        values: ReportTotalEarningsCtrl.items,                     
                        key: 'Revenue' //key  - the name of the series.
                        }]; 
}
})();
