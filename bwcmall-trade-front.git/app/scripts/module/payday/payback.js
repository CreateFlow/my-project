require(['dialog/avalon.dialog'], function(avalon) {

    var isLogin = storage.isLogin();
    if (!isLogin) {
        urls.goLogin();
    }

    var vm = avalon.define('paybackCtrl', function(vm) {
        vm.uploadImagesList = [];
        vm.resourceList = [];
        vm.dataList={};
        vm.paytabs = [  
            // {      
            //     title: "微信支付",
            //     value: "5-1",
            //     panel: ""
            // },
            // {
            //     title: "个人网银",
            //     value: "5-3",
            //     panel: "个人网银"
            // },
            // {
            //     title: "企业网银",
            //     value: "5-4",
            //     panel: "企业网银"
            // },
            // {
            //     title: "快捷支付",
            //     value: "5-5",
            //     panel: "快捷支付"
            // },
            {
                title: "银行转账",
                value: "3",
                panel: "银行转账"
            }
        ];
        vm.paymentCheck = 0;  
        vm.payCheck = function(){
            vm.paymentCheck = $(this).index();
        };
        vm.submit = function() {
            var serData = {
                "type": 3,
                "resourceList": vm.resourceList
            };
            io.PATCH(apiConfig.rootUrl + 'account/accountRepayment/' + urls.getParameter(window.location.href, 'Sn'), JSON.stringify(serData),
                function(data) {
                    if (data.success) {
                        alert('操作成功');
                        window.location.href = "/payday/payday.html";
                    } else {
                        alert('操作失败');
                    }
                }
            );
        };


        vm.deleteImage = function(id) {
            for (var i = 0; i < vm.uploadImagesList.length; i++) {
              if (id == vm.uploadImagesList[i].id) {
                vm.uploadImagesList.splice(i, 1);
                vm.resourceList.splice(i, 1);
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
                vm.resourceList.push(respData.result.id);
            }
        });
    };

    vm.initFileUpload();

    io.GET(apiConfig.rootUrl + 'account/accountRepayment/' + urls.getParameter(window.location.href, 'Sn'),function(data){
        if(data.success){
          vm.dataList = data.result; 
          avalon.scan();
        }
    });

    });
});