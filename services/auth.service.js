angular.module('myApp').factory("UserAuthentication", ['$log', '$firebaseAuth', 'FBEndPoint', '$state', 'Auth', function($log, $firebaseAuth, FBEndPoint, $state, Auth) {
	var self = {};
	//self.uid = undefined;

   	self.login = function(email, password, rememberme) {
	   	$log.debug("UserAuthentication.login params: ", [email, password, rememberme]);
	
		var auth = Auth;

		auth.$authWithPassword({
		  email: email,
		  password: password
		}).then(function(authData) {
		  $log.debug("Logged in as:", authData);
		  self.uid = authData.uid;
		  $state.go("main.load-csv-file");
		}).catch(function(error) {
		  $log.debug("Authentication failed:", error);
		});

    };

    self.getUid = function(){
    	return self.uid;
    }
    // Factory END
    return self;
 }])