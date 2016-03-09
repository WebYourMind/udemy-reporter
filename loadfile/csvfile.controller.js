(function() {

angular
    .module('myApp')
    .controller('CsvFileController', CsvFileController);
    
/* @ngInject */ 
 function CsvFileController($log, FirebaseService, currentAuth, ParserService ){	

	var vm = this;

    vm.currentAuth = currentAuth;
    //$log.debug("Current uid:", vm.currentAuth.uid);

    vm.sections = [];
    vm.content = "";
    vm.selectedFile;
    vm.predicate = "";

    // Read the CSV file content
    vm.parseContent = function($fileContent){
        vm.content = $fileContent;
        vm.sections = ParserService.parse(vm.content);
    };

    vm.order = function(predicate) {
        console.log (' Updating order for predicate = ',predicate);
     vm.reverse = (vm.predicate === predicate) ? !vm.reverse : false;
     vm.predicate = predicate;
    }
    // Send the data to Firebase backend
    vm.save = function(){
    	$log.debug("vm.save");  
    	FirebaseService.saveSections(vm.sections, vm.currentAuth.uid);
    }
}
})();