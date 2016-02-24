(function() {

angular
    .module('myApp')
    .controller('ReportSaleByCourseController', ReportSaleByCourseController);
    
/* @ngInject */ 
function ReportSaleByCourseController($scope, $log, ReportService, items, currentAuth, $rootScope){
    $log.debug("ReportSaleByCourseController creato. Items: ", items);
    var ReportSaleByCourseCtrl = this;
    
    ReportSaleByCourseCtrl.items = items;
    if ( ReportSaleByCourseCtrl.items == undefined )
        ReportSaleByCourseCtrl.items = ReportService.getEarinigsByCourse();

    $rootScope.$on("ByCourse", function(event, args){
        ReportSaleByCourseCtrl.items = args;
        ReportSaleByCourseCtrl.data = [{
            values: args,                     
            key: 'Revenue' 
        }];

    });

    /* Chart options */
    ReportSaleByCourseCtrl.options = { 
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
                    return d.coursetitle;                
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
                    axisLabel: 'Course Name'//,
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
                text: 'Earnings by Course Name'
            }
    };

    /* Chart data */
    ReportSaleByCourseCtrl.data = [{
                        values: items,                     
                        key: 'Revenue' //key  - the name of the series.
                        }]; 
}
})();
