  /**
   * 退换货列表
   */
  require(['dialog/avalon.dialog'], function(avalon) {
    var isLogin = storage.isLogin();
    if (!isLogin) {
      urls.goLogin();
    }

    var returnDetailCtrl03 = avalon.define('returnDetailCtrl03', function(vm) {
      vm.editModel = 1; //1 只读 2 全编辑 3 部分编辑（特指填写发货信息）,默认为1
      vm.id = urls.getParameter(window.location.href, 'id');
      vm.orderInfo = {};
      vm.actionList = [];
      vm.orderId = '';
      vm.sn = '';
      vm.currentType = 2;
      vm.currentProgress = 1;
      vm.blockProgress = 0;
      vm.currentAction = {};
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
      vm.returnLogisticCorpList = [];


      io.GET(apiConfig.getlogisticCorp, {}, function(data) {
        vm.returnLogisticCorpList = data.result;
      });

      vm.showShopInfo = function(obj) {
        $(obj).next().show();
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
      vm.alertMsg = function(msg) {
        alertDialogCtrl.msg = msg;
        alertDialogCtrl.orderId = vm.orderId;
        avalon.vmodels["alertDialog"].toggle = true;
      }
      vm.alertPlatorm = function() {
        avalon.vmodels["platormDialog"].toggle = true;
      };
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
        returnDetailCtrl03.province = name;
        if (vm.editModel == 1) {
          return false;
        }
        //清除
        returnDetailCtrl03.city = '';
        returnDetailCtrl03.county = '';
        returnDetailCtrl03.cityData = [];
        returnDetailCtrl03.countyData = [];
        returnDetailCtrl03.value = '';
        $('.m-tabselect-block').removeClass('m-tabselect-block-active');
        $('.m-tabselect-body').hide();
        for (var i = 0; i < returnDetailCtrl03.provinceData.length; i++) {
          if (returnDetailCtrl03.provinceData[i].name === name) {
            returnDetailCtrl03.cityData = returnDetailCtrl03.provinceData[i].c;
          }
        }
      };

      //选择城市
      vm.selectCity = function(name) {
        returnDetailCtrl03.city = name;
        if (vm.editModel == 1) {
          return false;
        }
        //清除
        returnDetailCtrl03.county = '';
        returnDetailCtrl03.countyData = [];
        returnDetailCtrl03.value = '';
        $('.m-tabselect-block').removeClass('m-tabselect-block-active');
        $('.m-tabselect-body').hide();
        for (var i = 0; i < returnDetailCtrl03.cityData.length; i++) {
          if (returnDetailCtrl03.cityData[i].name === name) {
            returnDetailCtrl03.countyData = returnDetailCtrl03.cityData[i].c;
          }
        }
      };

      //选择区/县
      vm.selectCounty = function(name, value) {

        returnDetailCtrl03.county = name;
        returnDetailCtrl03.value = value;
        if (vm.editModel == 1) {
          return false;
        }
        $('.m-tabselect-block').removeClass('m-tabselect-block-active');
        $('.m-tabselect-body').hide();
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
        if (vm.inProgress) {
          return;
        }
        vm.inProgress = true;

        io.PATCH(apiConfig.buyerConfirmDeliver, postData, function(data) {
          window.location.href = "/afs/return-list.html";
        }, function(data) {
          vm.inProgress = false;
          vm.alertMsg(data.message);
        });
      }

      vm.confirmRecive = function() {
        var postData = {};
        postData.orderAfterSaleId = vm.id
        if (vm.inProgress) {
          return;
        }
        vm.inProgress = true;

        io.PATCH(apiConfig.buyerConfirmRecive, postData, function(data) {
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
          vm.detailInfo = data.result;
          if (!data.result.orderInfo.afterSaleTypeList || data.result.orderInfo.afterSaleTypeList.length == 0) {
            data.result.orderInfo.afterSaleTypeList = new Array();
            data.result.orderInfo.afterSaleTypeList.push({
              'type': '2',
              'name': '换货'
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
          if (data.result.orderInfo) {
            vm.orderInfo = data.result.orderInfo;
            vm.sn = vm.orderInfo.orderSn;
            vm.orderId = data.result.orderInfo.orderId;
            vm.value = returnDetailCtrl03.detailInfo.buyerAreaId;
            returnDetailCtrl03.returnTypes = vm.orderInfo.afterSaleTypeList;
            if (data.result.payPlatform != 3) {
              $(".return-detail-panel").css("height", "550px")
            }
            //获取地区json数据
            io.GET("/scripts/json/area.json").done(function(data) {
              if (data) {
                returnDetailCtrl03.provinceData = data;
                returnDetailCtrl03.selectProvince(returnDetailCtrl03.detailInfo.buyerProvinceName);
                returnDetailCtrl03.selectCity(returnDetailCtrl03.detailInfo.buyerCityName);
                returnDetailCtrl03.selectCounty(returnDetailCtrl03.detailInfo.buyerDistrictName, returnDetailCtrl03.detailInfo.buyerAreaId);
              }
            });
          }
          if (data.result.afterSaleStatus || data.result.afterSaleStatus == 0) {
            //(0申请成功，等待卖家确认中 1申请达成，等待买家发货 2买家已寄回，等待卖家确认收货 3，等待卖家实物审核 
            //4驳回 5卖家不同意，等待买家修改 6换货达成，等待卖家发货 7卖家已发货，等待买家确认收货 8已完成),
            var status = data.result.afterSaleStatus;
            var num = vm.getProcessNum(status);
            vm.currentAction = vm.actionList[0];
            if (vm.currentAction.orderAfterStatus == 0) {
              vm.currentAction.orderAfterStatusName = '申请成功，等待卖家确认中';
            } else if (vm.currentAction.orderAfterStatus == 1) {
              vm.currentAction.orderAfterStatusName = '申请达成，等待买家发货';
            } else if (vm.currentAction.orderAfterStatus == 2) {
              vm.currentAction.orderAfterStatusName = '买家已寄回，等待卖家确认收货';
            } else if (vm.currentAction.orderAfterStatus == 3) {
              vm.currentAction.orderAfterStatusName = '等待卖家实物审核';
            } else if (vm.currentAction.orderAfterStatus == 4) {
              vm.currentAction.orderAfterStatusName = '驳回';
            } else if (vm.currentAction.orderAfterStatus == 5) {
              vm.currentAction.orderAfterStatusName = '卖家不同意，等待买家修改';
            } else if (vm.currentAction.orderAfterStatus == 6) {
              vm.currentAction.orderAfterStatusName = '换货达成，等待卖家发货';
            } else if (vm.currentAction.orderAfterStatus == 7) {
              vm.currentAction.orderAfterStatusName = '卖家已发货，等待买家确认收货 ';
            } else if (vm.currentAction.orderAfterStatus == 8) {
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
                      if (num > 0) {
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
                      num = vm.getProcessNum(vm.currentOrderAfsStatus);
                      if (num > 0 && vm.currentOrderAfsStatus != 4 && vm.currentOrderAfsStatus != 5) {
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
      vm.initData = function() {
        io.GET(apiConfig.returnReasonList + vm.currentType + "/typeCause", function(data) {
          vm.reasonTypeList = data.result;
          vm.initDetailInfo();
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
        //(0申请成功，等待卖家确认中 1申请达成，等待买家发货 2买家已寄回，等待卖家确认收货 3，等待卖家实物审核 
        //4驳回 5卖家不同意，等待买家修改 6换货达成，等待卖家发货 7卖家已发货，等待买家确认收货 8已完成),
        //
      vm.getProcessNum = function(status) {
        var num = -1;
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
          case 6:
            num = 5;
            break;
          case 7:
            num = 6;
            break;
          case 8:
            num = 7;
            break;
        }
        return num;
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
        if (returnDetailCtrl03.value == '') {
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
      vm.apply = function() {
        if (vm.inProgress) {
          return;
        }
        vm.inProgress = true;
        var postData = {};
        postData.orderId = vm.orderInfo.orderId;
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

        postData.orderAfterSaleId = vm.id;
        postData.orderAfterStatus = vm.currentOrderAfsStatus;
        io.PUT(apiConfig.returnPatch, postData, function(data) {
          window.location.href = "/afs/return-list.html";
        }, function(data) {
          vm.alertMsg(data.message);
          vm.inProgress = false;
        });
      };
      vm.cancelApply = function() {
        window.location.href = "/afs/return-list.html";
      }
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
          $("#returnType").val(returnDetailCtrl03.currentType);
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
            if (returnDetailCtrl03.selectedOrderItems && returnDetailCtrl03.selectedOrderItems.length > 0) {
              for (var i = 0; i < returnDetailCtrl03.selectedOrderItems.length; i++) {
                if (returnDetailCtrl03.selectedOrderItems[i].orderItemId == $(this).val()) {
                  found = true;
                  break;
                }
              }
            }
            if (!found) {
              for (var i = 0; i < orderItemsDialogCtrl.orderItems.length; i++) {
                if (orderItemsDialogCtrl.orderItems[i].id == $(this).val()) {
                  orderItemsDialogCtrl.orderItems[i].orderItemId = $(this).val();
                  returnDetailCtrl03.selectedOrderItems.push(orderItemsDialogCtrl.orderItems[i]);
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
    returnDetailCtrl03.initData();
  });