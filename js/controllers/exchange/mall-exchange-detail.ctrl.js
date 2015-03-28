PointMall.controller("MallExchangeDetailCtrl",["$scope","$rootScope","$timeout","$stateParams","Util","MallSev",function($scope,$rootScope,$timeout,$stateParams,Util,MallSev){

    $scope.post = {};

    console.log("Mall exchange  detail...");

    //获得详情ID
    var exchangeId =  $stateParams.exchangeId;


    $scope.goShop = function(post){
        //window.open(post.shopUrl);
        alert("请在pc或手机浏览器内 兑换 ");
    }

    //获得详情
    var loadDetail = function(){

        MallSev.getExchangeDetail($rootScope.token,exchangeId).then(function(res){
            $scope.post = res.bizData;

        },function(err){

        })
    }


    $scope.goDetail = function(post){
        $rootScope.loading(true);


        //加载详情
        MallSev.getProductDetail(post.exchangeLog.productionId).then(function(res){
            $rootScope.loading(false);
            if(res.rtnCode == "0000000"){
                Util.setSgObj("product",res.bizData);
                $rootScope.go("mall.detail");
            }
            else{
               alert(res.msg);
            }

        },function(err){
            $rootScope.loading(false);
        });

    }


    //加载详情
    loadDetail();

}]);