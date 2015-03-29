/**
 * sherlock221b
 * @type {module}
 */
var PointMall = angular.module('pointMall', ['ionic','selectPCA']);

PointMall.config(function ($ionicConfigProvider) {
    //android 平台下开启原生滚动模式  ionic1.0rc 版特性
//    if(!ionic.Platform.isIOS())$ionicConfigProvider.scrolling.jsScrolling(false);

    //默认策略是 back策略
    //极限缓存策略
//    $ionicConfigProvider.views.forwardCache(true);

})

PointMall.run(function ($ionicPlatform) {

    $ionicPlatform.ready(function () {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if (window.StatusBar) {
            StatusBar.styleDefault();
        }
    });
})

    .config(function ($stateProvider, $urlRouterProvider,VERSION) {
        $stateProvider

            .state("mall", {
                url: "/mall",
                abstract: true,
                templateUrl: "tpls/mall.html?v="+VERSION.URL_VERSION
            })
            //积分商城
            .state("mall.list", {
                url: "/list",
                templateUrl: "tpls/mall-list.html?v="+VERSION.URL_VERSION,
                controller: "MallListCtrl"
            })
            //商品信息
            .state("mall.detail", {
                url: "/detail",
                templateUrl: "tpls/mall-detail.html?v="+VERSION.URL_VERSION,
                controller: "MallDetailCtrl"

            })

//            .state("mall.exchange", {
//                url: "/exchange",
//                abstract: true
//            })


            //兑换记录
            .state("mall.exchange", {
                url: "/exchange",
                views: {
                    "@mall": {
                        templateUrl: "tpls/exchange/exchange-list.html?v="+VERSION.URL_VERSION
//                        controller: "MallExchangeCtrl"
                    }
                }
            })

            //兑换详情
            .state("mall.exchange.detail", {
                url: "/detail/:exchangeId",
                views: {
                    "@mall": {
                        templateUrl: "tpls/exchange/exchange-detail.html?v="+VERSION.URL_VERSION,
                        controller: "MallExchangeDetailCtrl"
                    }
                }
            })


            //虚拟话费
            .state("mall.virtual", {
                url: "/virtual",
                abstract: true
            })
            .state("mall.virtual.input", {
                url: "/input",
                views: {
                    "@mall": {
                        templateUrl: "tpls/virtual/virtual-input.html?v="+VERSION.URL_VERSION,
                        controller: "VirtualInputCtrl"
                    }
                }
            })

            //地址列表
            .state("mall.address", {
                url: "/address",
                abstract: true
            })
            .state("mall.address.list", {
                url: "/list",
                views: {
                    "@mall": {
                        templateUrl: "tpls/address/address-list.html?v="+VERSION.URL_VERSION,
                        controller: "AddressListCtrl"
                    }
                }
            })
            //添加地址
            .state("mall.address.add", {
                url: "/add",
                views: {
                    "@mall": {
                        templateUrl: "tpls/address/address-add.html?v="+VERSION.URL_VERSION,
                        controller: "AddressAddCtrl"
                    }
                }
            })


            //兑换卷
            .state("mall.volume", {
                url: "/volume",
                views: {
                    "@mall": {
                        templateUrl: "tpls/volume/volume-input.html?v="+VERSION.URL_VERSION,
                        controller: "VolumeInputCtrl"
                    }
                }
            })


            //选择省市区
            .state("mall.select", {
                url: "/select",
                abstract: true
            })
            .state("mall.select.province",{
                url : "/province",
                views: {
                    "@mall": {
                        templateUrl: "tpls/select/select-province.html?v="+VERSION.URL_VERSION,
                        controller: "SelectProvinceCtrl"
                    }
                }
            })
            .state("mall.select.city",{
                url : "/city/:code",
                views: {
                    "@mall": {
                        templateUrl: "tpls/select/select-city.html?v="+VERSION.URL_VERSION,
                        controller: "SelectCityCtrl"
                    }
                }
            })
            .state("mall.select.area",{
                url : "/area/:code",
                views: {
                    "@mall": {
                        templateUrl: "tpls/select/select-area.html?v="+VERSION.URL_VERSION,
                        controller: "SelectAreaCtrl"
                    }
                }
            })
        //默认路径
        $urlRouterProvider.otherwise('/mall/list');

    })

    //设置基本loading
    .constant('$ionicLoadingConfig', {
        template: '正在加载...',
        noBackdrop : true
    })

//配置http 拦截器
    .config(function ($httpProvider,$compileProvider) {
        $httpProvider.interceptors.push("AjaxInterceptors");
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|javascript):/);

    })
    //设置SEVER地址
    .constant('SERVER', {
        url: {
//            mall: "http://172.16.130.218:8086/credit",
            mall: "http://10.10.68.11:10000/credit",
//            mall: "http://imzhiliao.com:10000/credit",
//            mall: "./data" ,
//            mall: "/credit",
            resource : "./data"
        }
    })


    //协议
    .constant("PROTOCOL",{
        product : {
            status :  {
                //商品状态 -1 已下架
                shelf : "-1",
                //正常
                normal : "0",
                //未开始
                no_start : "1",
                //已经结束
                finish : "2"
            }
        }
    })


    //版本控制
    .constant("VERSION",{

        URL_VERSION : "5.5",
        ADDRESS_SOURCE_VERSION : "2.2"

    });
