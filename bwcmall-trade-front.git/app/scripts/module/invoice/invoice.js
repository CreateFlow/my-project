  /**
   * 发票设置主页面
   */
 
  require(['dialog/avalon.dialog'], function(avalon) {
    var isLogin = storage.isLogin();
    if (!isLogin) {
      //  urls.goLogin();
    }

    var invoiceCtrl = avalon.define('invoiceCtrl', function(vm) {
      vm.plainList = [];
      vm.valueAddedList = [];
      vm.currentTab = 'tab1';
      vm.plaintAddable = true;
      vm.valueAddedAddable = true;
      vm.addPlaint = false;
      //tab数据
      vm.invoiceTypeTabs = [{
        "text": "增值发票",
        "value": "tab1"
      }, {
        "text": "普通发票",
        "value": "tab2"
      }];
      //tab切换
      vm.changeTab = function(value) {
        vm.currentTab = value;
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
      vm.getServResType = function(type) {
        if (type == '0') {
          return '曾开具过的增值税专用发票';
        } else if (type == '1') {
          return '一般纳税人资格认定通知书';
        } else if (type == '2') {
          return '税务局一般纳税人资格查询截图';
        } else if (type == '3') {
          return '税票委托书';
        } 
      }
      vm.myMouseover = function(obj) {
        $(obj).find(".del-btn").show();
      }
      vm.myMouseleave = function(obj) {
        $(obj).find(".del-btn").hide();
      }
      vm.simpleOneMouseover = function(obj, el) {
        if (!el.inEdit) {
          $(obj).addClass('selected');
        }
        $(obj).find(".invoice-simple-actioin-panel").show();
      }
      vm.simpleOneMouseleave = function(obj, el) {
        $(obj).removeClass('selected');
        if (!el.inEdit) {
          $(obj).find(".invoice-simple-actioin-panel").hide();
        }
      }
      vm.editOrAddInvoice = function(el) {
        if (!el.id) {
          el = {};
        }
        invoiceEditDialogCtrl.data = el;
        invoiceEditDialogCtrl.initDialog();
        avalon.vmodels["invoiceEditDialog"].toggle = true;
      }
      vm.addPlainInvoice = function(id) {
        vm.addPlaint = true;
      };
      vm.editPlainInvoice = function(el) {
        var index = 0;
        for (var i = 0; i < vm.plainList.length; i++) {
          if (vm.plainList[i].id == el.id) {
            index = i;
            break;
          }
        }
        el.inEdit = true;

        vm.plainList.splice(index, 1, el);
        $(event.target).parent().parent().css("border", "none !important")

      };
      vm.cancelUpdate = function(el) {
        var index = 0;
        for (var i = 0; i < vm.plainList.length; i++) {
          if (vm.plainList[i].id == el.id) {
            index = i;
            break;
          }
        }
        el.inEdit = false;
        vm.plainList.splice(index, 1, el);
      }
      vm.updatePainInvoice = function(el) {
        var corpTitle = $("#corpTitle" + el.id).val();
        if (!corpTitle) {
          vm.alertMsg("请填写发票抬头!");
          return false;
        } else {
          var postData = {};
          postData.corpTitle = corpTitle;
          postData.type = "0";
          io.PUT(apiConfig.invoiceAPI + "/" + el.id, postData, function(data) {
            el.corpTitle = postData.corpTitle;
            var index = 0;
            for (var i = 0; i < vm.plainList.length; i++) {
              if (vm.plainList[i].id == el.id) {
                index = i;
                break;
              }
            }
            el.inEdit = false;
            vm.plainList.splice(index, 1, el);
          }, function(data) {
            vm.alertMsg(data.message);
          });
        }
      };

      vm.delInvoice = function(el) {
        deleteDialogCtrl.msg = "是否确定删除？";
        deleteDialogCtrl.data = el;
        avalon.vmodels["deleteDialog"].toggle = true;
      };
      vm.addPainInvoice = function() {
        var corpTitle = $("#corpTitle").val();
        if (!corpTitle) {
          vm.alertMsg("请填写发票抬头!");
          return false;
        } else {
          var postData = {};
          postData.corpTitle = corpTitle;
          postData.type = "0";
          io.POST(apiConfig.invoiceAPI, postData, function(data) {
            $("#corpTitle").val("");
            vm.plainList.push(data.result);
            vm.addPlaint = false;
            if (vm.plainList.length >= 5) {
              vm.plaintAddable = false;
            }
          }, function(data) {
            vm.alertMsg(data.message);
          });
        }
      };
      vm.cancelAdd = function() {
        vm.addPlaint = false;
        $("#corpTitle").val("");
      };
      vm.showErrorMsg = function(el) {
        confirmDialogCtrl.msg = el.reason;
        confirmDialogCtrl.data = el;
        avalon.vmodels["confirmDialog"].toggle = true;
      }

      io.GET(apiConfig.invoiceAPI, {}, function(data) {
        vm.plainList = data.result.plain;
        vm.valueAddedList = data.result.valueAdded;
        if (data.result.plain.length >= 5) {
          vm.plaintAddable = false;
        }
        if (data.result.valueAdded && data.result.valueAdded.length >= 3) {
          vm.valueAddedAddable = false;
        }
      });
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

        },
        onCancel: function() {
          avalon.vmodels["deleteDialog"].toggle = false;
        }
      },
      closeDialog: function() {
        avalon.vmodels["deleteDialog"].toggle = false;
      },
      onOK: function() {
        avalon.vmodels["deleteDialog"].toggle = false;
        io.DELETE(apiConfig.invoiceAPI + "/" + deleteDialogCtrl.data.id, {}, function(data) {
          if (deleteDialogCtrl.data.type == '0') {
            invoiceCtrl.plainList.remove(deleteDialogCtrl.data);
            if (invoiceCtrl.plainList.length < 5) {
              invoiceCtrl.plaintAddable = true;
            }
          } else {
            invoiceCtrl.valueAddedList.remove(deleteDialogCtrl.data);
            if (!invoiceCtrl.valueAdded || invoiceCtrl.valueAdded.length <= 3) {
              invoiceCtrl.valueAddedAddable = true;
            }
          }

        }, function(data) {
          invoiceCtrl.alertMsg(data.message);
        });
      }
    });
    var confirmDialogCtrl = avalon.define({
      $id: "confirmDialogCtrl",
      msg: "",
      data: {},
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
          avalon.vmodels["confirmDialog"].toggle = false;
        }
      },
      closeDialog: function() {
        avalon.vmodels["confirmDialog"].toggle = false;
      },
      onOK: function() {
        avalon.vmodels["confirmDialog"].toggle = false;
        invoiceCtrl.editOrAddInvoice(confirmDialogCtrl.data);
      }
    });

    var invoiceEditDialogCtrl = avalon.define({
      $id: "invoiceEditDialogCtrl",
      data: {},
      step: 1,
      isUploadInit: false,
      dialogTitle: "新增增票",
      certificateRes: {
        "id": 0,
        "resourceId": 0,
        "servResType": 0,
        "url": ""
      },
      attorneyRes: {
        "id": 0,
        "resourceId": 0,
        "servResType": 0,
        "url": ""
      },
      inProgress: false,
      //省份
      provinceData: [],
      province: '',
      //城市
      cityData: [],
      city: '',
      //县
      countyData: [],
      county: '',
      value: '',
      $invoiceEditDialogOptions: {
        title: "新增增票",
        showClose: true,
        width: 600,
        isTop: true,
        onInit: function() {

        },
        onCancel: function() {
          avalon.vmodels["invoiceEditDialog"].toggle = false;
        },
        onGoNext: function() {
          if (invoiceEditDialogCtrl.step == 1) {
            var postData = invoiceEditDialogCtrl.$invoiceEditDialogOptions.checkBaseInfo();
            if (postData == false) {
              return false;
            }
          }
          invoiceEditDialogCtrl.step = invoiceEditDialogCtrl.step + 1;
        },
        onGoPre: function() {
          invoiceEditDialogCtrl.step = invoiceEditDialogCtrl.step - 1;
        },
        checkBaseInfo: function() {
          var postData = {};
          if (!$(".invoice-step-content #corpTitle").val()) {
            invoiceCtrl.alertMsg("单位名称不能为空!");
            invoiceEditDialogCtrl.inProgress = false;
            invoiceEditDialogCtrl.step = 1;
            return false;
          } else {
            postData.corpTitle = $(".invoice-step-content #corpTitle").val();
          }
          if (!$("#taxNumber").val()) {
            invoiceCtrl.alertMsg("纳税人识别码不能为空!");
            invoiceEditDialogCtrl.inProgress = false;
            invoiceEditDialogCtrl.step = 1;
            return false;
          } else {
            postData.taxNumber = $("#taxNumber").val();
          }
          if (!invoiceEditDialogCtrl.value) {
            invoiceCtrl.alertMsg("注册地址不能为空!");
            invoiceEditDialogCtrl.inProgress = false;
            invoiceEditDialogCtrl.step = 1;
            return false;
          } else {
            postData.areaId = invoiceEditDialogCtrl.value;
          }
          if (!$("#areaAddress").val()) {
            invoiceCtrl.alertMsg("详细地址不能为空!");
            invoiceEditDialogCtrl.inProgress = false;
            invoiceEditDialogCtrl.step = 1;
            return false;
          } else {
            postData.areaAddress = $("#areaAddress").val();
          }
          if (!$("#phone").val()) {
            invoiceCtrl.alertMsg("注册电话不能为空!");
            invoiceEditDialogCtrl.inProgress = false;
            invoiceEditDialogCtrl.step = 1;
            return false;
          } else {
            postData.phone = $("#phone").val();
          }
          if (!$("#bankName").val()) {
            invoiceCtrl.alertMsg("开户银行不能为空!");
            invoiceEditDialogCtrl.inProgress = false;
            invoiceEditDialogCtrl.step = 1;
            return false;
          } else {
            postData.bankName = $("#bankName").val();
          }
          if (!$("#bankAccount").val()) {
            invoiceCtrl.alertMsg("银行账户不能为空!");
            invoiceEditDialogCtrl.inProgress = false;
            invoiceEditDialogCtrl.step = 1;
            return false;
          } else {
            postData.bankAccount = $("#bankAccount").val();
          }
          return postData;
        },
        onConfirm: function() {
          if (invoiceEditDialogCtrl.inProgress) {
            return false;
          }
          var postData = invoiceEditDialogCtrl.$invoiceEditDialogOptions.checkBaseInfo();
          if (postData == false) {
            invoiceEditDialogCtrl.inProgress = false;
            return false;
          }

          if (!$("#servResType").val() && $("#servResType").val() != 0) {
            invoiceCtrl.alertMsg("请选择资质证明类型!");
            invoiceEditDialogCtrl.inProgress = false;
            invoiceEditDialogCtrl.step = 2;
            return false;
          } else {
            invoiceEditDialogCtrl.certificateRes.servResType = $("#servResType").val();
          }
          if (!invoiceEditDialogCtrl.certificateRes.url) {
            invoiceCtrl.alertMsg("请上传增票资质文件!");
            invoiceEditDialogCtrl.inProgress = false;
            invoiceEditDialogCtrl.step = 2;
            return false;
          } else {
            postData.certificateRes = {};
            postData.certificateRes.id = invoiceEditDialogCtrl.certificateRes.id;
            postData.certificateRes.resourceId = invoiceEditDialogCtrl.certificateRes.resourceId;
            postData.certificateRes.servResType = invoiceEditDialogCtrl.certificateRes.servResType;
            postData.certificateRes.url = invoiceEditDialogCtrl.certificateRes.url;

            if (postData.certificateRes.id == 0) {
              postData.certificateRes.id = '';
            }
            postData.certificateRes.servResType = $("#servResType").val();
          }

          if (!invoiceEditDialogCtrl.attorneyRes.url) {
            invoiceCtrl.alertMsg("请上传增票资质委托授权书!");
            invoiceEditDialogCtrl.step = 3;
            invoiceEditDialogCtrl.inProgress = false;
            return false;
          } else {
            postData.attorneyRes = {};
            postData.attorneyRes.id = invoiceEditDialogCtrl.attorneyRes.id;
            postData.attorneyRes.resourceId = invoiceEditDialogCtrl.attorneyRes.resourceId;
            postData.attorneyRes.servResType = invoiceEditDialogCtrl.attorneyRes.servResType;
            postData.attorneyRes.url = invoiceEditDialogCtrl.attorneyRes.url;

            if (postData.attorneyRes.id == 0) {
              postData.attorneyRes.id = '';
            }
          }
          postData.type = "1";
          invoiceEditDialogCtrl.inProgress = true;
          if (invoiceEditDialogCtrl.data.id) {
            io.PUT(apiConfig.invoiceAPI + "/" + invoiceEditDialogCtrl.data.id, postData, function(data) {
              window.location.reload();
            }, function(data) {
              invoiceEditDialogCtrl.inProgress = false;
              invoiceCtrl.alertMsg(data.message);
            });
          } else {
            io.POST(apiConfig.invoiceAPI, postData, function(data) {
              window.location.reload();
            }, function(data) {
              invoiceEditDialogCtrl.inProgress = false;
              invoiceCtrl.alertMsg(data.message);
            });
          }

        }
      },
      closeDialog: function() {
        avalon.vmodels["invoiceEditDialog"].toggle = false;
      },
      //选择省份
      selectProvince: function(name) {
        invoiceEditDialogCtrl.province = name;
        if (invoiceEditDialogCtrl.editModel == 1) {
          return false;
        }
        //清除
        invoiceEditDialogCtrl.city = '';
        invoiceEditDialogCtrl.county = '';
        invoiceEditDialogCtrl.cityData = [];
        invoiceEditDialogCtrl.countyData = [];
        invoiceEditDialogCtrl.value = '';
        $('.m-tabselect-block').removeClass('m-tabselect-block-active');
        $('.m-tabselect-body').hide();
        for (var i = 0; i < invoiceEditDialogCtrl.provinceData.length; i++) {
          if (invoiceEditDialogCtrl.provinceData[i].name === name) {
            invoiceEditDialogCtrl.cityData = invoiceEditDialogCtrl.provinceData[i].c;
          }
        }
      },

      //选择城市
      selectCity: function(name) {
        invoiceEditDialogCtrl.city = name;
        if (invoiceEditDialogCtrl.editModel == 1) {
          return false;
        }
        //清除
        invoiceEditDialogCtrl.county = '';
        invoiceEditDialogCtrl.countyData = [];
        invoiceEditDialogCtrl.value = '';
        $('.m-tabselect-block').removeClass('m-tabselect-block-active');
        $('.m-tabselect-body').hide();
        for (var i = 0; i < invoiceEditDialogCtrl.cityData.length; i++) {
          if (invoiceEditDialogCtrl.cityData[i].name === name) {
            invoiceEditDialogCtrl.countyData = invoiceEditDialogCtrl.cityData[i].c;
          }
        }
      },

      //选择区/县
      selectCounty: function(name, value) {
        invoiceEditDialogCtrl.county = name;
        invoiceEditDialogCtrl.value = value;
        if (invoiceEditDialogCtrl.editModel == 1) {
          return false;
        }
        $('.m-tabselect-block').removeClass('m-tabselect-block-active');
        $('.m-tabselect-body').hide();
      },

      areaclick: function() {
        if (invoiceEditDialogCtrl.editModel == 1) {
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
      },
      initDialog: function() {
        invoiceEditDialogCtrl.step = 1;
        $(".invoice-step-content").val("");
        if (!invoiceEditDialogCtrl.isUploadInit) {
          invoiceEditDialogCtrl.initFileUpload();
          invoiceEditDialogCtrl.isUploadInit = true;
        }
        invoiceEditDialogCtrl.certificateRes = {
          "id": 0,
          "resourceId": 0,
          "servResType": 0,
          "url": ""
        };
        invoiceEditDialogCtrl.attorneyRes = {
          "id": 0,
          "resourceId": 0,
          "servResType": 0,
          "url": ""
        };
        $(".invoice-dialog-panel :input").val("");
        if (invoiceEditDialogCtrl.data && invoiceEditDialogCtrl.data.id) {
          invoiceEditDialogCtrl.dialogTitle = "修改增票";
          $(".invoice-step-content :input").each(function() {
            if (invoiceEditDialogCtrl.data[$(this).attr("id")]) {
              $(this).val(invoiceEditDialogCtrl.data[$(this).attr("id")]);
            }
          });
          if (invoiceEditDialogCtrl.data.certificateRes) {
            invoiceEditDialogCtrl.certificateRes = invoiceEditDialogCtrl.data.certificateRes;
            $("#servResType").val(invoiceEditDialogCtrl.certificateRes.servResType);
          }
          if (invoiceEditDialogCtrl.data.attorneyRes) {
            invoiceEditDialogCtrl.attorneyRes = invoiceEditDialogCtrl.data.attorneyRes;
          }


        } else {
          invoiceEditDialogCtrl.dialogTitle = "新增增票";
        }
        //获取地区json数据
        io.GET("/scripts/json/area.json").done(function(data) {
          if (data) {
            invoiceEditDialogCtrl.provinceData = data;
            if (invoiceEditDialogCtrl.data && invoiceEditDialogCtrl.data.id) {
              invoiceEditDialogCtrl.selectProvince(invoiceEditDialogCtrl.data.area.provinceName);
              invoiceEditDialogCtrl.selectCity(invoiceEditDialogCtrl.data.area.cityName);
              invoiceEditDialogCtrl.selectCounty(invoiceEditDialogCtrl.data.area.districtName, invoiceEditDialogCtrl.data.area.districtId);
            }
          }
        });
      },

      initFileUpload: function() {
        var token = null;
        if (!storage.getCurrentUser()) {
          urls.goLogin();
        } else {
          token = storage.getCurrentUser().authToken;
        }
        //资质上传
        $('#certificateRes_upload_btn').uploadbutton({
          'buttonClass': 'upButtonClass',
          'swf': '../scripts/plugin/uploadifive/uploadify.swf',
          'auto': true,
          'method': 'post',
          'fileSizeLimit': 10240,
          'formData': {
            'token': token
          },
          'fileObjName': 'file',
          'fileTypeExts': '*.gif;*.jpg;*.jpeg;*.png;*.bmp;*.gif;',
          'uploader': apiConfig.upload,
          'height': '30',
          'errorMsg': '文件上传出错',
          'width': '100',
          'buttonText': '+',
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
            invoiceEditDialogCtrl.certificateRes.resourceId = respData.result.id;
            invoiceEditDialogCtrl.certificateRes.url = respData.result.resources;
          }
        });
        $('#recertificateRes_upload_btn').uploadbutton({
          'buttonClass': 'upButtonClass',
          'swf': '../scripts/plugin/uploadifive/uploadify.swf',
          'auto': true,
          'method': 'post',
          'fileSizeLimit': 10240,
          'formData': {
            'token': token
          },
          'fileObjName': 'file',
          'fileTypeExts': '*.gif;*.jpg;*.jpeg;*.png;*.bmp;*.gif;',
          'uploader': apiConfig.upload,
          'height': '30',
          'errorMsg': '上传出错',
          'width': '100',
          'buttonText': '重新上传',
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
            invoiceEditDialogCtrl.certificateRes.resourceId = respData.result.id;
            invoiceEditDialogCtrl.certificateRes.url = respData.result.resources;
          }
        });

        //授权上传
        $('#attorneyRes_upload_btn').uploadbutton({
          'buttonClass': 'upButtonClass',
          'swf': '../scripts/plugin/uploadifive/uploadify.swf',
          'auto': true,
          'method': 'post',
          'fileSizeLimit': 10240,
          'formData': {
            'token': token
          },
          'fileObjName': 'file',
          'fileTypeExts': '*.gif;*.jpg;*.jpeg;*.png;*.bmp;*.gif;',
          'uploader': apiConfig.upload,
          'height': '30',
          'errorMsg': '文件上传出错',
          'width': '100',
          'buttonText': '+',
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
                alert("文件 [" + file.name + "] 类型不正确,只支持gif,jpg,jpeg,png,bmp,pdf等格式！");
                break;
            }
            return false;
          },

          'onUploadSuccess': function(file, data, response) {
            var respData = JSON.parse(data);
            invoiceEditDialogCtrl.attorneyRes.resourceId = respData.result.id;
            invoiceEditDialogCtrl.attorneyRes.url = respData.result.resources;
          }
        });
        $('#reattorneyRes_upload_btn').uploadbutton({
          'buttonClass': 'upButtonClass',
          'swf': '../scripts/plugin/uploadifive/uploadify.swf',
          'auto': true,
          'method': 'post',
          'fileSizeLimit': 10240,
          'formData': {
            'token': token
          },
          'fileObjName': 'file',
          'fileTypeExts': '*.gif;*.jpg;*.jpeg;*.png;*.bmp;*.gif;*.pdf',
          'uploader': apiConfig.upload,
          'height': '30',
          'errorMsg': '文件上传出错',
          'width': '100',
          'buttonText': '重新上传',
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
                alert("文件 [" + file.name + "] 类型不正确,只支持gif,jpg,jpeg,png,bmp,pdf等格式！");
                break;
            }
            return false;
          },

          'onUploadSuccess': function(file, data, response) {
            var respData = JSON.parse(data);
            invoiceEditDialogCtrl.attorneyRes.resourceId = respData.result.id;
            invoiceEditDialogCtrl.attorneyRes.url = respData.result.resources;
          }
        });
      }

    });
 

  });