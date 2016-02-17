angular.module('myApp')

.controller('LoginController', ['$log', 'UserAuthentication', 'currentAuth', function($log, UserAuthentication, currentAuth){
    $log.debug("LoginController creato");
    var LoginCtrl = this;

    LoginCtrl.login = function(){        
        UserAuthentication.login(LoginCtrl.email, LoginCtrl.password, LoginCtrl.rememberme);
    }
}])


.controller('NavigationController', ['$scope','$log', function($scope, $log){
	$scope.item = 0;
	$scope.changeTab = function(newItem){
		$scope.item = newItem;
	};
	$scope.isActiveTab = function(item){
		return $scope.item === item;
	};
}])

.controller('CsvFileController', ['$scope', '$http', '$log','NgTableParams', 'FirebaseService', 'currentAuth', 'ParserService', function($scope, $http, $log, NgTableParams, FirebaseService, currentAuth, ParserService ){
	//$log.debug("CsvFileController creato");
    //$log.debug("CsvFileController currentAuth: ", currentAuth);

	var CsvFileCtrl = this;

    CsvFileCtrl.currentAuth = currentAuth;
    $log.debug("Current uid:", CsvFileCtrl.currentAuth.uid);

	CsvFileCtrl.csvcontent = "";
	CsvFileCtrl.csvheader = true;
	CsvFileCtrl.csvheaderVisible = true;
	CsvFileCtrl.csvseparator = ",";
	CsvFileCtrl.csvseparatorVisible = false;
	CsvFileCtrl.csvresult = "";
	CsvFileCtrl.csvaccept = ".csv";
	CsvFileCtrl.showPreviewTable = false;
	CsvFileCtrl.enableSaveBtn = false;

	CsvFileCtrl.savedRecords = 0;

	// Watch su caricamento file CSV (innesca il reload automatico della pagina) 
    var listener = $scope.$watch(
		'CsvFileCtrl.csvresult',
	    function(newValue, oldValue) {
	        if (newValue){
	        	//$log.debug("CsvFileCtrl.watch - CSV changed (csvresult):", newValue);                                   
	    		CsvFileCtrl.tableParams = new NgTableParams(
	    			{page:1,
                     count: 100},
	    			{data: CsvFileCtrl.csvresult}
	    		); 
	    		CsvFileCtrl.showPreviewTable = true;              	
	    		CsvFileCtrl.enableSaveBtn = true;
	        }else{
	        	$log.debug("CsvFileCtrl.watch - no newval");                                 
	        }
	    }
    );

    $scope.$on("$destroy", function() {
        if (listener) {
            listener();
        }
    });

    CsvFileCtrl.save = function(){
    	CsvFileCtrl.enableSaveBtn = false;
		CsvFileCtrl.savedRecords = FirebaseService.save(CsvFileCtrl.csvresult, CsvFileCtrl.currentAuth.uid);
    }	

     	
    ////
    CsvFileCtrl.sections = [];
    CsvFileCtrl.content = "";
    CsvFileCtrl.showContent = function($fileContent){
        CsvFileCtrl.content = $fileContent;
    };

    CsvFileCtrl.parseContent = function($fileContent){
        CsvFileCtrl.content = $fileContent;
        CsvFileCtrl.sections = ParserService.parse(CsvFileCtrl.content);
    };
}])

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

.controller('ReportSaleByWeekController', function($scope, $log, ReportService, items, currentAuth){
	var ReportSaleByWeekCtrl = this;
	ReportSaleByWeekCtrl.items = items;

    ReportSaleByWeekCtrl.selection = {};
	ReportSaleByWeekCtrl.range = {};
    ReportSaleByWeekCtrl.courseList = ['All'];

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
                	//$log.debug("Got this as X value: ", d);                   
                	return d.date;                
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
})

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

.controller('ReportSaleByHourOfDayController', function($scope, $log, ReportService, items, currentAuth){
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
})

.controller('ReportSaleByPromotionController', function($scope, $log, ReportService, items, currentAuth){
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
})

.controller('HelpController', ['$log', function($log){
	$log.debug("HelpController creato");
}])