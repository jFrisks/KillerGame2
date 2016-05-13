var services = angular.module('app.services', []);

services.factory('fbAuth', function($firebaseAuth) {
    var userRef = new Firebase("https://blinding-heat-3134.firebaseio.com/");
    return $firebaseAuth(userRef);
});

services.factory('Users', function($firebaseArray, $firebaseObject, FirebaseUrl) {
    var usersRef = new Firebase(FirebaseUrl+'users');
    var users = $firebaseArray(usersRef);
    
    var Users = {
        getProfile: function(uid) {
            return $firebaseObject(usersRef.child(uid));
        },
        getDisplayName: function(uid) {
            return users.$getRecord(uid).displayName;
        },
        all: users
    };
    
    return Users;
});

// Gives addres to usersRef

services.factory('userLocation', ["$firebaseArray", 'fbAuth',
  function($firebaseArray, fbAuth) {
      var Auth = fbAuth.$getAuth();
      var ref = new Firebase("https://blinding-heat-3134.firebaseio.com/users/" + Auth.uid);
      
      return $firebaseArray(ref);
  }
]);


services.factory('userDataFactory', function(fbAuth, $firebaseObject, $filter, $scope) {
    
    var Auth = fbAuth.$getAuth();
    var userRef = new Firebase("https://blinding-heat-3134.firebaseio.com/users/"+ Auth.uid);
    
    this.createNewUserData = function(fullName) {
        //var Auth = fbAuth.$getAuth();
        //var userRef = new Firebase("https://blinding-heat-3134.firebaseio.com/users/"+ Auth.uid);
        var user = $firebaseObject(userRef);
        console.log(Auth.uid);
        user.name = fullName;
        user.codeid = Auth.uid.slice(0, 6);;
        user.score = 0;
        user.alive = true;
        user.killed = ["Test1", "test2"];
        user.target = "ID_FROM_PLAYERLIST";

        user.$save().then(function(userData) {
        //Promise
        }).catch(function(error) {
            //Pop up for error
        });
    }
    
    this.getUserData = function() {
        //var Auth = fbAuth.$getAuth();
        //var userRef = new Firebase("https://blinding-heat-3134.firebaseio.com/users/"+ Auth.uid);
        return $firebaseObject(userRef);
    }
    
    this.killUser = function(){
        var Auth = fbAuth.$getAuth();
        
        //change alive in scores & uid
        
    };
});