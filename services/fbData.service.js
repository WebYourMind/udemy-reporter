angular.module('myApp')
.factory('FirebaseService', ['$http', '$q', '$log', '$filter', '$firebaseArray', 'FBEndPoint', 'Auth', 
					function($http, $q, $log, $filter, $firebaseArray, FBEndPoint, Auth){
	var self = {};
	self.records = undefined;
	//self.uid = undefined;

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
		console.log("FirebaseService.get section is:", section);
		
		if (self.uid === undefined ){
			self.uid = Auth.$getAuth().uid;
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
		var records = self.get('sales'),	
			courses = [],
			finalCourses = [];
		finalCourses.push({"name": 'All', "value" : 'All'});
		_.each(records, function(element, index, list){
			if (_.indexOf(courses, element['Course Name'])<0){
				courses.push(element['Course Name']);				
				finalCourses.push({"name": element['Course Name'], "value" : element['Course Name']});
			}
		});
		return finalCourses;
	}	
	// FACTORY END
	return self;	
}])	
