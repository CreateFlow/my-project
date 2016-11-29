(function($) {
    require(['loading/avalon.loading'], function() {

        avalon.ready(function() {
            var categoryMenuCtrl = avalon.define('categoryMenuCtrl', function(vm) {
                //一级导航数据
                vm.navData = [];
                vm.navItemData = {brandList:[], secondCategoryList:[]};

                vm.$leftNavLoadingOptions = {
                    color: '#382223',
                    modal: true,
                    modalOpacity: 1,
                    modalBackground: '#eceae9'
                };
            });

            avalon.scan();

            //获取数据
            io.GET(apiConfig.indexNavList, function(data) {
                categoryMenuCtrl.navData = data.result;
                avalon.scan();

                menuHover($('.m-menu'), $('.m-menu-li'), $('.m-menu-right'), 'm-menu-li-active', $('.m-menu-title'));
                //关闭loading
                var leftNavLoadingCtrl = avalon.vmodels['leftNavLoading'];
                if(leftNavLoadingCtrl) {
                    leftNavLoadingCtrl.hideLoading();
                }
            });

            //导航栏展开
            $('.m-menu').hover(function(){
                $(this).children('.m-menu-left').stop(false,true).slideDown(300);
            },function(){
                $(this).children('.m-menu-left').stop(true,false).slideUp(300);
            })

            //分类滚动，页面则不滚动
            $(window).load(function(){
                document.getElementById('nav').onmousewheel = function(event) { 
                if (!event) event = window.event; 
                    this.scrollTop = this.scrollTop - (event.wheelDelta ? event.wheelDelta : -event.detail); 
                    return false; 
                }
            })
        });
    });

    //菜单导航
    function menuHover(wrap, obj, tObj, sClass, oTitle) {
        wrap.hover(function(e) {

        }, function(e) {
            tObj.hide();
            obj.removeClass(sClass);
        });
        obj.hover(function() {
            var index=$(this).index();
            avalon.vmodels['categoryMenuCtrl'].navItemData = avalon.vmodels['categoryMenuCtrl'].navData[index];
            $('.m-menu-right').hide();
            $(this).parents('.m-menu-left-content').siblings('.m-menu-right').show();
            obj.removeClass(sClass);
            $(this).addClass(sClass);
        });
        oTitle.hover(function() {
            if(0 < avalon.vmodels['categoryMenuCtrl'].navData.length) {
                //关闭loading
                var leftNavLoadingCtrl = avalon.vmodels['leftNavLoading'];
                if(leftNavLoadingCtrl) {
                    leftNavLoadingCtrl.hideLoading();
                }                    
            }            
            obj.removeClass(sClass);
            tObj.hide();
        });
    }

    //菜单导航更多
    function moreHover(obj, tObj, pObj) {
        obj.hover(function() {
            clearTimeout(t1);
            var t1 = setTimeout(function() {
                tObj.css('maxHeight', '999999px');
                obj.stop(true, true).fadeOut(300);
            }, 10);
        });
        pObj.hover(function() {}, function(e) {
            clearTimeout(t2);
            var t2 = setTimeout(function() {
                tObj.css('maxHeight', '459px');
                obj.stop(true, true).fadeIn(300);
            }, 500);
        });
    }

}(jQuery));

