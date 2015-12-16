
angular.module('myApp')
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

.directive('coursePicker', ['FirebaseService', '$log', function(FirebaseService, $log) {
	var directive = this;
	directive = {
		restrict:'AE',
		//replace:true,
		template: "<select ng-model='selectedValue' ng-options='c.name for c in courses'></select>",
		//template: "<input ng-model='selectedValue' type='text'>",
        scope: {
            selectedValue: '='
        },
        link: function (scope, elem, attrs) {
        	scope.courses = FirebaseService.getCourseList();
            //scope.selectedValue = scope.courses[0];
        }
	}

	return directive;
}]);