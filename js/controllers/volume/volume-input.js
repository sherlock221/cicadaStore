PointMall.controller("VolumeInputCtrl",["$state","$rootScope","$ionicPopup","$scope","Util","MallSev",function($state,$rootScope,$ionicPopup,$scope,Util,MallSev){
    //获得当前选择的商品
    var  volume = Util.getSgObj("volume");
    $scope.post = volume;


    $scope.goShop = function(post){
        //window.open(post.shopUrl);
        alert("请在pc或手机浏览器内 兑换 ");
    }
}]);