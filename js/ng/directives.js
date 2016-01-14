angular.module('myApp')

.directive('coursePicker', ['FirebaseService', '$log', function(FirebaseService, $log) {
	var directive = this;
	directive = {
		restrict:'AE',
		templateUrl: "pages/course-picker.tpl.html",
        scope: {
            selection: '=selection'
        },
        link: function (scope, elem, attrs) {
        	scope.courses = FirebaseService.getCourseList();
        }
	}

	return directive;
}])

.directive('wymDatepicker', ['FirebaseService', '$log', function(FirebaseService, $log) {
	var directive = this;
	directive = {
		restrict:'AE',
		templateUrl: "pages/date-picker.tpl.html",
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
}]);
