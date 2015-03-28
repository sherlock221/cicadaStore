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

