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
/**
 * Created by sherlock221b on 15-3-15.
 * HTML5 LBS定位
 */

SelectPCA
    .factory("GeoLocationSev",["$http","$q","SERVER",function ($http,$q,SERVER) {

        if(!navigator.geolocation){
            alert('您的浏览器不支持使用HTML 5来获取地理位置服务');
        }

        var  ak = "";

        //格式化错误
        var formatError = function(val){
            var msg;
            switch(val.code){
                case 1:
                    msg =  '位置服务被拒绝';
                    break;
                case 2:
                    msg ='暂时获取不到位置信息';
                    break;
                case 3:
                    msg ='获取信息超时';
                    break;
                case 4:
                    msg = '未知错误';
                    break;
            }
            var message = {
                code : val.code,
                msg  : msg
            }

            return message;
        }

        //公开方法
        return {
            //获得经纬度
            LBS  : function(){
                console.log("开始定位");
                var defer = $q.defer();

                navigator.geolocation.getCurrentPosition(function(val){
                    defer.resolve(val)
                }, function(val){
                    defer.reject(formatError(val));
                }, {enableHighAccuracy:true, maximumAge:1000});
                return defer.promise;
            },


            /**
             * 逆地址
             * @param lat 纬度
             * @param lng 经度
             * @returns {promise|*|promise|promise}
             */
            geocoder : function(lat,lon){
                var defer = $q.defer();
                $http.post(SERVER.url.mall+"/address/getAddressByLatAndLong",{
                    "style" : "",
                    "clientInfo" : {},
                    "data" : {
                        "latitude" : lat,
                        "longitude" : lon
                    }
                }).success(function(res){
                    defer.resolve(res);
                }).error(function(error){
                    defer.reject(error);
                });
                return defer.promise;
            }
        }
    }]);

PointMall
    .factory("MallSev",["$http","$q","SERVER",function($http,$q,SERVER){
        var  MallSev  =  {

            //获得商品列表
            getProduct : function(token,queryTime){
                var defer = $q.defer();
                $http.post(SERVER.url.mall+"/credit/getProductionList",{
                    "style" : "",
                    "clientInfo" : {},
                    "data" : {
                        "token" : token,
                        "queryTime" : queryTime
                    }
                }).success(function(res){
                    defer.resolve(res);
                }).error(function(error){
                    defer.reject(error);
                });

                return defer.promise;

            },


            //获得商品详情
            getProductDetail : function(productionId){
                var defer = $q.defer();
                $http.post(SERVER.url.mall+"/credit/queryProductionDetailById",{
                    "style" : "",
                    "clientInfo" : {},
                    "data" : {
                        "productionId": productionId
                    }
                }).success(function(res){
                    defer.resolve(res);
                }).error(function(error){
                    defer.reject(error);
                });

                return defer.promise;
            },


            //兑换
            exchange : function(token,productionId,productionType,comment){
                var defer = $q.defer();
                $http.post(SERVER.url.mall+"/credit/exchangeProduction",{
                    "style" : "",
                    "clientInfo" : {},
                    "data" : {
                        "token" : token,
                        "productionId" : productionId,
                        "productionType":productionType,
                        "comment" : comment
                    }
                }).success(function(res){
                    defer.resolve(res);
                }).error(function(error){
                    defer.reject(error);
                });

                return defer.promise;
            },



            //获得兑换列表
            getExchange : function(token,queryTime){
                var defer = $q.defer();
                $http.post(SERVER.url.mall+"/credit/queryExchangeProductionListByUserId",{
                    "style" : "",
                    "clientInfo" : {},
                    "data" : {
                        "token" : token,
                        "queryTime" : queryTime
                    }
                }).success(function(res){
                    defer.resolve(res);
                }).error(function(error){
                    defer.reject(error);
                });

                return defer.promise;
            },

            //获得兑换列表详情
            getExchangeDetail : function(token,exchangeId){
                exchangeId = parseInt(exchangeId);
                var defer = $q.defer();
                $http.post(SERVER.url.mall+"/credit/queryExchangeDetailById",{
                    "style" : "",
                    "clientInfo" : {},
                    "data" : {
                        "token" : token,
                        "exchangeId" : exchangeId
                    }
                }).success(function(res){
                    defer.resolve(res);
                }).error(function(error){
                    defer.reject(error);
                });

                return defer.promise;

            },

            //获得用户积分
            getUserCreadit : function(token){
                var defer = $q.defer();
                $http.post(SERVER.url.mall+"/credit/getUserCreditByUserId",{
                    "style" : "",
                    "clientInfo" : {},
                    "data" : {
                        "token" : token
                    }
                }).success(function(res){
                    defer.resolve(res);
                }).error(function(error){
                    defer.reject(error);
                });
                return defer.promise;
            }
        };
        return MallSev;
    }])

    .factory("AddressSev",["$http","$q","SERVER",function($http,$q,SERVER){
        var  AddressSev  =  {
            //获得地址
            getAddress : function(token){
                var defer = $q.defer();
                $http.post(SERVER.url.mall+"/address/getAddresses",{
                    "style" : "",
                    "clientInfo" : {},
                    "data" : {
                        "token" : token
                    }
                }).success(function(res){
                    defer.resolve(res);
                }).error(function(error){
                    defer.reject(error);
                });
                return defer.promise;
            },
            //添加地址
            addAddress : function(token,provice,city,district,street,userName,phone){
                var defer = $q.defer();
                $http.post(SERVER.url.mall+"/address/insertAddress",{
                    "style" : "",
                    "clientInfo" : {},
                    "data" : {
                        "token": token,
                        "provice": provice,
                        "city": city,
                        "district": district,
                        "street": street,
                        "userName": userName,
                        "phone": phone
                    }
                }).success(function(res){
                    defer.resolve(res);
                }).error(function(error){
                    defer.reject(error);
                });
                return defer.promise;
            }

        };
        return AddressSev;
    }])

.filter("exchangeStatus",["$http","$q","SERVER",function(){
        return function(status,type) {

            //邮寄
            if(type && type == 1){

                if (status == 0) {
                    return "配送中";
                }
                else {
                    return "已完成";
                }

            }

            //话费
            else if(type && type == 4){

                if (status == 0) {
                    return "充值中";
                }
                else {
                    return "已完成";
                }

            }
            //电子卷
            else if(type && type == 3){
                  return  "兑换成功"
            }

        }

 }]);


/**
 * websql省市区缓存
 * sherlock221b
 */

SelectPCA.constant("PCA_SQL", {

    CREATE: {
        TABLE: {
            PROVINCE: "create table if not exists cicada_province (id INTEGER PRIMARY KEY,code INTEGER,name TEXT)",
            CITY: "create table if not exists cicada_city (id INTEGER PRIMARY KEY  ,code INTEGER,name TEXT,province INTEGER  )",
            AREA: "create table if not exists cicada_area (id INTEGER PRIMARY KEY ,code INTEGER,name TEXT,city INTEGER  )"
        }

    },
    SELECT: {
        ALL_PROVINCE: "select * from cicada_province",
        CITY: "select * from cicada_city as c where c.province=?",
        AREA: "select * from cicada_area as a where a.city=?"
    },
    DROP: {
        TABLE: {
            PROVINCE: "drop table cicada_province",
            CITY: "drop table cicada_city",
            AREA: "drop table cicada_area"
        }
    }
})

SelectPCA
    .factory("AddressDataSourceSev", ["$http", "$q", "SERVER",function ($http, $q, SERVER) {
        return {
            getProvince: function () {
                var defer = $q.defer();
                $http.get(SERVER.url.resource + "/sql/p.sql").success(function (res) {
                    res = res.split(";");
                    defer.resolve(res);
                }).error(function (err) {
                        defer.reject();
                    });
                return defer.promise;
            },
            getCity: function () {
                var defer = $q.defer();
                $http.get(SERVER.url.resource+ "/sql/c.sql").success(function (res) {
                    res = res.split(";");
                    defer.resolve(res);
                }).error(function (err) {
                        defer.reject();
                    });
                return defer.promise;
            },
            getArea: function () {
                var defer = $q.defer();
                $http.get(SERVER.url.resource + "/sql/a.sql").success(function (res) {
                    res = res.split(";");
                    defer.resolve(res);
                }).error(function (err) {
                        defer.reject();
                    });
                return defer.promise;
            }
        }
    }]);

SelectPCA
    .factory("selectPCASev", ["$q", "$rootScope","PCA_SQL","Util","VERSION","AddressDataSourceSev",function ($q, $rootScope,PCA_SQL,Util,VERSION,AddressDataSourceSev) {

        var selectPCADao = function () {  }

        selectPCADao.prototype.check = function(callBack){

            var addressDataBase = Util.getLgObj("addressDataBase");
            //打开数据库
            try{
                this.db = window.openDatabase("cicadaStore", "2.0", "cicadaStore", 2*1024 * 1024);
                console.log("2.0 database");
            }
            catch(ex){
                alert(""+ex);
            }

            if(!addressDataBase ||  addressDataBase.version != VERSION.ADDRESS_SOURCE_VERSION ){
                Util.loading(true);
                this.init(callBack);
            }
            else{
                console.log("地址已经缓存..");
                callBack();
            }
        }

        selectPCADao.prototype.init= function (callBack) {
            drop(this.db);
            initTable(this.db);
            initData(this.db,callBack);
        }


        selectPCADao.prototype.open = function(){
            this.db = window.openDatabase("cicadaStore", "2.0", "cicadaStore", 2*1024 * 1024);
        }


        /**
         * 查询省
         * @type {selectPCADao}
         */
        selectPCADao.prototype.getProvinceList = function(){
           return  Util.selectSql(this.db,PCA_SQL.SELECT.ALL_PROVINCE);
        }

        /**
         * 查询市
         * @param provinceCode
         * @returns {*|void|SQLResultSet}
         */
        selectPCADao.prototype.getCityByProvince= function(provinceCode){
            return Util.selectSql(this.db,PCA_SQL.SELECT.CITY,[provinceCode])
        }

        /**
         * 查询区
         * @param cityCode
         * @returns {*|void|SQLResultSet}
         */
        selectPCADao.prototype.getAreaByCity= function(cityCode){
            return Util.selectSql(this.db,PCA_SQL.SELECT.AREA,[cityCode])
        }


        /**
         * 创建表
         */
        var initTable = function(db){
            db.transaction(function (tx) {
                tx.executeSql(PCA_SQL.CREATE.TABLE.PROVINCE, [],
                    function (tx, result) {
                        console.log('创建province表成功', result);
                    },
                    function (tx, error) {
                        console.log('创建province表失败:' + error.message);
                    });
                tx.executeSql(PCA_SQL.CREATE.TABLE.CITY, [],
                    function (tx, result) {
                        console.log('创建CITY表成功', result);
                    },
                    function (tx, error) {
                        console.log('创建CITY表失败:' + error.message);
                    });
                tx.executeSql(PCA_SQL.CREATE.TABLE.AREA, [],
                    function (tx, result) {
                        console.log('创建AREA表成功', result);
                    },
                    function (tx, error) {
                        console.log('创建AREA表失败:' + error.message);
                    });
            });
        }

        /**
         * 初始化数据
         */
       var  initData = function (db,callBack) {
            var _this = this;

            $q.all({
                f1: AddressDataSourceSev.getProvince(),
                f2: AddressDataSourceSev.getCity(),
                f3: AddressDataSourceSev.getArea()
            })
            .then(function (res) {

                    db.transaction(function (tx) {
                        var addressSql  = res.f1.concat(res.f2).concat(res.f3);
                        var count = 0;
                        //数据量
                        var total = 3239;
                        var addCount = function(){
                            count++;
                            if(count >= total ){
                                Util.setLgObj("addressDataBase",{"isUpdate":"1","version":VERSION.ADDRESS_SOURCE_VERSION});
                                callBack();
                                Util.loading(false);
                                console.log("创建完成");

                            }
                        }

                        //数据容错处理
                        var  errorFn  = function(tx,error){
                            Util.loading(false);
                            console.log(tx);
                        }

                        //创建数据
                        for(var i =0; i <addressSql.length; i++){
                            var sql  = addressSql[i];
                            if(sql){
                                tx.executeSql(sql, [],addCount,errorFn)
                            }
                        }
                    });
            }, function (error) {
               Util.loading(false);
                console.log(error);
            })

        }

        /**
         * 删除表
         */
        var drop = function (db) {
             db.transaction(function (tx) {
                tx.executeSql(PCA_SQL.DROP.TABLE.PROVINCE, []);
                tx.executeSql(PCA_SQL.DROP.TABLE.CITY, []);
                tx.executeSql(PCA_SQL.DROP.TABLE.AREA, []);
            });
        }




        var pcaDao = new selectPCADao();
        return pcaDao;
    }])

PointMall
    .factory("Util", ["$window", "$q","$ionicLoading","$ionicHistory",function ($window, $q,$ionicLoading,$ionicHistory) {
        return {

            getSgObj: function (key) {
                var obj = $window.sessionStorage.getItem(key);
                return  JSON.parse(obj);
            },
            setSgObj: function (key, value) {
                return $window.sessionStorage.setItem(key, JSON.stringify(value));
            },

            getSg: function (key) {
               return  $window.sessionStorage.getItem(key);
            },

            setSg: function (key, value) {
                $window.sessionStorage.setItem(key, value);
            },
            remove : function(key){
                $window.sessionStorage.removeItem(key);
            },

            removeSg : function(key){
                $window.sessionStorage.removeItem(key);
            },

            loading : function(toggle){
                if(toggle){
                    $ionicLoading.show();
                }
                else{
                    $ionicLoading.hide();
                }
            },

            getLgObj: function (key) {
                var obj = $window.localStorage.getItem(key);
                return  JSON.parse(obj);
            },
            setLgObj: function (key, value) {
                return $window.localStorage.setItem(key, JSON.stringify(value));
            },

            getLg: function (key) {
               return  $window.localStorage.getItem(key);
            },

            setLg: function (key, value) {
                $window.localStorage.setItem(key, value);
            },
            removeLg : function(key){
                $window.localStorage.removeItem(key);
            },

           executeSql : function(db,sql,params){
                var defer = $q.defer();
                params = params || [];
               db.transaction(function(tx){
                   tx.executeSql(sql, params,function(tx,result){
                       defer.resolve(result);
                   },function(tx,error){
                       console.log(error);
                       defer.reject(error);
                   });
               });
                return defer.promise;
            },

            /**
             * 查询sql
             * @param db
             * @param sql
             * @param params
             * @returns {promise|*|promise|promise}
             */
            selectSql : function(db,sql,params){
                var defer = $q.defer();
                db.transaction(function(tx){
                    tx.executeSql(sql, params,function(tx,res){
                        var data = [];
                        for(var i=0; i<res.rows.length; i++){
                            data.push(res.rows.item(i));
                        }
                        defer.resolve(data);
                    },function(tx,error){
                        console.log(error);
                        defer.reject(error);
                    });
                });
                return defer.promise;
            },
            backToView : function(stateName){
                var historyId = $ionicHistory.currentHistoryId();
                var history = $ionicHistory.viewHistory().histories[historyId];
                for (var i = history.stack.length - 1; i >= 0; i--){
                    if (history.stack[i].stateName == stateName){
                        $ionicHistory.backView(history.stack[i]);
                        $ionicHistory.goBack();
                    }
                }
            },
            back : function(){
                $ionicHistory.goBack();
            },

            parseParams : function(paramsUrl){

                    var  paramsArray  = paramsUrl.split("&");
                    var  newParams = [];
                    for(var i =0; i<paramsArray.length;i++){
                        var objs = paramsArray[i].split("=");
                        var tt = '{"'+objs[0]+'": "'+objs[1]+'" }';
                        var newObj = JSON.parse(tt);
                        newParams.push(newObj);
                    }
                return newParams;

            },

            getParam : function(key,array){
                for(var i =0; i<array.length;i++){
                    var objs = array[i];
                    if(objs[key]){
                        return  objs[key];
                    }

                }
                return "";
            }
        }
    }]);



PointMall.directive("imgLazy", function () {
        //当前屏幕宽度
        var currentWidth  = document.body.clientWidth;
    return {
            restrict : "AE",
            transclude : true,
            template : '<div class="pos-rel inherit"><div ng-transclude></div><div class="baseMap"></div></div>',
            scope : {
            },
            link : function(scope,element,attr){
                var scale = attr.auto;
                var height;
                console.log(currentWidth);

                //计算比例
                if(scale){
                    console.log(currentWidth/scale);
                    height = currentWidth/scale +"px";
                }
                else{
                    height = attr.height;
                }
               element.css({
                   width: attr.width,
                   height :height
               });
            }

        }
});
PointMall.directive("spinner", function () {

        return {
            restrict : "E",
            template : "<div></div>",
            scope : {
                type : "@"
            },
            link : function(scope,element,attr){
                var ripple = '<svg version="1.1" id="loading-svg"  xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"  viewBox="0 0 64 64"> <g fill="none" fill-rule="evenodd" stroke-width="3"><circle cx="32" cy="32" r="9.42876"><animate attributeName="r" begin="0s" dur="2s" values="0;24" keyTimes="0;1" keySplines="0.1,0.2,0.3,1" calcMode="spline" repeatCount="indefinite"></animate><animate attributeName="stroke-opacity" begin="0s" dur="2s" values=".2;1;.2;0" repeatCount="indefinite"></animate></circle><circle cx="32" cy="32" r="22.335"><animate attributeName="r" begin="-1s" dur="2s" values="0;24" keyTimes="0;1" keySplines="0.1,0.2,0.3,1" calcMode="spline" repeatCount="indefinite"></animate><animate attributeName="stroke-opacity" begin="-1s" dur="2s" values=".2;1;.2;0" repeatCount="indefinite"></animate></circle></g> </svg>';
                if(scope.type == "ripple"){
                    element.html(ripple);
                }
            }

        }
});
/**
 * angularJS http拦截器
 */

PointMall
    .factory("AjaxInterceptors",["$window","$q","SERVER","$rootScope",function($window,$q,SERVER,$rootScope){
        return {
            //成功请求
            'request' : function(config ){

//                if(config.method == "POST"){
//                    if(!config.headers['is-form-data']){
//
//                        config.headers['Content-Type'] = "application/x-www-form-urlencoded";
//                        config.transformRequest = function(obj) {
//                            var str = [];
//                            for(var p in obj)
//                                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
//                            return str.join("&");
//                        }
//                    }
//                }

                return config ;
            },

            //成功返回
            response : function(response){
                return response;
            },

            //捕获返回异常
            responseError : function(response){
                var defer = $q.defer();
                var temp = {};

                switch (response.status) {
                    case (500):
                        temp.content  = "An error occurred on the server";
                        break;
                    case (401):
                        temp.content  = "You are not logged in";
                        break;
                    case (403):
                        temp.content  = "You do not have permission to perform this operation";
                        break;
                    case (404):
                        temp.content  = "Did not find the resources";
                        break;
                    case (408):
                        temp.content  = "The request timeout";
                        break;
                    default:
                        temp.content  = "Network error";
                }

                temp.type = "danger";
                temp.title = "error";
                temp.status = response.status;
                $rootScope.httpError = temp;
                defer.reject(response.status);
                return defer.promise;
            }
        }

    }]);