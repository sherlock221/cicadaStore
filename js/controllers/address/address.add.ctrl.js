PointMall.controller("AddressAddCtrl",["$scope","$rootScope","Util","AddressSev","selectPCASev",function($scope,$rootScope,Util,AddressSev,selectPCASev){
    console.log("address add");

    //添加新地址参数
    $scope.fm ={
        userName : "",
        phone : "",
        baseAddress : "",
        street : ""
    }

//    $scope.isSubmit = false;


    //检测视图进入
    $scope.$on("$ionicView.beforeEnter",function(){

        console.log("address  before enter..");

        var address = Util.getSgObj("selectAddress");

        if(address && address.province &&  address.city && address.area){
            $scope.fm.baseAddress = address.province + " " + address.city + " " + address.area;
        }
        else{
            $scope.fm.baseAddress = "";
        }

        //滚动条顶部
        $rootScope.scrollTopByName("addressAddScroll");
    });



    $scope.goSelectAddress = function(){
        //初始化check
        selectPCASev.check(function(){
            $rootScope.go("mall.select.province");
        });

    }

    //检查地址
    var checkAddress = function(fm){

        //中文验证
        var chineseReg = /^[\u4e00-\u9fa5]+$/i;


        if(fm.street.length >  50){
            $rootScope.alert("","收获地址过长！小于50个字");
            return false;
        }
        else if(fm.phone.length > 11){
            $rootScope.alert("","请输入正确的手机号码!");
            return false
        }
        else if(fm.userName.length < 2 ||  fm.userName.length > 5){
            $rootScope.alert("","请输入正确的收货人姓名!");
            return false;
        }
        else if(!chineseReg.test(fm.userName)){
            $rootScope.alert("","请输入中文!");
            return false;
        }

        return true;

    }

    //添加地址
    $scope.addAddress = function(){

        $scope.isSubmit = true;

        //检查字段
        if(!checkAddress($scope.fm)){
            $scope.isSubmit = false;
            return;
        }


        var temp = $scope.fm.baseAddress.split(" ");
        var provice = temp[0];
        var city = temp[1];
        var district = temp[2];

        AddressSev.addAddress($rootScope.token,provice,city,district,$scope.fm.street,$scope.fm.userName,$scope.fm.phone).then(function(res){

            if(res.rtnCode == "0000000"){
                $rootScope.alert("","地址添加成功");
                //加入本地缓存
                var address = Util.setLgObj("address",res.bizData);
                //reset数据
                Util.removeSg("selectAddress");
                $rootScope.go("mall.address.list");
            }
            else{
                alert(res.msg);
            }

        },function(){
//            $scope.isSubmit = false;
        });

    }


    $scope.resetAdd = function(){
        //reset数据
        Util.removeSg("selectAddress");
        $scope.fm = {};

        var address = Util.getLgObj("address");

        //address 有值
        if(address){
            $rootScope.backToView('mall.address.list');
        }
        else{
//            $rootScope.backToView('mall.detail');
            $rootScope.back();
        }


    }


}]);