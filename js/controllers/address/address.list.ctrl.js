PointMall.controller("AddressListCtrl",["$scope","$rootScope","Util","MallSev",function ($scope, $rootScope, Util, MallSev) {

    var product;
    var address;


    //进入加载
    $scope.$on("$ionicView.beforeEnter", function () {

        $rootScope.scrollTopByName("addressListScroll");
        console.log("address list  before enter..");

        product = Util.getSgObj("product");
        address = Util.getLgObj("address");

        $scope.posts = address;
        $scope.fm = {
            currentAddress: address[0].id
        }

    });





    //兑换实物
    $scope.exchange = function () {

        var comment;

        //邮寄产品
        if (product.productionType == "1") {
            comment = $scope.fm.currentAddress
        }

        MallSev.exchange($rootScope.token, product.productionId, product.productionType, comment).then(function (res) {

            if (res.rtnCode == "0000000") {
                $rootScope.alert("", "兑换成功");
                $rootScope.go("mall.exchange");
            }
            else {
                $rootScope.alert("", res.msg);
            }


        }, function () {


        });

    }

}]);