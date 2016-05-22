var fb = new Firebase("https://blinding-heat-3134.firebaseio.com/");
var appCtrl = angular.module('app.controllers', []);

//deafault variables
var defaultTarget = "Okänd";





appCtrl.controller('firebaseCtrl', function($scope, $state, fbAuth, $firebaseObject) {
    var ref = new Firebase("https://blinding-heat-3134.firebaseio.com");
    
    var readUserData = function(authData){
        var Auth = fbAuth.$getAuth();
        if(Auth!=null){
            $scope.userdata = $firebaseObject(ref.child('users').child(Auth.uid));
        }
        else{
            $state.go("loggain");
        }
    }
    
    //On auth change update userdtaa
    
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
                user.codeid = Auth.uid.slice(0, 6);
                user.score = 0;
                user.alive = true;
                user.killed = [];
                user.target = defaultTarget;

                user.$save().then(function(userData) {
                //Promise
                }).catch(function(error) {
                    //Pop up for error
                });
                
                //Setting up person's score
                var defaultScore = 0;
                var scores = $firebaseObject(scoresref.child(Auth.uid));
                console.log(scores);
                scores.score = defaultScore;
                scores.alive = user.alive;
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
            readUserData();
            console.log("du loggades in med", authData.uid);
            $state.go("hem");
            
        }).catch(function(error) {
            console.error(error)
        });
        
    };
});


appCtrl.controller('hemCtrl', ['$scope', 'fbAuth', '$state', '$firebaseObject', '$q', function($scope, fbAuth, $state, $firebaseObject, $q) {
    
    
    var Auth = fbAuth.$getAuth();   
    var ref = new Firebase("https://blinding-heat-3134.firebaseio.com");
    var newsref = ref.child("news");
    var scoreref = ref.child("scores");
    var userref = ref.child("users");
    var serverref = ref.child("server");
    
    
    
    
    var readUserData = function(Auth){
        if(Auth!=null){
            $scope.userdata = $firebaseObject(ref.child('users').child(Auth.uid));
        }
        else{
            $state.go("loggain");
        }
    }
    //read when no authdata is given
    var readUserData = function(){
        var defer = $q.defer();
        var Auth = fbAuth.$getAuth();
        
        if(Auth!=null){
            $scope.userdata = $firebaseObject(ref.child('users').child(Auth.uid));
            //when loaded it continues
            $scope.userdata.$loaded().then(function(){
                defer.resolve('userdata loaded');
                console.log("userdata loaded " + $scope.userdata);
                readTargetName();
            }).catch(function(){
                console.log("couldn't get userdata with target");
                defer.reject('userdata loading failed');
            });
        }
        else{
            $state.go("loggain");
            defer.reject('Not logged in');
        }
        
        return defer.promise;
    }
    
    
    //Read target - fires when changed
    var readTargetName = function(){
        var targetUid, targetName;
        var targetObj;
        
        
        if($scope.userdata==null){
            console.log("ingen userdata");
            readUserData().then(function(){
                targetUid = $scope.userdata.target;
                //om inget target finns
                if(targetUid==defaultTarget){
                    $scope.targetName = defaultTarget;
                }
                else{
                    targetObj = $firebaseObject(scoreref.child(targetUid));
                    targetObj.$loaded().then(function(){
                    targetName = targetObj.name;
                        $scope.targetName = targetName;
                    });
                }
                
            });
            
            
        }
        else{
            console.log("användardatan finns" + $scope.userdata);
            targetUid = $scope.userdata.target;
            //om inget target finns
            if(targetUid==defaultTarget){
                $scope.targetName = defaultTarget;
            }
            else{
                targetObj = $firebaseObject(scoreref.child(targetUid));
                targetObj.$loaded().then(function(){
                    targetName = targetObj.name;
                    $scope.targetName = targetName;
                });
            }
        }
    };
    
    if(Auth!=null){
        userref.child(Auth.uid).on('child_changed', function(childSnapshot){
            console.log("din användardata uppdaterades och därför uppdaterades ditt mål");
            readTargetName();
        });
    }

    
    
    //checks when auth updates
    $scope.auth = fbAuth;
    $scope.auth.$onAuth(function(authData){
        readUserData(authData);
    });
    
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
    
/////========== KILL SOMEONE ===========////
    
    $scope.killTarget = function(codeID){
        var targetData, targetID;
        var targetsTarget;
        
        ///// --- small functions ////////////
        
        var updateTargetStatus = function(){
            targetData.alive = false;
            //saving targets target before their death
            targetsTarget = targetData.target;
            //resets targets target to def
            targetData.target = defaultTarget;
            targetData.$save();
        };
        
        var updateScoreKilled = function(){
            
            //update score info
            var userScoreData = $firebaseObject(scoreref.child(Auth.uid));
            userScoreData.$loaded().then(function(){
                userScoreData.score+=1;
                userScoreData.$save();
            });
            
            //update userdata info
            //$scope.userdata.killed.$add({foo: targetID});
            $scope.userdata.score++;
            $scope.userdata.target = targetsTarget;
            $scope.userdata.$save();
            
            //updates server info
            var serverInfo = $firebaseObject(serverref);
            serverInfo.$loaded().then(function(){
                serverInfo.playersAlive -=1;
                serverInfo.$save();
            }).catch();
        };
        
        
        //// MAIN FUNCTION ///////
        console.log("starting killing process...");
        var targetID = $scope.userdata.target;
        
        var targetData = $firebaseObject(userref.child(targetID));
        targetData.$loaded().then(function(){
            //get targets code id - see if matching with id you got
            var realCodeID = targetData.codeid;
            if(codeID === realCodeID && targetData.alive!=false){
                //Kör koden om den stämmer
                console.log("du har koden till ditt target");
                updateTargetStatus();
                updateScoreKilled();
            }
            else{
                console.log("koden du har är inte din targets eller så är den redan död");
            }
        }).catch();

        
        /*
        //change target to killed and remove target
        var targetObject = $firebaseObject(userref.child(targetID));
        
        targetObject.$loaded().then(function(){
            targetObject.alive = false;
            targetObject.target = defaultTarget;
            targetObject.$save();
        });
        
        //update killer's score & killed[] + update server info
        var killerObject = $firebaseObject(userref.child(Auth.uid));
        killerObject.$loaded().then(function(){
            killerObject.killed.$add({foo: targetID});
            killerObject.$save();
        });
        */
    }
    
///===================================================///
    //toplist
    var getTopList = function(){
        var scores = scoreref.orderByChild("score").limitToFirst(5);
        var scoreObject = $firebaseObject(scores);
        var objectWithBlanc;
        scoreObject.$loaded().then(function(){
            objectWithBlanc = Object.keys(scoreObject).map(function(key){
                return scoreObject[key];
            });

            objectWithBlanc.splice(0,3);
            $scope.topUserList = objectWithBlanc;
        });


        $scope.loggaut = function() {
            console.log("User logged out");
            fbAuth.$unauth();
            $state.go("loggain");
        };
    }
    
    scoreref.orderByChild("score").limitToFirst(5).on('child_changed', function(){
        getTopList();
    });
    
    
    
    
    
// Reading news
    $scope.news = $firebaseObject(newsref);
    $scope.serverinfo = $firebaseObject(ref.child("server"));
    
    
    
//SAVE kills and save score
    //Get victim's target
    
//Order databse to get current position in comp and top players
    
    
    
    
    
    //Last kills - killer and victim
    //
    angular.element(document).ready(function(){
        getTopList();
    });
    
    //----ADMIN SIDE------
    //Generate everyone's target
    //Send news and push notifcations
    //Cooldown and start and stop time for game
    //Remove Players & Add - everyone (not done)
    //

}]);
   
appCtrl.controller('adminCtrl', function($scope, $state, fbAuth, $firebaseObject) {
    var ref = new Firebase("https://blinding-heat-3134.firebaseio.com");
    var userref = ref.child("users");
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
    
    $scope.removeUserData = function(){
        //ta bort score
        //ändra människocount
        //ta bort userdata
        //(Accountet kan du inte ta bort) - skit i det i nuläget - uppdatera userdata när den loggar in
    };
    
    
    
    /*=============== GE OFFER ===============*/
   
    $scope.giveEveryoneTarget = function(){
        //initiering---
        //Loopa igenom alla användare - lägg till nästa användare som den valdes offer. (om vilkor stämmer = lever, aktiverad)
        
        var lastUid = "";
        var firstUid = "";
        userref.orderByKey().on("child_added", function(snapshot){
            //save each user as object - editing it then saving it
            var userData = $firebaseObject(userref.child(snapshot.key()));
            
            userData.$loaded().then(function(){
                userData.target = lastUid;
                console.log(userData);
                // sets this id to last visited id
                if(lastUid===""){
                    firstUid=snapshot.key();
                }
                
                lastUid = snapshot.key();                
                userData.$save();
            });
            
            
        });
        
    };
});



/*
============= VAD JAG LÄRT MIG ================
- Lägg upp struktur i kod för uppdateringar varje sekund, när en del i databasen ändras, när du laddar om, när du är inloggad, när du inte är inloggad osv. (Nu fick jag fixa fulingar då jag inte var inloggad men den kolla efter uid.)
- laddar ner anvädardata oinödigt ofta. kolla för att spara (och uppdatera när den behövs) - för att slippa använda data.
- databasen kan ha default-värde (ex. 0) där view ändrar vad det står...
*/


 /*------------- ATT GÖRA ---------------*/
//visa topplista (från scores)- 
//när du loggar in kollar den om du har userdata - annars skapar den
//när du tar bort userdata när du raderar