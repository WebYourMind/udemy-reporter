angular.module('myApp', ['firebase','ngSanitize', 'ngAnimate', 'ui.router', 'ui.bootstrap', 'nvd3','ngMaterial'])

.config(function ($logProvider, $httpProvider, $stateProvider, $urlRouterProvider, $locationProvider, $mdIconProvider){
  /* Set up the routing system */
  // Removed url hash 
  $locationProvider.html5Mode(true);  
  // For any unmatched url, redirect to /
  $urlRouterProvider.otherwise("/");

  $mdIconProvider.fontSet('fa', 'fontawesome');

  $stateProvider
      .state('main', {
        abstract: true, // necessario per rendere questo state non utilizabile senza uno state di default
        url: "/",
        templateUrl: "navigation/main-wrapper.html",
        controller: 'NavigationController'
      })                
      /// Working states
      .state('main.home', {
        url: "", // parent state, therefore empty url
        templateUrl: "pages/home.html"
      })
      .state('main.login', {
              url: "login.html",            
              onEnter: function($mdDialog) {
                  $mdDialog.show({
                      templateUrl: 'authentication/login-material.html',
                      controller:"LoginController as LoginCtrl"          

                  });
              },

                   
          })       
      
      .state('main.logout', {
        url: "logout.html",      
        resolve: {
          "logout": ["FBEndPoint", function(FBEndPoint) {
            var ref = new Firebase(FBEndPoint);
            ref.unauth();
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
      .state('main.report-daily-earnings', {
        url: "report-daily-earnings.html", 
        templateUrl: "reports/report-base.html",
        controller: 'ReportController as ReportCtrl',
        resolve: {
           "currentAuth": ["Auth", function(Auth) {
            // $requireAuth returns a promise so the resolve waits for it to complete
            // If the promise is rejected, it will throw a $stateChangeError 
            return Auth.$requireAuth();
            }],            
            "params" : function(){ return {"reportName": "DailyEarnings", "reportLabel": "Daily Earnings", "reportType": "line"}; }
        }
      }) 
      .state('main.report-promotion-earnings', {
        url: "report-promotion-earnings.html", 
        templateUrl: "reports/report-base.html",
        controller: 'ReportController as ReportCtrl',
        resolve: {
           "currentAuth": ["Auth", function(Auth) {
            // $requireAuth returns a promise so the resolve waits for it to complete
            // If the promise is rejected, it will throw a $stateChangeError 
            return Auth.$requireAuth();
            }],            
            "params" : function(){ return {"reportName": "PromotionEarnings", "reportLabel": "Promotion Earnings", "reportType": "bar"}; }
        }
      })
      .state('main.report-day-of-the-week-earnings', {
        url: "report-day-of-the-week-earnings.html", 
        templateUrl: "reports/report-base.html",
        controller: 'ReportController as ReportCtrl',
        resolve: {
           "currentAuth": ["Auth", function(Auth) {
            // $requireAuth returns a promise so the resolve waits for it to complete
            // If the promise is rejected, it will throw a $stateChangeError 
            return Auth.$requireAuth();
            }],            
            "params" : function(){ return {"reportName": "DayOfTheWeekEarnings", "reportLabel": "Day Of The Week Earnings", "reportType": "bar"}; }
        }
      })
      .state('main.report-channel-earnings', {
        url: "report-channel-earnings.html", 
        templateUrl: "reports/report-base.html",
        controller: 'ReportController as ReportCtrl',
        resolve: {
           "currentAuth": ["Auth", function(Auth) {
            // $requireAuth returns a promise so the resolve waits for it to complete
            // If the promise is rejected, it will throw a $stateChangeError 
            return Auth.$requireAuth();
            }],            
            "params" : function(){ return {"reportName": "ChannelEarnings", "reportLabel": "Channel Earnings", "reportType": "bar"}; }
        }
      }) 
      .state('main.report-course-title-earnings', {
        url: "report-course-title.html", 
        templateUrl: "reports/report-base.html",
        controller: 'ReportController as ReportCtrl',
        resolve: {
           "currentAuth": ["Auth", function(Auth) {
            // $requireAuth returns a promise so the resolve waits for it to complete
            // If the promise is rejected, it will throw a $stateChangeError 
            return Auth.$requireAuth();
            }],            
            "params" : function(){ return {"reportName": "CourseTitleEarnings", "reportLabel": "Course Title Earnings", "reportType": "bar"}; }
        }
      })  
      .state('main.report-week-of-the-year-earnings', {
        url: "report-week-of-the-year-title.html", 
        templateUrl: "reports/report-base.html",
        controller: 'ReportController as ReportCtrl',
        resolve: {
           "currentAuth": ["Auth", function(Auth) {
            // $requireAuth returns a promise so the resolve waits for it to complete
            // If the promise is rejected, it will throw a $stateChangeError 
            return Auth.$requireAuth();
            }],            
            "params" : function(){ return {"reportName": "WeekOfTheYearEarnings", "reportLabel": "Week Of The Year Earnings", "reportType": "bar"}; }
        }
      })                 
///////////////
      .state('main.help', {
        url: "help.html", 
        template: "TBD"    
      }) ;
})

.run(function($log, $rootScope, $state, FirebaseService){

  $rootScope.$on("$stateChangeError", function(event, toState, toParams, fromState, fromParams, error) {
    // We can catch the error thrown when the $requireAuth promise is rejected
    // and redirect the user back to the home page
    console.info('error ', error)
    if (error === "AUTH_REQUIRED") {
      console.info('auth required')
      $state.go("main.login", {},{reload:true});
    }
  });
  
  //var records = FirebaseService.get();
  //$log.debug("App run records: ", records);
  $log.debug("App is running");
});