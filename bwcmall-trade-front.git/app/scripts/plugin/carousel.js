;
(function ($) {
    var settings = {
        "container": '#carousel',  //����
        "pWidth": "1000", //ÿ��bannerͼ���
        "cHeight": "460", //����߶�
        "cWidth": "100%", //������
        "imgWidth": "atuo",  //ͼƬ���
        "imgLeft": "0",  //ͼƬĬ��leftֵ
        "autoPlay": true,    //�Ƿ����Զ��ֲ�
        "showDot":true,     //�Ƿ���ʾԭ��
        "playInterval": 3000, //�ֲ����
        "alwaysCenter": true,    //ͼƬ�Ƿ�ʼ�վ�����ʾ
        "cData": []   //bannerͼƬurl
    };
    var win = $(window),
        container,  //����
        mindex = 0,   //��ǰͼƬ����
        bannerItems,    //�л���
        opts = {},    //����
        cp = null;    //��ʱ��

    var carousel = $.fn.carousel = function (options) {
        opts = $.extend({}, settings, options || {});
        container = $(opts.container);
        mindex = opts.cData.length - 1;

        carouselInit();
        ////����resize����
        //win.resize(function () {
        //    carousel.calc();
        //});
        container.hover(carousel.qingchuInterval, startInterval);

    };

    //����ı䵱ǰbanner
    carousel.changeCurrentPhoto = function (i) {
        carousel.clickChangePhoto(i);
    };

    //�ı䵱ǰbanner
    carousel.clickChangePhoto = function (cur) {
        if (cur === mindex) {
            return;
        }
        bannerItems.eq(cur).fadeIn('slow');
        bannerItems.eq(mindex + 0).fadeOut('slow');
        mindex = cur;
    };

    //�л�banner
    carousel.changePhoto = function () {
        var next = mindex + 1;
        var cur = mindex + 0;
        if (next >= opts.cData.length) {
            next = 0;
        }
        if(cur==next){
            bannerItems.eq(next).fadeIn('slow');
        }
        else{
            bannerItems.eq(next).fadeIn('slow');
            bannerItems.eq(cur).fadeOut('slow');
        }
        $('.spinner').removeClass('light');
        $('.spinner').eq(next).addClass('light');
        mindex = next;
    };

    //����Բ��
    carousel.createDot = function () {
        var str = '<div class="spinners"><div id="dot" >';

        for (var i = 0; i < opts.cData.length; i++) {
            str += '<div class="spinner"></div>';
        }
        str += '<div style="clear"></div></div></div>';
        var dWidth = opts.cData.length * 34;
        container.append(str);
        $('#dot').css({"bottom": "10px", "width": dWidth, "margin-left": -dWidth / 2});
        $(".spinner").eq(0).addClass('light');
        carousel.bindDot();
    };

    //����DOM
    carousel.createDom = function () {
        var str = '';
        for (var i = 0; i < opts.cData.length; i++) {
            str += '<div class="carouselUI_li"><a class="carouselUI_li_a" target="_blank" href="' + opts.cData[i].href + '"><img src="' + opts.cData[i].src + '"></a></div>';
        }
        container.prepend(str);
        bannerItems = container.find('.carouselUI_li');
        //carousel.calc();
    };

    //Բ����¼�
    carousel.bindDot = function () {
        $(".spinner").click(function () {
            $(".spinner").removeClass('light');
            $(this).addClass('light');
            var index = $(this).index();
            carousel.clickChangePhoto(index);
        });
    };


    //�����ʱ��
    carousel.qingchuInterval = function () {
        window.clearInterval(cp);
    };

    //ͼƬλ�þ���
    carousel.calc = function () {
        var bwidth = parseInt($('body').width());
        if (bwidth < opts.pWidth) {
            opts.imgLeft = (-(opts.pWidth - bwidth) / 2) + "px";
            bannerItems.css('left', opts.imgLeft);
        } else {
            opts.imgLeft = (bwidth - opts.pWidth) / 2 + "px";
            opts.imgWidth = bwidth + "px";
            bannerItems.css({'left': opts.imgLeft, 'width': opts.imgWidth});
        }
    };

    //˽�з���
    //������ʱ��
    function startInterval() {
        carousel.qingchuInterval();
        if(opts.autoPlay){
            cp = window.setInterval(carousel.changePhoto, opts.playInterval);
        }
    };

    //��ʼ��
    function carouselInit() {
        container.css({"width": opts.cWidth, "height": opts.cHeight});
        if(opts.showDot){
            carousel.createDot();
        }
        carousel.createDom();
        carousel.changePhoto();
        if (opts.autoPlay) {
            startInterval();
        }
    };
})(jQuery);