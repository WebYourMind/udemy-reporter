angular.module('myApp')

.controller('LoginController', ['$log', 'UserAuthentication', 'currentAuth', function($log, UserAuthentication, currentAuth){
    $log.debug("LoginController creato");
    var LoginCtrl = this;

    LoginCtrl.login = function(){        
        UserAuthentication.login(LoginCtrl.email, LoginCtrl.password, LoginCtrl.rememberme);
    }
}])

.controller('CsvFileController', ['$scope', '$http', '$log','NgTableParams', 'FirebaseService', 'currentAuth', function($scope, $http, $log, NgTableParams, FirebaseService, currentAuth ){
	$log.debug("CsvFileController creato");
    $log.debug("CsvFileController currentAuth: ", currentAuth);

	var CsvFileCtrl = this;

    CsvFileCtrl.currentAuth = currentAuth;

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
    $scope.$watch(
		'CsvFileCtrl.csvresult',
	    function(newValue, oldValue) {
	        if (newValue){
	        	$log.debug("CsvFileCtrl.watch - CSV changed:", newValue);                   
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

    CsvFileCtrl.save = function(){
    	CsvFileCtrl.enableSaveBtn = false;
		CsvFileCtrl.savedRecords = FirebaseService.save(CsvFileCtrl.csvresult);
    }	 	
}])

.controller('ReportSaleByDayController', function($scope, $log, ReportService, items, currentAuth){
	//$log.debug("ReportController creato. Items: ", items);
	var ReportSaleByDayCtrl = this;
	ReportSaleByDayCtrl.items = items;

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
                	return new Date(parts[0], parts[1]-1, parts[2]);                
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
                    	console.log("This is the date: ", d);
                    	console.log("This is the date type: ", typeof(d));
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

.controller('ReportSaleByDayOfWeekController', function($scope, $log, ReportService, items, currentAuth){
    $log.debug("ReportSaleByDayOfWeekController creato. Items: ", items);
    var ReportSaleByDayOfWeekCtrl = this;
    ReportSaleByDayOfWeekCtrl.items = items;

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