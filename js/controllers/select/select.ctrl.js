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