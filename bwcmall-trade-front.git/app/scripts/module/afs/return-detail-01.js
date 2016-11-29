  /**
   * 退换货列表
   */
  require(['dialog/avalon.dialog'], function(avalon) {
    var isLogin = storage.isLogin();
    if (!isLogin) {
      urls.goLogin();
    }

    var returnDetailCtrl01 = avalon.define('returnDetailCtrl01', function(vm) {
      vm.editModel = 1; //1 只读 2 全编辑 3 部分编辑（特指填写发货信息）,默认为1
      vm.id = urls.getParameter(window.location.href, 'id');
      vm.orderInfo = {};
      vm.actionList = [];
      vm.orderId = '';
      vm.sn = '';
      vm.currentType = 0;
      vm.currentProgress = 1;
      vm.blockProgress = 0;
      vm.currentAction = {};
      vm.returnLogisticCorpList = [];
      vm.currentOrderAfsStatus = 0;
      vm.detailInfo = {
        items: [],
        content: [],
        voucherUrl: []
      };

      vm.selectedOrderItems = [];
      vm.uploadImagesList = [];
      vm.inProgress = false;

      //省份
      vm.provinceData = [];
      vm.province = '';
      //城市
      vm.cityData = [];
      vm.city = '';
      //县
      vm.countyData = [];
      vm.county = '';
      vm.value = '';
      vm.returnTypes = [];

      vm.reasonTypeList = [];

      io.GET(apiConfig.getlogisticCorp, {}, function(data) {
        vm.returnLogisticCorpList = data.result;
      });
      vm.showShopInfo = function(obj) {
        $(obj).next().show();
      };
      vm.hasBank = function(accountTypes) {
        if (accountTypes && accountTypes.length > 0) {
          for (var i = 0; i < accountTypes.length; i++) {
            if (accountTypes[i] == '1') {
              return true;
            }
          }
        }
        return false;
      };

      vm.hideShopInfo = function(obj) {
        $(obj).next().hide();
      };
      vm.selectShippingCrop = function(name) {
        vm.detailInfo.returnLogisticCorp = name;
        $('.m-tabselect-block').removeClass('m-tabselect-block-active');
        $('.m-tabselect-body').hide();
      };
      vm.shippingCropClick = function(name) {
        if (vm.editModel == 1) {
          return false;
        }
        var $dis = $(this).siblings('.m-tabselect-body').css('display');
        if ($dis == 'block') {
          $('.m-tabselect-body').hide();
          $('.m-tabselect-block').removeClass('m-tabselect-block-active');
        } else {
          $('.m-tabselect-block').removeClass('m-tabselect-block-active');
          $(this).addClass('m-tabselect-block-active');
          $('.m-tabselect-body').hide();
          $(this).siblings('.m-tabselect-body').show();
        }
      };
      vm.goReturnApply = function(obj) {
        var type = $("#returnType").val();
        if (type != vm.currentType) {
          confirmDialogCtrl.msg = "切换售后类型后，当前填写的所有数据都将丢失，是否确认切换？";
          confirmDialogCtrl.type = type;
          confirmDialogCtrl.id = vm.id;
          avalon.vmodels["confirmDialog"].toggle = true;
        }
      }
      vm.alertPlatorm = function() {
        avalon.vmodels["platormDialog"].toggle = true;
      };
      vm.alertMsg = function(msg) {
        alertDialogCtrl.msg = msg;
        alertDialogCtrl.orderId = vm.orderId;
        avalon.vmodels["alertDialog"].toggle = true;
      }
      vm.viewBigImage = function(url) {
        imageDialogCtrl.url = url;
        avalon.vmodels["imageDialog"].toggle = true;
      }
      vm.deleteImage = function(id) {
        for (var i = 0; i < vm.uploadImagesList.length; i++) {
          if (id == vm.uploadImagesList[i].resourcesId) {
            vm.uploadImagesList.splice(i, 1);
            break;
          }
        }
      };
      vm.popOrderItems = function() {
        orderItemsDialogCtrl.msg = "测试";
        orderItemsDialogCtrl.orderId = vm.orderId;
        avalon.vmodels["orderItemsDialog"].toggle = true;
        orderItemsDialogCtrl.loadOrderItems();

      };
      vm.deleteOrderItem = function(obj) {
        for (var i = 0; i < vm.selectedOrderItems.length; i++) {
          if (obj == vm.selectedOrderItems[i].id) {
            vm.selectedOrderItems.splice(i, 1);
            break;
          }
        }
      };
      vm.initFileUpload = function() {
        var token = null;
        if (!storage.getCurrentUser()) {
          urls.goLogin();
        } else {
          token = storage.getCurrentUser().authToken;
        }
        //举证上传
        $('#fileUploadBtn').uploadbutton({
          'buttonClass': 'upButtonClass',
          'swf': '../scripts/plugin/uploadifive/uploadify.swf',
          'auto': true,
          'method': 'post',
          'fileSizeLimit': 10240,
          'formData': {
            'token': token
          },
          'fileObjName': 'file',
          'fileTypeExts': '*.gif;*.jpg;*.jpeg;*.png;*.bmp;*.gif',
          'uploader': apiConfig.upload,
          'height': '30',
          'errorMsg': '文件上传出错',
          'width': '100',
          'buttonText': '选择凭证图片',
          'overrideEvents': ['onSelectError', 'onDialogClose'],
          'onDialogClose': function() {

          },
          'onSelectError': function(file, errorCode, errorMsg) {
            switch (errorCode) {
              case -100:
                alert("一次只能上传一个文件！");
                break;
              case -110:
                alert("文件 [" + file.name + "] 大小必须小于10M！");
                break;
              case -120:
                alert("文件 [" + file.name + "] 大小异常！");
                break;
              case -130:
                alert("文件 [" + file.name + "] 类型不正确,只支持gif,jpg,jpeg,png,bmp等格式！");
                break;
            }
            return false;
          },

          'onUploadSuccess': function(file, data, response) {
            var respData = JSON.parse(data);
            respData.result.resourcesId = respData.result.id;
            respData.result.id = '';
            vm.uploadImagesList.push(respData.result);
          }
        });
      };
      //选择省份
      vm.selectProvince = function(name) {
        returnDetailCtrl01.province = name;
      };

      //选择城市
      vm.selectCity = function(name) {
        returnDetailCtrl01.city = name;
      };

      //选择区/县
      vm.selectCounty = function(name, value) {

        returnDetailCtrl01.county = name;
        returnDetailCtrl01.value = value;
      };
      vm.amountCheck = function() {
        $("#amount").val($("#amount").val().replace(/[^((0-9)|(\.))]/g, ''));
        var amount = $("#amount").val();
        if (amount > vm.orderInfo.returnableAmount) {
          vm.alertMsg("最多可退金额为:" + vm.orderInfo.returnableAmount);
          $("#amount").val(0);
          return false;
        }

        return true;
      };
      vm.bankNameCheck = function() {
        if (vm.orderInfo.payPlatform == 3) {
          var bankName = $("#bankName").val();
          if (!bankName) {
            vm.alertMsg("开户行名称不能为空！");
            return false;
          }

        }
        return true;
      };
      vm.bankAccountCheck = function() {
        if (vm.orderInfo.payPlatform == 3) {
          var bankAccount = $("#bankAccount").val();
          if (!bankAccount) {
            vm.alertMsg("银行账号不能为空！");
            return false;
          }

        }
        return true;
      };
      vm.accountNameCheck = function() {
        if (vm.orderInfo.payPlatform == 3) {
          var accountName = $("#accountName").val();
          if (!accountName) {
            vm.alertMsg("账户姓名不能为空！");
            return false;
          }

        }
        return true;
      };

      vm.returnQuantityCheck = function(obj, maxquantity, id) {
        $(obj).val($(obj).val().replace(/[^0-9]/g, ''));
        var obj = $(obj);
        if (obj.val() > maxquantity) {
          vm.alertMsg("最多只能退" + maxquantity + "个商品!")
          obj.val(0);
          for (var i = 0; i < vm.selectedOrderItems.length; i++) {
            if (vm.selectedOrderItems[i].orderItemId == id) {
              vm.selectedOrderItems[i].returnQuantity = 0;
            }
          }
          return false;
        };
        for (var i = 0; i < vm.selectedOrderItems.length; i++) {
          if (vm.selectedOrderItems[i].orderItemId == id) {
            vm.selectedOrderItems[i].returnQuantity = obj.val();
          }
        }
        return true;
      }

      vm.areaclick = function() {
        if (vm.editModel == 1) {
          return false;
        }
        var $dis = $(this).siblings('.m-tabselect-body').css('display');
        if ($dis == 'block') {
          $('.m-tabselect-body').hide();
          $('.m-tabselect-block').removeClass('m-tabselect-block-active');
        } else {
          $('.m-tabselect-block').removeClass('m-tabselect-block-active');
          $(this).addClass('m-tabselect-block-active');
          $('.m-tabselect-body').hide();
          $(this).siblings('.m-tabselect-body').show();
        }
      };
      vm.confirmShipping = function() {
        var postData = {};
        postData.orderAfterSaleId = vm.id
        postData.returnLogisticCorp = $("#returnLogisticCorp").val();
        postData.returnLogisticMemo = $("#returnLogisticMemo").val()
        postData.returnLogisticId = $("#returnLogisticId").val();
        if (vm.inProgress) {
          return;
        }
        if (!postData.returnLogisticCorp) {
          vm.alertMsg("请选择物流公司!")
          vm.inProgress = false;
          return false;
        }
        if (!postData.returnLogisticId) {
          vm.alertMsg("请填写物流单号!")
          vm.inProgress = false;
          return false;
        }
        vm.inProgress = true;

        io.PATCH(apiConfig.buyerConfirmDeliver, postData, function(data) {
          window.location.href = "/afs/return-list.html";
        }, function(data) {
          vm.inProgress = false;
          vm.alertMsg(data.message);
        });
      }
      vm.initDetailInfo = function() {
        //mock 数据
        //  num = 3;
        //  vm.currentProgress = num;
        //   vm.blockProgress = -1;
        //   vm.currentAction = {
        //     tex: "驳回",
        //      "createTime": "2016-02-20"
        //   };

        io.GET(apiConfig.returnOrderInfo + vm.id, {}, function(data) {
          data.result.orderInfo.accountTypes = data.result.accountTypes;
          vm.detailInfo = data.result; 
          if( !data.result.orderInfo.afterSaleTypeList || data.result.orderInfo.afterSaleTypeList.length == 0){
            data.result.orderInfo.afterSaleTypeList  = new Array();
            data.result.orderInfo.afterSaleTypeList.push({
              'type':'0',
              'name':'退货退款'
            });
          } 
          vm.returnTypes = data.result.orderInfo.afterSaleTypeList;

          $("#returnType").val(data.result.afterSaleType);
          $("#reasonType").val(data.result.reasonType);
          $("#amount").val(data.result.amount);
          $("#reason").val(data.result.reason);

          $(":input").each(function() {
            var key = $(this).attr("name");
            if (vm.detailInfo[key]) {
              $(this).val(vm.detailInfo[key]);
            }
          });


          if (data.result) {
            if (data.result.afterSaleLog) {
              vm.actionList = data.result.afterSaleLog;
            }
            if (data.result.items) {

              vm.selectedOrderItems = data.result.items;
            }
            if (data.result.res) {
              vm.uploadImagesList = [];
              for (var i = 0; i < data.result.res.length; i++) {
                if (data.result.res[i].afterSaleResType != 1) {
                  vm.uploadImagesList.push(data.result.res[i]);
                }
              }
            }
          }

          $("#reDeliverLogisticCorp").val(data.result.returnLogisticCorp);
          $("#reDeliverLogisticMemo").val(data.result.returnLogisticMemo)
          $("#reDeliverLogisticId").val(data.result.returnLogisticId);

          if (data.result.orderInfo) {
            vm.orderInfo = data.result.orderInfo;
            vm.orderId = data.result.orderInfo.orderId;
            vm.sn = vm.orderInfo.orderSn;
            vm.value = returnDetailCtrl01.detailInfo.buyerAreaId;
            returnDetailCtrl01.returnTypes = vm.orderInfo.afterSaleTypeList;
            $(".return-detail-panel").css("height", "550px")

          }

          returnDetailCtrl01.selectProvince(returnDetailCtrl01.detailInfo.salerProvinceName);
          returnDetailCtrl01.selectCity(returnDetailCtrl01.detailInfo.salerCityName);
          returnDetailCtrl01.selectCounty(returnDetailCtrl01.detailInfo.salerDistrictName, returnDetailCtrl01.detailInfo.salerAreaId);

          $("#salerConsignee").val(returnDetailCtrl01.detailInfo.salerConsignee);
          $("#salerPhone").val(returnDetailCtrl01.detailInfo.salerPhone);
          $("#salerAddress").val(returnDetailCtrl01.detailInfo.salerAddress);

          if (data.result.afterSaleStatus || data.result.afterSaleStatus == 0) {
            //(0申请成功，等待卖家确认中 1申请达成，等待买家发货 2买家已寄回，等待卖家确认收货 3，等待卖家实物审核 
            //4驳回 5卖家不同意，等待买家修改 6换货达成，等待卖家发货 7卖家已发货，等待买家确认收货 8已完成),
            var status = data.result.afterSaleStatus;
            var num = vm.getProcessNum(status);
            vm.currentAction = vm.actionList[0];

            if(vm.currentAction.orderAfterStatus ==  0 ){
              vm.currentAction.orderAfterStatusName = '申请成功，等待卖家确认中';
            }else if(vm.currentAction.orderAfterStatus ==  1 ){
              vm.currentAction.orderAfterStatusName = '申请达成，等待买家发货';
            }else if(vm.currentAction.orderAfterStatus ==  2 ){
              vm.currentAction.orderAfterStatusName = '买家已寄回，等待卖家确认收货';
            }else if(vm.currentAction.orderAfterStatus ==  3 ){
              vm.currentAction.orderAfterStatusName = '等待卖家实物审核';
            }else if(vm.currentAction.orderAfterStatus ==  4 ){
              vm.currentAction.orderAfterStatusName = '驳回';
            }else if(vm.currentAction.orderAfterStatus ==  5 ){
              vm.currentAction.orderAfterStatusName = '卖家不同意，等待买家修改';
            }else if(vm.currentAction.orderAfterStatus ==  6 ){
              vm.currentAction.orderAfterStatusName = '换货达成，等待卖家发货';
            }else if(vm.currentAction.orderAfterStatus ==  7){
              vm.currentAction.orderAfterStatusName = '卖家已发货，等待买家确认收货 ';
            }else if(vm.currentAction.orderAfterStatus ==  8 ){
              vm.currentAction.orderAfterStatusName = '已完成';
            } 

            if (status == 1) {
              vm.editModel = 3;
            }
            if (status == 4) { //驳回了
              //驳回时，计算驳回的前一个环节 
              if (vm.actionList && vm.actionList.length > 0) {
                for (var i = 0; i < vm.actionList.length; i++) {
                  if (vm.actionList[i].orderAfterStatus == 4) { //表示驳回
                    for (var j = i + 1; j < vm.actionList.length; j++) { //找被驳回的前一个属于当前流程的值
                      num = vm.getProcessNum(vm.actionList[j].orderAfterStatus);
                      if (num > 0 && num < 5) {
                        vm.blockProgress = num;
                        break;
                      }
                    }
                  }
                }
              }
            } else if (status == 5) {
              vm.editModel = 2;
              vm.initFileUpload();
              //修改时，计算修改的前一个环节
              if (vm.actionList && vm.actionList.length > 0) {
                vm.currentOrderAfsStatus = -1;
                for (var i = 0; i < vm.actionList.length; i++) {
                  if (vm.actionList[i].orderAfterStatus == 5) { //返回修改 
                    for (var j = i + 1; j < vm.actionList.length; j++) { //找被驳回的前一个属于当前流程的值
                      vm.currentOrderAfsStatus = vm.actionList[i + 1].orderAfterStatus;
                      if (vm.currentOrderAfsStatus == 6 || vm.currentOrderAfsStatus == 7) {
                        vm.currentOrderAfsStatus = 3;
                      }
                      num = vm.getProcessNum(vm.currentOrderAfsStatus);
                      if (num > 0 && vm.currentOrderAfsStatus < 4) {
                        break;
                      }
                    }
                  }
                  if (vm.currentOrderAfsStatus != -1) {
                    break;
                  }
                }
              }
            }
            vm.currentProgress = num;
          }
          vm.initByReadoly();
        });
      }
      vm.initByReadoly = function() {

        var selectLit = $("select:disabled");
        var text = '';
        for (var i = 0; i < selectLit.length; i++) {
          text = $(selectLit[i]).find("option:selected").text();
          if (!text) {
            text = "&nbsp;"
          }
          $(selectLit[i]).parent().append('<span class="readonly-text">' + text + '</span>');
          $(selectLit[i]).remove();
        }
        var textareaList = $("textarea:disabled");
        for (var i = 0; i < textareaList.length; i++) {
          text = $(textareaList[i]).val();
          if (!text) {
            text = "&nbsp;"
          }
          $(textareaList[i]).parent().append('<span>' + text + '</span>');
          $(textareaList[i]).remove();
        }
        $(".return-detail-panel").css("height", "auto");
      }
      vm.initData = function() {
          io.GET(apiConfig.returnReasonList + vm.currentType + "/typeCause", function(data) {
            vm.reasonTypeList = data.result;
            vm.initDetailInfo();
          });
        }
        //(0申请成功，等待卖家确认中 1申请达成，等待买家发货 2买家已寄回，等待卖家确认收货 3，等待卖家实物审核 
        //4驳回 5卖家不同意，等待买家修改 6换货达成，等待卖家发货 7卖家已发货，等待买家确认收货 8已完成),
      vm.getProcessNum = function(status) {
        var num = -1;
        if (status == 6 || status == 7) {
          status = 3;
        }
        switch (status) {
          case 0:
            num = 1;
            break;
          case 1:
            num = 2;
            break;
          case 2:
            num = 3;
            break;
          case 3:
            num = 4;
            break;
          case 8:
            num = 5;
            break;
        }
        return num;
      };
      vm.apply = function() {
        if (vm.inProgress) {
          return;
        }
        vm.inProgress = true;
        var postData = {};
        postData.afterSaleType = vm.currentType;
        postData.afterTypeCauseId = $("#reasonType").val();
        postData.amount = $("#amount").val();
        postData.afterTypeCauseReason = $("#reasonType").find("option:selected").text();
        postData.reason = $("#reason").val();
        postData.orderId = vm.orderInfo.orderId;
        if (!vm.amountCheck() || !vm.bankNameCheck() || !vm.accountNameCheck() || !vm.bankAccountCheck()) {
          vm.inProgress = false;
          return false;
        }
        //举证图片
        if (vm.uploadImagesList.length > 0) {
          postData.resourceList = [];
          for (var i = 0; i < vm.uploadImagesList.length; i++) {
            if (vm.uploadImagesList[i].afterSaleResType != 1) {
              postData.resourceList.push({
                resourceId: vm.uploadImagesList[i].resourcesId,
                imgUrl: vm.uploadImagesList[i].resources
              });
            }

          }
        }
        //退货商品
        if (vm.selectedOrderItems.length > 0) {
          postData.orderAfterSaleItemCreateOrUpdateVOList = [];
          for (var i = 0; i < vm.selectedOrderItems.length; i++) {
            if (!vm.selectedOrderItems[i].returnQuantity) {
              vm.alertMsg("第" + (i + 1) + "条退货数量不能为空!");
              vm.inProgress = false;
              return false;
            }
            if (vm.selectedOrderItems[i].returnQuantity < 1) {
              vm.alertMsg("第" + (i + 1) + "条退货数量必须大于0!");
              vm.inProgress = false;
              return false;
            }
            postData.orderAfterSaleItemCreateOrUpdateVOList.push({
              "orderItemId": vm.selectedOrderItems[i].orderItemId,
              "returnQuantity": vm.selectedOrderItems[i].returnQuantity
            });
          }
        } else {
          vm.alertMsg("请至少选择一件商品！");
          vm.inProgress = false;
          return false;
        }
        //退回物流信息
        postData.returnLogisticCorp = $("#returnLogisticCorp").val();
        postData.returnLogisticMemo = $("#returnLogisticMemo").val()
        postData.returnLogisticId = $("#returnLogisticId").val();
        //银行信息
        if (vm.orderInfo.payPlatform == 3) {
          postData.bankName = $("#bankName").val();
          postData.bankAccount = $("#bankAccount").val();
          postData.accountName = $("#accountName").val();
        }
        postData.orderAfterSaleId = vm.id;
        postData.orderAfterStatus = vm.currentOrderAfsStatus;
        io.PUT(apiConfig.returnPatch, postData, function(data) {
          window.location.href = "/afs/return-list.html";
        }, function(data) {
          vm.inProgress = false;
          vm.alertMsg(data.message);
        });
      };
      vm.cancelApply = function() {
        window.location.href = "/afs/return-list.html";
      }

    });



    var confirmDialogCtrl = avalon.define({
      $id: "confirmDialogCtrl",
      msg: "",
      id: "",
      type: "",
      $confirmDialogOptions: {
        title: "友情提示",
        showClose: true,
        width: 460,
        isTop: true,
        onClose: function() {
          //点击×号回调函数
        },
        onConfirm: function() {
          avalon.vmodels["confirmDialog"].toggle = false;

        },
        onCancel: function() {
          $("#returnType").val(returnDetailCtrl01.currentType);
          avalon.vmodels["confirmDialog"].toggle = false;
        }
      },
      closeDialog: function() {
        avalon.vmodels["confirmDialog"].toggle = false;
      },
      onOK: function() {
        if (confirmDialogCtrl.type == 0) {
          window.location.href = "return-detail-01.html?id=" + confirmDialogCtrl.id;
        } else if (confirmDialogCtrl.type == 1) {
          window.location.href = "return-detail-02.html?id=" + confirmDialogCtrl.id;
        } else if (confirmDialogCtrl.type == 2) {
          window.location.href = "return-detail-03.html?id=" + confirmDialogCtrl.id;
        }
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

        },
        onCancel: function() {
          avalon.vmodels["alertDialog"].toggle = false;
        }
      },
      closeDialog: function() {
        avalon.vmodels["alertDialog"].toggle = false;
      }

    });
    var imageDialogCtrl = avalon.define({
      $id: "imageDialogCtrl",
      url: "",
      $imageDialogOptions: {
        title: "查看大图",
        showClose: true,
        width: 800,
        isTop: true,
        onClose: function() {
          //点击×号回调函数
        },
        onConfirm: function() {
          avalon.vmodels["imageDialog"].toggle = false;

        },
        onCancel: function() {
          avalon.vmodels["imageDialog"].toggle = false;
        }
      },
      closeDialog: function() {
        avalon.vmodels["imageDialog"].toggle = false;
      }

    });
    var platormDialogCtrl = avalon.define({
      $id: "platormDialogCtrl",
      $platormDialogOptions: {
        title: "查看大图",
        showClose: true,
        width: 400,
        isTop: true,
        onClose: function() {
          //点击×号回调函数
        },
        onConfirm: function() {
          avalon.vmodels["platormDialog"].toggle = false;

        },
        onCancel: function() {
          avalon.vmodels["platormDialog"].toggle = false;
        }
      },
      closeDialog: function() {
        avalon.vmodels["platormDialog"].toggle = false;
      }

    });
    var orderItemsDialogCtrl = avalon.define({
      $id: "orderItemsDialogCtrl",
      msg: "",
      orderId: "",
      selectDataList: [],
      orderItems: [],
      select_all: false,
      showWarnging: false,
      $orderItemsDialogOptions: {
        title: "选择商品",
        showClose: true,
        width: 1200,
        height: 500,
        isTop: true,
        onClose: function() {
          //点击×号回调函数
        },
        onConfirm: function() {
          avalon.vmodels["orderItemsDialog"].toggle = false;

        },
        onCancel: function() {
          avalon.vmodels["orderItemsDialog"].toggle = false;
        }
      },
      loadOrderItems: function() {
        if (!orderItemsDialogCtrl.orderItems || orderItemsDialogCtrl.orderItems.length < 1) {
          io.GET(apiConfig.returnOrderItemList + orderItemsDialogCtrl.orderId + "/orderItemList", {}, function(data) {
            for (var i = 0; i < data.result.length; i++) {
              data.result[i].isSelected = false;
            }
            orderItemsDialogCtrl.orderItems = data.result;
          });
        }
      },
      closeOderItems: function() {
        avalon.vmodels["orderItemsDialog"].toggle = false;
      },
      checkAll: function() {
        if (!$(this).find(":input").is(":checked")) {
          orderItemsDialogCtrl.select_all = true;
        } else {
          orderItemsDialogCtrl.select_all = false;
        }
        for (var i = 0; i < orderItemsDialogCtrl.orderItems.length; i++) {
          orderItemsDialogCtrl.orderItems[i].isSelected = orderItemsDialogCtrl.select_all;
        }
        orderItemsDialogCtrl.isShowWarning();
      },
      isShowWarning: function() {
        var found = false;
        for (var i = 0; i < orderItemsDialogCtrl.orderItems.length; i++) {
          if (orderItemsDialogCtrl.orderItems[i].isSelected) {
            if (orderItemsDialogCtrl.orderItems[i].returnType == 0) {
              found = true;
              break;
            }
          }
        }
        orderItemsDialogCtrl.showWarnging = found;
      },
      onCheckBoxSelected: function() {
        var id = $(this).find(":input").val();
        var item = "";
        for (var i = 0; i < orderItemsDialogCtrl.orderItems.length; i++) {
          if (orderItemsDialogCtrl.orderItems[i].id == id) {
            item = orderItemsDialogCtrl.orderItems[i];
          }
        }
        if (!$(this).find(":input").is(":checked")) {
          item.isSelected = true;
        } else {
          item.isSelected = false;
        }
        orderItemsDialogCtrl.isSelectAll();
        orderItemsDialogCtrl.isShowWarning();
      },
      isSelectAll: function() {
        var isAllSelected = true;
        for (var i = 0; i < orderItemsDialogCtrl.orderItems.length; i++) {
          if (orderItemsDialogCtrl.orderItems[i].isSelected != true) {
            isAllSelected = false;
            break;
          }
        }
        orderItemsDialogCtrl.select_all = isAllSelected;
      },
      addItems: function() {
        $("#popItemTable").find(":input[type=checkbox]").each(function() {
          if ($(this).is(":checked")) {
            var found = false;
            if (returnDetailCtrl01.selectedOrderItems && returnDetailCtrl01.selectedOrderItems.length > 0) {
              for (var i = 0; i < returnDetailCtrl01.selectedOrderItems.length; i++) {
                if (returnDetailCtrl01.selectedOrderItems[i].orderItemId == $(this).val()) {
                  found = true;
                  break;
                }
              }
            }
            if (!found) {
              for (var i = 0; i < orderItemsDialogCtrl.orderItems.length; i++) {
                if (orderItemsDialogCtrl.orderItems[i].id == $(this).val()) {
                  orderItemsDialogCtrl.orderItems[i].orderItemId = $(this).val();
                  returnDetailCtrl01.selectedOrderItems.push(orderItemsDialogCtrl.orderItems[i]);
                  break;
                }
              }
            }
          }
        });
        orderItemsDialogCtrl.closeOderItems();
      }

    });

    avalon.scan();
    returnDetailCtrl01.initData();
  });