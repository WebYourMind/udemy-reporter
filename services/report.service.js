
angular.module('myApp')
.factory('ReportService', ['$log', '$filter', '$rootScope', 'FirebaseService', function($log, $filter, $rootScope, FirebaseService){
	var self = {};	
	self.courseList = [];
	


	// Get the courses list 
	// Attention: At the moment the function works with sales firebase branch only	
	self.getCourseList = function(){
		return self.courseList;
	}
	// Prepare the courses list 
	// @param records The sales firebase object
	// Attention: At the moment the function works with sales firebase branch only	
	self.filterCourseList = function(records){	
		var	courses = [],
			finalCourses = [];
		finalCourses.push({"name": 'All', "value" : 'All'});
		_.each(records, function(element, index, list){
			if (_.indexOf(courses, element['Course Name'])<0){
				courses.push(element['Course Name']);				
				finalCourses.push({"name": element['Course Name'], "value" : element['Course Name']});
			}
		});
		self.courseList = finalCourses;
	};	

	self.filterByCourseName = function(records, courseName){
		if(courseName && courseName != 'All'){
			records = _.filter(records, function(elem){ return elem['Course Name'] == courseName});
		}
		return records;
	};

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
	};

	self.getSaleTotals = function(reportName, courseName, range){
		var results = [],
			records = FirebaseService.get('sales');
			
		records.$loaded().then(function(){
			// Filter by course name
			//records = self.filterByCourseName(angular.copy(records), courseName);
			// Filter by date range
			//records = self.filterByDateRange(angular.copy(records), range);
			switch (reportName){
				case 'ByDay':
					results = self.ByDay(records);
					break;
				case 'ByWeek':
					results = self.ByWeek(records);
					break;
				case 'ByDayOfWeek':
					results = self.ByDayOfWeek(records);
					break;
				case 'ByPromotion':
					results = self.ByPromotion(records);
					break;
				default:
					$log.error("Report ["+reportName+"] not yet implemented");
			}
			if (self.courseList.length == 0)
				self.filterCourseList(records);

			$rootScope.$emit( reportName, results );
			return results;					
		})
	},



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
	};

	// Handle the Earnings by course report
	self.getEarningsByCourse = function(){
		var results = [],
			records = FirebaseService.get('yourearningsbycourse');
		records.$loaded().then(function(){
			$log.debug("ReportService.getEarningsByCourse $loaded");
			results = self.ByCourse(records);
			$rootScope.$emit( "ByCourse", results );
			return results;				
		})
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
	};

	///
	// Done. New function name: ByChannel
	// 
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
	///
	// Done. New function name: ByCourseTitle
	// 
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
	///
	// Done. New function name: ByCouponCode
	// 
	self.ByPromotion = function(records){
		$log.debug("ReportService.ByPromotion called");
		var results = [];	
		_.each(records, function(element, index, list){
			var couponCode = element['Coupon Code'];
			var rec = _.find(results, function(rec){ return rec.promotion === couponCode; });
			if ( rec == undefined ){
				results.push({"x" : couponCode, "y" : parseFloat(element.Earnings), cardinality: 1});
			}else{
				rec.total = rec.y + parseFloat(element.Earnings);
			}
		});
		return _.sortBy(results, "promotion");
	};
	///
	// Done. New function name: ByDayOfTheWeek
	// 
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

	// Sum all sales group by WEEK of the YEAR
	///
	// Done. New function name: ByWeekOfTheYear
	//  
	self.ByWeek = function(records){
		var results = [];

		_.each(records, function(element, index, list){
		            
           var weekToAdd = ($filter('date')(new Date(element["Formatted Date"]),'yyyyww')),
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
		return _.sortBy(results, "week");
	};
	///
	// Done. New function name: getByDayData
	// 	
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
	};


	//////////////////////////////////////
	/// Metodi sperimentali 
	//////////////////////////////////////

	/**
	 * Given the report name returns the database section containings the required data. Used to properly retrive data from Firebase
	 * 
	 * @function getSectionName
	 * @param  {String} reportName - The report name
	 * @return {String} sectionName - The branch of the DB to be retrieved 
	 */	
	self.getSectionName = function(reportName) {
        var sectionName = "sales";
        switch(reportName){
            case "DailyEarnings":
            case "CourseTitleEarnings":
            case "DayOfTheWeekEarnings":
            case "WeekOfTheYearEarnings":
            case "ChannelEarnings":
                sectionName = "sales";
                break;            
            case "PromotionEarnings":
                sectionName = "yourpromotionactivity";
                break;            
            default:
                sectionName = "sales";
                console.warn("ReportService.getSection - unmanaged report [%s]", reportName);
        }	
        return 	sectionName;
	};
	
	/**
	 * 
	 * @function getByDayData
	 * @param  {Array} data - The full JSON array of data from Firebase
	 * @return {Array} aggregate - The JSON array containings the aggregated data 
	 */
	self.getByDayData = function(data) {
        console.log("ReportService.getByDayData called");
        var aggregatedData = [];
		
		data.forEach(function(e, i){
			var day,
				dayToAdd = $filter('date')(new Date(e["Formatted Date"]), 'MM/dd/yyyy');	

			// 
			aggregatedData.forEach(function(elem,k){
				if (elem.date == dayToAdd ){
					day = elem;
				}
			});

			if (day){
				// se esiste sommo valore
				day.total = day.total + parseFloat(e["Instructor Share"]);
			}else{				
				var orderByDate = $filter('date')(new Date(e["Formatted Date"]), 'yyyyMMdd');	
				// se non esiste inserisco il nuovo valore
				aggregatedData.push({	"date" : 		dayToAdd, 
										"orderByDate" : orderByDate,
										"total" : 		parseFloat(e["Instructor Share"])}
									);
			}

		});
		return _.sortBy(aggregatedData, "orderByDate");
	};

	/**
	 * 
	 * @function ByDayOfTheWeek
	 * @param  {Array} records - The full JSON array of data from Firebase
	 * @return {Array} aggregate - The JSON array containings the aggregated data 
	 */
	self.ByDayOfTheWeek = function(records){
		var xFiledName = "Formatted Date",
			yFieldName = "Instructor Share";

		var results = [];	
		records.forEach(function(element, index){
			var dayToAdd = $filter('date')(new Date(element[xFiledName]), 'EEEE');			
			// Search among results array for the "day of the week"
			var day = _.find(results, function(day){ return day.x === dayToAdd; });
			if ( day === undefined ){
				results.push({"x" : dayToAdd, "y" : Math.round(parseFloat(element[yFieldName]))});
			}else{
				day.y = day.y + Math.round(parseFloat(element[yFieldName]));
			}
		});	
		return _.sortBy(results, "y");
	};

	/**
	 * 
	 * @function ByWeekOfTheYear
	 * @param  {Array} records - The full JSON array of data from Firebase
	 * @return {Array} aggregate - The JSON array containings the aggregated data 
	 */
	self.ByWeekOfTheYear = function(records){
		var xFiledName = "Formatted Date",
			yFieldName = "Instructor Share",
			results = [];	

		records.forEach(function(element, index){
			var weekToAdd = $filter('date')(new Date(element[xFiledName]), 'yyyyww');			
			// Search among results array for the "day of the week"
			var week = _.find(results, function(week){ return week.x === weekToAdd; });
			if ( week === undefined ){
				results.push({"x" : weekToAdd, "y" : Math.round(parseFloat(element[yFieldName]))});
			}else{
				week.y = week.y + Math.round(parseFloat(element[yFieldName]));
			}
		});	
		return _.sortBy(results, "x");
	};

	/**
	 * 
	 * @function ByCouponCode
	 * @param  {Array} records - The full JSON array of data from Firebase
	 * @return {Array} aggregate - The JSON array containings the aggregated data 
	 */
	self.ByCouponCode = function(records){
		//console.debug("ReportService.ByCouponCode called");
		var xFieldName = "Coupon Code",
			yFieldName = "Earnings",
			results = [];	
		records.forEach(function(element, index){
			var couponCode = element[xFieldName];
			var rec = _.find(results, function(rec){ return rec.x === couponCode; });
			if ( rec === undefined ){
				results.push({"x" : couponCode, "y" : parseFloat(element[yFieldName])});
			}else{
				rec.y = rec.y + parseFloat(element[yFieldName]);
			}
		});
		return _.sortBy(results, "y");
	};

	/**
	 * 
	 * @function ByChannel
	 * @param  {Array} records - The full JSON array of data from Firebase
	 * @return {Array} aggregate - The JSON array containings the aggregated data 
	 */
	self.ByChannel = function(records){
		var xFieldName = "Revenue Channel",
			yFieldName = "Instructor Share",		
			results = [];	

		records.forEach(function(element, index){
			//console.log("Element: ", element);
			var revenueChannel = element[xFieldName];
			var rec = _.find(results, function(rec1){ return rec1.x === revenueChannel; });
			if (rec === undefined){
				results.push({"x" : revenueChannel, "y" : parseFloat(element[yFieldName]) });
				//console.log("revenueChannel [%s] not exists element[yFieldName] [%s](%s)", revenueChannel, element[yFieldName], typeof(element[yFieldName]));
			}else{
				//console.log("revenueChannel [%s] exists element[yFieldName] [%s](%s)", revenueChannel, element[yFieldName], typeof(element[yFieldName]));
				rec.y = rec.y + parseFloat(element[yFieldName]);
			}
		});
		return _.sortBy(results, "y");
	};	

	/**
	 * 
	 * @function ByCourseTitle
	 * @param  {Array} records - The full JSON array of data from Firebase
	 * @return {Array} aggregate - The JSON array containings the aggregated data 
	 */
	self.ByCourseTitle = function(records){
		var xFieldName = "Course Name",
			yFieldName = "Instructor Share",		
			results = [];

		records.forEach(function(element, index){
			var courseTitle = element[xFieldName];
			var rec = _.find(results, function(rec1){ return rec1.x === courseTitle; });
			if ( rec === undefined ){
				results.push({"x" : courseTitle, "y" : parseFloat(element[yFieldName])});
			}else{
				rec.y = rec.y + parseFloat(element[yFieldName]);
			}
		});
		return _.sortBy(results, "y");
	};

    /**
     * Draw a line chart on the page
     * 
     * @function drawLineChart 
     * @param {Array} _data - The data required by the report
     * @param {Object} dimensions - The JSON object containings (at least) margin, width and height of the chart
     */
  	self.drawLineChart = function(_data, dimensions){ 

            var margin = dimensions.margin,
            	width = dimensions.width,
            	height = dimensions.height,
            	data = _data;

            var parseDate  = d3.time.format("%m/%d/%Y").parse;

            var x = d3.time.scale().range([0, width]);
            var y = d3.scale.linear().range([height, 0]);
            var xAxis = d3.svg.axis()
                .scale(x)
                .orient("bottom");

            var yAxis = d3.svg.axis()
                .scale(y)
                .orient("left");

            data.forEach(function(d) {
              d.date = parseDate(d.date);
            }); 

            var line = d3.svg.line()
                .x(function(d) { return x(new Date(d.date)); })
                .y(function(d) { return y(d.total); });  

            var svg = d3.select("#chart").append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
             
            x.domain(d3.extent(data, function(d) { return d.date; }));
            y.domain([0, d3.max(data, function(d) { return d.total; })]);

            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis);

            svg.append("g")
                .attr("class", "y axis")
                .call(yAxis)
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text("Earnings ($)");

            svg.append("path")
                .datum(data)
                .attr("class", "line")
                .attr("d", line);
  	};

    /**
     * Draw a bar chart on the page
     * 
     * @function drawBarChart 
     * @param {Array} _data - The data required by the report
     * @param {Object} dimensions - The JSON object containings (at least) margin, width and height of the chart
     */
	self.drawBarChart = function(_data, dimensions){

	    var margin = dimensions.margin,
	    	width = dimensions.width,
	    	height = dimensions.height,
	    	dataset = _data;
		var barPadding = 1; 

		console.log("drawBarChart data: ", _data);    
		/*
		var svg = d3.select("#chart")
		            .append("svg")
		            .attr("width", width)
		            .attr("height", height);

		svg.selectAll("rect")
		   .data(dataset)
		   .enter()
		   .append("rect")
			.attr("x", function(d, i) {
			    return i * (width / dataset.length);
			})		   
		   .attr("y", function(d) {
    			return 0;//height - d.y;  //Height minus data value
			})
		   .attr("width", width / dataset.length - barPadding)
		   .attr("height", function(d) {
			    return Math.round(parseFloat(d.y)/height*100);
			})
			.attr("fill", "teal");		   
		   
		   	// Manage the labels
			svg.selectAll("text")
			   	.data(dataset)
			   	.enter()
				.append("text")
				.text(function(d) {
			        return d.x + " - " + d.y;
			   	})
			   	.attr("x", function(d, i) {
			    	return i * (width / dataset.length) + 5;  // +5
			   	})
			   	.attr("y", function(d) {
			    	return 15;//h - (d.y * 4) + 15;              // +15
			   	})
			   .attr("font-family", "sans-serif")
			   .attr("font-size", "11px")
			   .attr("fill", "white");	
*/
		// New code

		var x = d3.scale.ordinal().rangeRoundBands([0, width], 0.05);
		var y = d3.scale.linear().range([height, 0]);
		var xAxis = d3.svg.axis()
		    .scale(x)
		    .orient("bottom")
		    .tickFormat(d3.time.format("%Y-%m"));
		var yAxis = d3.svg.axis()
		    .scale(y)
		    .orient("left")
		    .ticks(10);

		var svg = d3.select("#chart").append("svg")
			    .attr("width", width + margin.left + margin.right)
			    .attr("height", height + margin.top + margin.bottom)
			  	.append("g")
			    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
		
		dataset.forEach	(function(data, index){
			console.log("data:", data);
			
	  		//x.domain(data.map(function(d) { return d.x; }));
		  	//y.domain([0, d3.max(data, function(d) { return d.y; })]);

		  	svg.append("g")
	      		.attr("class", "x axis")
		      	.attr("transform", "translate(0," + height + ")")
		      	.call(xAxis)
		    	.selectAll("text")
		      	.style("text-anchor", "end")
		      	.attr("dx", "-.8em")
		      	.attr("dy", "-.55em")
		      	.attr("transform", "rotate(-90)" );

		  	svg.append("g")
		      	.attr("class", "y axis")
		      	.call(yAxis)
		    	.append("text")
		      	.attr("transform", "rotate(-90)")
		      	.attr("y", 6)
		      	.attr("dy", ".71em")
		      	.style("text-anchor", "end")
		      	.text("Value ($)");

		  	svg.selectAll("bar")
		      	.data(data)
		    	.enter().append("rect")
		      	.style("fill", "steelblue")
		      	.attr("x", function(d) { return x(d.x); })
		      	.attr("width", x.rangeBand())
		      	.attr("y", function(d) { return y(d.y); })
		      	.attr("height", function(d) { return height - y(d.y); });
		});		

		   	
	};

    /**
     * Wrapper function to draw the chart on the page
     * 
     * @function drawLineChart 
     * @param  {Object} params - The JSON object containings (at least) reportName and reportType of the report to be drawn <br/>
     *                         	Example {"reportName": "DailyEarnings", "reportType": "line"} <br/>
     *                         	Values:
     *                         	reportName: DailyEarnings|PromotionEarnings|
     *                         	reportType: line|bar
     */
    
	self.drawChart = function(params){ 
        // get the start time           
        var timeToLoad0 = performance.now();
        // Set the report name
        var records = FirebaseService.get(self.getSectionName(params.reportName));
        // Once data are ready, start processing them
        records.$loaded().then(function(){
            // Calculate the completion time
            var timeToLoad = performance.now() - timeToLoad0;
            console.info("Data from firebase takes %s secs for retrieving.", (timeToLoad/1000).toFixed(2));
            
            // Prepare the D3 object
            var w = Math.round(Math.max(document.documentElement.clientWidth, window.innerWidth || 0)*0.98);
            var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)-200;
            //console.log("Width [%s] height [%s]",w,h);
            var margin = {top: 20, right: 20, bottom: 30, left: 50},
                width = w - margin.left - margin.right,
                height = h - margin.top - margin.bottom;    
            console.log("Width [%s] height [%s]",width,height);

            var dimensions = {
            	margin: margin,
            	width: width,
            	height: height
            };

            // Get the data
            var data;
            switch(params.reportName){
              case "DailyEarnings":
              	data = self.getByDayData(records);
              break;
              case "PromotionEarnings":
              	data = self.ByCouponCode(records);
              	break;
              case "ChannelEarnings":
              	data = self.ByChannel(records);
              	break;              	
              case "DayOfTheWeekEarnings":
              	data = self.ByDayOfTheWeek(records);
              	break;
              case "WeekOfTheYearEarnings":
              	data = self.ByWeekOfTheYear(records);
              	break;              	
              case "CourseTitleEarnings":
              	data = self.ByCourseTitle(records);
              	break;              	              	
              default:
              	data = self.getByDayData(records);
          	}

			switch(params.reportType){
				case "line":
					self.drawLineChart(data, dimensions);
					break;
				case "bar":
					self.drawBarChart(data, dimensions);
					break;
				default:
					console.log("You should never see this message");
			}
		});
	};
        
	// Fine FACTORY
	return self;	
}]);