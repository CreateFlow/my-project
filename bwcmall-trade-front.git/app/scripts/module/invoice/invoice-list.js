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
      var invoiceListCtrl = avalon.define('invoiceListCtrl', function(vm) {

        vm.dateSelectType = 1;

        vm.dataList = {}; //返回数据
        vm.currentPage = 1;
        vm.maxPageCount = 0;
        vm.perPage = 15;
        vm.from = from;
        vm.to = to;
        vm.aOpts = {
          rules: 'null, 0D'
        };

        vm.total = {
          "totleInvoiceAmount": 0,
          "totleDeliveredInvoiceAmount": 0,
          "totleInvoieBalance": 0
        };
        //
        vm.invoiceTypeList = [{
          "type": "0",
          "name": "普票"
        }, {
          "type": "1",
          "name": "增票"
        }];
        vm.invoiceStatusList = [{
          "type": "0",
          "name": "未申请"
        }, {
          "type": "1",
          "name": "开票中"
        }, {
          "type": "2",
          "name": "已开票"
        }];

        vm.orderStatusList = [{
          "type": "1",
          "name": "待发货"
        }, {
          "type": "2",
          "name": "已发货"
        }, {
          "type": "3",
          "name": "已收货"
        }, {
          "type": "5",
          "name": "已完成"
        }];

        vm.init = function() {

          io.GET(apiConfig.invoiceTotal, {}, function(data) {
            if (data.result) {
              vm.total = data.result;
              if (!vm.total.totleInvoiceAmount) {
                vm.total.totleInvoiceAmount = 0;
              }
              if (!vm.total.totleDeliveredInvoiceAmount) {
                vm.total.totleDeliveredInvoiceAmount = 0;
              }
              if (!vm.total.totleInvoieBalance) {
                vm.total.totleInvoieBalance = 0;
              }
            }
          });
        }
        vm.doQuery = function() {
          var data = {};

          if ($("#sn").val()) {
            data.sn_contains = $("#sn").val();
          }
          if ($("#serviceBuyerName").val()) {
            data.serviceBuyerName_contains = $("#serviceBuyerName").val();
          }

          if ($("#InvoiceTypeDisplay").val()) {
            data.invoiceType = $("#InvoiceTypeDisplay").val();
          }
          if ($("#orderInvoiceStatus").val()) {
            data.orderInvoiceStatus = $("#orderInvoiceStatus").val();
          }
          if ($("#orderStatusDisplay").val()) {
            data.orderStatus = $("#orderStatusDisplay").val();
          }
          if (vm.to) {
            var date = new Date(vm.to);
            date.setTime(date.getTime() + 24 * 3600 * 1000);
            data.createdTime__lte = date.format("yyyy-MM-dd");
          }
          if (vm.from) {
            data.createdTime__gte = vm.from;
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
          data.sort = "-createdTime";

          vm.dataList = [];
          vm.currentPage = 0;
          vm.maxPageCount = 0;

          io.GET(apiConfig.invoice, data, function(data) {
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
        vm.checkALL = function() {
          if (!$(this).find(":input").is(":checked")) {
            $(this).find("strong").addClass('m-checkbox-all-icon-checked');
            $(".invoice-table").find(":input[type=checkbox]").parent().find("strong").addClass('m-checkbox-icon-checked');
            $(".invoice-table").find(":input[type=checkbox]").prop("checked", true);
          } else {
            $(".invoice-table").find(":input[type=checkbox]").removeProp('checked');
            $(".invoice-table").find(":input[type=checkbox]").parent().find("strong").removeClass('m-checkbox-icon-checked');
            $(this).find("strong").removeClass(' m-checkbox-all-icon-checked');
          }
        };
        vm.checkOne = function() {
          if (!$(this).find(":input").is(":checked")) {
            $(this).find("strong").addClass('m-checkbox-icon-checked');
            $(this).find(":input[type=checkbox]").prop("checked", true);
          } else {
            $(this).find(":input[type=checkbox]").removeProp('checked');
            $(this).find("strong").removeClass('m-checkbox-icon-checked');
          }
        }
        vm.alertMsg = function(msg) {
          alertDialogCtrl.msg = msg;
          alertDialogCtrl.orderId = vm.orderId;
          avalon.vmodels["alertDialog"].toggle = true;
        };
        vm.applyInvoice = function(id) {
          applyDialogCtrl.initDialog();
          applyDialogCtrl.orderList = [];
          applyDialogCtrl.orderList.push(id);
          avalon.vmodels["applyDialog"].toggle = true;
        };
        vm.batchApplyInvoice = function() {
          var orderList = [];
          $(".invoice-table").find(".m-checkbox-check").each(function() {
            if ($(this).is(":checked") && $(this).attr("orderInvoiceStatus")) {
              orderList.push($(this).val());
            }
          });
          if (orderList.length == 0) {
            vm.alertMsg("请至少选择一条需要开票的记录!");
            return false;
          }
          applyDialogCtrl.orderList = orderList;
          applyDialogCtrl.initDialog();
          avalon.vmodels["applyDialog"].toggle = true;
        }

        vm.showReason = function() {
          vm.alertMsg("由于当前订单的状态不可以开票，请过一段时间再申请开票，谢谢!");
        }
      });

      var alertDialogCtrl = avalon.define({
        $id: "alertDialogCtrl",
        msg: "",
        $alertDialogOptions: {
          title: "友情提示",
          showClose: true,
          width: 460,
          isTop: true,
          onClose: function() {
            //点击×号回调函数
          },
          onConfirm: function() {
            avalon.vmodels["alertDialog"].toggle = false;
            $(".oni-dialog-layout").css("z-index", 1);
          },
          onCancel: function() {
            avalon.vmodels["alertDialog"].toggle = false;
            $(".oni-dialog-layout").css("z-index", 1);
          }
        },
        closeDialog: function() {
          avalon.vmodels["alertDialog"].toggle = false;
          $(".oni-dialog-layout").css("z-index", 1);
        }

      });
      var deleteDialogCtrl = avalon.define({
        $id: "deleteDialogCtrl",
        msg: "",
        data: {},
        data: {},
        $deleteDialogOptions: {
          title: "友情提示",
          showClose: true,
          width: 460,
          isTop: true,
          onClose: function() {
            //点击×号回调函数
          },
          onConfirm: function() {
            avalon.vmodels["deleteDialog"].toggle = false;
            $(".oni-dialog-layout").css("z-index", 1);

          },
          onCancel: function() {
            avalon.vmodels["deleteDialog"].toggle = false;
            $(".oni-dialog-layout").css("z-index", 1);
          }
        },
        closeDialog: function() {
          avalon.vmodels["deleteDialog"].toggle = false;
          $(".oni-dialog-layout").css("z-index", 1);
        },
        onOK: function() {
          avalon.vmodels["deleteDialog"].toggle = false;
          $(".oni-dialog-layout").css("z-index", 1);
          io.DELETE(apiConfig.invoiceAPI + "/" + deleteDialogCtrl.data.id, {}, function(data) {
            if (deleteDialogCtrl.data.type == '0') {
              applyDialogCtrl.plainList.remove(deleteDialogCtrl.data);
              if (applyDialogCtrl.plainList.length < 5) {
                applyDialogCtrl.plaintAddable = true;
              }
            } else {
              applyDialogCtrl.valueAddedList.remove(deleteDialogCtrl.data);
              var count = 0;
              for (var i = 0; i < applyDialogCtrl.valueAdded.length; i++) {
                if (applyDialogCtrl.valueAdded[i].custInvoiceStatus == 1) {
                  count = count + 1;
                }
              }
              if (count <= 3) {
                applyDialogCtrl.valueAddedAddable = true;
              }
            }

          }, function(data) {
            invoiceListCtrl.alertMsg(data.message);
          });
        }
      });
      var successDialogCtrl = avalon.define({
        $id: "successDialogCtrl",
        $successDialogOptions: {
          title: "友情提示",
          showClose: true,
          width: 460,
          isTop: true,
          onCancel: function() {
            window.location.reload();
          }
        },
        onOK: function() {
          window.location.reload();
        }
      });
      var applyDialogCtrl = avalon.define({
        $id: "applyDialogCtrl",
        msg: "",
        currentTab: 'tab1',
        orderList: [],
        plainList: [],
        valueAddedList: [],
        addressList: [],
        step: 1,
        selectedInoiceId: 0,
        selectedAddressId: 0,
        plaintAddable: true,
        isInit: false,
        inprogress: false,
        invoiceContextType: -1,
        invoiceTitleType: -1,
        addPlaint: false,
        //tab数据
        invoiceTypeTabs: [{
          "text": "增值发票",
          "value": "tab1"
        }, {
          "text": "普通发票",
          "value": "tab2"
        }],
        $applyDialogOptions: {
          title: "友情提示",
          showClose: true,
          width: 600,
          isTop: true,
          onClose: function() {
            //点击×号回调函数
          },
          onConfirm: function() {

            if (applyDialogCtrl.inprogress) {
              return false;
            }
            applyDialogCtrl.inprogress = true;

            if (applyDialogCtrl.currentTab == "tab2") {
              if (!applyDialogCtrl.invoiceContextType == -1) {
                invoiceListCtrl.alertMsg("请选择发票内容!");
                applyDialogCtrl.inprogress = false;
                applyDialogCtrl.step = 1;
                return false;
              }
              if (applyDialogCtrl.invoiceTitleType == -1) {
                invoiceListCtrl.alertMsg("请选择发票抬头类型[个人或者公司]!");
                applyDialogCtrl.inprogress = false;
                applyDialogCtrl.step = 1;
                return false;
              }
              if (applyDialogCtrl.invoiceTitleType == 1) {
                if (!applyDialogCtrl.selectedInoiceId) {
                  invoiceListCtrl.alertMsg("请选择发票抬头!");
                  applyDialogCtrl.inprogress = false;
                  applyDialogCtrl.step = 1;
                  return false;
                }
              }
            }
            if (!applyDialogCtrl.selectedAddressId) {
              invoiceListCtrl.alertMsg("请选择收票地址!");
              applyDialogCtrl.inprogress = false;
              return false;
            }

            var postData = {};
            postData.orderList = applyDialogCtrl.orderList;
            postData.addressId = applyDialogCtrl.selectedAddressId;

            if (applyDialogCtrl.currentTab == "tab2") {
              postData.invoiceType = 0;
              postData.invoiceTitleType = applyDialogCtrl.invoiceTitleType;
              postData.invoiceContextType = applyDialogCtrl.invoiceContextType;
              if (applyDialogCtrl.invoiceTitleType == 1) {
                postData.invoiceId = applyDialogCtrl.selectedInoiceId;
              }
            } else {
              postData.invoiceType = 1;
              postData.invoiceId = applyDialogCtrl.selectedInoiceId;
            }
            io.POST(apiConfig.invoice, postData, function(data) {
                avalon.vmodels["successDialog"].toggle = true;
              }, function(data) {
                invoiceListCtrl.alertMsg(data.message);
                applyDialogCtrl.inprogress = false;
              })
              //avalon.vmodels["applyDialog"].toggle = false;
          },
          onCancel: function() {
            avalon.vmodels["applyDialog"].toggle = false;
          },
          onGoNext: function() {
            applyDialogCtrl.step = applyDialogCtrl.step + 1;
          },
          selectInvoice: function(id) {
            applyDialogCtrl.selectedInoiceId = id;
            // $(this).parent().find('div').removeClass('selected')
            //  $(this).addClass('selected')
          },
          selectSimpleInvoice: function(id) {
            applyDialogCtrl.selectedInoiceId = id;
          },
          selectAddress: function(id) {
            applyDialogCtrl.selectedAddressId = id;
          },
          selectInvoiceContextType: function(type) {
            applyDialogCtrl.invoiceContextType = type;
          },
          selectInvoiceTitleType: function(type) {
            applyDialogCtrl.invoiceTitleType = type;
            if (type == 1) {
              if (applyDialogCtrl.plainList && applyDialogCtrl.plainList.length > 0) {
                applyDialogCtrl.selectedInoiceId = applyDialogCtrl.plainList[0].id;
              }
            }

          },

          onGoPre: function() {
            applyDialogCtrl.step = applyDialogCtrl.step - 1;
          },
          //tab切换
          changeTab: function(value) {
            applyDialogCtrl.step = 1;
            applyDialogCtrl.selectedInoiceId = 0;
            applyDialogCtrl.selectedAddressId = 0;
            applyDialogCtrl.currentTab = value;
            applyDialogCtrl.invoiceContextType = -1;
            applyDialogCtrl.invoiceTitleType = -1;
            $(".dialog-apply-content").find(".selected").removeClass('selected')
            if (value == 'tab2') {
              applyDialogCtrl.invoiceContextType = 0;
              applyDialogCtrl.invoiceTitleType = 0;
            } else {
              if (applyDialogCtrl.valueAddedList && applyDialogCtrl.valueAddedList.length > 0) {
                applyDialogCtrl.selectedInoiceId = applyDialogCtrl.valueAddedList[0].id;
              }
            }
            if (applyDialogCtrl.addressList && applyDialogCtrl.addressList.length > 0) {
              applyDialogCtrl.selectedAddressId = applyDialogCtrl.addressList[0].id;
            }
          },
          subAddress: function(str) {
            if (str) {
              if (str.length > 20) {
                return str.substring(0, 20) + "...";
              } else {
                return str;
              }
            } else {
              return "";
            }
          },
          simpleOneMouseover: function(obj, el) {
            if (!el.inEdit) {

            }
            $(obj).find(".invoice-simple-actioin-panel").show();
          },
          simpleOneMouseleave: function(obj, el) {
            if (!el.inEdit) {
              $(obj).find(".invoice-simple-actioin-panel").hide();
            }
          },
          addPlainInvoice: function(id) {
            applyDialogCtrl.addPlaint = true;
          },
          cancelUpdate: function(el) {
            var index = 0;
            for (var i = 0; i < applyDialogCtrl.plainList.length; i++) {
              if (applyDialogCtrl.plainList[i].id == el.id) {
                index = i;
                break;
              }
            }
            el.inEdit = false;
            applyDialogCtrl.plainList.splice(index, 1, el);
          },
          editPlainInvoice: function(el) {
            var index = 0;
            for (var i = 0; i < applyDialogCtrl.plainList.length; i++) {
              if (applyDialogCtrl.plainList[i].id == el.id) {
                index = i;
                break;
              }
            }
            el.inEdit = true;

            applyDialogCtrl.plainList.splice(index, 1, el);


          },
          updatePainInvoice: function(el) {
            var corpTitle = $("#corpTitle" + el.id).val();
            if (!corpTitle) {
              invoiceListCtrl.alertMsg("请填写发票抬头!");
              return false;
            } else {
              var postData = {};
              postData.corpTitle = corpTitle;
              postData.type = "0";
              io.PUT(apiConfig.invoiceAPI + "/" + el.id, postData, function(data) {
                el.corpTitle = postData.corpTitle;
                var index = 0;
                for (var i = 0; i < applyDialogCtrl.plainList.length; i++) {
                  if (applyDialogCtrl.plainList[i].id == el.id) {
                    index = i;
                    break;
                  }
                }
                el.inEdit = false;
                applyDialogCtrl.plainList.splice(index, 1, el);
              }, function(data) {
                invoiceListCtrl.alertMsg(data.message);
              });
            }
          },

          delInvoice: function(el) {
            deleteDialogCtrl.msg = "是否确定删除？";
            deleteDialogCtrl.data = el;
            avalon.vmodels["deleteDialog"].toggle = true;
          },
          addPainInvoice: function() {
            var corpTitle = $("#corpTitle").val();
            if (!corpTitle) {
              invoiceListCtrl.alertMsg("请填写发票抬头!");
              return false;
            } else {
              var postData = {};
              postData.corpTitle = corpTitle;
              postData.type = "0";
              io.POST(apiConfig.invoiceAPI, postData, function(data) {
                $("#corpTitle").val("");
                applyDialogCtrl.plainList.push(data.result);
                applyDialogCtrl.addPlaint = false;
                if (applyDialogCtrl.plainList.length >= 5) {
                  applyDialogCtrl.plaintAddable = false;
                }
              }, function(data) {
                invoiceListCtrl.alertMsg(data.message);
              });
            }
          },
          cancelAdd: function() {
            applyDialogCtrl.addPlaint = false;
            $("#corpTitle").val("");
          }
        },
        closeDialog: function() {
          avalon.vmodels["applyDialog"].toggle = false;
        },
        initDialog: function() {
          applyDialogCtrl.step = 1;
          applyDialogCtrl.selectedInoiceId = 0;
          applyDialogCtrl.selectedAddressId = 0;
          applyDialogCtrl.currentTab = 'tab1';
          applyDialogCtrl.invoiceContextType = -1;
          applyDialogCtrl.invoiceTitleType = -1;
          $(".dialog-apply-content").find(".selected").removeClass('selected');
          applyDialogCtrl.inprogress = false;
          if (!applyDialogCtrl.isInit) {
            io.GET(apiConfig.invoiceAPI, {}, function(data) {
              applyDialogCtrl.plainList = data.result.plain;
              for (var i = 0; i < data.result.valueAdded.length; i++) {
                if (data.result.valueAdded[i].custInvoiceStatus == '1') {
                  applyDialogCtrl.valueAddedList.push(data.result.valueAdded[i]);
                }
              }
              if (applyDialogCtrl.valueAddedList && applyDialogCtrl.valueAddedList.length > 0) {
                applyDialogCtrl.selectedInoiceId = applyDialogCtrl.valueAddedList[0].id;
              }
              if (data.result.plain.length >= 5) {
                applyDialogCtrl.plaintAddable = false;
              }
              applyDialogCtrl.isInit = true;
            });
            io.GET(apiConfig.addresses, function(data) {
              applyDialogCtrl.addressList = data.result;
              if (applyDialogCtrl.addressList && applyDialogCtrl.addressList.length > 0) {
                applyDialogCtrl.selectedAddressId = applyDialogCtrl.addressList[0].id;
              }
            });
          } else {
            //默认初始化第一个
            if (applyDialogCtrl.valueAddedList && applyDialogCtrl.valueAddedList.length > 0) {
              applyDialogCtrl.selectedInoiceId = applyDialogCtrl.valueAddedList[0].id;
            }
            if (applyDialogCtrl.addressList && applyDialogCtrl.addressList.length > 0) {
              applyDialogCtrl.selectedAddressId = applyDialogCtrl.addressList[0].id;
            }
          }
        }

      });


      avalon.scan();
      invoiceListCtrl.init();
      invoiceListCtrl.doQuery();
    });

  });