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
}])

.directive('onReadFile', function ($parse) {
  return {
    restrict: 'A',
    scope: false,
    link: function(scope, element, attrs) {
      var fn = $parse(attrs.onReadFile);
 
      element.on('change', function(onChangeEvent) {
        var reader = new FileReader();
 
        reader.onload = function(onLoadEvent) {
          scope.$apply(function() {
            fn(scope, {$fileContent:onLoadEvent.target.result});
          });
        };
 
        reader.readAsText((onChangeEvent.srcElement || onChangeEvent.target).files[0]);
      });
    }
  };
});
