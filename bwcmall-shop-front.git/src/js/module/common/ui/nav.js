'use strict';

define(function(require, exports, module) {
    var avalon = require('avalon'),
        $ = require('jquery'),
        path = require('module/common/config/path'),

        vm = avalon.define({
            $id: 'navCtrl',
            listItems: [
                { id: 'index', name:'首页', url: path.shopBase, active: false}
                // { id: 'account', name:'账户设置', active: false},
                // { id: 'message', name:'消息', active: false}
            ]
        }),

        nav = {

            getIndexByField: function(fieldName, value, model) {
                var index = -1;
                $.each(model, function(i, item) {
                    if (item[fieldName] === value) {
                        index = i;
                    }
                });
                return index;
            },

            getIndexById: function(id, model) {
                return this.getIndexByField('id', id, model);
            },

            getNavList: function() {
                return vm.listItems;
            },

            getActive: function() {
                var len, item,
                    i = 0,
                    index = -1,
                    list = this.getNavList();

                for (len = list.length; i < len; i += 1) {
                    item = list[i];
                    if (item.active === true) {
                        index = i;
                        break;
                    }
                }

                return index;
            },

            setActive: function(index) {
                var id,
                    list = this.getNavList(),
                    activeIndex = this.getActive();

                if (typeof index === 'string') {
                    id = index;
                    index = this.getIndexById(id, list);
                }

                if (index !== -1) {
                    list[index].active = true;
                } else {
                    return;
                }

                if (activeIndex !== -1) {
                    list[activeIndex].active = false;
                }
            }

        };

    avalon.scan();

    nav.setActive('index');

    module.exports = nav;
});