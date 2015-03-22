PointMall.controller("AddressAddCtrl",function($scope,$rootScope,Util,AddressSev,selectPCASev){
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

    });



    $scope.goSelectAddress = function(){
        //初始化check
        selectPCASev.check(function(){
            $rootScope.go("mall.select.province");
        });

    }


    //添加地址
    $scope.addAddress = function(){
        $scope.isSubmit = true;

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
        $rootScope.backToView('mall.address.list');
    }


});