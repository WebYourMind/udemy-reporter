angular.module('myApp')
.controller('LoginController', ['$log', 'UserAuthentication', 'currentAuth', function($log, UserAuthentication, currentAuth){
    $log.debug("LoginController creato");
    var LoginCtrl = this;

    LoginCtrl.login = function(){        
        UserAuthentication.login(LoginCtrl.email, LoginCtrl.password, LoginCtrl.rememberme);
    }
}])