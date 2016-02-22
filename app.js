angular.module('myApp', ['firebase','ngSanitize', 'ngAnimate', 'ui.router', 'ui.bootstrap', 'ngTable', 'ngCsvImport',  'nvd3','ngMaterial'])

.config(function ($logProvider, $httpProvider, $stateProvider, $urlRouterProvider, $locationProvider){
  /* Set up the routing system */
  // Rimuovo hashtag dall'URL
  $locationProvider.html5Mode(true);  
  // For any unmatched url, redirect to /prj-urlobp-naptr
  $urlRouterProvider.otherwise("/"); 

  $stateProvider
      .state('main', {
        abstract: true, // necessario per rendere questo state non utilizabile senza uno state di default
        url: "/",
        templateUrl: "navigation/main-wrapper.html",
        controller: 'NavigationController'
      })                
      /// Working states
      .state('main.home', {
        url: "", // URL e' vuoto perche' questa route e' il default per il parent state main
        templateUrl: "pages/home.html"
      })
      .state('main.login', {
        url: "login.html", 
        templateUrl: "authentication/login.html",
        controller: 'LoginController as LoginCtrl',
        resolve: {
          // controller will not be loaded until $waitForAuth resolves
          "currentAuth": ["Auth", function(Auth) {
            // $waitForAuth returns a promise so the resolve waits for it to complete
            return Auth.$waitForAuth();
          }]
        }        
      })  
      .state('main.logout', {
        url: "logout.html", 
        //templateUrl: "pages/logout.html",
        //controller: 'LogoutController as LogoutCtrl',
        resolve: {
          "logout": ["FBEndPoint", function(FBEndPoint) {
            var ref = new Firebase(FBEndPoint);
            ref.unauth();
          }],
          // controller will not be loaded until $waitForAuth resolves
          "currentAuth": ["Auth", function(Auth) {
            // $waitForAuth returns a promise so the resolve waits for it to complete
            return Auth.$requireAuth();
          }]
        }        
      })               
      .state('main.load-csv-file', {
        url: "load-csv.html", 
        templateUrl: "loadfile/upload-csv.html",
        controller: 'CsvFileController as CsvFileCtrl',
        resolve: {
          // controller will not be loaded until $requireAuth resolves
          "currentAuth": ["Auth", function(Auth) {
            // $requireAuth returns a promise so the resolve waits for it to complete
            // If the promise is rejected, it will throw a $stateChangeError
            return Auth.$requireAuth();
          }]
        }        
      })
      .state('main.show-total-by-day-report', {
        url: "show-total-by-day-report.html", 
        templateUrl: "reports/show-total-by-day-report.html",
        controller: 'ReportSaleByDayController as ReportSaleByDayCtrl',
        resolve: {
          items : function(ReportService){
            return ReportService.getSaleTotals('ByDay');
          },
          "currentAuth": ["Auth", function(Auth) {
            // $requireAuth returns a promise so the resolve waits for it to complete
            // If the promise is rejected, it will throw a $stateChangeError
            return Auth.$requireAuth();
          }]          
        }
      }) 
      .state('main.show-total-by-week-report', {
        url: "show-total-by-week-report.html", 
        templateUrl: "reports/show-total-by-week-report.html",
        controller: 'ReportSaleByWeekController as ReportSaleByWeekCtrl',
        resolve: {
          items : function(ReportService){
            return ReportService.getSaleTotals('ByWeek');
          },
          "currentAuth": ["Auth", function(Auth) {
            // $requireAuth returns a promise so the resolve waits for it to complete
            // If the promise is rejected, it will throw a $stateChangeError
            return Auth.$requireAuth();
          }]          
        }
      })       
      .state('main.show-total-by-day-of-week-report', {
        url: "show-total-by-day-of-week-report.html", 
        templateUrl: "reports/show-total-by-day-of-week-report.html",
        controller: 'ReportSaleByDayOfWeekController as ReportSaleByDayOfWeekCtrl',
        resolve: {
          items : function(ReportService){
            return ReportService.getSaleTotals('ByDayOfWeek');
          },
          "currentAuth": ["Auth", function(Auth) {
            // $requireAuth returns a promise so the resolve waits for it to complete
            // If the promise is rejected, it will throw a $stateChangeError
            return Auth.$requireAuth();
          }]          
        }
      })         
      .state('main.show-total-by-hour-of-day-report', {
        url: "show-total-by-hour-of-day-report.html", 
        templateUrl: "reports/show-total-by-hour-of-day-report.html",
        controller: 'ReportSaleByHourOfDayController as ReportSaleByHourOfDayCtrl',
        resolve: {
          items : function(ReportService){
            return ReportService.getSaleTotals('ByHourOfDay');
          },
          "currentAuth": ["Auth", function(Auth) {
            // $requireAuth returns a promise so the resolve waits for it to complete
            // If the promise is rejected, it will throw a $stateChangeError
            return Auth.$requireAuth();
          }]          
        }
      }) 
      .state('main.report-by-promotion', {
        url: "report-by-promotion.html", 
        templateUrl: "reports/report-by-promotion.html",
        controller: 'ReportSaleByPromotionController as ReportSaleByPromotionCtrl',
        resolve: {
          items : function(ReportService){
            return ReportService.getSaleTotals('ByPromotion');
          },
          "currentAuth": ["Auth", function(Auth) {
            // $requireAuth returns a promise so the resolve waits for it to complete
            // If the promise is rejected, it will throw a $stateChangeError 
            return Auth.$requireAuth();
          }]          
        }
      })   
      .state('main.help', {
        url: "help.html", 
        template: "TBD"    
      })  
})

.run(function($log, $rootScope, $state, FirebaseService){

  $rootScope.$on("$stateChangeError", function(event, toState, toParams, fromState, fromParams, error) {
    // We can catch the error thrown when the $requireAuth promise is rejected
    // and redirect the user back to the home page
    if (error === "AUTH_REQUIRED") {
      $state.go("main.login");
    }
  });
  
  //var records = FirebaseService.get();
  //$log.debug("App run records: ", records);
  $log.debug("App is running");
});