(function($) {

    if (typeof $ === 'undefined') return;

    function template(t) {
        return [
            '距离特价结束时间：',
            '<i class=\"txt-warn\">',
            t.day,
            '</i>天<i class=\"txt-warn\">',
            t.hour,
            '</i>小时<i class=\"txt-warn\">',
            t.minute,
            '</i>分<i class=\"txt-warn\">',
            t.second,
            '</i>秒</span>'
        ].join('');
    }

    function formatDateStr(t) {
        var tStr = t + '';
        return ('00' + tStr).substring(tStr.length);
    }

    function getTimer(time) {
        var zero = '00',
            day = zero,
            hour = zero,
            minute = zero,
            second = zero;

        if (time > 0) {
            day = formatDateStr( Math.floor(time / 86400000) );
            hour = formatDateStr( Math.floor((time % 86400000) / 3600000) );
            minute = formatDateStr( Math.floor(((time % 86400000) % 3600000) / 60000) );
            second = formatDateStr( Math.floor(((time % 86400000) % 3600000 % 60000) / 1000) );
        }

        return { day: day, hour: hour, minute: minute, second: second};
    }

    function show(selector, t) {
        var nowTime = new Date().getTime(),
            endTime = new Date(t).getTime();
        $(selector).html( template( getTimer(endTime - nowTime) ) );
    }

    function countdown(selector) {
         $(selector).each( function() {
            show( this, this.getAttribute('data-endTime') );
        });
    }

    function openLink(url) {
        url && (window.location.href = url);
    }

    $(function() {
        $('#goods').on('click', '.jLink', function() {
            openLink( this.getAttribute('data-url') );
        });

        function setCountdown() {
            countdown('.jCountdown');
        }

        countdown('.jCountdown');
        clearInterval(setCountdown);
        setInterval(setCountdown, 1000);
    });

}(jQuery));