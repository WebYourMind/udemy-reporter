(function(angular, undefined) {
angular
    .module('myApp')
    .controller('ReportSaleByWeekController', ReportSaleByWeekController);
    
/* @ngInject */ 
    function ReportSaleByWeekController($scope, $log, $rootScope, ReportService, items, currentAuth){
	var ReportSaleByWeekCtrl = this;
	ReportSaleByWeekCtrl.items = items;

    ReportSaleByWeekCtrl.showSpinner = true
    if ( ReportSaleByWeekCtrl.items === undefined )
        ReportSaleByWeekCtrl.items = [];

    $rootScope.$on("ByWeek", function(event, args){
        $log.debug('ByWeek called');
        ReportSaleByWeekCtrl.items = args;
        ReportSaleByWeekCtrl.data = [{
            values: args,                     
            key: 'Revenue'
        }];
        ReportSaleByWeekCtrl.showSpinner = false
    });

    ReportSaleByWeekCtrl.selection = {};
	ReportSaleByWeekCtrl.range = {};
    ReportSaleByWeekCtrl.courseList = ['All'];
/*
    var courseNameListener = $scope.$watchCollection('ReportSaleByWeekCtrl.selection.ids', function(newValue, oldValue) {
        if (newValue){
        	ReportSaleByWeekCtrl.data = [];
        	var newData = [];
            ReportSaleByWeekCtrl.courseList = [];
            _.each(ReportSaleByWeekCtrl.selection.ids, function(value, key, list){
		    	if (value){
		    		newData.push({
    					values: ReportService.getSaleTotals('ByWeek', key, ReportSaleByWeekCtrl.range),                     
			                key: key
	            	}); 
                    ReportSaleByWeekCtrl.courseList.push(key);
		    	}	    	
            });
	    	ReportSaleByWeekCtrl.data = newData;            
        }
    });

    var dateRangeListener = $scope.$watchCollection('ReportSaleByWeekCtrl.range', function(newValue, oldValue) {
        if (newValue){      
        	ReportSaleByWeekCtrl.data = [];
        	var newData = [];			
            _.each(ReportSaleByWeekCtrl.courseList, function(value, key, list){
                $log.debug("ReportSaleByWeekCtrl.range watch: ", [value, key]);
	    		newData.push({
    					values: ReportService.getSaleTotals('ByWeek', value, ReportSaleByWeekCtrl.range),                     
		                key: value
            	});                 
            });
            ReportSaleByWeekCtrl.data = newData; 
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
*/
    /* Chart options */
    ReportSaleByWeekCtrl.options = { 
            chart: {
                type: 'lineChart',
                height: 500,
                margin : {
                    top: 20,
                    right: 20,
                    bottom: 50,
                    left: 55
                },
                x: function(d){                  	
                	$log.debug("Got this as X value: ", d);                   
                	return d.week;                
                },
                y: function(d){ 
                	//$log.debug("Got this as Y value: ", d);  
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
                    axisLabel: 'Week'   
                },
                yAxis: {
                    axisLabel: 'Sales ($)'
                },
                callback: function(chart){
                    //console.log("!!! lineChart callback !!!");
                }
            },
            title: {
                enable: true,
                text: 'Sales by Week of the Year'
            }
    };

    /* Chart data */
    ReportSaleByWeekCtrl.data = [{
    					values: items,                     
		                key: 'Revenue'
                		}];
}
})(angular);