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
PointMall.controller("MallExchangeCtrl",["$scope","$ionicScrollDelegate","$rootScope","$timeout","$stateParams","Util","MallSev",function($scope,$ionicScrollDelegate,$rootScope,$timeout,$stateParams,Util,MallSev){

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
                else
                {
                    $scope.posts = $scope.posts.concat(res.bizData);
                    $scope.fm.queryTime = res.bizData[res.bizData.length-1].createDate;
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
                    $scope.fm.queryTime = res.bizData[res.bizData.length-1].createDate;
                    $scope.posts = res.bizData;

                    if(res.bizData == 0){
                        $scope.isNotProduct = true;
                    }
                    else{
                        //从新加载
                        $scope.isMore = true;
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

}]);
PointMall.controller("MallDetailCtrl",["$state","$stateParams","$scope","$rootScope","Util","AddressSev","MallSev",function($state,$stateParams,$scope,$rootScope,Util,AddressSev,MallSev){
   //获得当前选择的商品
   var  product = Util.getSgObj("product");
        console.log(product.comment);
        product.comment =  JSON.parse(product.comment);
        $scope.post = product;


     //兑换状态
     $scope.notExchange = true;
     $scope.isExchangeMsg = "不足兑换";

    if($rootScope.user.credit   -  product.credit  >= 0){
        $scope.notExchange = false;
        $scope.isExchangeMsg = "兑换";
    }

    //去相应流程
    $scope.goPage = function(){

        //判断商品类型
        switch (product.productionType){
            //邮寄类
            case  1 :
                checkAddress();
                break;


            //自取
            case  2 :
                alert("自取");
                break;

            //电子卷
            case  3 :
                checkBook();
                break;

            //虚拟话费
            case  4 :
                checkVirtual();
                break;
            default :
                alert("无");
                break;
        }
    }

    //检查地址
    var  checkAddress = function(){
       var  address = Util.getLgObj("address");
//       if(address){
//           $rootScope.go("mall.address.list");
//       }
//       else{
           //拉取address
           $rootScope.loading(true);
           AddressSev.getAddress($rootScope.token).then(function(res){
               $rootScope.loading(false);

               if(res.bizData.length > 0){

                   //更新本地缓存
                   Util.setLgObj("address",res.bizData);

                   //跳转list
                   $rootScope.go("mall.address.list");
               }
               else{

                   Util.removeLg("address");

                   //跳转添加
                   $rootScope.go("mall.address.add");
               }

           },function(){
               $rootScope.loading(false);
           });

//       }


    }

    //话费部分
    var  checkVirtual = function(){

        $rootScope.go("mall.virtual.input");
    }

    //电子卷部分
    var  checkBook = function(){
        var comment = "";
        //兑换电子卷
        $rootScope.loading(true);
        MallSev.exchange($rootScope.token,product.productionId,product.productionType,comment).then(function(res){
            $rootScope.loading(false);
            if(res.rtnCode == "0000000"){
                res.bizData.productionName = product.productionName;
                Util.setSgObj("volume",res.bizData);
                $state.go("mall.volume");

            }
            else{
                $rootScope.alert("",res.msg);
            }
        },function(){
            $rootScope.loading(false);
        });


    }
}]);
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
PointMall.controller("MallCtrl",["$state", "$stateParams", "$location", "$scope", "$timeout", "$rootScope", "$ionicLoading","$ionicScrollDelegate","$ionicPopup", "Util", "MallSev",function ($state, $stateParams, $location, $scope, $timeout, $rootScope, $ionicLoading,$ionicScrollDelegate,$ionicPopup, Util, MallSev) {
//        console.log($location.$$url);


    //获得token
    var paramsUrl;
    if ($location.$$absUrl.indexOf("#") == -1) {
        paramsUrl = $location.$$absUrl.substring($location.$$absUrl.indexOf("?") + 1, $location.$$absUrl.length);

    }
    else {
        paramsUrl = $location.$$absUrl.substring($location.$$absUrl.indexOf("?") + 1, $location.$$absUrl.indexOf("#"));
    }

    paramsUrl = Util.parseParams(paramsUrl);
    var token = Util.getParam("token", paramsUrl);
    if (!token) {
        alert("token为空!");
        return;
    }


   // alert(JSON.stringify(paramsUrl));

    $rootScope.isLoadingVal = false;
    $rootScope.token = token;
    console.log($rootScope.token);


    //全局机型
    $rootScope.MOBILE = {
        version : Util.getParam("version", paramsUrl) || "",
        clientType : Util.getParam("clientType", paramsUrl) || ""
    }


    console.log($rootScope.MOBILE);

    $rootScope.user = {
        credit: ""
    }

    if (!$rootScope.token) {
        alert("token失效");

    }

    //返回某个state
    $rootScope.backToView = function (stateName) {
        Util.backToView(stateName);
    }

    $rootScope.go = function (stateName,param) {
        param = param || {};
        $state.go(stateName,param);
    }

    //全局弹出
    $rootScope.alert = function (title, template) {
        $ionicPopup.alert({
            title: title || "",
            template: template,
            okText: "确定"

        });
    }


    //返回到滚动条顶部
    $rootScope.scrollTopByName = function(scrollName){
        $ionicScrollDelegate.$getByHandle(scrollName).scrollTop();
    }

    //计算banner宽高比
    var screenWidth = document.body.clientWidth;
    var bannerScale = 750 / 340;
    $scope.bannerHeight = screenWidth / bannerScale;


    //获得用户活跃
    $rootScope.getUser = function (token) {
        $rootScope.isLoadingVal = true;
        MallSev.getUserCreadit(token).then(function (res) {
            $rootScope.isLoadingVal = false;
            $rootScope.user.credit = res.bizData.credit;

        }, function (err) {
            $rootScope.isLoadingVal = false;
        });
    }


    //获得用户列表
    $rootScope.getUser($rootScope.token);

    $rootScope.goCicadaVal = function () {

        if($rootScope.MOBILE.clientType == "iOS"){
            window.location="cicada://cicadaStore/gotoActiveValue";
//            cicadaStore.gotoActiveValue();
        }
        else{
            window.cicadaStore.gotoActiveValue();
        }

    }

    $rootScope.goCicadaBack = function () {
        if($rootScope.MOBILE.clientType == "iOS"){
            window.location="cicada://cicadaStore/back";
//            cicadaStore.back();
        }
        else{
            window.cicadaStore.back();
        }
    }


    //loading
    $rootScope.loading = function(toggle){
        if(toggle){
            $ionicLoading.show();
        }
        else{
            $ionicLoading.hide();
        }
    }


    $rootScope.back = function(toggle){
       Util.back();
    }

}]);
var SelectPCA = angular.module("selectPCA",[])
    .controller("SelectProvinceCtrl",["$scope", "$rootScope", "$timeout","Util","selectPCASev","GeoLocationSev",function ($scope, $rootScope, $timeout,Util,selectPCASev,GeoLocationSev) {
        console.log("province controller only one ...");

        $scope.fm ={
            geoAddress : ""
        }

        //定位标志
        $scope.isGeoLoading = true;

            //定位
              GeoLocationSev.LBS()
                  .then(function(val){
                      var longitude = val.coords.longitude;
                      var latitude = val.coords.latitude;
                      console.log(longitude,latitude);
                      return  GeoLocationSev.geocoder(latitude,longitude);
                  },function(err){
                      console.log(err);
                      $rootScope.alert("",err.msg);
                      $scope.isGeoLoading = false;
                  })
                  .then(function(res){
                      if(res.rtnCode && res.rtnCode == "0000000"){
                          var  address =  JSON.parse(res.bizData.addressJson).result.addressComponent;
                          $scope.fm.geoAddress = address.province + " "+address.city + " "+  address.district;
                      }
                      else if(!res.rtnCode){

                      }
                      else{
                          $rootScope.alert("",res.msg);
                      }

                      $scope.isGeoLoading = false;

                  },function(){
                      $scope.isGeoLoading = false;
                  });


//        var longitude = 108.8820463792503;
//        var  latitude  = 34.22558449211924;
//
//        GeoLocationSev.geocoder(latitude,longitude) .then(function(res){
//            if(res.rtnCode == "0000000"){
//                var  address =  JSON.parse(res.bizData.addressJson).result.addressComponent;
//                $scope.fm.geoAddress = address.province + " "+address.city + " "+  address.district;
//            }
//            $scope.isGeoLoading = false;
//
//        },function(){
//            $scope.isGeoLoading = false;
//        });


        $scope.posts = [];

        //选择定位的
        $scope.selectLBS  = function(){
            if($scope.fm.geoAddress != ""){
                        var tempList = $scope.fm.geoAddress.split(" ");
                        Util.setSgObj("selectAddress",{
                            province : tempList[0],
                            city : tempList[1],
                            area : tempList[2]
                        })

                //走掉
                $rootScope.backToView("mall.address.add");
            }
        }


        var selectProvice  =function(){
            //查询省
            selectPCASev.getProvinceList().then(function(res){
                console.log("走了一遍省");
                $scope.posts = res;
            });
        }


        $scope.goCity = function(post){
            Util.setSgObj("selectAddress",{province : post.name});
            $rootScope.go("mall.select.city",{code : post.code});
        }

        //init 完成后的调用
        selectProvice();
    }])

    .controller("SelectCityCtrl",["$scope", "$stateParams","$rootScope","Util","selectPCASev",function ($scope, $stateParams,$rootScope,Util,selectPCASev) {
        console.log("city controller only one ...");

        var code = $stateParams.code;
        $scope.posts = [];

        //查询省
        selectPCASev.getCityByProvince(code).then(function(res){
            console.log("走了一遍市");
            $scope.posts = res;
        });

        $scope.goArea = function(post){
            var selectAddress = Util.getSgObj("selectAddress");
            selectAddress.city = post.name;
            Util.setSgObj("selectAddress",selectAddress);
            $rootScope.go("mall.select.area",{code : post.code});
        }
    }])

    .controller("SelectAreaCtrl",["$scope", "$stateParams","$rootScope", "Util","selectPCASev",function ($scope, $stateParams,$rootScope, Util,selectPCASev) {
        console.log("area controller only one ...");
        $scope.posts = [];
        var code = $stateParams.code;

        //查询省
        selectPCASev.getAreaByCity(code).then(function(res){
           console.log("走了一遍区");
            $scope.posts = res;
        });

        $scope.finish = function(post){
           //跳转到
            var selectAddress = Util.getSgObj("selectAddress");
            selectAddress.area = post.name;
            Util.setSgObj("selectAddress",selectAddress);
            $rootScope.go("mall.address.add");
        }
    }]);
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
PointMall.controller("VolumeExchange",["$state","$state","$ionicPopup","$scope","Util","MallSev",function($state,$rootScope,$ionicPopup,$scope,Util,MallSev){

}]);
PointMall.controller("VolumeInputCtrl",["$state","$rootScope","$ionicPopup","$scope","Util","MallSev",function($state,$rootScope,$ionicPopup,$scope,Util,MallSev){
    //获得当前选择的商品
    var  volume = Util.getSgObj("volume");
    $scope.post = volume;


    $scope.goShop = function(post){
        //window.open(post.shopUrl);
        alert("请在pc或手机浏览器内 兑换 ");
    }
}]);