angular.module('myApp')
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
