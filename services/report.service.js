
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

	// Fine FACTORY
	return self;	
}]);