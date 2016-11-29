  /**
   * 退换货列表
   */
  require(['dialog/avalon.dialog'], function(avalon) {

    var isLogin = storage.isLogin();
    if (!isLogin) {
      urls.goLogin();
    }

    var returnApplyCtrl02 = avalon.define('returnApplyCtrl02', function(vm) {

      vm.orderInfo = {};
      vm.sn = '';
      vm.inProgress = false;
      vm.orderId = urls.getParameter(window.location.href, 'orderId');
      vm.currentType = 1;
      vm.uploadImagesList = [];
      vm.returnTypes = [];

      vm.reasonTypeList = [];

      io.GET(apiConfig.returnReasonList + vm.currentType + "/typeCause", function(data) {
        vm.reasonTypeList = data.result;
      });
      vm.showShopInfo = function(obj) {
        $(obj).next().show();
      };

      vm.hideShopInfo = function(obj) {
        $(obj).next().hide();
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
      vm.goReturnApply = function(obj) {
        var type = $("#returnType").val();
        if (type != vm.currentType) {
          confirmDialogCtrl.msg = "切换售后类型后，当前填写的所有数据都将丢失，是否确认切换？";
          confirmDialogCtrl.type = type;
          confirmDialogCtrl.orderId = vm.orderId;
          avalon.vmodels["confirmDialog"].toggle = true;
        }
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

      vm.apply = function() {
        if (vm.inProgress) {
          return;
        }
        vm.inProgress = true;
        var postData = {};
        postData.orderId = vm.orderId;
        postData.afterSaleType = vm.currentType;
        postData.afterTypeCauseId = $("#reasonType").val();
        postData.amount = $("#amount").val();
        postData.afterTypeCauseReason = $("#reasonType").find("option:selected").text();
        postData.reason = $("#reason").val();

        if (!vm.amountCheck() || !vm.bankNameCheck() || !vm.accountNameCheck() || !vm.bankAccountCheck()) {
          vm.inProgress = false;
          return false;
        }
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

        //银行信息
        if (vm.orderInfo.payPlatform == 3) {

          postData.bankName = $("#bankName").val();
          postData.bankAccount = $("#bankAccount").val();
          postData.accountName = $("#accountName").val();
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

      io.GET(apiConfig.returnOrderInfo + vm.orderId + "/orderInfo", {}, function(data) {
        returnApplyCtrl02.orderInfo = data.result;
        returnApplyCtrl02.returnTypes = data.result.afterSaleTypeList;
        vm.sn = data.result.orderSn;
        if (!vm.hasBank(data.result.accountTypes)) {
          $(".return-detail-content").css("height", "800px");
        } else {
          $(".return-detail-content").css("height", "1050px");
        }
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
          $("#returnType").val(returnApplyCtrl02.currentType);
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
    avalon.scan();
  });