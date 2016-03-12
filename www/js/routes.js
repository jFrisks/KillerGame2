var app = angular.module('app.routes', []);

//Om auth behövs tar den oss till login
app.run(["$rootScope", "$state", function ($rootScope, $state) {
    $rootScope.$on("$stateChangeError", function (event, toState, toParams, fromState, fromParams, error) {
        // We can catch the error thrown when the $requireAuth promise is rejected
        // and redirect the user back to the home page
        if (error === "AUTH_REQUIRED") {
            $state.go("loggain");
        }
    });
}]);

app.config(function ($stateProvider, $urlRouterProvider) {

    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js
    $stateProvider



    .state('loggain', {
        url: '/loggain',
        templateUrl: 'templates/loggain.html',
        controller: 'firebaseCtrl',
        resolve: {
            requireNoAuth: function ($state, fbAuth) {
                return fbAuth.$requireAuth().then(function (auth) {
                    $state.go('hem');
                }, function (error) {
                    return;
                });
            }
        }
    })





    .state('skapakonto', {
        url: '/skapakonto',
        templateUrl: 'templates/skapakonto.html',
        controller: 'firebaseCtrl',
        resolve: {
            requireNoAuth: function ($state, fbAuth) {
                return fbAuth.$requireAuth().then(function (auth) {
                    $state.go('hem');
                }, function (error) {
                    return;
                });
            }
        }
    })





    .state('hem', {
        url: '/hem',
        templateUrl: 'templates/hem.html',
        controller: 'hemCtrl',
        resolve: {
            currentAuth: ["fbAuth", function (fbAuth) {
                return fbAuth.$requireAuth();
            }]
        }
    })





    .state('topplista', {
        url: '/topplista',
        templateUrl: 'templates/topplista.html',
        controller: 'hemCtrl',
        resolve: {
            currentAuth: ["fbAuth", function (fbAuth) {
                return fbAuth.$requireAuth();
            }]
        }
    })





    .state('minakills', {
        url: '/minakills',
        templateUrl: 'templates/minakills.html',
        controller: 'hemCtrl',
        resolve: {
            currentAuth: ["fbAuth", function (fbAuth) {
                return fbAuth.$requireAuth();
            }]
        }
    })





    .state('kill', {
        url: '/kill',
        templateUrl: 'templates/kill.html',
        controller: 'hemCtrl',
        resolve: {
            currentAuth: ["fbAuth", function (fbAuth) {
                return fbAuth.$requireAuth();
            }]
        }
    })
    
    .state('admin', {
        url: '/admin',
        templateUrl: 'templates/admin.html',
        controller: 'adminCtrl'
    });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/loggain');

});