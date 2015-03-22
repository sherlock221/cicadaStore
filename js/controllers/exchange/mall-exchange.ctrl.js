PointMall.controller("MallExchangeCtrl",function($scope,$ionicScrollDelegate,$rootScope,$timeout,$stateParams,Util,MallSev){

    $scope.posts = [];

    $scope.isNotProduct = false;

    $scope.canInfiniteScroll  =false;

    $scope.fm = {
        "queryTime" : 0
    }

    $scope.isSubmit = false;


    //是否还有更多
    $scope.isMore  = true;

    $scope.isTime = [];

    //加载更多 满足一屏 就加载
    $scope.loadMore = function(){
        console.log("load more...");
        load($rootScope.token, $scope.fm.queryTime).then(function(res){
             console.log("load...data");
            if(res.rtnCode == "0000000"){
                //没有最新的
                if(res.bizData.length <= 0){
                    $scope.isMore = false;
                }
                else{
                    $scope.posts = $scope.posts.concat(res.bizData);
                    $scope.fm.queryTime = $scope.posts[$scope.posts.length-1].createDate;
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                }
            }
            else{
               console.error("error");
            }

        },function(err){
        });


    }


    //加载数据
    var load = function(token,queryTime){
        return MallSev.getExchange(token,queryTime);
    }


    //刷新
    $scope.refresh = function () {
        console.log("refresh...");
        $scope.fm.queryTime = 0;

        $timeout(function(){

            load($rootScope.token, $scope.fm.queryTime).then(function(res){
                $scope.$broadcast('scroll.refreshComplete');
                if(res.rtnCode == "0000000"){
                    $scope.posts = res.bizData;

                    if(res.bizData == 0){
                        $scope.isNotProduct = true;
                    }
                }
                else{
                    alert(res.msg);
                }
            },function(err){
                $scope.$broadcast('scroll.refreshComplete');
            });


        },0);

    }

    //去兑换详情
    $scope.getDetail = function(post){
        $rootScope.go("mall.exchange.detail",{
            "exchangeId" : post.id
        });
    }



    $scope.refresh();

});