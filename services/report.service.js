
angular.module('myApp')
.factory('ReportService', ['$log', '$filter', '$rootScope', 'FirebaseService', function($log, $filter, $rootScope, FirebaseService){
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
			records = FirebaseService.get('sales');
		
		// Filter by course name
		//records = self.filterByCourseName(angular.copy(records), courseName);
		// Filter by date range
		//records = self.filterByDateRange(angular.copy(records), range);	
		records.$loaded().then(function(){
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
			$rootScope.$emit( reportName, results );
			return results;	
				
		})
	}

	// Sum all sales group by DAY
	self.ByDay = function(records){
		var results = [];

		_.each(records, function(element, index, list){
			// trovo record con data uguale a element.Date
			var dayToAdd = $filter('date')(new Date(element["Formatted Date"]), 'dd/MM/yyyy');			
			var day;// = undefined;
			_.each(results, function(elem, idx, lst){
				if (elem.date == dayToAdd ){
					day = elem;
				}
			});
			if (day){
				// se esiste sommo valore
				day.total = day.total + parseFloat(element["Instructor Share"]);
			}else{				
				//var tmp = dayToAdd.split('/')
				var orderByDate = $filter('date')(new Date(element["Formatted Date"]), 'yyyyMMdd');	//tmp[2] + (tmp[1].length == 1 ? '0' + tmp[1] : tmp[1]) + (tmp[0].length == 1 ?  '0' + tmp[0] : tmp[0]);
				// se non esiste inserisco il nuovo valore
				results.push({	"date" : dayToAdd, 
								"orderByDate" : orderByDate,
								"total" : parseFloat(element["Instructor Share"])});
			}
		});
		results = _.sortBy(results, "orderByDate");
		return results;
	}

	// Sum all sales group by WEEK of the YEAR
	self.ByWeek = function(records){
		var results = [];

		_.each(records, function(element, index, list){			
			var pad = '00',
				weekToAdd = (new Date(element["Formatted Date"])).getFullYear()  
							+ (pad + (new Date(element["Formatted Date"]).getWeekNumber())).slice(-pad.length),
				week;// = undefined;
			
			_.each(results, function(elem, idx, lst){
				//$log.debug("Check match found for weekToAdd:" + weekToAdd +" elem: ", elem );
				if (elem.week === weekToAdd ){
					week = elem;
				}		
			});
			if (week){
				// se esiste sommo valore
				week.total = week.total + parseFloat(element["Instructor Share"]);
			}else{
				// se non esiste inserisco il nuovo valore
				results.push({"week" : weekToAdd, "total" : parseFloat(element["Instructor Share"])});
			}
		});
		$log.debug("ReportService.getTotalsByWeek  value:", results);
		//return _.sortBy(results, "week");
	}

	self.ByDayOfWeek = function(records){
		var results = [];	
		_.each(records, function(element, index, list){
			// trovo record con ora uguale a element.Date
			var hourToAdd = $filter('date')(new Date(element["Formatted Date"]), 'EEEE');			
			var day;// = undefined;
			_.each(results, function(elem, idx, lst){
				if (elem.day == hourToAdd ){
					day = elem;
				}
			});
			if (day){
				// se esiste sommo valore
				day.total = day.total + parseFloat(element["Instructor Share"]);
			}else{
				// se non esiste inserisco il nuovo valore
				results.push({"day" : hourToAdd, "total" : parseFloat(element["Instructor Share"])});
			}
		});	
		return _.sortBy(results, "total");
	};

	self.ByHourOfDay = function(records){
		var results = [];	
		_.each(records, function(element, index, list){
			// trovo record con ora uguale a element.Date
			var hourToAdd = $filter('date')(new Date(element.Date), 'HH');			
			var day;// = undefined;
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
	
	// Handle the Promotion report
	self.getPromotions = function(){
		var results = [],
			records = FirebaseService.get('yourpromotionactivity');
		records.$loaded().then(function(){
			$log.debug("ReportService.getPromotions $loaded");
			results = self.ByPromotion(records);
			$rootScope.$emit( "ByPromotion", results );
			return results;				
		})
	}

	self.ByPromotion = function(records){
		$log.debug("ReportService.ByPromotion called");
		var results = [];	
		_.each(records, function(element, index, list){
			var couponCode = element['Coupon Code'];
			var rec = _.find(results, function(rec){ return rec.promotion === couponCode; });
			if ( rec == undefined ){
				results.push({"promotion" : couponCode, "total" : parseFloat(element.Earnings), cardinality: 1});
			}else{
				rec.total = rec.total + parseFloat(element.Earnings);
			}
		});
		return _.sortBy(results, "promotion");
	};

	// Handle the Earnings by course report
	self.getEarinigsByCourse = function(){
		var results = [],
			records = FirebaseService.get('yourearningsbycourse');
		records.$loaded().then(function(){
			$log.debug("ReportService.getEarinigsByCourse $loaded");
			results = self.ByCourse(records);
			$rootScope.$emit( "ByCourse", results );
			return results;				
		})
	}

	self.ByCourse = function(records){
		$log.debug("ReportService.ByCourse called");
		var results = [];	
		_.each(records, function(element, index, list){
			var courseTitle = element['Course Title'];
			var rec = _.find(results, function(rec1){ return rec1.coursetitle === courseTitle; });
			if ( rec == undefined ){
				results.push({"coursetitle" : courseTitle, "total" : parseFloat(element.Earnings), cardinality: 1});
			}else{
				rec.total = rec.total + parseFloat(element.Earnings);
			}
		});
		return _.sortBy(results, "coursetitle");
	};

	// Handle the Total Earnings report
	self.getTotalEarnings = function(){
		var results = [],
			records = FirebaseService.get('yourtotalearnings');
		records.$loaded().then(function(){
			$log.debug("ReportService.getTotalEarinigs $loaded");
			results = self.ByTotalEarnings(records);
			$rootScope.$emit( "TotalEarnings", results );
			return true;				
		})
	}

	self.ByTotalEarnings = function(records){
		$log.debug("ReportService.TotalEarinigs called");
		var results = [];	
		_.each(records, function(element, index, list){
			var revenueChannel = element['Revenue Channel'];
			var rec = _.find(results, function(rec1){ return rec1.revenuechannel === revenueChannel; });
			if (rec == undefined){
				results.push({"revenuechannel" : revenueChannel, "total" : parseFloat(element.Earnings), cardinality: 1});
			}else{
				rec.total = rec.total + parseFloat(element.Earnings);
			}
		});
		return _.sortBy(results, "revenuechannel");
	};	
	// Fine FACTORY
	return self;	
}]);