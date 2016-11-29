'use strict';

define(function(require, exports, module) {
    var $ = require('jquery'),
        Emitter = require('events'),
        inherits = require('lib/core/inherits/inherits'),
        inArray = $.inArray,
        extend = $.extend,
        NOOP = function() {},
        SELECT_NAME = 'select2',
        EVENT_PREFIX = SELECT_NAME + ':',
        EVENTS = ['change', 'close', 'closing', 'open', 'opening', 'select', 'selecting', 'unselect', 'unselecting'],

        defaults = {
            minimumResultsForSearch: Infinity,
            // allowClear: true,
            dropdownParent: $(document.body)
        };

    require('lib/plugins/select2/4.0.3/select2');

    function getEventName(event, defineEvents) {
        if ( inArray(event, defineEvents) !== - 1 ) {
            event = EVENT_PREFIX + event;
        }
        return event;
    }

    function getItemByValue(value, dataList) {
        var i = 0,
            len = dataList.length,
            item;

        for (; i < len; i += 1) {
            item = dataList[i];
            if ( item.id + ''  === value ) {
                return item;
            }
        }
    }

    function Select(element, opts) {
        this.initialize(element, opts);
    }

    inherits(Select, Emitter, {

        initialize: function(element, opts) {
            this.initProps(element, opts);
            this.setup(this.options);
        },

        initProps: function(element, opts) {
            this.element = element;
            this.selector = element.selector;
            this.options = extend({}, defaults, opts || {});
        },

        setup: function(opts) {
            this.element = this.element.select2(opts);
            this.bindEvents();
        },

        bindEvents: function() {
            var self = this;

            EVENTS.forEach(function(name) {
                var eventName = 'change';

                if (name !== eventName) {
                    eventName = getEventName(name, EVENTS)
                }

                self.getElement().on(eventName, function(e) {
                    self.emit(name, e, self);
                });
            });
        },

        getInstance: function() {
            return this.getElement().data(SELECT_NAME);
        },

        // interface

        getValue: function() {
            var result,
                dataSources = this.getDataSources(),
                value = this.getElement().val();

            if (dataSources.length > 0) {
                result = getItemByValue(value, dataSources);
            }

            if (typeof result !== 'undefined') {
                return result;
            }
        },

        getDOMValue: function() {
            var val = '',
                value = this.getValue();
            if (typeof value !== 'undefined' && 'id' in value) {
                val = value.id;
            }
            return val;
        },

        setValue: function(value) {
            if ( !Array.isArray(value) ) {
                value = [value];
            }
            this.getInstance().val(value);
            return this;
        },

        getSelectedItems: function() {
            var items = this.getInstance().data();
            if (items.length > 0) {
                return items;
            }
        },

        setDataSources: function(data) {
            var select2 = this.getInstance();

            if ( !Array.isArray(data) ) {
                data = [data];
            }
            //清空子option，修复destroy的清空问题
            if ('$element' in select2 && select2.$element.length > 0) {
                select2.$element.empty();
            }
            this.element = this.element.select2( extend({}, this.options, {data: data}) );
            return this;
        },

        render: function() {
            this.getInstance().render();
            return this;
        },

        getDataSources: function() {
            var data,
                options = this.getInstance().options.options;

            // 先取组件上的数据源
            // 如果，不存在再查询本地数据源
            if (options && options.data) {
                data = options.data;
            } else {
                data = this.options.data || [];
            }

            return data;
        },

        getElement: function() {
            return this.element;
        },

        destroy: function() {
            this.un();
            this.getInstance().destroy();
        }

    });

    module.exports = function(element, opts) {
        if (typeof element === 'undefined') {
            throw new Error('Element is required!');
            return;
        }

        if (element.selector == null) {
            element = $(element);
        }

        return new Select(element, $.extend({}, opts || {}));
    };
});