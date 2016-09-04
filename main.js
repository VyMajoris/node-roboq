var app = angular.module("app",[]);

app.controller('MainCtrl', function($scope,$http){
    
    $scope.ligar = function(){
        $http.get('http://localhost:3000/qrcode')
            .success(function(data){
                $scope.num = data.senhaNum;
                $scope.qr = data.qr;
            })
            .error(function(err){
                $scope.msg = err;
            });
    };
    
    $scope.desligar = function(){
        $http.get('http://localhost:3000/led/desligar')
            .success(function(data){
                $scope.msg = data;
            })
            .error(function(err){
                $scope.msg = err;
            });
    };
    
    
    
    var tempRef = firebase.database().ref('iot/temp');
  tempRef.on('child_changed', function(data) {
   console.log(data)
    $scope.msg = data
  });
    
    
});