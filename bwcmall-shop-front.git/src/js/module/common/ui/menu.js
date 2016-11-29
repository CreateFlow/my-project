'use strict';

define(function(require, exports, module) {
    var avalon = require('avalon'),
        $ = require('jquery'),
        request = require('lib/io/request'),
        API = require('module/common/config/api'),
        urls = require('module/common/utils/url'),
        menuData = require('module/common/config/menu');

    var vm = avalon.define({
        $id: 'menuCtrl',
        //TODO 最终需要改为API获取
        menuItems: [],
        setMenuItems: function(shopId) {
            var items = menuData,
                ids = [3, 4];

            if (shopId === '1') {
                items = items.filter(function(val) {
                    if ( $.inArray(val.id, ids) === -1 ) {
                        return val;
                    }
                });
            }

            this.menuItems = items;
            avalon.scan(document.body, vm);
        }
    });

    avalon.scan();

    request.GET(API.shopPanorama, function(data) {
        if (data.success === true) {
            vm.setMenuItems(data.result.shopId);
        }
    });
});
