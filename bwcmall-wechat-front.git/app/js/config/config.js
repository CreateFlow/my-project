'use strict';


function timestamp(url) {
    var getTimestamp = new Date().getTime();
    if (url.indexOf("?") > -1) {
        url = url + "&_=" + getTimestamp
    } else {
        url = url + "?_=" + getTimestamp
    }
    return url;
}

var host = location.host;
if (host.indexOf('wechat.bwcmall.com') >= 0) {
    Vue.config.apiPath = '//wechat.bwcmall.com/api';
} else {
    Vue.config.devtools = true
    Vue.config.apiPath = '//wechatapi.dev.bwcmall.cn/api';
}

var token = Cookies.get('authToken');
if (token) {
    Vue.http.headers.common['Authorization'] = Cookies.get('authToken');
}


Vue.http.interceptors.push({

    request: function(request) {
        //request.url = timestamp(request.url)
        return request;
    },

    response: function(response) {
        if (response.data.error && response.data.error.code == '10006') {
            console.log(response.data.message)
            location.href = '/account/auth.html'
        }
        return response;
    }

});
