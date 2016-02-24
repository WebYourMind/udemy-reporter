(function() {

angular
    .module('myApp')
    .controller('ReportSaleByPromotionController', ReportSaleByPromotionController);
    
/* @ngInject */ 
function ReportSaleByPromotionController($scope, $log, ReportService, items, currentAuth, $rootScope){
    $log.debug("ReportSaleByPromotionController creato. Items: ", items);
    var ReportSaleByPromotionCtrl = this;

    if ( ReportSaleByPromotionCtrl.items == undefined )
        ReportSaleByPromotionCtrl.items = [];

    $rootScope.$on("ByPromotion", function(event, args){
        ReportSaleByPromotionCtrl.items = args;
        ReportSaleByPromotionCtrl.data = [{
            values: args,                     
            key: 'Revenue' //key  - the name of the series.
        }];

    });

    ReportSaleByPromotionCtrl.items = items;
    ReportSaleByPromotionCtrl.selection = {};

    /* Chart options */
    ReportSaleByPromotionCtrl.options = { 
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
                    return d.promotion;                
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
                    axisLabel: 'Promotion'//,
                    //axisLabelDistance: -5000          
                },
                yAxis: {
                    axisLabel: 'Sales ($)',
                    axisLabelDistance: -10
                },
                callback: function(chart){
                    console.log("!!! lineChart callback !!!");
                }
            },
            title: {
                enable: true,
                text: 'Sales by Your Promotion'
            }
    };

    /* Chart data */
    ReportSaleByPromotionCtrl.data = [{
                        values: items,                     
                        key: 'Revenue' //key  - the name of the series.
                        }]; 
}
})();
