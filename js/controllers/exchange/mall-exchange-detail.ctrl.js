PointMall.controller("MallExchangeDetailCtrl",["$scope","$rootScope","$timeout","$stateParams","Util","MallSev",function($scope,$rootScope,$timeout,$stateParams,Util,MallSev){

    $scope.post = {};

    console.log("Mall exchange  detail...");

    //获得详情ID
    var exchangeId =  $stateParams.exchangeId;


    //获得详情
    var loadDetail = function(){

        MallSev.getExchangeDetail($rootScope.token,exchangeId).then(function(res){
            $scope.post = res.bizData;

        },function(err){

        })
    }


    loadDetail();


}]);