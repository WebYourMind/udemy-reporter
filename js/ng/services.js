angular.module('myApp')

// let's create a re-usable factory that generates the $firebaseAuth instance
.factory("Auth", ['$firebaseAuth', 'FBEndPoint', function($firebaseAuth, FBEndPoint) {
    var ref = new Firebase(FBEndPoint);
    return $firebaseAuth(ref);
  }
]) 

.factory("UserAuthentication", ['$log', '$firebaseAuth', 'FBEndPoint', '$state', function($log, $firebaseAuth, FBEndPoint, $state) {
	var self = {};
	
   	self.login = function(email, password, rememberme) {
	   	$log.debug("UserAuthentication.login params: ", [email, password, rememberme]);
	
		var ref = new Firebase(FBEndPoint),
    		auth = $firebaseAuth(ref);

		auth.$authWithPassword({
		  email: email,
		  password: password
		}).then(function(authData) {
		  $log.debug("Logged in as:", authData);
		  $state.go("main.load-csv-file");
		}).catch(function(error) {
		  $log.debug("Authentication failed:", error);
		});

    };

    // Factory END
    return self;
 }])

.factory('FirebaseService', ['$http', '$q', '$log', '$filter', '$firebaseArray', 'FBEndPoint', function($http, $q, $log, $filter, $firebaseArray, FBEndPoint){
	var self = {};
	self.records = undefined;
		
	self.save = function(recs){	
		var addedRecords = 0,
			alreadyAddedRecords = 0,
			records = self.get(),		
			lastTransactionId = self.getLastTransactionId(records);

		recs.reverse();
		_.each(recs, function(element, index, list){
			var currentTransactionId = element['Transaction Id'];
			if (currentTransactionId > lastTransactionId){
				records.$add({
					"TransactionId" : element['Transaction Id'],
					"Date"			: $filter('date')(new Date(element['Formatted Date'].replace(/"/g,"")), 'MM/dd/yyyy HH:mm:ss'),
					"CustomerName"	: element['User Name'].replace(/"/g,""),
					"Course"		: element['Course Name'].replace(/"/g,""),
					"CouponCode"	: element['Coupon Ode'].replace(/"/g,""),
					"Channel"		: element['Revenue Channel'].replace(/"/g,""),
					"Platform"		: element.Vendor.replace(/"/g,""),
					"PricePaid"		: element['Paid Price'].replace(/"/g,""),
					"Currency"		: element['Transaction Currency'].replace(/"/g,""),
					"TaxAmount"		: element['Tax Amount'].replace(/"/g,""),
					"NetAmount"		: element['Share Price'].replace(/"/g,""),
					"YourRevenue"	: element['Instructor Share'].replace(/"/g,""), 
					"TaxRate"		: element['Tax Rate'].replace(/"/g,""),
					"ExchangeRate"	: element['Exchange Rate'].replace(/"/g,"")
				});
				addedRecords++;
			}else{				
				alreadyAddedRecords++;
			}
		});
		$log.debug("FirebaseService.save loaded records ["+addedRecords+"]/discarded records (already processed) ["+alreadyAddedRecords+"]");
		return addedRecords;
	}

	self.get = function(){
		if (self.records == undefined){
			//$log.debug("FirebaseService.get [self.records] is undefined: get the values");
			var ref = new Firebase(FBEndPoint);
			self.records = $firebaseArray(ref);			
			return self.records;
		}else {
			//$log.debug("FirebaseService.get [self.records] is defined: use the values");
			return self.records;
		}
	}

	self.getLastTransactionId = function(records){
		var lastTr = -1;
		_.each(records, function(element, index, list){
			//$log.debug("getLastTransactionId - looping. element transactionId: ", element.TransactionId);
			if (element.TransactionId > lastTr){
				lastTr = element.TransactionId;
			}			
		});
		return lastTr;
	}

	self.getCourseList = function(){
		var records = self.get(),	
			courses = [],
			finalCourses = [];
		finalCourses.push({"name": 'All', "value" : 'All'});
		_.each(records, function(element, index, list){
			if (_.indexOf(courses, element.Course)<0){
				courses.push(element.Course);				
				finalCourses.push({"name": element.Course, "value" : element.Course});
			}
		});
		return finalCourses;
	}	
	// Fine FACTORY
	return self;	
}]);	

angular.module('myApp')
.factory('ReportService', ['$log', '$filter', 'FirebaseService', function($log, $filter, FirebaseService){
	var self = {};	

	self.filterByCourseName = function(records, courseName){
		if(courseName && courseName != 'All'){
			records = _.filter(records, function(elem){ return elem.Course == courseName});
		}
		return records;
	}

	self.filterByDateRange = function(records, range){
		var filtered = [],
			fromDate = $filter('date')(new Date('2010/01/01'), 'yyyyMMdd'),
			toDate = $filter('date')(new Date(), 'yyyyMMdd');

		if (angular.isDefined(range)){
			//$log.debug("ReportService.filterByDateRange range:", range);
			if (angular.isDefined(range.fromDate)){
				fromDate = $filter('date')(new Date(range.fromDate), 'yyyyMMdd');
			}
			if(range.toDate){
				toDate = $filter('date')(new Date(range.toDate), 'yyyyMMdd');
			}
			_.each(records, function(elem, idx, lst){
				var dateToCheck = $filter('date')(new Date(elem.Date), 'yyyyMMdd');			
				if (dateToCheck >= fromDate && dateToCheck <= toDate ){
					filtered.push(elem);
				}
			});

		}else{
			filtered = records;
		}	

		return filtered;
	}

	// Sum all sales group by DAY
	self.getTotalsByDay = function(courseName, range){
		var results = [],
			records = FirebaseService.get();

		// Filter by course name
		records = self.filterByCourseName(angular.copy(records), courseName);
		// Filter by date range
		records = self.filterByDateRange(angular.copy(records), range);

		_.each(records, function(element, index, list){
			// trovo record con data uguale a element.Date
			var dayToAdd = $filter('date')(new Date(element.Date), 'dd/MM/yyyy');			
			var day = undefined;
			_.each(results, function(elem, idx, lst){
				if (elem.date == dayToAdd ){
					day = elem;
				}
			});
			if (day){
				// se esiste sommo valore
				day.total = day.total + parseFloat(element.YourRevenue);
			}else{
				// se non esiste inserisco il nuovo valore
				results.push({"date" : dayToAdd, "total" : parseFloat(element.YourRevenue)});
			}
		});
		return results;
	}
	
	// Sum all sales group by WEEK
	self.getTotalsByWeek = function(courseName, range){

		$log.debug("Entering the ReportService.getTotalsByWeek");

		var results = [],
			records = FirebaseService.get();

		// Filter by course name
		records = self.filterByCourseName(angular.copy(records), courseName);
		// Filter by date range
		records = self.filterByDateRange(angular.copy(records), range);

		_.each(records, function(element, index, list){			
			var weekToAdd = (new Date(element.Date).getWeekNumber()) + "-" + (new Date(element.Date)).getFullYear();			
			//$log.debug("weekToAdd typeof: " + typeof(weekToAdd) + " - value:", weekToAdd);	
			var day = undefined;
			
			_.each(results, function(elem, idx, lst){
				//$log.debug("Check match found for weekToAdd:" + weekToAdd +" elem: ", elem );
				if (elem.week === weekToAdd ){
					$log.debug("Match found ");
					day = elem;
				}		
			});
			if (day){
				// se esiste sommo valore
				day.total = day.total + parseFloat(element.YourRevenue);
			}else{
				// se non esiste inserisco il nuovo valore
				results.push({"week" : weekToAdd, "total" : parseFloat(element.YourRevenue)});
			}
		});

		$log.debug("ReportService.getTotalsByWeek  value:", results);
		return results;
	}
	

	self.getTotalsByDayOfWeek = function(courseName, range){
		var results = [];
		var records = FirebaseService.get();	
		
		//$log.debug("A - ReportService.getTotalsByDayOfWeek records length:", records.length);
		// Filter by course name		
		records = self.filterByCourseName(angular.copy(records), courseName);
		//$log.debug("B - ReportService.getTotalsByDayOfWeek records length:", records.length);
		// Filter by date range
		records = self.filterByDateRange(angular.copy(records), range);
		//$log.debug("C - ReportService.getTotalsByDayOfWeek records length:", records.length);
		
		_.each(records, function(element, index, list){
			// trovo record con ora uguale a element.Date
			var hourToAdd = $filter('date')(new Date(element.Date), 'EEEE');			
			var day = undefined;
			_.each(results, function(elem, idx, lst){
				if (elem.day == hourToAdd ){
					day = elem;
				}
			});
			if (day){
				// se esiste sommo valore
				day.total = day.total + parseFloat(element.YourRevenue);
			}else{
				// se non esiste inserisco il nuovo valore
				results.push({"day" : hourToAdd, "total" : parseFloat(element.YourRevenue)});
			}
		});	
		return _.sortBy(results, "total");
	};

	self.getTotalsByHourOfDay = function(courseName, range){
		var results = [];
		var records = FirebaseService.get();	
		
		//$log.debug("A - ReportService.getTotalsByHourOfDay records length:", records.length);
		// Filter by course name		
		records = self.filterByCourseName(angular.copy(records), courseName);
		//$log.debug("B - ReportService.getTotalsByHourOfDay records length:", records.length);
		// Filter by date range
		records = self.filterByDateRange(angular.copy(records), range);
		//$log.debug("C - ReportService.getTotalsByHourOfDay records length:", records.length);

		_.each(records, function(element, index, list){
			// trovo record con ora uguale a element.Date
			var hourToAdd = $filter('date')(new Date(element.Date), 'HH');			
			var day = undefined;
			_.each(results, function(elem, idx, lst){
				if (elem.hour == hourToAdd ){
					day = elem;
				}
			});
			if (day){
				// se esiste sommo valore
				day.total = day.total + parseFloat(element.YourRevenue);
			}else{
				// se non esiste inserisco il nuovo valore
				results.push({"hour" : hourToAdd, "total" : parseFloat(element.YourRevenue)});
			}
		});
		return _.sortBy(results, "hour");
	};

	self.getTotalsByPromotion = function(courseName, range){
		$log.debug("ReportService.getTotalsByPromotion called");
		var results = [],
			records = FirebaseService.get();
		
		//$log.debug("A - ReportService.getTotalsByPromotion records length:", records.length);
		// Filter by course name		
		records = self.filterByCourseName(angular.copy(records), courseName);
		//$log.debug("B - ReportService.getTotalsByPromotion records length:", records.length);
		// Filter by date range
		records = self.filterByDateRange(angular.copy(records), range);
		//$log.debug("C - ReportService.getTotalsByPromotion records length:", records.length);
				
		_.each(records, function(element, index, list){
			// trovo record con ora uguale a element.Date	
			var promotionCode = undefined;
			if (element.Channel == 'instructor'){
				var couponCode = element.CouponCode;
				//$log.debug("element is an instructor sale: ", couponCode);
				// se esiste sommo il valore
				var promo = _.findWhere(results, {promotion: couponCode});
				if (promo){
					// Promo esiste, sommo il totale
					promo.total = promo.total + parseFloat(element.YourRevenue);
					promo.cardinality = promo.cardinality +1;
				}else{
					// Promo non esiste, inserisco
					results.push({"promotion" : couponCode, "total" : parseFloat(element.YourRevenue), cardinality: 1});
				}
			}
		});
		return _.sortBy(results, "promotion");
	};

	// Fine FACTORY
	return self;	
}]);	