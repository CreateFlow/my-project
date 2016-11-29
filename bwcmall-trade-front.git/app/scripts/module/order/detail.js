require(['dialog/avalon.dialog'], function() {
    var isLogin = storage.isLogin();
    if (!isLogin) {
        urls.goLogin();
    }

    avalon.ready(function() {
        var odCtrl = avalon.define({
            $id: "orderDetailCtrl",
            $sn: urls.getParameter(window.location.href, 'orderSn'),
            order: {},
            orderCancel: function(orderSn) {
                odcCtrl.orderSn = orderSn;
                showOrderCancelDialog("您确定要取消订单吗？")
            },

            payNow: function(orderSn) {
                common.toPay(orderSn);
            },
            confirmReceived: function(orderSn) {
                confirmReceivedDialog.orderSn = orderSn;
                avalon.vmodels["ConfirmReceived"].toggle = true;
            },
            computeShip: function(shipMin, shipMax) {
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
            },
            showShopInfo: function(obj) {
                $(obj).next().show();
            },

            hideShopInfo: function(obj) {
                $(obj).next().hide();
            },
            viewAfsDetail: function(afs) {
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
            },
            toApply: function(el) {
                var url = '/afs/return-intro.html?orderId='+el.id;
                if(el.accountTypes && el.accountTypes.length>0){
                    for(var i =0;i<el.accountTypes.length;i++){
                        if(el.accountTypes[i]=='5' && el.shopId != '1'){ //存在账期支付
                           showMsg("当前订单支付类型为账期支付，请您直接通过电话："+el.sellerPhone+"，联系卖家协商退换货事项。");
                            return;
                        }
                    }
                }
                window.open(url );
            }
        });
        io.GET(apiConfig.orderDeltail + urls.getParameter(window.location.href, 'orderSn'), function(data) {
            if (data.success) {
                avalon.vmodels["orderDetailCtrl"].order = data.result.order;
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
                    });
                },
                onCancel: function() {
                    avalon.vmodels["quickPayDialogErr"].toggle = false;
                }
            }


        });

        //active状态，延迟处理
        setTimeout(function() {
            if (avalon.vmodels['accountHeadCtrl']) {
                odCtrl.$fire('down!currentNavInfo', 'order');
            }
        }, 50);


        avalon.scan();


        initStyle();

        $(".odgo-change").mouseover(function() {
            $(this).next().show();
        });
        $(".odgo-change").mouseleave(function() {
            $(this).next().hide();
        });

        //实际发货量tips的显示和隐藏
        $(".oogo-num-tips").mouseover(function() {
            $(this).parent().next().show();
        });
        $(".oogo-num-tips").mouseleave(function() {
            $(this).parent().next().hide();
        });


        //页面初始化的动作放在这个函数里面
        function initStyle() {
            //设置商品列表border的高度
            //$(".order-detail-receiver").css("height", $(".order-detail-goods").height());
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