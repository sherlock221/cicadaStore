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


