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


