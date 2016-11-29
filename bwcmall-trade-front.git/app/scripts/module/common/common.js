'use strict';

(function(window, $) {

    function login(formData, btn, callBack) {
        var userName = formData.userName,
            password = formData.password,
            url = urlConfig.index;

        function error(data, textStatus, jqXHR) {
            storage.removeUser();
            callBack(data);
        }

        function success(data) {
            storage.setUser(data.result);
            if (!callBack) {
                urls.goRef(url);
            } else {
                callBack(data);
            }
        }

        if (typeof btn === 'function') {
            callBack = btn;
            btn = null;
        }

        if (userName && password) {
            return io.POST(apiConfig.login, formData, success, error, btn);
        }
    }

    function logout(btn) {

        function success(data) {
            storage.removeUser();
            urls.goLogin();
        }

        io.GET(apiConfig.logout, success, btn);
    }

    function toPay(sn, target) {
        if (!target) {
            target = "_self";
        }
        var snList = null;
        if (typeof sn === 'string') {
            snList = [];
            snList.push(sn);
        } else {
            snList = sn;
        }


        io.POST(apiConfig.orderDeltail + "paysign", snList, function(data) {
            var form = $('<form></form>').attr("style", 'display:none').attr("action", window.payUrl).attr("method", "POST")
                .attr("target", target);
            var jsondata = null;
            for (var key in data.result) {
                if (key == 'params') {
                    form.append('<input type="text" name="' + key + '" value="">');
                    jsondata = data.result[key];
                } else {
                    form.append('<input type="text" name="' + key + '" value="' + data.result[key] + '">');
                }

            }
            form.appendTo('body');

            $(form).find(":input[name=params]").val(jsondata);
            form.submit();

            form.remove();
        });

    }

    window.common = {
        login: login,
        logout: logout,
        toPay: toPay
    };
}(this, jQuery));


//$('.m-fold-title').click(function () {
//    if (!$(this).hasClass('m-fold-title-active')) {
//        $('.m-fold-title').removeClass('m-fold-title-active');
//        $(this).addClass('m-fold-title-active');
//        $('.m-fold-inner').slideUp(300);
//        $(this).siblings('.m-fold-inner').slideDown(300);
//    }
//});
//
//
//toggleClass('.m-fold-item', 'm-fold-item-active');
//toggleClass('.m-sort-item', 'm-sort-active');

//切换类
function toggleClass(obj, className) {
    $(obj).click(function() {
        $(obj).removeClass(className);
        $(this).addClass(className);
    });
}

//加入收藏夹
//$('.u-add-collection').click(function () {
//    if ($(this).hasClass('u-add-collection-active')) {
//        $(this).text('加入收藏夹');
//        $(this).removeClass('u-add-collection-active');
//        $(this).removeClass('a-fadein');
//    }
//    else {
//        $(this).text('已收藏');
//        $(this).addClass('u-add-collection-active');
//        $(this).addClass('a-fadein');
//    }
//});

//封装需要登录状态判断ajax
function loginAjaxGet(src, postData, isLogin, callBack, errorCallBack) {
    //是否登录
    if (isLogin) {
        $.post(src, postData, function(data) {
            if (data.type == 'success') {
                callBack(data);
            } else {
                errorCallBack(data);
            }
        }, 'json')
    }
}

//封装需要登录才能操作的ajax click
function loginAjaxClick(src, postData, targetUrl, url, callBack, errorCallBack) {
    $.ajax({
        type: "POST",
        url: src,
        data: postData,
        dataType: "json",
        success: function(data) {
            if (data.type == 'success') {
                //执行回调
                callBack(data);
            } else {
                errorCallBack(data);
            }
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            if (textStatus == "parsererror" || textStatus == "error") {
                //ajax执行报错跳转登录
                location.href = targetUrl + "?target-url=" + $.base64.btoa(url);
            }
        }
    });
}


////购物车数量加减
////加减号
//$('.m-inorder-minus').on('click',function () {
//    var $numObj = $(this).parent().children('span').children('.m-inorder-num');
//    if ($numObj.val() > 1) {
//        $numObj.val(parseInt($numObj.val()) - 1);
//    }
//});
//
//$('.m-inorder-add').on('click',function () {
//    var $numObj = $(this).parent().children('span').children('.m-inorder-num');
//    $numObj.val(parseInt($numObj.val()) + 1);
//});
////输入框数字输入限制
//function RepNumber(obj) {
//    var reg = /^[\d]+$/g;
//    console.log($(this).val());
//    if (!reg.test(obj.val())) {
//        var txt = obj.val();
//        txt.replace(/[^0-9]+/, function (char, index, val) {//匹配第一次非数字字符
//            obj.val(val.replace(/\D/g, ""));//将非数字字符替换成""
//            var rtextRange = null;
//            if (obj.setSelectionRange) {
//                obj.setSelectionRange(index, index);
//            } else {//支持ie
//                rtextRange = obj.createTextRange();
//                rtextRange.moveStart('character', index);
//                rtextRange.collapse(true);
//                rtextRange.select();
//            }
//        })
//    }
//}
////输入框只能输大于0数字
//$('.m-inorder-num').on('keyup',function () {
//    $(this).val($(this).val().replace(/[^0-9]/g, ''));
//    if($(this).val()<=0){
//        $(this).val(1);
//    }
//}).on("paste", function () {
//    //粘贴处理
//    $(this).val($(this).val().replace(/[^0-9]/g, ''));
//    if($(this).val()<=0){
//        $(this).val(1);
//    }
//});


////下拉框折叠
//$('.m-tabselect-nav-title a').click(function(){
//    $(this).parent().siblings('.m-tabselect-item-wrap').toggle();
//    $(this).text()=='－'?$(this).text('＋'):$(this).text('－');
//});
////下拉
//$('.m-tabselect-block').click(function(){
//    console.log(11111);
//    var $dis=$(this).siblings('.m-tabselect-body').css('display');
//    if($dis=='block'){
//        $('.m-tabselect-body').hide();
//        $('.m-tabselect-block').removeClass('m-tabselect-block-active');
//    }
//    else{
//        $('.m-tabselect-block').removeClass('m-tabselect-block-active');
//        $(this).addClass('m-tabselect-block-active');
//        $('.m-tabselect-body').hide();
//        $(this).siblings('.m-tabselect-body').show();
//    }
//});
//$('.m-tabselect-item').click(function(){
//    $(this).parents().siblings('.m-tabselect-block').text($(this).text());
//    $('.m-tabselect-block').removeClass('m-tabselect-block-active');
//    $('.m-tabselect-body').hide();
//});


/*jason_wzl start*/

/*bCheckBox v0.2 start*/
function bCheckBox(type, ischeck, options) {
    //type分"gray","red" 2个类型 差别就是选中按钮的颜色不一样
    this.bgType = type;
    this.bCheck = ischeck;
    this.bgUrl = "";
    this.bgOptions = options;
    this.thiso = "";
    this.that = "";
}

//返回checkbox选中状态
bCheckBox.prototype.isChecked1 = function(thiso) {
    return this.bCheck;
};
//返回checkbox选中状态
bCheckBox.prototype.isChecked2 = function(thiso) {
    //获取Dom元素的css样式(兼容w3c和ie的方式)
    var a = window.getComputedStyle ? window.getComputedStyle(thiso, null).backgroundImage : thiso.currentStyle.backgroundImage;
    var b = window.getComputedStyle ? a.slice(a.length - 6, a.length - 5) : a.slice(a.length - 7, a.length - 6);

    if (b != "0") {
        return true;
    } else {
        return false;
    }
};
//选中checkbox
bCheckBox.prototype.check = function(thiso) {
    this.bCheck = true;

    if (this.bgType == "gray") {
        this.bgUrl = this.bgOptions.url1;
    }
    if (this.bgType == "red") {
        this.bgUrl = this.bgOptions.url2;
    }

    thiso.style.backgroundImage = this.bgUrl;
};
//取消选中checkbox
bCheckBox.prototype.uncheck = function(thiso) {
    this.bCheck = false;
    this.bgUrl = this.bgOptions.url0;
    thiso.style.backgroundImage = this.bgUrl;
};
//checkbox click事件
bCheckBox.prototype.click = function(thiso) {
    //console.log(this);
    //if(this.bCheck){
    //    this.uncheck(thiso);
    //}else{
    //    this.check(thiso);
    //}

    //获取Dom元素的css样式(兼容w3c和ie的方式)
    var a = window.getComputedStyle ? window.getComputedStyle(thiso, null).backgroundImage : thiso.currentStyle.backgroundImage;
    var b = window.getComputedStyle ? a.slice(a.length - 6, a.length - 5) : a.slice(a.length - 7, a.length - 6);

    if (b != "0") {
        this.uncheck(thiso);
    } else {
        this.check(thiso);
    }
};

bCheckBox.prototype.setThis = function(thiso) {
    this.thiso = thiso;
};

bCheckBox.prototype.getThis = function() {
    return this.thiso;
};

/*bCheckBox v0.2 end*/


/** bCheckBox v0.3 start **/
/**
 * Created by jason_wzl on 2015/11/23.
 * mail: jason.wzl@qq.com
 *
 * 简单的jwCheckbox v0.3
 * 支持click自动切换选中状态
 * 支持全选和全取消选中
 * 支持灰色和红色
 */

/** 使用示例
 <div class="divc">
 <span class="jw-checkbox" data-ischeck="no" onclick="jwcbClick(this)"></span>
 <span class="jw-checkbox" data-ischeck="no" onclick="jwcbClick(this)"></span>
 <span class="jw-checkbox" data-ischeck="no" onclick="jwcbClick(this)"></span>
 <span class="jw-checkbox" data-ischeck="no" onclick="jwcbClick(this)"></span>

 <input type="button" value="check" onclick="jwcbAllCheck()"/>
 <input type="button" value="uncheck" onclick="jwcbAllunCheck()"/>
 </div>
 **/

var g_checkboxBgUrl = {
    url0: "url(/imgages/common/bcheckbox_0.png)",
    url1: "url(/imgages/common/bcheckbox_1.png)",
    url2: "url(/imgages/common/bcheckbox_2.png)"
};

/* 功 能 html标签属性的onclick处理函数 onclick="jwcbAllCheck()"
 * 参数1 thiso   被点击checkbox的jquery this对象
 * 参数2 ischeck 被点击checkbox的选中状态 只有["yes","no"]两个值
 * 参数3 color   选中时的颜色 不指定时默认灰色 支持红色["red"]
 */
/*
 function jwcbClick(thiso, color)
 {
 toggleCheckbox(thiso, thiso.attr("data-ischeck"), color);

 //其他业务处理代码放在这里
 //to do xxx..
 }
 */

/* 功 能 html标签属性的onclick处理函数 onclick="jwcbAllCheck()"
 * 参数1 thiso   被点击checkbox的jquery this对象
 * 参数2 ischeck 被点击checkbox的选中状态 只有["yes","no"]两个值
 * 参数3 color   选中时的颜色 不指定时默认灰色 支持红色["red"]
 */
function jwcbClickAll(thiso, color) {
    var c = thiso.attr("data-ischeck");
    if (c == "yes") {
        jwcbAllunCheck(null);
    }
    if (c == "no") {

        jwcbAllCheck(null, color);
    }

}

/* 功 能 切换选中和未选中状态
 * 参数1 thiso   被点击checkbox的jquery this对象
 * 参数2 ischeck 被点击checkbox的选中状态 只有["yes","no"]两个值
 * 参数3 color   选中时的颜色，不指定时默认灰色，支持红色["red"]
 */
function toggleCheckbox(thiso, ischeck, color) {
    //如果当前是选中状态 则置为未选中状态
    if (ischeck == "yes") {
        $(thiso).css("background-image", g_checkboxBgUrl.url0);
        $(thiso).attr("data-ischeck", "no");
    }
    if (ischeck == "no") {
        //如果有颜色就用指定颜色
        if (color == "red") {
            $(thiso).css("background-image", g_checkboxBgUrl.url2);
        }
        //否则默认灰色
        else {
            $(thiso).css("background-image", g_checkboxBgUrl.url1);
        }

        $(thiso).attr("data-ischeck", "yes");
    }
}

/* 示 例-可以这样来操作所有的checkbox
 * 功 能 页面上所有jwCheckbox的全部选中
 * 参数1 thiso 通过传入jquery选择器指定要选中的一个或多个checkbox
 * 参数2 color 选中时的颜色，不指定时默认灰色，支持红色["red"]
 */
function jwcbAllCheck(thiso, color) {
    if (thiso != null) {
        //如果有颜色就用指定颜色
        if (color == "red") {
            thiso.css("background-image", g_checkboxBgUrl.url2);
        }
        //否则默认灰色
        else {
            thiso.css("background-image", g_checkboxBgUrl.url1);
        }

        thiso.attr("data-ischeck", "yes");
    } else {
        //如果有颜色就用指定颜色
        if (color == "red") {
            $("[data-ischeck='no']").css("background-image", g_checkboxBgUrl.url2);
        }
        //否则默认灰色
        else {
            $("[data-ischeck='no']").css("background-image", g_checkboxBgUrl.url1);
        }

        $("[data-ischeck='no']").attr("data-ischeck", "yes");
    }
}

/* 示 例 可以这样来操作所有的checkbox
 * 功 能 页面上所有jwCheckbox的全部取消选中
 * 参数1 thiso 通过jquery选择器指定要取消选中的一个或多个checkbox
 */
function jwcbAllunCheck(thiso) {
    if (thiso != null) {
        thiso.css("background-image", g_checkboxBgUrl.url0);
        thiso.attr("data-ischeck", "no");
    } else {
        $("[data-ischeck='yes']").css("background-image", g_checkboxBgUrl.url0);
        $("[data-ischeck='yes']").attr("data-ischeck", "no");
    }
}
/*bCheckBox v0.3 end*/



/*jwMask v0.1 start*/

/**使用示例
 * js调用
 *
 //显示mask
 $("#mask-1").click(function(){
        jwMaskShowTips("你好", "再见");
    });

 //功能 响应窗口resize事件 这段代码放在使用dialog的页面里面比较好
 //如果放到common.js里面 会导致每个页面都会响应resize事件，但并没有做什么事情
 $(window).resize(function(){
    //如果遮罩层存在
    if(($(".jw-mask").css("display") != undefined) && ($(".jw-mask").css("display") != "none"))
    {
        jwMaskShow(g_dlg);
    }
});

 //通用的html对话框++++++++++++++++++++++++++++
 <button id="mask-1">mask1</button>

 <!--遮罩层-->
 <div class="jw-mask"></div>

 <!--遮罩层上面的对话框1 友情提示-->
 <div class="jw-dialog">

 <!--对话框header-->
 <div class="jw-dialog-header">
 友情提示
 </div>

 <!--对话框主要内容-->
 <div class="jw-dialog-content">
 <!--提示类信息-->
 <div class="dlg-tips">
 <p class="dlgt-info">您确定吗？</p>
 </div>
 </div>

 <!--对话框footer-->
 <div class="jw-dialog-footer">
 <!--有确定取消按钮用于需要用户确定类窗口-->
 <input type="button" value="取消" id="jwdf-cancel" onclick="jwDlgBtnCancel(this)" class="jwdf-btn jwdf-cancel"/>
 <input type="button" value="确定" id="jwdf-ok" onclick="jwDlgBtnOK(this)" class="jwdf-btn jwdf-ok" data-ok="null"/>
 <!--这个确定按钮用于提示类窗口-->
 <input type="button" value="关闭" id="jwdf-close" onclick="jwDlgBtnClose(this)" class="jwdf-btn jwdf-ok g-dn"/>
 </div>
 </div>
 //通用的html对话框--------------------------------

 * **/

/*业务代码相关函数 start*/
function jwDlgBtnCancel(thiso) {
    jwMaskHide();
}

function jwDlgBtnOK(thiso) {
    jwMaskHide();
}

function jwDlgBtnClose(thiso) {
    jwMaskHide();
}
/*业务代码相关函数 end*/

/*常用函数 start*/
/* 功 能 显示遮罩层
 * 参数1 argDlg 要显示的Dialog
 * */
var g_dlg = null;

function jwMaskShow(argDlg) {
    var mask = $(".jw-mask");
    g_dlg = argDlg ? argDlg : $(".jw-dialog");

    //重置背景的宽高
    mask.css("top", $(document).scrollTop());
    mask.css("left", $(document).scrollLeft());
    //+20是为了弥补滚动条隐藏后留下的空白
    mask.css("width", $(window).width() + 20);
    mask.css("height", $(window).height() + 20);
    mask.show();

    //重置dialog的位置
    g_dlg.css("left", $(window).width() / 2 - g_dlg.width() / 2 + $(document).scrollLeft());
    var h1 = $(document).scrollTop();
    var h2 = $(window).height() / 2 - g_dlg.height() / 2 + $(document).scrollTop();
    g_dlg.css("top", h1 > 200 ? h2 - 100 : (h2 >= 200 ? 200 : h2));
    g_dlg.show();

    jwHideScroll(true);
}

/* 功 能 隐藏遮罩层
 * 参数1 argDlg 要隐藏的Dialog
 * */
function jwMaskHide(argDlg) {
    var mask = $(".jw-mask");
    g_dlg = argDlg ? argDlg : $(".jw-dialog");

    g_dlg.hide();
    mask.hide();
    jwHideScroll(false);
    g_dlg = null;
}

/* 功 能 显示为Tips样式的对话框
 * 参数1 className
 * */
function jwMaskShowTips(title, tips) {
    dlgSetTitle(title);
    dlgSetTips(tips);
    jwBtnShowClose();
    jwDlgShowOne(".dlg-tips");
    jwMaskShow();
}

/* 功 能 这个Dialog的概念是外框一样,内部有很多个div,根据需要显示不同的div
 *      这个函数就是根据css类名显示不同的div
 * 参数1 className
 * */
function jwDlgShowOne(className) {
    //隐藏所有内容
    $(".jw-dialog-content").children().hide();

    //显示传入的div
    $(className).show();
}

/* 功 能 设置提示对话框的title
 * 参数1 s title字符串
 * */
function dlgSetTitle(s) {
    $(".jw-dialog-header").text(s);
}

/* 功 能 设置提示对话框的提示内容
 * 参数1 s 提示内容
 * */
function dlgSetTips(s) {
    $(".dlgt-info").text(s);
}

/* 功 能 设置其他类型对话框的的按钮 确定和取消
 * */
function jwBtnShowOkCancel() {
    $("#jwdf-cancel").show();
    $("#jwdf-ok").show();
    $("#jwdf-close").hide();
}

/* 功 能 设置提示对话框的的按钮 确定
 * */
function jwBtnShowClose() {
    $("#jwdf-cancel").hide();
    $("#jwdf-ok").hide();
    $("#jwdf-close").show();
}

/* 功 能 在"确定"按钮上面存储一些数据，比如点了哪个按钮触发的对话框
 *      主要是方便后期业务处理时，根据不同的点击来做不同的处理
 * 参数1 s 点击源，一个自定义的字符串。如"btnPay", "btnAdd", "btnDel"
 * */
function jwBtnOkSetData(s) {
    $("#jwdf-ok1").attr("data-ok", s);
}

/* 功 能 返回上面jwBtnOkSetData(s)保存的字符串
 *      在"确定"按钮上面存储一些数据，比如点了哪个按钮触发的对话框
 *      主要是方便后期业务处理时，根据不同的点击来做不同的处理
 *      点击源，一个自定义的字符串。如"btnPay", "btnAdd", "btnDel"
 *      示例:
 *      if(jwBtnOkGetData() == "btnPay")
 *      {
 *          gopay...
 *      }
 *      if(jwBtnOkGetData() == "btnAdd")
 *      {
 *          add something...
 *      }
 * */
function jwBtnOkGetData() {
    return $("#jwdf-ok1").attr("data-ok");
}
/*常用函数 end*/

/*遮罩和对话框自用函数 start*/
/*功能 隐藏滚动条*/
function jwHideScroll(t) {
    if (t) {
        document.documentElement.style.overflow = "hidden";
    } else {
        document.documentElement.style.overflow = "auto";
    }
}
/*遮罩和对话框自用函数 end*/

/*jwMask v0.1 end*/

/*jason_wzl end*/

//侧边栏
function bwcFllowInit() {
    var $height = $(window).height();
    //置height
    $('.bwc-side-bar-wrap').css('height', $height);
    $('.bwc-side-bar').css('height', $height);
    $('.bwc-side').css('height', $height);
    $('.bwc-bar').css('height', $height);
    $('.bwc-side-plugin-fllow').css('height', $height);
    $('.bwc-side-plugin-cart').css('height', $height);

    $(window).resize(function() {
        $height = $(window).height();
        $('.bwc-side-bar-wrap').css('height', $height);
        $('.bwc-side-bar').css('height', $height);
        $('.bwc-side').css('height', $height);
        $('.bwc-bar').css('height', $height);
        $('.bwc-side-plugin-fllow').css('height', $height);
        $('.bwc-side-plugin-cart').css('height', $height);
    });

    //收藏事件
    $('.bwc-bar-fllow').click(function(e) {
        if (parseInt($('.bwc-side-bar').css('right')) < 0) {
            bwcSideFold(e);
            bwcSideFllow();
            e.stopPropagation();
            return false;
        } else {
            $('.bwc-side-plugin-cart').hide();
            $('.bwc-side-plugin-fllow').show();
            e.stopPropagation();
            return false;
        }

    });

    //侧边购物车事件
    $('.bwc-bar-cart').click(function(e) {
        if (parseInt($('.bwc-side-bar').css('right')) < 0) {
            bwcSideFold(e);
            bwcSideCart();
            e.stopPropagation();
            return false;
        } else {
            $('.bwc-side-plugin-fllow').hide();
            $('.bwc-side-plugin-cart').show();
            e.stopPropagation();
            return false;
        }

    });

    //折叠按钮事件
    $('.bwc-bar-btn').click(function() {
        bwcSideFold();
        bwcSideFllow();
    });

    //禁用滚动条
    //bwcSideShield();

    //点击其他地方折叠
    $(document).click(function() {
        bwcSideFold(0);
    });
}

function bwcSideFold(tag) {
    var $obj = $('.bwc-side-bar'),
        $oBtn = $('.bwc-bar-btn');


    if (tag == '0') {
        $obj.animate({
            right: "-220px"
        });
        $oBtn.hide();
        return;
    }
    if (tag == '1') {
        $obj.animate({
            right: "0"
        });
        $oBtn.show();
        return;
    }

    parseInt($obj.css('right')) < 0 ? $obj.animate({
        right: "0"
    }) : $obj.animate({
        right: "-220px"
    });
    parseInt($obj.css('right')) < 0 ? $oBtn.show() : $oBtn.hide();
}

function bwcSideFllow() {
    var $obj = $('.bwc-side-plugin-fllow'),
        $pObj = $('.bwc-side-bar'),
        $cartObj = $('.bwc-side-plugin-cart');

    $cartObj.hide();
    $obj.fadeIn(300);
    //parseInt($pObj.css('right')) < 0?$obj.fadeIn(300):$obj.fadeOut(300);
}

function bwcSideCart() {
    var $obj = $('.bwc-side-plugin-cart'),
        $fllowObj = $('.bwc-side-plugin-fllow');

    $fllowObj.hide();
    $obj.fadeIn(300);
}

//屏蔽滚动条
function bwcSideShield() {
    //滚动条事件
    document.getElementById('bwcSide').onmousewheel = function scrollWheel(e) {
        var sl;
        e = e || window.event;
        if (navigator.userAgent.toLowerCase().indexOf('msie') >= 0) {
            event.returnValue = false;
        } else {
            e.preventDefault();
        };
        if (e.wheelDelta) {
            sl = e.wheelDelta;
        } else if (e.detail) {
            sl = -e.detail;
        };
    };
    if (navigator.userAgent.toLowerCase().indexOf('firefox') >= 0) {
        //firefox支持onmousewheel
        addEventListener('DOMMouseScroll',
            function(e) {
                var obj = e.target;
                var onmousewheel;
                while (obj) {
                    onmousewheel = obj.getAttribute('onmousewheel') || obj.onmousewheel;
                    if (onmousewheel) break;
                    if (obj.tagName == 'BODY') break;
                    obj = obj.parentNode;
                };
                if (onmousewheel) {
                    if (e.preventDefault) e.preventDefault();
                    e.returnValue = false; //禁止页面滚动
                    if (typeof obj.onmousewheel != 'function') {
                        //将onmousewheel转换成function
                        eval('window._tmpFun = function(event){' + onmousewheel + '}');
                        obj.onmousewheel = window._tmpFun;
                        window._tmpFun = null;
                    };
                    // 不直接执行是因为若onmousewheel(e)运行时间较长的话，会导致锁定滚动失效，使用setTimeout可避免
                    setTimeout(function() {
                            obj.onmousewheel(e);
                        },
                        1);
                };
            },
            false);
    };
}

//商品列表仓豆说明
function peasProduct() {
    $('.product-item').hover(function(e) {
        $(this).find('.peas-list-product').stop().show();
        e.stopPropagation();
    }, function(e) {
        $(this).find('.peas-list-product').stop().hide();
        e.stopPropagation();
    });
}
$(function() {
    //询价下单
    $('.stock-link').on({
        mouseenter: function() {
            $(this).next('.stock-img').show();
        },
        mouseleave: function() {
            $(this).next('.stock-img').hide();
        }
    });
});