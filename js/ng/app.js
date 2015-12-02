var myApp = angular.module('myApp', ['firebase','ngSanitize', 'ui.router', 'ngTable', 'ngCsvImport',  'nvd3']);

angular.module('myApp').constant("FBEndPoint", "https://<FIREBASE_URL>.firebaseio.com");

angular.module('myApp').config(function ($logProvider, $httpProvider, $stateProvider, $urlRouterProvider, $locationProvider){
  /* Set up the routing system */
  // Rimuovo hashtag dall'URL
  $locationProvider.html5Mode(true);  
  // For any unmatched url, redirect to /prj-urlobp-naptr
  $urlRouterProvider.otherwise("/"); 

  $stateProvider
      .state('main', {
        abstract: true, // necessario per rendere questo state non utilizabile senza uno state di default
        url: "/",
        templateUrl: "pages/main-wrapper.html"
      })                
      /// Working states
      .state('main.splash', {
        url: "", // URL e' vuoto perche' questa route e' il default per il parent state main
        templateUrl: "pages/splash.html"
      })      
      .state('main.load-csv-file', {
        url: "load-csv.html", 
        templateUrl: "pages/upload-csv.html",
        controller: 'CsvFileController as CsvFileCtrl'
      })
      .state('main.show-total-by-day-report', {
        url: "show-total-by-day-report.html", 
        templateUrl: "pages/show-total-by-day-report.html",
        controller: 'ReportSaleByDayController as ReportSaleByDayCtrl',
        resolve: {
          items : function(ReportService){
            return ReportService.getTotalsByDay();
          }
        }
      })   
      .state('main.show-total-by-hour-of-day-report', {
        url: "show-total-by-hour-of-day-report.html", 
        templateUrl: "pages/show-total-by-hour-of-day-report.html",
        controller: 'ReportSaleByHourOfDayController as ReportSaleByHourOfDayCtrl',
        resolve: {
          items : function(ReportService){
            return ReportService.getTotalsByHourOfDay();
          }
        }
      })   
      .state('main.report-by-promotion', {
        url: "report-by-promotion.html", 
        templateUrl: "pages/report-by-promotion.html",
        controller: 'ReportSaleByPromotionController as ReportSaleByPromotionCtrl',
        resolve: {
          items : function(ReportService){
            return ReportService.getTotalsByPromotion();
          }
        }
      })   
      .state('main.help', {
        url: "help.html", 
        templateUrl: "pages/help.html",
        controller: 'HelpController as HelpCtrl'
      })  
});

angular.module('myApp').run(function($log, FirebaseService){
  $log.debug("App run!!!");
  var records = FirebaseService.get();
  $log.debug("App run records: ", records);
});