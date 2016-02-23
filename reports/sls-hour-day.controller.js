(function() {

angular
   .module('myApp')
   .controller('ReportSaleByHourOfDayController', ReportSaleByHourOfDayController);
  
/* @ngInject */ 
function ReportSaleByHourOfDayController($scope, $log, ReportService, items, currentAuth){
    	$log.debug("ReportSaleByHourOfDayController creato. Items: ", items);
    	var ReportSaleByHourOfDayCtrl = this;
    	ReportSaleByHourOfDayCtrl.items = items;

        ReportSaleByHourOfDayCtrl.selection = {};
    	ReportSaleByHourOfDayCtrl.range = {};
        ReportSaleByHourOfDayCtrl.courseList = ['All'];

        var courseNameListener = $scope.$watchCollection('ReportSaleByHourOfDayCtrl.selection.ids', function(newValue, oldValue) {
            if (newValue){
            	ReportSaleByHourOfDayCtrl.data = [];
            	var newData = [];
                ReportSaleByHourOfDayCtrl.courseList = [];
                _.each(ReportSaleByHourOfDayCtrl.selection.ids, function(value, key, list){
    				$log.debug("ReportSaleByDayOfWeekCtrl.selection.ids - selected courses:", [value, key]);
    		    	if (value){
    		    		newData.push({
    	    					values: ReportService.getSaleTotals('ByHourOfDay', key, ReportSaleByHourOfDayCtrl.range),                     
    			                key: key
    	            	}); 
                        ReportSaleByHourOfDayCtrl.courseList.push(key);
    		    	}else{
    		    		$log.debug("ReportSaleByDayOfWeekCtrl current data is:", ReportSaleByHourOfDayCtrl.data);
    		    	}		    	
                });
    	    	ReportSaleByHourOfDayCtrl.data = newData;            
            }
        });

        var dateRangeListener = $scope.$watchCollection('ReportSaleByHourOfDayCtrl.range', function(newValue, oldValue) {
            if (newValue){      
    			$log.debug("ReportSaleByHourOfDayCtrl.range watch: ", newValue);
            	ReportSaleByHourOfDayCtrl.data = [];
            	var newData = [];			
                _.each(ReportSaleByHourOfDayCtrl.courseList, function(value, key, list){
                    $log.debug("ReportSaleByHourOfDayCtrl.range watch: ", [value, key]);
    	    		newData.push({
        					values: ReportService.getSaleTotals('ByHourOfDay', value, ReportSaleByHourOfDayCtrl.range),                     
    		                key: value
                	});                 
                });
                ReportSaleByHourOfDayCtrl.data = newData; 
            }else{
                $log.debug("ReportSaleByHourOfDayCtrl.range watch- no newval");                                 
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
        ReportSaleByHourOfDayCtrl.options = { 
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
                    	return d.hour;                
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
                        axisLabel: 'Hour',                
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
                    text: 'Sales by hour of the day'
                }
        };

        /* Chart data */
        ReportSaleByHourOfDayCtrl.data = [{
        					values: items,                     
    		                key: 'Revenue', //key  - the name of the series.
    		                color: '#ff7f0e',  //color - optional: choose your own line color.
    		                strokeWidth: 2//,
    		                //classed: 'dashed'
                    		}];	
    }
})();