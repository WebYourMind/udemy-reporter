angular.module('myApp')

.factory('ParserService', ['$log', '$filter', function($log, $filter){
	var self = {};	

	var _sections = [
		{	"startLabel" : "Your total earnings", 
			"firstRow": "-1", 
			"lastRow": "-1", 	
			"columns" : ["Revenue Channel","Earnings"], 
			"coursenameposition" : 0 
		},{
			"startLabel" : "Your promotion activity", 	
			"firstRow": "-1", 
			"lastRow": "-1", 	
			"columns" : ["Coupon Code","Earnings"], 
			"coursenameposition" : 0  
		},{
			"startLabel" : "Your earnings by course", 	
			"firstRow": "-1", 
			"lastRow": "-1", 	
			"columns" : ["Course Title","Earnings"],
			"coursenameposition" : 0  
		},{
			"startLabel" : "Sales", 
			"firstRow": "-1", 
			"lastRow": "-1", 	
			"columns" : ["Transaction Id", 
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
						 "Exchange Rate"], 
			"coursenameposition" : 3  
		},{	
			"startLabel" : "Redemptions", 	
			"firstRow": "-1", 
			"lastRow": "-1",	
			"columns" : ["Split Id","Transaction Date","User Name","Course Name","Coupon Code"], 
			"coursenameposition" : 3  
		},{
			"startLabel" : "Refunds", 
			"firstRow": "-1", 
			"lastRow": "-1",	
			"columns" : ["Refund Date","User Name","Course Name","Refund Amount","Instructor Refund Amount"], 
			"coursenameposition" : 2  
		}
	];

	self.parse = function(text){
		var lines = text.split('\n');
		var sections = angular.copy(_sections)
		var startLabels = ["Your total earnings", "Your earnings by course", "Your promotion activity", "Sales", "Redemptions", "Refunds"];
		var line=0;

		console.log("text=", text);

		for(line=0; line < lines.length; line++){
			if(_.contains(startLabels, lines[line])){
				var section = _.findWhere(sections, { startLabel: lines[line] });			
				section.firstRow = line;
				//$log.debug("Set section ["+ section.startLabel +"] firstRow at line ["+ section.firstRow +"]");
			}
		}
		// Set the last row of the last section
		sections[sections.length-1].lastRow = line;	

		// Remove missing sections not present in the CSV file
		sections = _.reject(sections, function(section){ 
			return section.firstRow == -1; 
		});

		// set the last line. Exclude the last entry because value already set
		for (var k=0; k<sections.length -1; k++) {
			sections[k].lastRow = sections[k+1].firstRow;
		  	// Debug
		  	//$log.debug("Section start/end row: ", [sections[k].startLabel, sections[k].firstRow, sections[k].lastRow, sections[k+1].startLabel, sections[k+1].firstRow, sections[k+1].lastRow]);
		}

		// Couple column names with values
		for(line=0; line<sections.length; line++){		
			sections[line].data = _.compact(lines.slice(sections[line].firstRow + 2, sections[line].lastRow));
			sections[line].json = self.getJson(sections[line]);			
		}	
		return sections;
	}

	self.getJson = function(section){
		//$log.debug("section.data.length: ", section.data.length);
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
				$log.warn("Attention invalid number of cells ["+cells.length+"] vs ["+section.columns.length+"] in ["+section.startLabel+ "]. ");
				var numberOfCellToRemove = cells.length - section.columns.length;
				
				// Following insruction should be improved because at the moment it merges only 2 cells but they could be much more than 1
				cells[section.coursenameposition] = cells[section.coursenameposition] +"," + cells[section.coursenameposition+1] ;
				
				// Remove the exceeding cells
				var index = section.coursenameposition;
				cells.splice(index+1, numberOfCellToRemove);
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
	