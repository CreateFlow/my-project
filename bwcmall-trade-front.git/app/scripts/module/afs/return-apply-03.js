  /**
   * 退换货列表
   */
  require(['dialog/avalon.dialog'], function(avalon) {

    var isLogin = storage.isLogin();
    if (!isLogin) {
      urls.goLogin();
    }

    var returnApplyCtrl03 = avalon.define('returnApplyCtrl03', function(vm) {

      vm.orderInfo = {};
      vm.sn = '';
      vm.orderId = urls.getParameter(window.location.href, 'orderId');
      vm.currentType = 2;
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
      vm.totalPriceNum = 0;

      io.GET(apiConfig.returnReasonList + vm.currentType + "/typeCause", function(data) {
        vm.reasonTypeList = data.result;
      });

      vm.showShopInfo = function(obj) {
        $(obj).next().show();
      };

      vm.hideShopInfo = function(obj) {
        $(obj).next().hide();
      };
      vm.goReturnApply = function(obj) {
        var type = $("#returnType").val();
        if (type != vm.currentType) {
          confirmDialogCtrl.msg = "切换售后类型后，当前填写的所有数据都将丢失，是否确认切换？";
          confirmDialogCtrl.type = type;
          confirmDialogCtrl.orderId = vm.orderId;
          avalon.vmodels["confirmDialog"].toggle = true;
        }
      };
      vm.popOrderItems = function() {
        orderItemsDialogCtrl.msg = "测试";
        orderItemsDialogCtrl.orderId = vm.orderId;
        avalon.vmodels["orderItemsDialog"].toggle = true;
        orderItemsDialogCtrl.loadOrderItems();

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
      vm.deleteFile = function(obj) {
        $(obj).remove();
      };
      vm.deleteOrderItem = function(obj) {
        for (var i = 0; i < vm.selectedOrderItems.length; i++) {
          if (obj == vm.selectedOrderItems[i].id) {
            vm.selectedOrderItems.splice(i, 1);
            break;
          }
        }
        vm.allTotalPrice();
      };
      vm.deleteImage = function(id) {
        for (var i = 0; i < vm.uploadImagesList.length; i++) {
          if (id == vm.uploadImagesList[i].id) {
            vm.uploadImagesList.splice(i, 1);
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
            vm.uploadImagesList.push(respData.result);
          }
        });
      };
      //选择省份
      vm.selectProvince = function(name) {
        returnApplyCtrl03.province = name;
        //清除
        returnApplyCtrl03.city = '';
        returnApplyCtrl03.county = '';
        returnApplyCtrl03.cityData = [];
        returnApplyCtrl03.countyData = [];
        returnApplyCtrl03.value = '';
        $('.m-tabselect-block').removeClass('m-tabselect-block-active');
        $('.m-tabselect-body').hide();
        for (var i = 0; i < returnApplyCtrl03.provinceData.length; i++) {
          if (returnApplyCtrl03.provinceData[i].name === name) {
            returnApplyCtrl03.cityData = returnApplyCtrl03.provinceData[i].c;
          }
        }
      };

      //选择城市
      vm.selectCity = function(name) {
        returnApplyCtrl03.city = name;
        //清除
        returnApplyCtrl03.county = '';
        returnApplyCtrl03.countyData = [];
        returnApplyCtrl03.value = '';
        $('.m-tabselect-block').removeClass('m-tabselect-block-active');
        $('.m-tabselect-body').hide();
        for (var i = 0; i < returnApplyCtrl03.cityData.length; i++) {
          if (returnApplyCtrl03.cityData[i].name === name) {
            returnApplyCtrl03.countyData = returnApplyCtrl03.cityData[i].c;
          }
        }
      };

      //选择区/县
      vm.selectCounty = function(name, value) {
        returnApplyCtrl03.county = name;
        returnApplyCtrl03.value = value;
        $('.m-tabselect-block').removeClass('m-tabselect-block-active');
        $('.m-tabselect-body').hide();
      };


      //联系电话校验
      vm.checkPhone = function() {
        if ($('#buyerPhone').val().replace(/\s+/g, "") == '') {
          rvm.alertMsg("请填写联系电话");
          return false;
        }
        $('#buyerPhone').val($('#buyerPhone').val().replace(/\s+/g, ""));
        if ($('#buyerPhone').val().length > 20) {
          vm.alertMsg("联系电话长度必须小于20个字符");
          return false;
        }
        return true;
      };

      //所在区域校验
      vm.checkArea = function() {
        if (returnApplyCtrl03.value == '') {
          vm.alertMsg("请选择区域");
          return false;
        }
        return true;
      };

      //详细地址校验
      vm.checkAdress = function() {
        if ($('#buyerAddress').val().replace(/\s+/g, "") == '') {
          vm.alertMsg("请填写详细地址");
          return false;
        }
        $('#buyerAddress').val($('#buyerAddress').val().replace(/\s+/g, ""));
        if ($('#buyerAddress').val().length > 100) {
          vm.alertMsg("详细地址长度必须小于100个字符");
          return false;
        }
        return true;
      };

      //详细地址校验
      vm.checkbuyerConsignee = function() {
        if ($('#buyerConsignee').val().replace(/\s+/g, "") == '') {
          vm.alertMsg("请填写联系人");
          return false;
        }
        $('#buyerConsignee').val($('#buyerConsignee').val().replace(/\s+/g, ""));
        if ($('#buyerConsignee').val().length > 10) {
          vm.alertMsg("联系人长度必须小于10个字符");
          return false;
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
        };
        for (var i = 0; i < vm.selectedOrderItems.length; i++) {
          if (vm.selectedOrderItems[i].orderItemId == id) {
            vm.selectedOrderItems[i].returnQuantity = obj.val();
          }
        }
        vm.allTotalPrice();
        return true;
      }

      vm.allTotalPrice = function(){
        var num = document.getElementsByName("returnQuantity");
        vm.totalPriceNum = 0;
        for (var i = 0; i < vm.selectedOrderItems.length; i++) {
          var a = vm.selectedOrderItems[i].price*1;
          var b = num[i].value;
          vm.totalPriceNum += a*b;
        }
      }

      vm.apply = function() {
        if (vm.inProgress) {
          return;
        }
        vm.inProgress = true;
        var postData = {};
        postData.orderId = vm.orderId;
        postData.afterSaleType = vm.currentType;
        postData.afterTypeCauseId = $("#reasonType").val();
        postData.afterTypeCauseReason = $("#reasonType").find("option:selected").text();
        postData.reason = $("#reason").val();

        if (!vm.checkbuyerConsignee() || !vm.checkAdress() || !vm.checkArea() || !vm.checkPhone()) {
          vm.inProgress = false;
          return false;
        }
        postData.buyerConsignee = $("#buyerConsignee").val();
        postData.buyerPhone = $("#buyerPhone").val();
        postData.buyerAreaId = vm.value;
        postData.buyerAddress = $("#buyerAddress").val();
        //举证图片
        if (vm.uploadImagesList.length > 0) {
          postData.resourceList = [];
          for (var i = 0; i < vm.uploadImagesList.length; i++) {
            postData.resourceList.push({
              resourceId: vm.uploadImagesList[i].id,
              imgUrl: vm.uploadImagesList[i].resources
            });
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

        io.POST(apiConfig.returnCreate, postData, function(data) {
          window.location.href = "/afs/return-list.html";
        }, function(data) {
          vm.alertMsg(data.message);
          vm.inProgress = false;
        });
      };
      vm.cancelApply = function() {
        window.location.href = "/afs/return-list.html";
      }
      vm.areaclick = function() {
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
      io.GET(apiConfig.returnOrderInfo + vm.orderId + "/orderInfo", {}, function(data) {
        returnApplyCtrl03.orderInfo = data.result;
        vm.sn = data.result.orderSn;
        vm.value = data.result.districtId;
        returnApplyCtrl03.returnTypes = data.result.afterSaleTypeList;
        //获取地区json数据
        io.GET("/scripts/json/area.json").done(function(data) {
          if (data) {
            returnApplyCtrl03.provinceData = data;
            returnApplyCtrl03.selectProvince(returnApplyCtrl03.orderInfo.provinceName);
            returnApplyCtrl03.selectCity(returnApplyCtrl03.orderInfo.cityName);
            returnApplyCtrl03.selectCounty(returnApplyCtrl03.orderInfo.districtName, returnApplyCtrl03.orderInfo.districtId);

            $("#buyerConsignee").val(returnApplyCtrl03.orderInfo.consignee);
            $("#buyerPhone").val(returnApplyCtrl03.orderInfo.phone);
            $("#buyerAddress").val(returnApplyCtrl03.orderInfo.address);
          }
        });
      });



      vm.initFileUpload();



    });



    var confirmDialogCtrl = avalon.define({
      $id: "confirmDialogCtrl",
      msg: "",
      orderId: "",
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
          $("#returnType").val(returnApplyCtrl03.currentType);
          avalon.vmodels["confirmDialog"].toggle = false;
        }
      },
      closeDialog: function() {
        avalon.vmodels["confirmDialog"].toggle = false;
      },
      onOK: function() {
        if (confirmDialogCtrl.type == 0) {
          window.location.href = "return-apply-01.html?orderId=" + confirmDialogCtrl.orderId;
        } else if (confirmDialogCtrl.type == 1) {
          window.location.href = "return-apply-02.html?orderId=" + confirmDialogCtrl.orderId;
        } else if (confirmDialogCtrl.type == 2) {
          window.location.href = "return-apply-03.html?orderId=" + confirmDialogCtrl.orderId;
        }
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
            if (returnApplyCtrl03.selectedOrderItems && returnApplyCtrl03.selectedOrderItems.length > 0) {
              for (var i = 0; i < returnApplyCtrl03.selectedOrderItems.length; i++) {
                if (returnApplyCtrl03.selectedOrderItems[i].orderItemId == $(this).val()) {
                  found = true;
                  break;
                }
              }
            }
            if (!found) {
              for (var i = 0; i < orderItemsDialogCtrl.orderItems.length; i++) {
                if (orderItemsDialogCtrl.orderItems[i].id == $(this).val()) {
                  orderItemsDialogCtrl.orderItems[i].orderItemId = $(this).val();
                  returnApplyCtrl03.selectedOrderItems.push(orderItemsDialogCtrl.orderItems[i]);
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
  });