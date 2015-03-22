PointMall.controller("MallListCtrl",["$state","$rootScope","$scope","Util","MallSev",function($state,$rootScope,$scope,Util,MallSev){
        $scope.posts = [];

    //参数
    $scope.fm = {
        queryTime : 0
    }

    $scope.getItemHeight = function(item, index) {
        //Make evenly indexed items be 10px taller, for the sake of example
        return (index % 2) === 0 ? 50 : 60;
    };

    //加载列表
    $scope.loadList = function(){
        MallSev.getProduct($rootScope.token,$scope.fm.queryTime).then(function(res){
            console.log(res);
            if(res.rtnCode == "0000000"){
                $scope.posts = res.bizData;
            }
            else{
                alert(res.msg);
            }
        },function(err){
        });
    }


    $scope.goDetail = function(post){
        Util.setSgObj("product",post);
        $state.go("mall.detail");
    }


    $scope.loadList();
}]);