angular.module('myApp')
.directive('wymDatepicker', ['FirebaseService', '$log', function(FirebaseService, $log) {
	var directive = this;
	directive = {
		restrict:'AE',
		templateUrl: "components/date-picker.tpl.html",
		scope: {
			range: 	'=range'
		},
		link: function(scope, elem, attrs) {	
        	scope.fromDateOpened = false;
        	scope.toDateOpened = false;			
			scope.dateOptions =	{
								    formatYear: 'yy',
									startingDay: 1
								};        	

			scope.openFromDate = function() {
			    scope.fromDateOpened = true;
			};
			scope.openToDate = function() {
			    scope.toDateOpened = true;
			};		   
		}
	}

	return directive;
}])