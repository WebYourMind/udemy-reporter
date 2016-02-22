angular.module('myApp')

// let's create a re-usable factory that generates the $firebaseAuth instance
.factory("Auth", ['$firebaseAuth', 'FBEndPoint', function($firebaseAuth, FBEndPoint) {
    var ref = new Firebase(FBEndPoint);
    return $firebaseAuth(ref);
  }
]) 