/**
 * Created by jason_wzl on 2015/11/5 005.
 */
require(['dialog/avalon.dialog', 'pager/avalon.pager'], function() {

    avalon.ready(function() {
        var orderListCtrl = avalon.define('orderListCtrl', function(vm) {
            //tab切换
            vm.currentTab = 'tab1';
            vm.isLogin = storage.isLogin();
            if (!vm.isLogin) {
                urls.goLogin();
            }
            vm.orderlist = [];
            vm.totalPrice = [];
            vm.headOrder = {};
            vm.pager = {
                nextText: "下一页",
                prevText: "上一页",
                currentPage: 1,
                totalItems:10,
                perPages:10,
                showJumper:true,
                onJump: function(e, data) {
                    getOrderListNew(data._currentPage);
                    $(document.body).scrollTop(0);
                }
            };
            vm.$skipArray = ["pager"];

            //tab数据
            vm.currentData = [{
                "text": "全部订单",
                "value": "tab1"
            }, {
                "text": "待付款订单",
                "value": "tab2"
            }, {
                "text": "已完成的订单",
                "value": "tab3"
            }];
            //tab切换
            vm.changeTab = function(value) {
                orderListCtrl.currentTab = value;

                getOrderListNew(1);

                setOOHONELine();
            };
            vm.orderCancel = function(orderSn) {
                odcCtrl.orderSn = orderSn;
                showOrderCancelDialog("您确定要取消订单吗？")
            };
            vm.payNow = function(orderSn) {
                common.toPay(orderSn);
            };
            vm.allProduct = function(orderSn) {
                window.location.href = "/order/detail.html?orderSn=" + orderSn;
            };
            vm.ConfirmReceived = function(orderSn) {
                confirmReceivedDialog.orderSn = orderSn;
                avalon.vmodels["ConfirmReceived"].toggle = true;
            };
            vm.orderExport = function(orderSn) {
                //模拟form
                var form = $('<form></form>').attr("style", 'display:none').attr("action", apiConfig.orderExport + orderSn).attr("method", "POST")
                    .attr("target", "_blank");
                form.append('<input type="text" name="token" value="' + storage.getCurrentUser().authToken + '">');
                form.appendTo('body').submit();
                form.remove();

            };
            vm.computeShip = function(shipMin, shipMax) {
                if (shipMin == shipMax) {
                    if (shipMin == 0) {
                        return "当";
                    } else {
                        return shipMin;
                    }
                } else {
                    if (shipMin > shipMax) {
                        return shipMax + "-" + shipMin;
                    } else {
                        return shipMin + "-" + shipMax;
                    }
                }
            };
            vm.showShopInfo = function(obj) {
                $(obj).next().show();
            };
            vm.hideShopInfo = function(obj) {
                $(obj).next().hide();
            };
            vm.viewAfsDetail = function(afs) {
                var url = "";
                var type = afs.afterSaleType;
                var id = afs.id;
                if (type == 0) {
                    url = "/afs/return-detail-01.html?id=" + id;
                } else if (type == 1) {
                    url = "/afs/return-detail-02.html?id=" + id;
                } else if (type == 2) {
                    url = "/afs/return-detail-03.html?id=" + id;
                }

                window.open(url);
            };
            vm.toApply = function(el) {
                var url = '/afs/return-intro.html?orderId=' + el.id;
                if (el.accountTypes && el.accountTypes.length > 0) {
                    for (var i = 0; i < el.accountTypes.length; i++) {
                        if (el.accountTypes[i] == '5' && el.shopId != '1') { //存在账期支付
                            showMsg("当前订单支付类型为账期支付，请您直接通过电话：" + el.sellerPhone + "，联系卖家协商退换货事项。");
                            return;
                        }
                    }
                }
                window.open(url);
            }
        });
        $("#tips-no-order").hide();

        function getOrderListNew(pageCode){
            io.GET(apiConfig.getOrderList +
                '?per_page=' + orderListCtrl.pager.perPages +
                '&page=' + pageCode +
                '&orderStatus=' + getOrderStatusByTab(),
                function(responseData) {
                if(responseData.success){
                    if (responseData.result.length > 0) {
                        orderListCtrl.orderlist = responseData.result;
                    } else {
                        $('.'+orderListCtrl.currentTab).html($("#tips-no-order").html());
                    }

                    var widget = avalon.vmodels['idOrderListPager'];
                    if (widget) {
                        widget.totalItems = responseData.result_info.total_count;
                        widget.totalPages = responseData.result_info.page_count;
                        widget.perPages = responseData.result_info.per_page;
                        widget.currentPage = responseData.result_info.page;
                    }
                }else{
                    console.log(responseData.message);
                }
            });
        }

        function getOrderStatusByTab(){
            if(orderListCtrl.currentTab == 'tab1'){
                return '';
            }
            if(orderListCtrl.currentTab == 'tab2'){
                return 0;
            }
            if(orderListCtrl.currentTab == 'tab3'){
                return 5;
            }
        }

        function initOrderListOld(){
            io.GET(apiConfig.getOrderList+"/old", function(data) {
                if(data.success) {
                    orderListCtrl.orderlist = data.result.orders;
                    if (data.result.orders && data.result.orders.length > 0) {
                        orderListCtrl.headOrder = data.result.orders[0];
                    }

                    var html = $("#tips-no-order").html();
                    if (orderListCtrl.orderlist && orderListCtrl.orderlist.length > 0) {
                        var pendingCount = 0;
                        var finishedCount = 0;
                        for (var i in orderListCtrl.orderlist) {
                            if (orderListCtrl.orderlist[i].orderStatus == 'PendingPay') {
                                pendingCount = pendingCount + 1;
                            } else if (orderListCtrl.orderlist[i].orderStatus == 'Finished') {
                                finishedCount = finishedCount + 1;
                            }
                        }
                        if (finishedCount == 0) {
                            $(".tab3").html(html);
                        }
                        if (pendingCount == 0) {
                            $(".tab2").html(html);
                        }
                    } else {
                        $(".tab1").html(html);
                        $(".tab2").html(html);
                        $(".tab3").html(html);
                    }

                    avalon.scan();
                }
            });
        }

        var odcCtrl = avalon.define({
            $id: "quickPayDialogErrCtrl",
            orderSn: "",
            quickPayErrStr1: "",

            //快捷支付错误提示dialog配置
            $quickPayDialogErrOptions: {
                title: "友情提示",
                showClose: true,
                width: 460,
                isTop: true,
                onClose: function() {
                    //点击×号回调函数
                },
                onConfirm: function() {
                    avalon.vmodels["quickPayDialogErr"].toggle = false;
                    //把解绑请求信息发送到服务器
                    io.GET(apiConfig.orderDeltail + odcCtrl.orderSn + "/cancel", {}, function(data) {
                        if (!data.success) {
                            showMsg(data.message);
                            return false;
                        } else {
                            location.reload();
                            return true;
                        }
                    }, function() {
                        showMsg(data.message);
                        return false;
                    });
                },
                onCancel: function() {
                    avalon.vmodels["quickPayDialogErr"].toggle = false;
                }
            }

        });

        var alertMsgCtrl = avalon.define({
            $id: "alertMsgCtrl",
            alertMsgStr: "",
            //提示dialog配置
            $alertMsgOptions: {
                title: "友情提示",
                showClose: true,
                width: 460,
                isTop: true,
                onClose: function() {
                    //点击×号回调函数
                },
                onConfirm: function() {
                    avalon.vmodels["alertMsg"].toggle = false;
                },
                onCancel: function() {
                    avalon.vmodels["alertMsg"].toggle = false;
                }
            }

        });

        var confirmReceivedDialog = avalon.define({
            $id: "ConfirmReceivedCtrl",
            orderSn: "",
            //确认收货提示dialog配置
            $ConfirmReceivedOptions: {
                title: "确认收货",
                showClose: true,
                width: 460,
                isTop: true,
                onClose: function() {
                    //点击×号回调函数
                },
                onConfirm: function() {
                    avalon.vmodels["ConfirmReceived"].toggle = false;
                    //把解绑请求信息发送到服务器
                    io.PATCH(apiConfig.shippingReceived + confirmReceivedDialog.orderSn, {}, function(data) {
                        if (!data.success) {
                            showMsg(data.message);
                            return false;
                        } else {
                            location.reload();
                            return true;
                        }
                    }, function() {

                        return false;
                    });
                },
                onCancel: function() {
                    avalon.vmodels["ConfirmReceived"].toggle = false;
                }
            }

        });

        avalon.scan();

        //页面初始化动作
        initStyle();


        //实际发货量tips的显示和隐藏
        $(".oogo-num-tips").mouseover(function() {
            $(this).parent().next().show();
        });
        $(".oogo-num-tips").mouseleave(function() {
            $(this).parent().next().hide();
        });

        //页面初始化的动作放在这个函数里面
        function initStyle() {
            getOrderListNew(1, '');

            setOOHONELine();
        }

        //设置商品ooh-one左侧line的高度
        function setOOHONELine() {
            for (var i = 0; i < $(".order-one-header").length; i++) {
                $(".order-one-header").eq(i).find(".g-ib.ooh-line").css("height", $(".order-one-header").eq(i).parent().height() + 81);
            }
        }

        function showMsg(strErr) {
            alertMsgCtrl.alertMsgStr = strErr;
            avalon.vmodels["alertMsg"].toggle = true;
        }

        function showOrderCancelDialog(strErr) {
            odcCtrl.quickPayErrStr1 = strErr;
            avalon.vmodels["quickPayDialogErr"].toggle = true;
            avalon.vmodels["quickPayDialogErr"].setTitle("友情提示");
        }

    });


});
