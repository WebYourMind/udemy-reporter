angular.module('myApp')

// let's create a re-usable factory that generates the $firebaseAuth instance
.factory("Auth", ['$firebaseAuth', 'FBEndPoint', function($firebaseAuth, FBEndPoint) {
    var ref = new Firebase(FBEndPoint);
    return $firebaseAuth(ref);
  }
]) 

.factory("UserAuthentication", ['$log', '$firebaseAuth', 'FBEndPoint', '$state', function($log, $firebaseAuth, FBEndPoint, $state) {
	var self = {};
	//self.uid = undefined;

   	self.login = function(email, password, rememberme) {
	   	$log.debug("UserAuthentication.login params: ", [email, password, rememberme]);
	
		var ref = new Firebase(FBEndPoint),
    		auth = $firebaseAuth(ref);

		auth.$authWithPassword({
		  email: email,
		  password: password
		}).then(function(authData) {
		  $log.debug("Logged in as:", authData);
		  self.uid = authData.uid;
		  $state.go("main.load-csv-file");
		}).catch(function(error) {
		  $log.debug("Authentication failed:", error);
		});

    };

    self.getUid = function(){
    	return self.uid;
    }
    // Factory END
    return self;
 }])

.factory('FirebaseService', ['$http', '$q', '$log', '$filter', '$firebaseArray', 'FBEndPoint', 'UserAuthentication', function($http, $q, $log, $filter, $firebaseArray, FBEndPoint, UserAuthentication){
	var self = {};
	self.records = undefined;
	//self.uid = undefined;

	self.save = function(recs, uid){	
		self.uid = uid;
		var addedRecords = 0,
			alreadyAddedRecords = 0,
			records = self.get(uid),		
			lastTransactionId = self.getLastTransactionId(records);

		recs.reverse();
		_.each(recs, function(element, index, list){
			var currentTransactionId = element['Transaction Id'];
			if (currentTransactionId > lastTransactionId){
				try{
					records.$add({
						"TransactionId" : element['Transaction Id'],
						"Date"			: $filter('date')(new Date(element['Formatted Date'].replace(/"/g,"")), 'MM/dd/yyyy HH:mm:ss'),
						"CustomerName"	: element['User Name'].replace(/"/g,""),
						"Course"		: element['Course Name'].replace(/"/g,""),
						"CouponCode"	: element['Coupon Code'].replace(/"/g,""),
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
			}catch(e){
				$log.error("An exception raised: ", e);
			}
			}else{				
				alreadyAddedRecords++;
			}
		});
		$log.debug("FirebaseService.save loaded records ["+addedRecords+"]/discarded records (already processed) ["+alreadyAddedRecords+"]");
		return addedRecords;
	}

	self.get = function(){
		if (self.uid === undefined ){
			$log.debug("FirebaseService.get uid is undefined:", self.uid);
			self.uid = UserAuthentication.getUid();
		}else{
			$log.debug("FirebaseService.get uid is defined:", self.uid);
		}
		if (self.records == undefined && self.uid != undefined){
			//$log.debug("FirebaseService.get [self.records] is undefined: get the values");
			var endPoint = FBEndPoint + self.uid + "/" + "sales/";
			$log.debug("FirebaseService.get endPoint:", endPoint);
			var ref = new Firebase(endPoint);
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
}])	

.factory('ParserService', ['$log', '$filter', function($log, $filter){
	var self = {};	

	var sections = [
		{"startLabel" : "Your total earnings", 		"firstRow": "-1", "lastRow": "-1", 	"columns" : ["Revenue Channel","Earnings"], "coursenameposition" : 0 },
		{"startLabel" : "Your earnings by course", 	"firstRow": "-1", "lastRow": "-1", 	"columns" : ["Course Title","Earnings"], "coursenameposition" : 0  },
		{"startLabel" : "Your promotion activity", 	"firstRow": "-1", "lastRow": "-1", 	"columns" : ["Coupon Code","Earnings"] },
		{"startLabel" : "Sales", 	"firstRow": "-1", "lastRow": "-1", 	"columns" : ["Transaction Id", 
																					 "Formatted Date", 
																					 "User Name",
																					 "Course Name",
																					 "Coupon Code",
																					 "Revenue Channel",
																					 "Vendor",
																					 "Paid Price",
																					 "Transaction Currency",
																					 "Tax Amount",
																					 "Store Fee",
																					 "Share Price",
																					 "Instructor Share",
																					 "Tax Rate",
																					 "Exchange Rate"], "coursenameposition" : 3  },
		{"startLabel" : "Redemptions", 	"firstRow": "-1", "lastRow": "-1",	"columns" : ["Split Id","Transaction Date","User Name","Course Name","Coupon Code"], "coursenameposition" : 3  },
		{"startLabel" : "Refunds",  "firstRow": "-1", "lastRow": "-1",	"columns" : ["Refund Date","User Name","Course Name","Refund Amount","Instructor Refund Amount"], "coursenameposition" : 2  }
	];

	self.parse = function(text){
		var lines = text.split('\n'),
			sectionNumber = sections.length,
			currentSection = 0;

		for(var line=0; line < lines.length; line++){
			if (lines[line] == sections[0].startLabel){
				//$log.debug("Found section " + sections[0].startLabel + " at line: " +line);
				sections[0].firstRow = line;
			}else if (lines[line] == sections[1].startLabel){
				//$log.debug("Found section " + sections[1].startLabel + " at line: " +line);
				sections[0].lastRow = line;
				sections[1].firstRow = line;
			}else if (lines[line] == sections[2].startLabel){
				//$log.debug("Found section " + sections[2].startLabel + " at line: " +line);
				sections[1].lastRow = line;
				sections[2].firstRow = line;
			}else if (lines[line] == sections[3].startLabel){
				//$log.debug("Found section " + sections[3].startLabel + " at line: " +line);
				sections[2].lastRow = line;
				sections[3].firstRow = line;
			}else if (lines[line] == sections[4].startLabel){
				//$log.debug("Found section " + sections[4].startLabel + " at line: " +line);
				sections[3].lastRow = line;
				sections[4].firstRow = line;
			}else if (lines[line] == sections[5].startLabel){
				//$log.debug("Found section " + sections[5].startLabel + " at line: " +line);
				sections[4].lastRow = line;
				sections[5].firstRow = line;
			}
		}
		sections[5].lastRow = line;	

		for(line=0; line<sections.length; line++){
			//$log.debug("Section [" + sections[line].startLabel + "] starts at line " + sections[line].firstRow + " and ends at line: " + sections[line].lastRow);
			sections[line].data = _.compact(lines.slice(sections[line].firstRow + 2, sections[line].lastRow));
			//$log.debug("Section data: ", sections[line].data);
			//$log.debug("---------------------------------------------------------------------------");
			sections[line].json = self.getJson(sections[line]);			
		}	
		//$log.debug("Risultato jasonizzazione: ", sections);	
		return sections;
	}

	self.getJson = function(section){
		$log.debug("section.data.length: ", section.data.length);
		var json = [],
			table = section.data;

		for(var i = 0; i< table.length; i++){
			var tableRow = table[i];

			// Clean up from the crap
			tableRow = tableRow.replace(/\r/g, "");
			tableRow = tableRow.replace(/\"/g, "");
			tableRow = tableRow.replace(/" /g, "\"");

			// Split the row in cells
			var cells = tableRow.split(","),			
				obj = {};

			// Check coherence between cardinality of columns and values
			if (cells.length != section.columns.length){
				$log.warn("Attention invalid number of cells ["+cells.length+"] vs ["+section.columns.length+"]");
				var offset = cells.length - section.columns.length;
				// Following insruction should be improved because at the moment it merges only 2 cells but they could be much more than 1
				cells[section.coursenameposition] = cells[section.coursenameposition] +", " + cells[section.coursenameposition]+1 ;
				// Remove the exceeding merged cells
				cells = cells.slice(section.coursenameposition+1, offset);

			}
			// Couple column names with values
			for (var k = 0; k < section.columns.length;k++) {
			   obj[section.columns[k]] = cells[k];
			}

			// The JSON.parse is required because JSON.stringify escapes doublequotes with backslash
			json.push(JSON.parse(JSON.stringify(obj)));
		}

		return json;
	}

	// Fine FACTORY
	return self;
}])

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

	self.getSaleTotals = function(reportName, courseName, range){
		var results = [],
			records = FirebaseService.get();

		// Filter by course name
		records = self.filterByCourseName(angular.copy(records), courseName);
		// Filter by date range
		records = self.filterByDateRange(angular.copy(records), range);	

		if (reportName == 'ByDay'){
			results = self.ByDay(records);
		}else if(reportName == 'ByWeek'){
			results = self.ByWeek(records);
		}else if(reportName == 'ByDayOfWeek'){
			results = self.ByDayOfWeek(records);
		}else if(reportName == 'ByHourOfDay'){
			results = self.ByHourOfDay(records);
		}else if(reportName == 'ByPromotion'){
			results = self.ByPromotion(records);
		}else{
			$log.error("Report ["+reportName+"] not yet implemented");
		}

		return results;
	}

	// Sum all sales group by DAY
	self.ByDay = function(records){
		var results = [];

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

	// Sum all sales group by WEEK of the YEAR
	self.ByWeek = function(records){
		var results = [];

		_.each(records, function(element, index, list){			
			var pad = '00',
				weekToAdd = (new Date(element.Date)).getFullYear() + "-" + (pad + (new Date(element.Date).getWeekNumber())).slice(-pad.length),
				day = undefined;
			
			_.each(results, function(elem, idx, lst){
				//$log.debug("Check match found for weekToAdd:" + weekToAdd +" elem: ", elem );
				if (elem.week === weekToAdd ){
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
		return _.sortBy(results, "week");
	}

	self.ByDayOfWeek = function(records){
		var results = [];	
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

	self.ByHourOfDay = function(records){
		var results = [];	
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
	
	self.ByPromotion = function(records){
		$log.debug("ReportService.getTotalsByPromotion called");
		var results = [];	
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
/*
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
	
	// Sum all sales group by WEEK of the YEAR
	self.getTotalsByWeek = function(courseName, range){

		$log.debug("Entering the ReportService.getTotalsByWeek");

		var results = [],
			records = FirebaseService.get();

		// Filter by course name
		if (courseName)
			records = self.filterByCourseName(angular.copy(records), courseName);
		// Filter by date range
		if(range)
			records = self.filterByDateRange(angular.copy(records), range);

		_.each(records, function(element, index, list){			
			var pad = '00',
				weekToAdd = (new Date(element.Date)).getFullYear() + "-" + (pad + (new Date(element.Date).getWeekNumber())).slice(-pad.length),
				day = undefined;
			
			_.each(results, function(elem, idx, lst){
				//$log.debug("Check match found for weekToAdd:" + weekToAdd +" elem: ", elem );
				if (elem.week === weekToAdd ){
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
		// sort by week
		// TODO
		$log.debug("ReportService.getTotalsByWeek  value:", results);
		return _.sortBy(results, "week");
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
*/
	// Fine FACTORY
	return self;	
}]);	