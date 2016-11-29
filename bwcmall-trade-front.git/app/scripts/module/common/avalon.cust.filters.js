 (function(window, $) {
     avalon.filters.formatPrice = function(price) { //用法： {{aaa|haha}}
           return formatPrice(price);
        }
        avalon.filters.subGoodsNames = function(str) { //用法： {{aaa|haha}}
            if (str) {
                if (str.length > 50) {
                    return str.substring(0, 50);
                } else {
                    return str;
                }
            } else {
                return "";
            }
        }
        avalon.filters.subStr5 = function(str) { //用法： {{aaa|haha}}
            if (str) {
                if (str.length > 5) {
                    return str.substring(0, 5);
                } else {
                    return str;
                }
            } else {
                return "";
            }
        }
        avalon.filters.subStr10 = function(str) { //用法： {{aaa|haha}}
            if (str) {
                if (str.length > 10) {
                    return str.substring(0, 10);
                } else {
                    return str;
                }
            } else {
                return "";
            }
        }
        avalon.filters.subStr15 = function(str) { //用法： {{aaa|haha}}
            if (str) {
                if (str.length > 15) {
                    return str.substring(0, 15);
                } else {
                    return str;
                }
            } else {
                return "";
            }
        }
        avalon.filters.subStr20 = function(str) { //用法： {{aaa|haha}}
            if (str) {
                if (str.length > 20) {
                    return str.substring(0, 20);
                } else {
                    return str;
                }
            } else {
                return "";
            }
        }

         avalon.filters.subStr25 = function(str) { //用法： {{aaa|haha}}
            if (str) {
                if (str.length > 25) {
                    return str.substring(0, 25);
                } else {
                    return str;
                }
            } else {
                return "";
            }
        },
          avalon.filters.subStr50 = function(str) { //用法： {{aaa|haha}}
            if (str) {
                if (str.length > 50 ){
                    return str.substring(0, 50);
                } else {
                    return str;
                }
            } else {
                return "";
            }
        }
}(this, jQuery));
