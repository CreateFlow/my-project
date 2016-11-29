  /**
   * 退换货列表
   */
  require(["datepicker/avalon.coupledatepicker",'dialog/avalon.dialog'], function(avalon) {

    var isLogin = storage.isLogin();
    if (!isLogin) {
      urls.goLogin();
    }

    Date.prototype.format = function(format) {
      var o = {
        "M+": this.getMonth() + 1, //month
        "d+": this.getDate(), //day
        "h+": this.getHours(), //hour
        "m+": this.getMinutes(), //minute
        "s+": this.getSeconds(), //second
        "q+": Math.floor((this.getMonth() + 3) / 3), //quarter
        "S": this.getMilliseconds() //millisecond
      }
      if (/(y+)/.test(format)) format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
      for (var k in o)
        if (new RegExp("(" + k + ")").test(format))
          format = format.replace(RegExp.$1,
            RegExp.$1.length == 1 ? o[k] :
            ("00" + o[k]).substr(("" + o[k]).length));
      return format;
    }
    var today = new Date(); // 获取今天时间 
    var to = today.format("yyyy-MM-dd");
    today.setTime(today.getTime() - 30 * 24 * 3600 * 1000);
    var from = today.format("yyyy-MM-dd");

    avalon.ready(function() {
      var returnListCtrl = avalon.define('returnListCtrl', function(vm) {

        vm.dateSelectType = 1;
        vm.from = from;
        vm.to = to;
        vm.dataList = {}; //返回数据
        vm.currentPage = 1;
        vm.maxPageCount = 0;
        vm.perPage = 15;

        //
        vm.afterSaleType = [{
          "type": "0",
          "name": "退货退款"
        }, {
          "type": "1",
          "name": "仅退款"
        }, {
          "type": "2",
          "name": "换货"
        }];
        vm.afterSaleStatus = [{
          "type": "0",
          "name": "申请成功，等待卖家确认中"
        }, {
          "type": "1",
          "name": "申请达成，等待买家发货"
        }, {
          "type": "2",
          "name": "买家已寄回，等待卖家确认收货"
        }, {
          "type": "3",
          "name": "等待卖家实物审核"
        }, {
          "type": "4",
          "name": "驳回"
        }, {
          "type": "5",
          "name": "卖家不同意，等待买家修改"
        }, {
          "type": "6",
          "name": "换货达成，等待卖家发货"
        }, {
          "type": "7",
          "name": "卖家已发货，等待买家确认收货"
        }, {
          "type": "8",
          "name": "已完成"
        }];
        vm.doQuery = function() {
          var data = {};

          if ($("#afterSaleStatus").val()) {
            data.afterSaleStatus = $("#afterSaleStatus").val();
          }
          if ($("#orderSn").val()) {
            data.orderSn_contains = $.trim($("#orderSn").val());
          }
          if ($("#sn").val()) {
            data.sn_contains = $.trim($("#sn").val());
          }
          var today = new Date(); // 获取今天时间
          var begin = null;
          var end = null;

          today.setTime(today.getTime() + 24 * 3600 * 1000);

         vm.dateSelectType  = $("#dateSelect").val();

          if (vm.dateSelectType == 4) { //自定时间
            begin = vm.from;
            end = vm.to;
          } else if (vm.dateSelectType == 1) {
            end = today.format('yyyy-MM-dd');

            today.setTime(today.getTime() - 7 * 24 * 3600 * 1000);

            begin = today.format('yyyy-MM-dd');

          } else if (vm.dateSelectType == 2) {
            end = today.format('yyyy-MM-dd');
            today.setMonth(today.getMonth() - 1);
            begin = today.format('yyyy-MM-dd');
          } else if (vm.dateSelectType == 3) {
            end = today.format('yyyy-MM-dd');
            today.setMonth(today.getMonth() - 3);
            begin = today.format('yyyy-MM-dd');
          }
          if (end) {
             var date = new Date(end);
            date.setTime(date.getTime()+24*3600*1000);
            data.createTime__lte = date.format("yyyy-MM-dd"); 
            data.createTime__gte = begin;
          }
          if (vm.currentPage > vm.maxPageCount) {
            vm.currentPage = vm.maxPageCount;
          }

          if (vm.currentPage == 0) {
            vm.currentPage = 1;
          }

          if (vm.perPage == 0) {
            vm.perPage = 1;
          }
          data.page = vm.currentPage;
          data.per_page = vm.perPage;
          data.sort = "-modifyTime";

          vm.dataList = [];
          vm.currentPage = 0;
          vm.maxPageCount = 0;

          io.GET(apiConfig.returnList, data, function(data) {
            vm.dataList = data.result;
            vm.currentPage = data.result_info.page;
            vm.maxPageCount = data.result_info.page_count;
            vm.perPage = data.result_info.per_page;
          }, function() {
            vm.dataList = [];
            vm.currentPage = 0;
            vm.maxPageCount = 0;
          });
        };
        vm.goDetail = function(id, type) {
          var url = "";
          if (type == 0) {
            url = "/afs/return-detail-01.html?id=" + id;
          } else if (type == 1) {
            url = "/afs/return-detail-02.html?id=" + id;
          } else if (type == 2) {
            url = "/afs/return-detail-03.html?id=" + id;
          }

          window.location.href = url;
        };
        vm.goFirst = function() {
          vm.currentPage = 1;
          vm.doQuery();
        };
        vm.goLast = function() {
          vm.currentPage = vm.maxPageCount;
          vm.doQuery();
        };
        vm.goBefore = function(i) {
          vm.currentPage = vm.currentPage - i;
          vm.doQuery();
        };
        vm.getAfter = function(i) {
          vm.currentPage = vm.currentPage + 1;
          vm.doQuery();
        };
        vm.chanageDateSelect = function() {
          vm.dateSelectType = $("#dateSelect").val();
        };
        vm.getAfsTypeName = function(value) {
          for (var i = 0; i < vm.afterSaleType.length; i++) {
            if (vm.afterSaleType[i].type == value) {
              return vm.afterSaleType[i].name;
            }
          }
        };
        vm.getAfsStatusName = function(value) {
          for (var i = 0; i < vm.afterSaleStatus.length; i++) {
            if (vm.afterSaleStatus[i].type == value) {
              return vm.afterSaleStatus[i].name;
            }
          }
        }
      });
      avalon.scan();
      returnListCtrl.doQuery();
    });
  });