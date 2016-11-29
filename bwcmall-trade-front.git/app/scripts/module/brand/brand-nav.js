avalon.ready(function() {
    var index = 0;
    var brandNavCtrl = avalon.define('brandNavCtrl', function(vm) {
        vm.brandList = {};
        vm.getIndex = function() {
            return index++;
        };
        vm.menuClick = function() {
            $text = '#' + $(this).text();
            if ($text == '##') {
                $scrollTop = $('#other').offset().top - 48;
            } else {
                $scrollTop = $($text).offset().top - 48;
            }

            $("body,html").animate({
                scrollTop: $scrollTop
            }, 400);
            $('.brand-menu-link').removeClass('brand-menu-link-active');
            $(this).addClass('brand-menu-link-active');
        };
        vm.itemmouseenter = function() {
            var $obj = $(this).children('.brand-block_hidden');

            $obj.show();
            $obj.find('span').animate({
                marginTop: '40px'
            }, 300);
        };
        vm.itemmouseleave = function() {
            var $obj = $(this).children('.brand-block_hidden');

            $obj.find('span').animate({
                marginTop: '80px'
            }, 300);
            $obj.hide();
        };
    });

    //获取品牌数据
    io.GET(apiConfig.brandNav, function(data) {
        brandNavCtrl.brandList = data.result;
    });



    //监控滚动条导航事件
    $(window).scroll(function() {

        setFixBrandMenuTop();

        //brand-menu-link-active
        var $items = $('.brand-content-wrap').find('.brand-nav-tag'),
            $menu = $(".fix-brand-menu"),
            $top = $(document).scrollTop(),
            $currentId = ""; //滚动条现在所在位置的item id

        $items.each(function() {
            var m = $(this);
            //注意：m.offset().top代表每一个item的顶部位置
            if ($top > m.offset().top - 60) {
                $currentId = m.text();
            } else {
                return false;
            }
        });
        var $currentLink = $menu.find(".brand-menu-link-active");
        if ($currentId && $currentLink.text() != $currentId) {
            $('.brand-menu-link').removeClass("brand-menu-link-active");
            for (var i = 0; i < $('.brand-menu-link').length; i++) {
                if ($('.brand-menu-link').eq(i).text() == $currentId) {
                    $('.brand-menu-link').eq(i).addClass("brand-menu-link-active");
                    return;
                }
            }
        }
    });

    avalon.scan();
});

//动态调整右侧菜单的位置，主要因为有些小屏幕的情况下 右侧菜单显示不完整
function setFixBrandMenuTop() {
    var hScrollTop = $(window).scrollTop();
    var activeTop = $('.brand-menu-link-active').offset().top;
    var windowHeight=$(window).height();

    if (hScrollTop >= 200) {
        if ($(".fix-brand-menu").css("top") == "210px") {
            $(".fix-brand-menu").css("top", 50);
        }
        if(activeTop-hScrollTop > windowHeight-50){
            $('.fix-brand-menu').css({'bottom':10+'px','top':'auto'})
        }
    } else {
        $(".fix-brand-menu").css("top", 210);
    }
}