angular.module('myApp')

.controller('ReportSaleByDayController', function($scope, $log, ReportService, items, currentAuth){
	var ReportSaleByDayCtrl = this;
	ReportSaleByDayCtrl.items = items;

    ReportSaleByDayCtrl.selection = {};
	ReportSaleByDayCtrl.range = {};
    ReportSaleByDayCtrl.courseList = ['All'];

    var courseNameListener = $scope.$watchCollection('ReportSaleByDayCtrl.selection.ids', function(newValue, oldValue) {
        if (newValue){
        	ReportSaleByDayCtrl.data = [];
        	var newData = [];
            ReportSaleByDayCtrl.courseList = [];
            _.each(ReportSaleByDayCtrl.selection.ids, function(value, key, list){
				//$log.debug("ReportSaleByDayCtrl.selection.ids - selected courses:", [value, key]);
		    	if (value){
		    		newData.push({
	    					values: ReportService.getSaleTotals('ByDay', key, ReportSaleByDayCtrl.range),                     
			                key: key
	            	}); 
                    ReportSaleByDayCtrl.courseList.push(key);
		    	}//else{
		    		//$log.debug("ReportSaleByDayCtrl current data is:", ReportSaleByDayCtrl.data);
		    	//}		    	
            });
	    	ReportSaleByDayCtrl.data = newData;            
        }
    });

    var dateRangeListener = $scope.$watchCollection('ReportSaleByDayCtrl.range', function(newValue, oldValue) {
        if (newValue){      
			//$log.debug("ReportSaleByDayCtrl.range watch: ", newValue);
        	ReportSaleByDayCtrl.data = [];
        	var newData = [];			
            _.each(ReportSaleByDayCtrl.courseList, function(value, key, list){
                $log.debug("ReportSaleByDayCtrl.range watch: ", [value, key]);
	    		newData.push({
    					values: ReportService.getSaleTotals('ByDay', value, ReportSaleByDayCtrl.range),                     
		                key: value
            	});                 
            });
            ReportSaleByDayCtrl.data = newData; 
        }else{
            //$log.debug("ReportSaleByDayCtrl.range watch- no newval");                                 
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
    ReportSaleByDayCtrl.options = { 
            chart: {
                type: 'lineChart',
                height: 500,
                margin : {
                    top: 20,
                    right: 20,
                    bottom: 40,
                    left: 55
                },
                x: function(d){        
                	var parts = d.date.split('/');             
                    return new Date(parts[2], parts[1]-1, parts[0]);  
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
                    axisLabel: 'Date',
                    tickFormat: function(d){
                    	//console.log("This is the date: ", d);
                    	//console.log("This is the date type: ", typeof(d));
                    	if (typeof(d) == 'number'){                    		
                    		var retVal = d3.time.format('%d/%m/%y')(new Date(d))
							//console.log("Entering the number option ", retVal);
							return retVal;
                    	}else{
                    		//console.log("Entering the OTHER option ");
                    		return d;
                    	}
                    }                    
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
                text: 'Sales by day'
            }
    };

    /* Chart data */
    ReportSaleByDayCtrl.data = [{
    					values: items,                     
		                key: 'Revenue', //key  - the name of the series.
		                color: '#ff7f0e',  //color - optional: choose your own line color.
		                strokeWidth: 2//,
		                //classed: 'dashed'
                		}];
})
