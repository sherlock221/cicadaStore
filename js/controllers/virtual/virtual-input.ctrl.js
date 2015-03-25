/**
 * 虚拟卷兑换
 */
PointMall.controller("VirtualInputCtrl",["$state","$rootScope","$ionicPopup","$scope","Util","MallSev",function($state,$rootScope,$ionicPopup,$scope,Util,MallSev){

        var  product = Util.getSgObj("product");

    //参数
    $scope.fm = {
        "phone" : "",
        "productionId" : product.productionId
    }

    $scope.isSubmit = false;


    console.log("input...");

    // A confirm dialog
    $scope.showConfirm = function(title,content) {

    };


    //加载列表
    $scope.exchange = function(){
        console.log(product.productName);

        if(!isMobil($scope.fm.phone)){
            $rootScope.alert("","请输入正确的手机号!");
            return;
        }


        //提示框
        var confirmPopup = $ionicPopup.confirm({
            title: '提示',
            template:"确认给号码"+$scope.fm.phone+"兑换"+product.productionName+"?",
            buttons : [
                {
                    text: '取消',
                    type: 'button-default'
                },
                {
                    text: '确定',
                    type: 'button-positive',
                    onTap: function(e) {
                        return "success";
                    }
                }
            ]
        });


        function isMobil(s)
        {
            var reg=/^0?(13[0-9]|15[012356789]|18[0123456789]|14[57])[0-9]{8}$/;
            if (!reg.exec(s)) return false
            return true
        }

        confirmPopup.then(function(res) {
            if(res) {
                $scope.isSubmit = true;
                MallSev.exchange($rootScope.token,$scope.fm.productionId,product.productionType,$scope.fm.phone).then(function(res){
                    console.log(res);
                    if(res.rtnCode == "0000000"){

//                        alert("兑换成功!");
                        $rootScope.alert("","兑换成功!");
                        $rootScope.getUser($rootScope.token);
                        $state.go("mall.exchange");
                    }
                    else{
//                        alert(res.msg);
                        $rootScope.alert("",res.msg);
                    }
                    $scope.isSubmit = false;
                },function(err){
                    $scope.isSubmit = false;
                });


            } else {
            }
        });


    }




}]);