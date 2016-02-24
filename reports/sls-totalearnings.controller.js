(function() {

angular
    .module('myApp')
    .controller('ReportTotalEarningsController', ReportTotalEarningsController);
    
/* @ngInject */ 
function ReportTotalEarningsController($scope, $log, ReportService, items, currentAuth, $rootScope){
    $log.debug("ReportTotalEarningsController creato. Items: ", items);
    var ReportTotalEarningsCtrl = this;
    
    ReportTotalEarningsCtrl.items = items;
    if ( ReportTotalEarningsCtrl.items == undefined )
        ReportTotalEarningsCtrl.items = ReportService.getTotalEarinigs();

    $rootScope.$on("TotalEarnings", function(event, args){
        ReportTotalEarningsCtrl.items = args;
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
                        values: items,                     
                        key: 'Revenue' //key  - the name of the series.
                        }]; 
}
})();
