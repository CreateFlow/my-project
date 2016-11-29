'use strict';

define(function(require, exports, module) {
    module.exports = [
        {
            id: 1,
            title:'客户服务',
            subItems:[
                {
                    title:'退换货订单',
                    url:'/aftersale/list.html'
                }
            ]
        },
        {
            id: 2,
            title: '账期支付',
            url: '/payment/help.html',
            subItems: [
                {
                    title: '买家账期管理',
                    url: '/payment/list.html'
                },
                {
                    title:'账单管理',
                    url:'/acctbill/bill-list.html'
                },
            ]
        },
        {
            id: 3,
            title: '开票管理',
            subItems:[
                {
                    title:'开票管理',
                    url:'/seller-invoice/invoice.html'
                }
            ]
        },
        {
            id: 4,
            title: '订单管理',
            subItems: [
                {
                    title:'订单管理',
                    url:'/order/list.html'
                }
            ]
        },
        {
            id: 7,
            title: '商品管理',
            subItems: [
                {
                    title:'商品列表',
                    url:'/goods/list.html'
                },
                {
                    title:'上传商品',
                    url:'/goods/add.html'
                },
                {
                    title:'批量上传',
                    url:'/goods/import.html'
                },
            ]
        },
        {
            id: 8,
            title: '价格管理',
            subItems: [
                {
                    title:'定价策略管理',
                    url:'/price/tack.html'
                },
                {
                    title:'商品价格管理',
                    url:'/price/good-price.html'
                },
                {
                    title:'会员价格管理',
                    url:'/price/member-price.html'
                },
            ]
        },
        {
            id: 5,
            title: '资金管理',
            subItems: [
                {
                    title:'资金流水',
                    url:'/bill/bill.html'
                }
            ]
        },
        {
            id: 6,
            title: '账号管理',
            subItems: [
                {
                    title: '修改密码',
                    url:'/seller-manager/update-pwd.html'
                }
            ]
        }
    ];

});