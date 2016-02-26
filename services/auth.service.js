angular.module('myApp').factory("UserAuthentication", ['$log', '$firebaseAuth', 'FBEndPoint', '$state', 'Auth', function($log, $firebaseAuth, FBEndPoint, $state, Auth) {
	var self = {};
	//self.uid = undefined;

   	self.login = function(email, password, rememberme) {
	   	$log.debug("UserAuthentication.login params: ", [email, password, rememberme]);
	
		var auth = Auth;

	return auth.$authWithPassword({
		  email: email,
		  password: password
		},{
		 rememberme : rememberme 
		}).then(function(authData) {
		  $log.debug("Logged in as:", authData);
		  self.uid = authData.uid;		  
		  return authData;
		}).catch(function(error) {
		  $log.debug("Authentication failed:", error);
		  // not returning specific error, as firebase is not consistent with the error formatting
		  return {error: true, message: 'Invalid Username or Password'};
		});

    };

    self.getUid = function(){
    	return self.uid;
    }
    // Factory END
    return self;
 }])