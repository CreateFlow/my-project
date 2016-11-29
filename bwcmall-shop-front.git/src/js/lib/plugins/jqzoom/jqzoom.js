//**************************************************************
// jQZoom allows you to realize a small magnifier window,close
// to the image or images on your web page easily.
//
// jqZoom version 2.1
// Author Doc. Ing. Renzi Marco(www.mind-projects.it)
// First Release on Dec 05 2007
// i'm searching for a job,pick me up!!!
// mail: renzi.mrc@gmail.com
//**************************************************************

'use strict';

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {
        // Node, CommonJS-like
        module.exports = factory( require('jquery') );
    } else {
        // Browser globals (root is window)
        root.returnExports = factory(root.jQuery);
    }
}(this, function ($) {
    var leftpos, mouse, xpos, ypos, scrolly, scrollx;

    function MouseEvent(e) {
        this.x = e.pageX;
        this.y = e.pageY;
    }

    $.fn.jqueryzoom = function (options) {
        var settings = {
            xzoom: 200,//zoomed width default width
            yzoom: 200,//zoomed div default width
            offset: 10, //zoomed div default offset
            position: "right",//zoomed div default position,offset position is to the right of the image
            lens: 1, //zooming lens over the image,by default is 1;
            preload: 1
        };

        if (options) {
            $.extend(settings, options);
        }

        var noalt = '';
        $(this).hover(function () {

            var imageLeft = $(this).offset().left;
            var imageRight = this.offsetRight;
            var imageTop = $(this).offset().top;
            var imageWidth = $(this).children('img').get(0).offsetWidth;
            var imageHeight = $(this).children('img').get(0).offsetHeight;

            noalt = $(this).children("img").attr("alt");

            var bigimage = $(this).children("img").attr("jqimg");

            $(this).children("img").attr("alt", '');

            if ($("div.zoomdiv").get().length == 0) {

                $(this).after("<div class='zoomdiv'><img class='bigimg' src='" + bigimage + "'/></div>");


                $(this).append("<div class='jqZoomPup'>&nbsp;</div>");

            }


            if (settings.position == "right") {

                if (imageLeft + imageWidth + settings.offset + settings.xzoom > screen.width) {

                    leftpos = imageLeft - settings.offset - settings.xzoom;

                } else {

                    leftpos = imageLeft + imageWidth + settings.offset;
                }
            } else {
                leftpos = imageLeft - settings.xzoom - settings.offset;
                if (leftpos < 0) {

                    leftpos = imageLeft + imageWidth + settings.offset;

                }

            }

            $("div.zoomdiv").css({top: 0, left: 460});

            $("div.zoomdiv").width(settings.xzoom);

            $("div.zoomdiv").height(settings.yzoom);

            $("div.zoomdiv").show();

            if (!settings.lens) {
                $(this).css('cursor', 'crosshair');
            }


            $(document.body).mousemove(function (e) {


                mouse = new MouseEvent(e);

                /*$("div.jqZoomPup").hide();*/


                var bigwidth = $(".bigimg").get(0).offsetWidth;

                var bigheight = $(".bigimg").get(0).offsetHeight;

                var scaley = 'x';

                var scalex = 'y';


                if (isNaN(scalex) | isNaN(scaley)) {

                    var scalex = (bigwidth / imageWidth);

                    var scaley = (bigheight / imageHeight);

                    //$("div.jqZoomPup").width((settings.xzoom) / scalex/2);

                    //$("div.jqZoomPup").height((settings.yzoom) / scaley/2);
                    $("div.jqZoomPup").width('150px');

                    $("div.jqZoomPup").height('150px');

                    if (settings.lens) {
                        $("div.jqZoomPup").css('visibility', 'visible');
                    }

                }


                xpos = mouse.x - $("div.jqZoomPup").width() / 2 - imageLeft;

                ypos = mouse.y - $("div.jqZoomPup").height() / 2 - imageTop;

                if (settings.lens) {
                    xpos = (mouse.x - $("div.jqZoomPup").width() / 2 < imageLeft ) ? 0 : (mouse.x + $("div.jqZoomPup").width() / 2 > imageWidth + imageLeft ) ? (imageWidth - $("div.jqZoomPup").width() - 2) : xpos;

                    ypos = (mouse.y - $("div.jqZoomPup").height() / 2 < imageTop ) ? 0 : (mouse.y + $("div.jqZoomPup").height() / 2 > imageHeight + imageTop ) ? (imageHeight - $("div.jqZoomPup").height() - 2 ) : ypos;

                }


                if (settings.lens) {

                    $("div.jqZoomPup").css({top: ypos, left: xpos});

                }


                scrolly = ypos;

                $("div.zoomdiv").get(0).scrollTop = scrolly * scaley;

                scrollx = xpos;

                $("div.zoomdiv").get(0).scrollLeft = (scrollx) * scalex;


            });
        }, function () {

            $(this).children("img").attr("alt", noalt);
            $(document.body).unbind("mousemove");
            if (settings.lens) {
                $("div.jqZoomPup").remove();
            }
            $("div.zoomdiv").remove();

        });

        count = 0;

        if (settings.preload) {

            $('body').append("<div style='display:none;' class='jqPreload" + count + "'>sdsdssdsd</div>");

            $(this).each(function () {

                var imagetopreload = $(this).children("img").attr("jqimg");

                var content = $('div.jqPreload' + count + '').html();

                $('div.jqPreload' + count + '').html(content + '<img src=\"' + imagetopreload + '\">');

            });

        }

    }

}));