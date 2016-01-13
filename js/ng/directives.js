angular.module('myApp')


.directive('wymDatepicker', ['FirebaseService', '$log', function(FirebaseService, $log) {
	var directive = this;
	directive = {
		restrict:'AE',
		templateUrl: "pages/date-picker.tpl.html",
		scope: {
			range: 	'=range'
		},
		link: function(scope, elem, attrs) {	
			scope.dateOptions =	{
								    formatYear: 'yy',
									startingDay: 1
								};        	
        	
        	scope.fromDateOpened = false;
        	scope.toDateOpened = false;

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
}]);	


/*
.directive('myDatepicker', function() {
	var directive = this;
	directive = {
		restrict:'AE',
		scope: {},
		replace:true,
		link: function(scope, elem, attrs, controller) {						
			var to = new Date();
			var from = new Date(to.getTime() - 1000 * 60 * 60 * 24 * 14);
			angular.element(elem).DatePicker({				
			  	inline: true,
			  	date: [from, to],
			  	calendars: 3,
			  	mode: 'range',
			  	current: new Date(to.getFullYear(), to.getMonth() - 1, 1),
			  	onChange: function(dates,el) {
			    	// update the range display
			    	$('#date-range-field span').text(
			      		dates[0].getDate()+' '+dates[0].getMonthName(true)+', '+
			      		dates[0].getFullYear()+' - '+
			      		dates[1].getDate()+' '+dates[1].getMonthName(true)+', '+
			      		dates[1].getFullYear()
			      	);
			  	}
			});
		}
	}

	return directive;
})
*/

/*
.directive('coursePickerOld', ['FirebaseService', '$log', function(FirebaseService, $log) {
	var directive = this;
	directive = {
		restrict:'AE',
		template: "<select ng-model='selectedCourse' ng-options='c.name for c in courses'></select>",
        scope: {
            selectedCourse: '=selectedCourse'
        },
        link: function (scope, elem, attrs) {
        	scope.courses = FirebaseService.getCourseList();
            scope.selectedCourse = scope.courses[0];            
        }
	}

	return directive;
}])
*/