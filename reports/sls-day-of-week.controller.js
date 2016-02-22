angular.module('myApp')

.controller('ReportSaleByDayOfWeekController', function($scope, $log, ReportService, items, currentAuth){
    //$log.debug("ReportSaleByDayOfWeekController creato. Items: ", items);
    var ReportSaleByDayOfWeekCtrl = this;
    ReportSaleByDayOfWeekCtrl.items = items;

    ReportSaleByDayOfWeekCtrl.selection = {};
	ReportSaleByDayOfWeekCtrl.range = {};
    ReportSaleByDayOfWeekCtrl.courseList = ['All'];

    var courseNameListener = $scope.$watchCollection('ReportSaleByDayOfWeekCtrl.selection.ids', function(newValue, oldValue) {
        if (newValue){
        	ReportSaleByDayOfWeekCtrl.data = [];
        	var newData = [];
            ReportSaleByDayOfWeekCtrl.courseList = [];
            _.each(ReportSaleByDayOfWeekCtrl.selection.ids, function(value, key, list){
				$log.debug("ReportSaleByDayOfWeekCtrl.selection.ids - selected courses:", [value, key]);
		    	if (value){
		    		newData.push({
	    					values: ReportService.getSaleTotals('ByDayOfWeek', key, ReportSaleByDayOfWeekCtrl.range),                     
			                key: key
	            	}); 
                    ReportSaleByDayOfWeekCtrl.courseList.push(key);
		    	}//else{
		    	//	$log.debug("ReportSaleByDayOfWeekCtrl current data is:", ReportSaleByDayOfWeekCtrl.data);
		    	//}		    	
            });
	    	ReportSaleByDayOfWeekCtrl.data = newData;            
        }
    });

    var dateRangeListener = $scope.$watchCollection('ReportSaleByDayOfWeekCtrl.range', function(newValue, oldValue) {
        if (newValue){      
			$log.debug("ReportSaleByDayOfWeekCtrl.range watch: ", newValue);
        	ReportSaleByDayOfWeekCtrl.data = [];
        	var newData = [];			
            _.each(ReportSaleByDayOfWeekCtrl.courseList, function(value, key, list){
                $log.debug("ReportSaleByDayOfWeekCtrl.range watch: ", [value, key]);
	    		newData.push({
    					values: ReportService.getSaleTotals('ByDayOfWeek', value, ReportSaleByDayOfWeekCtrl.range),                     
		                key: value
            	});                 
            });
            ReportSaleByDayOfWeekCtrl.data = newData; 
        }else{
            $log.debug("ReportSaleByDayOfWeekCtrl.range watch- no newval");                                 
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
    ReportSaleByDayOfWeekCtrl.options = { 
            chart: {
                type: 'discreteBarChart',
                height: 500,
                margin : {
                    top: 20,
                    right: 20,
                    bottom: 40,
                    left: 55
                },
                x: function(d){                        
                    return d.day;                
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
                    axisLabel: 'Day of the Week',                
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
                text: 'Sales by day of the week'
            }
    };


    /* Chart data */
    ReportSaleByDayOfWeekCtrl.data = [{
                        values: items,                     
                        key: 'Revenue', //key  - the name of the series.
                        color: '#ff7f0e',  //color - optional: choose your own line color.
                        strokeWidth: 2//,
                        //classed: 'dashed'
                        }]; 
})