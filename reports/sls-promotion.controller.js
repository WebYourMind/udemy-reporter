(function() {

angular
    .module('myApp')
    .controller('ReportSaleByPromotionController', ReportSaleByPromotionController);
    
/* @ngInject */ 
function ReportSaleByPromotionController($scope, $log, ReportService, items, currentAuth){
    $log.debug("ReportSaleByPromotionController creato. Items: ", items);
    var ReportSaleByPromotionCtrl = this;
    ReportSaleByPromotionCtrl.items = items;


    ReportSaleByPromotionCtrl.selection = {};
    ReportSaleByPromotionCtrl.range = {};
    ReportSaleByPromotionCtrl.courseList = ['All'];

    var courseNameListener = $scope.$watchCollection('ReportSaleByPromotionCtrl.selection.ids', function(newValue, oldValue) {
        if (newValue){
            ReportSaleByPromotionCtrl.data = [];
            var newData = [];
            ReportSaleByPromotionCtrl.courseList = [];
            _.each(ReportSaleByPromotionCtrl.selection.ids, function(value, key, list){
                $log.debug("ReportSaleByPromotionCtrl.selection.ids - selected courses:", [value, key]);
                if (value){
                    newData.push({
                            values: ReportService.getSaleTotals('ByPromotion', key, ReportSaleByPromotionCtrl.range),                     
                            key: key
                    }); 
                    ReportSaleByPromotionCtrl.courseList.push(key);
                }else{
                    $log.debug("ReportSaleByPromotionCtrl current data is:", ReportSaleByPromotionCtrl.data);
                }               
            });
            ReportSaleByPromotionCtrl.data = newData;            
        }
    });

    var dateRangeListener = $scope.$watchCollection('ReportSaleByPromotionCtrl.range', function(newValue, oldValue) {
        if (newValue){      
            $log.debug("ReportSaleByPromotionCtrl.range watch: ", newValue);
            ReportSaleByPromotionCtrl.data = [];
            var newData = [];           
            _.each(ReportSaleByPromotionCtrl.courseList, function(value, key, list){
                $log.debug("ReportSaleByPromotionCtrl.range watch: ", [value, key]);
                newData.push({
                        values: ReportService.getSaleTotals('ByPromotion', value, ReportSaleByPromotionCtrl.range),                     
                        key: value
                });                 
            });
            ReportSaleByPromotionCtrl.data = newData; 
        }else{
            $log.debug("ReportSaleByPromotionCtrl.range watch- no newval");                                 
        }
    });

    // Clean up on exit
    $scope.$on("$destroy", function() {
        if (courseNameListener) {
            courseNameListener();
        }
        if (dateRangeListener) {
            dateRangeListener();
        }        
    });


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
