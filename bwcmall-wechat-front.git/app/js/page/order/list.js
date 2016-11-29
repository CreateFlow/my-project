'use strict'

;
(function() {

    Vue.component('tab', vuxTab)
    Vue.component('tabItem', vuxTabItem)
    Vue.component('scroller', vuxScroller);
    Vue.component('loading', vuxLoading)

    var vm = new Vue({
        el: '#app',
        data: {
            navItem: {
                name: '全部',
                orderStatus: ''
            },
            navList: [{
                name: '全部',
                orderStatus: ''
            }, {
                name: '未完成',
                orderStatus: ''
            }, {
                name: '已完成',
                orderStatus: '5'
            }, {
                name: '已取消',
                orderStatus: '4'
            }],
            currentTab: '',
            winHeight: '',
            orderList: [],
            orderStatus: '',
            pageNum: 1,
            resultInfo: {},
            loadingBusy: false,
            loadingText: '加载中...'
        },
        methods: {
            clickTab: function(item) {
                this.currentTab = item.name;
                this.orderStatus = item.orderStatus;
                var str = JSON.stringify(item);
                sessionStorage.setItem('navItem', str);
                this.resetOrderList();
                this.getOrderList();
            },
            resetOrderList: function() {
                var self = this;
                this.pageNum = 1;
                this.orderList = [];
                this.resultInfo = {};
                self.$broadcast('pullup:enable', self.$refs.scroller.uuid)
                document.getElementsByClassName('xs-container')[0].style.transform = 'translateY(0)';
                this.$nextTick(function() {
                    self.$refs.scroller.reset()
                });
            },
            getOrderList: function() {
                //订单列表，请求参数：orderStatus，orderStatus=0,查询未支付订单，orderStatus=5,查询已完成订单，不传查询所有订单
                var self = this;
                self.loadingBusy = true;
                self.$http.get(API.orderList, {
                    "orderStatus": self.orderStatus,
                    "per_page": 20,
                    "page": self.pageNum
                }).then(function(response) {
                    var body = response.data
                    if (body.success) {
                        var result = body.result;
                        var i;
                        for (i = result.length - 1; i >= 0; i -= 1) {
                            var item = result[i]
                            if (item.childOrders) {
                                for (var j = 0; j < item.childOrders.length; j++) {
                                    item.amount += item.childOrders[j].amount
                                }
                            }
                            if (self.currentTab == '未完成') {
                                if (item.orderStatusDisplay == '已完成' || item.orderStatusDisplay == '已取消') {
                                    result.splice(i, 1)
                                }
                                if (item.childOrders) {
                                    var allOK = 0
                                    for (var j = 0; j < item.childOrders.length; j++) {
                                        var subItem = item.childOrders[j]
                                        if (subItem.orderStatusDisplay == '已完成' || subItem.orderStatusDisplay == '已取消') {
                                            allOK++
                                            if (allOK == item.childOrders.length) {
                                                result.splice(i, 1)
                                            }

                                        }
                                    }
                                }
                            }
                        }

                        self.orderList = self.orderList.concat(result);
                        self.loadingBusy = false;
                        self.resultInfo = body.result_info;
                        self.$nextTick(function() {
                            self.$refs.scroller.reset()
                        });
                    } else {
                        self.loadingBusy = false;
                        alert(body.message)
                    }
                }, function(response) {
                    // error callback
                });
            },
            goOrder: function(sn, childOrders) {
                if (!childOrders) {
                    location.href = "/order/pay/jsapi.html?sn=" + sn;
                }
            },
            pullupLoad: function(uuid) {
                var self = this;
                if (self.resultInfo.page < self.resultInfo.page_count) {
                    console.log(2)
                    self.pageNum++;
                    self.getOrderList(uuid);
                    self.$nextTick(function() {
                        self.$broadcast('pullup:reset', uuid)
                    })
                } else {
                    console.log(3)
                    self.$broadcast('pullup:disable', uuid)
                }
            }
        },
        ready: function() {
            var self = this;
            var navItem = sessionStorage.getItem('navItem')
            if (navItem) {
                self.navItem = JSON.parse(navItem);
                self.currentTab = self.navItem.name;
                self.orderStatus = self.navItem.orderStatus;
            }
            this.winHeight = (document.documentElement.clientHeight - 44) + 'px';
            // this.$nextTick(function() {
            //     self.$refs.scroller.reset()
            // });
            self.getOrderList();
        }
    });


})();
