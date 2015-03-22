/**
 * angularJS http拦截器
 */

PointMall
    .factory("AjaxInterceptors",function($window,$q,SERVER,$rootScope){
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

    });