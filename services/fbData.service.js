angular.module('myApp')
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

	self.saveSections = function(sections, uid){	
		_.each(sections, function(section, index, list){
			$log.debug("FirebaseService.saveSections - Try to save section:", section.startLabel)
			self.saveSection(section, uid)
		})
	}

	self.saveSection = function(section, uid){	
		// process the section name
		var sectionName = section.startLabel.toLowerCase().replace(/ /g,'')		
		//$log.debug("FirebaseService.saveSection - saving section: ", [sectionName, section.json])
		var records = self.get(sectionName)
		_.each(section.json, function(rec, index, list){
			// add to the firebase 
			records.$add(rec)
		})
	}

	self.get = function(section){
		if (section === undefined ){
			section = 'sales';
		}
		$log.debug("FirebaseService.get section is:", section);
		
		if (self.uid === undefined ){
			$log.debug("FirebaseService.get uid is undefined:", self.uid);
			self.uid = UserAuthentication.getUid();
			$log.debug("FirebaseService.get get the uid:", self.uid);
		}else{
			$log.debug("FirebaseService.get uid is defined:", self.uid);
		}

		//if (self.records == undefined && self.uid != undefined){
			//$log.debug("FirebaseService.get [self.records] is undefined: get the values");
			var endPoint = FBEndPoint;
			var ref = new Firebase(endPoint);
			self.records = $firebaseArray(ref.child(self.uid).child(section));			
			return self.records;
		//}else {
			//$log.debug("FirebaseService.get [self.records] is defined: use the values");
		//	return self.records;
		//}
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
