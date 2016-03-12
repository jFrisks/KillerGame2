var fb = new Firebase("https://blinding-heat-3134.firebaseio.com/");
var appCtrl = angular.module('app.controllers', []);


appCtrl.controller('firebaseCtrl', function($scope, $state, fbAuth, $firebaseObject) {
    var ref = new Firebase("https://blinding-heat-3134.firebaseio.com");
    
    var readUserData = function(){
        var Auth = fbAuth.$getAuth();
        if(Auth!=null){
            $scope.userdata = $firebaseObject(ref.child('users').child(Auth.uid));
        }
        else{
            $state.go("loggain");
        }
    }
    
    $scope.login = function(email, password) {
        fbAuth.$authWithPassword({
            email:email,
            password: password
        }).then(function(authData) {
            console.log("userdata är:", authData.password.email);
            console.log("Går till hemskärmen");
            $state.go("hem");
        
            /*readUserData();
            console.log("userdata är:", authData.password.email);
            $scope.userdata.$loaded().then(function(){
                console.log("Går till hemskärmen");
                $state.go("hem");
            });*/
            
        }).catch(function(error) {
            console.error(error);
        })
    };
    
    $scope.register = function(email, password, fullName) {
        fbAuth.$createUser({email:email, password: password}).then(function(userData) {
            return fbAuth.$authWithPassword({
                email: email,
                password: password
            });
        //Function for adding additional userdata
        //router/error catching
        }).then(function(authData) {
            
            
            //Function for createing new userdata
            var createNewUserData = function(fullName) {
                console.log("Kör savefunct");
                var Auth = fbAuth.$getAuth();
                var ref = new Firebase("https://blinding-heat-3134.firebaseio.com/");
                var scoresref = ref.child("scores");
                var userRef = ref.child("users").child(Auth.uid);
                var user = $firebaseObject(userRef);
                
                user.name = fullName;
                user.codeid = Auth.uid.slice(0, 6);;
                user.score = 0;
                user.alive = true;
                user.killed = [];
                user.target = "UNKNOWN";

                user.$save().then(function(userData) {
                //Promise
                }).catch(function(error) {
                    //Pop up for error
                });
                
                //Setting up person's score
                var scores = $firebaseObject(scoresref.child(Auth.uid));
                console.log(scores);
                scores.score = 0;
                scores.name = fullName;
                scores.$save().then(function(){}).catch(function(){});
                
                //Adding info to server
                var server = $firebaseObject(ref.child("server"));
                server.$loaded().then(function(){
                    server.players ++;
                    server.playersAlive ++;
                    server.$save();
                });
                
                
                
            }
            createNewUserData(fullName);
            
            //Redirecting to home
            console.log("du loggades in med", authData.uid);
            $state.go("hem");
            
        }).catch(function(error) {
            console.error(error)
        });
        
    };
});


   
appCtrl.controller('hemCtrl', function($scope, fbAuth, $state, $firebaseObject) {
    var Auth = fbAuth.$getAuth();   
    var ref = new Firebase("https://blinding-heat-3134.firebaseio.com");
    var newsref = ref.child("news");
    var scoreref = ref.child("score");
    
    
    $scope.auth = fbAuth;
    //Checks everytime auth status updates for log out button
    $scope.auth.$onAuth(function(authData) {
        $scope.authData = authData;
        if(authData == null){
            console.log("Du var utloggad")
            $state.go("loggain");
        }
        else{
            console.log("Auth uppdaterades fast du är inloggad...");
        }
    });
    
    $scope.loggaut = function() {
        console.log("User logged out");
        fbAuth.$unauth();
        $state.go("loggain");
    };
    
    if(Auth!=null){
        $scope.userdata = $firebaseObject(ref.child('users').child(Auth.uid));
    }
    else{
        $state.go("loggain");
    }
    
    
    
// Reading news
    $scope.news = $firebaseObject(newsref);
    $scope.serverinfo = $firebaseObject(ref.child("server"));
    
    
    
//SAVE kills and save score
    //Get victim's target
    
//Order databse to get current position in comp and top players
    
    
    
    
    
    //Last kills - killer and victim
    //
    
    
    //----ADMIN SIDE------
    //Generate everyone's target
    //Send news and push notifcations
    //Cooldown and start and stop time for game
    //Remove Players & Add - everyone (not done)
    //

});
   
appCtrl.controller('adminCtrl', function($scope, $state, fbAuth, $firebaseObject) {
    var ref = new Firebase("https://blinding-heat-3134.firebaseio.com");
    var newsref = ref.child("news");
    $scope.news = $firebaseObject(newsref);

    
    $scope.createNews = function(title, text){
            $scope.news.title = title;
            $scope.news.content = text;
            $scope.news.published = Firebase.ServerValue.TIMESTAMP;
            $scope.news.$save(
        ).then(function(ref){
            console.log('Saved News');
        }).catch(function(error){
            console.log(error);
        });
    };
    
//Reads news    --------------------------------------------------------
    $scope.news = $firebaseObject(newsref);
    
//Removes user    ------------------------------------------------------------------ 
    $scope.removeUser = function(){
        fbAuth.$removeUser({
            email: "",
            password: ""
        }).then(function(){
            console.log("User removed");
        }).catch(function(){
            console.log(error);
        });
        
        var Auth = fbAuth.$getAuth;
        var userref = ref.child("users").child(Auth.uid);
        var user = $firebaseObject(userref);
        user.$remove();
    };
    
});

 