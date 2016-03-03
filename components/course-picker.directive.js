angular.module('myApp')

.directive('coursePicker', ['$log', function($log) {
	var directive = this;
	directive = {
		restrict:'AE',
		templateUrl: "components/course-picker.tpl.html",
        scope: {
            selection: '=selection',
            courses: '=courses'
        },
        link: function (scope, elem, attrs) {
        	//console.log('coursePicker: ', [scope, elem, attrs])
        	//scope.courses = FirebaseService.getCourseList();        	
        }
	}

	return directive;
}])