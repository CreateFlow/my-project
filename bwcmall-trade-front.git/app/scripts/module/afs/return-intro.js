  /**
   * 退换货介绍
   */
  require(['dialog/avalon.dialog'], function(avalon) {

    var isLogin = storage.isLogin();
    if (!isLogin) {
      urls.goLogin();
    }

    var returnIntroCtrl = avalon.define('returnIntroCtrl', function(vm) {

      vm.orderInfo = {};
      vm.sn = '';
      vm.orderId = urls.getParameter(window.location.href, 'orderId');
      vm.goReturnApply = function(type) {
        if (type == 0) {
          window.location.href = "return-apply-01.html?orderId=" + vm.orderId;
        } else if (type == 1) {
          window.location.href = "return-apply-02.html?orderId=" + vm.orderId;
        } else if (type == 2) {
          window.location.href = "return-apply-03.html?orderId=" + vm.orderId;
        }
      }
      vm.showShopInfo = function(obj) {
        $(obj).next().show();
      };

      vm.hideShopInfo = function(obj) {
        $(obj).next().hide();
      };
      io.GET(apiConfig.returnOrderInfo + vm.orderId + "/orderInfo", {}, function(data) {
        returnIntroCtrl.orderInfo = data.result;
        vm.sn = data.result.orderSn;
      });

    });
    avalon.scan();
  });