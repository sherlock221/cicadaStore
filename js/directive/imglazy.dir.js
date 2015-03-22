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