angular.module('myApp')

.directive('coursePicker', ['FirebaseService', '$log', function(FirebaseService, $log) {
	var directive = this;
	directive = {
		restrict:'AE',
		templateUrl: "components/course-picker.tpl.html",
        scope: {
            selection: '=selection'
        },
        link: function (scope, elem, attrs) {
        	scope.courses = FirebaseService.getCourseList();
        }
	}

	return directive;
}])