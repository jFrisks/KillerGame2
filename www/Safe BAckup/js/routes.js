angular.module('app.routes', [])

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider
    
      
        
    .state('loggain', {
      url: '/loggain',
      templateUrl: 'templates/loggain.html',
      controller: 'loggainCtrl'
    })
        
      
    
      
        
    .state('skapakonto', {
      url: '/skapakonto',
      templateUrl: 'templates/skapakonto.html',
      controller: 'skapakontoCtrl'
    })
        
      
    
      
        
    .state('hem', {
      url: '/hem',
      templateUrl: 'templates/hem.html',
      controller: 'hemCtrl'
    })
        
      
    
      
        
    .state('topplista', {
      url: '/topplista',
      templateUrl: 'templates/topplista.html',
      controller: 'topplistaCtrl'
    })
        
      
    
      
        
    .state('minakills', {
      url: '/minakills',
      templateUrl: 'templates/minakills.html',
      controller: 'minakillsCtrl'
    })
        
      
    
      
        
    .state('kill', {
      url: '/kill',
      templateUrl: 'templates/kill.html',
      controller: 'killCtrl'
    })
        
      
    ;

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/loggain');

});