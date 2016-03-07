(function() {

angular
    .module('myApp')
    .controller('CsvFileController', CsvFileController);
    
/* @ngInject */ 
 function CsvFileController($log, FirebaseService, currentAuth, ParserService ){	

	var CsvFileCtrl = this

    CsvFileCtrl.currentAuth = currentAuth
    //$log.debug("Current uid:", CsvFileCtrl.currentAuth.uid);

    CsvFileCtrl.sections = []
    CsvFileCtrl.content = ""
    CsvFileCtrl.selectedFile;

    // 
    //CsvFileCtrl.showContent = function($fileContent){
     //   CsvFileCtrl.content = $fileContent
    //};

    // Read the CSV file content
    CsvFileCtrl.parseContent = function($fileContent){
        CsvFileCtrl.content = $fileContent
        CsvFileCtrl.sections = ParserService.parse(CsvFileCtrl.content)
    };

    // Send the data to Firebase backend
    CsvFileCtrl.save = function(){
    	$log.debug("CsvFileCtrl.save")  
    	FirebaseService.saveSections(CsvFileCtrl.sections, CsvFileCtrl.currentAuth.uid)
    }
}
})();