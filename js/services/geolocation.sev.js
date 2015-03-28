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
