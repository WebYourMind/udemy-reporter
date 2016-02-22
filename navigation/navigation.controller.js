(function() {

angular
   .module('myApp')
   .controller('NavigationController', NavigationController);

/* @ngInject */ 
function NavigationController($scope, $log, Auth){

	$scope.item = 0;
	$scope.changeTab = function(newItem){
		$scope.item = newItem;
	};
	$scope.isActiveTab = function(item){
		return $scope.item === item;
	};
    $scope.Auth = Auth
    $scope.Auth.$onAuth(function(result){
        $scope.currentAuth = result;
        console.log($scope.currentAuth);
    })
 }

})();