(function(angular, undefined) { 
angular
	.module('myApp')
	.controller('LoginController', LoginController);
/* @ngInject */ 
function LoginController($log, UserAuthentication, $mdDialog, $state, $mdToast) {

    $log.debug("LoginController creato");
    var LoginCtrl = this;

    LoginCtrl.login = function(){       
    console.log('login'); 
    UserAuthentication.login(LoginCtrl.email, LoginCtrl.password, LoginCtrl.rememberme)
    .then(function(authData) {
		   console.log ('AuthData in LoginController')
		   console.log(authData);
		     console.log(authData.error);
		   if(!authData.error) {
		   	$mdDialog.hide();
		   	$state.go("main.load-csv-file");
		   } else {
		   	console.log ('ERRORE')
		    $mdToast.show(
		    	$mdToast
		    	.simple()
		    	.textContent(authData.message) 
		    	.position('top right')		    	
		    	);
		   }
		}).catch(function(error) {
		  $log.debug("Unexpected error:", error);
		});
    
      
    }
}
})(angular);
