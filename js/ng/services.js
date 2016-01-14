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

.factory('FirebaseService', ['$http', '$q', '$log', '$firebaseArray', 'FBEndPoint', function($http, $q, $log, $firebaseArray, FBEndPoint){
	var self = {};
	self.records = undefined;
		
	self.save = function(recs){	
		var addedRecords = 0;
		var records = self.get();		
		var lastTransactionId = self.getLastTransactionId(records);
		recs.reverse();
		_.each(recs, function(element, index, list){
			if (element['"Transaction Id"'] > lastTransactionId){
				records.$add({
					"TransactionId" : element['"Transaction Id"'],
					"Date"			: element.Date.replace(/"/g,""),
					"CustomerName"	: element['"Customer Name"'].replace(/"/g,""),
					"Course"		: element.Course.replace(/"/g,""),
					"CouponCode"	: element['"Coupon Code"'].replace(/"/g,""),
					"Channel"		: element.Channel.replace(/"/g,""),
					"Platform"		: element.Platform.replace(/"/g,""),
					"PricePaid"		: element['"Price Paid"'].replace(/"/g,""),
					"Currency"		: element.Currency.replace(/"/g,""),
					"TaxAmount"		: element['"Tax Amount"'].replace(/"/g,""),
					"NetAmount"		: element['"Net Amount(USD)"'].replace(/"/g,""),
					/* ATTENTION: at the moment UDEMY's CSV has some issue and to temporary fix the problem we use the Net Amout as Revenue */
					"YourRevenue"	: element['"Net Amount(USD)"'].replace(/"/g,""), //element['"Your Revenue"'].replace(/"/g,""),
					"TaxRate"		: element['"Tax Rate"'].replace(/"/g,""),
					"ExchangeRate"	: element['"Exchange Rate"'].replace(/"/g,"")
				});
				addedRecords++;
			}
		});
	return addedRecords;
	}

	self.get = function(){
		$log.debug("FirebaseService.get called");
		if (self.records == undefined){
			//$log.debug("FirebaseService.get [self.records] is undefined: get the values");
			var ref = new Firebase(FBEndPoint);
			self.records = $firebaseArray(ref);			
			return self.records;
		}else {
			$log.debug("FirebaseService.get [self.records] is defined: use the values");
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
		$log.debug("ReportService.filterByDateRange range length ["+records.length+"]");
		
		var filtered = [],
			fromDate = $filter('date')(new Date('2010/01/01'), 'yyyyMMdd'),
			toDate = $filter('date')(new Date(), 'yyyyMMdd');

		//$log.debug("ReportService.filterByDateRange fromDate ["+fromDate+"] toDate ["+toDate+"]");		
		if (angular.isDefined(range)){
			$log.debug("ReportService.filterByDateRange range:", range);
			if (angular.isDefined(range.fromDate)){
				//$log.debug("ReportService.filterByDateRange range.fromDate ["+range.fromDate+"]");				
				fromDate = $filter('date')(new Date(range.fromDate), 'yyyyMMdd');
				$log.debug("ReportService.filterByDateRange fromDate ["+fromDate+"]");
			}
			if(range.toDate){
				//$log.debug("ReportService.filterByDateRange range.toDate ["+range.toDate+"]");
				toDate = $filter('date')(new Date(range.toDate), 'yyyyMMdd');
				$log.debug("ReportService.filterByDateRange toDate ["+toDate+"]");
			}
			_.each(records, function(elem, idx, lst){
				var dateToCheck = $filter('date')(new Date(elem.Date), 'yyyyMMdd');
				$log.debug("ReportService.filterByDateRange checking if ["+dateToCheck+"] is between ["+fromDate+"] and ["+toDate+"]" );
				if (dateToCheck >= fromDate && dateToCheck <= toDate ){
					filtered.push(elem);
				}
			});

		}else{
			$log.debug("ReportService.filterByDateRange range not defined");
			filtered = records;
		}	

		return filtered;
	}

	// Sum all sales group by DATE
	self.getTotalsByDay = function(courseName, range){
		$log.debug("ReportService.getTotalsByDay Filter by ["+courseName+"] and date range: ", range);
		var results = [],
			records = FirebaseService.get();

		records = self.filterByCourseName(angular.copy(records), courseName);
		$log.debug("ReportService.getTotalsByDay Filter by name ["+courseName+"]: ", records.length);

		records = self.filterByDateRange(angular.copy(records), range);
		$log.debug("ReportService.getTotalsByDay Filter by range: ", records.length);

		_.each(records, function(element, index, list){
			// trovo record con data uguale a element.Date
			var dayToAdd = $filter('date')(new Date(element.Date), 'yyyy/MM/dd');
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
				//var total = parseFloat(element.YourRevenue);
				//console.log("Prova 1: ", total);
				//console.log("Prova 2: ", total.toFixed(2));
				results.push({"date" : dayToAdd, "total" : parseFloat(element.YourRevenue)});
			}
		});
		return results;
	}
	
	self.getTotalsByDayOfWeek = function(){
		var results = [];
		var records = FirebaseService.get();	
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

	self.getTotalsByHourOfDay = function(){
		var results = [];
		var records = FirebaseService.get();	
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

	self.getTotalsByPromotion = function(){
		$log.debug("ReportService.getTotalsByPromotion called");
		var results = [],
			records = FirebaseService.get();	
		//$log.debug("ReportService.getTotalsByPromotion element in the records array: ", records.length);

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