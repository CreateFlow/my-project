require(['dialog/avalon.dialog'], function(avalon) {
    var token, user;
    if ( !storage.isLogin() ) {
        urls.goLogin();
    } else {
        user = storage.getCurrentUser();
        token = user.authToken;
    }
    avalon.ready(function() {
        var demandCtrl = avalon.define({
            $id: "demandCtrl",
            currentNavInfo : 'index',
            sourceList : [],
            dataList : [],
            typeList : [],
            categoryList : [],
            customerId : '',
            source : '',
            remarks : '',
            uploadImagesList :  [],
            resourceList :  [],
            trArr : [{
                "brandName": "",                //品牌名
                "itemName": "",                 //品名
                "skuSnSet": "",                 //商品型号
                "requiredQuantity": "",         //需求数量
                "unit": "",                     //商品单位
                "spuCategoryId": "",            //所属分类（一级分类）
                "remarks": "",                  //备注 
                "resIdList": []                 //关联资源ID列表
            }],

            deleteImage : function(id) {
                for (var i = 0; i < demandCtrl.uploadImagesList.length; i++) {
                  if (id == demandCtrl.uploadImagesList[i].id) {
                    demandCtrl.uploadImagesList.splice(i, 1);
                    demandCtrl.resourceList.splice(i, 1);
                    break;
                  }
                }
            },
            download : function() {
                var token = null;
                if (!storage.getCurrentUser()) {
                    urls.goLogin();
                } else {
                    token = storage.getCurrentUser().authToken;
                };
                var form = $('<form id="cateForm"></form>').attr("style", 'display:none')
                        .attr("action", apiConfig.rootUrl + 'requirement/import/template')
                        .attr("method", "GET");
                form.append('<input type="text" name="token" value="' + token + '">');
                form.appendTo('body');
                form.submit();
                form.remove();
            },

            initFileUpload : function() {
                var token = null;
                if (!storage.getCurrentUser()) {
                    urls.goLogin();
                } else {
                    token = storage.getCurrentUser().authToken;
                }
                //附件上传
                $('#fileUploadBtn').uploadbutton({
                    'buttonClass': 'upButtonClass',
                    'swf': '../scripts/plugin/uploadifive/uploadify.swf',
                    'auto': true,
                    'method': 'post',
                    'fileSizeLimit': 10240,
                    'fileObjName': 'file',
                    'fileTypeExts': '*.gif;*.jpg;*.jpeg;*.png;*.bmp;*.gif',
                    'uploader': apiConfig.upload + '?token=' + token,
                    'height': '30',
                    'errorMsg': '文件上传出错',
                    'width': '100',
                    'buttonText': '上传附件',
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
                        demandCtrl.uploadImagesList.push(respData.result);
                        demandCtrl.resourceList.push(respData.result.id);
                    }
                });
                //批量上传
                $('#allUploadBtn').uploadbutton({
                    'buttonClass': 'query_btn',
                    'swf': '../scripts/plugin/uploadifive/uploadify.swf',
                    'auto': true,
                    'method': 'post',
                    'fileSizeLimit': 10240,
                    'fileObjName': 'file',
                    'fileTypeExts': '*.xlsx',
                    'uploader': apiConfig.rootUrl + 'requirement/import' + '?token=' + token,
                    'height': '30',
                    'errorMsg': '文件上传出错',
                    'width': '100',
                    'buttonText': '上传需求单',
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
                            alert("文件 [" + file.name + "] 类型不正确,只支持xlsx等格式！");
                            break;
                        }
                        return false;
                    },

                    'onUploadSuccess': function(file, data, response) {
                        var respData = JSON.parse(data);
                        console.log(respData.result);
                       //demandCtrl.trArr = demandCtrl.trArr.concat(respData.result);
                        demandCtrl.trArr = respData.result;
                    }
                });
            },

            init : function(){
                
                io.GET(apiConfig.rootUrl + 'dict/REQUIREMENT_SOURCE/item', {}, function(data) {
                    if (data.result) {
                     demandCtrl.sourceList = data.result;
                    }
                });
                io.GET(apiConfig.rootUrl + 'dict/REQUIREMENT_TYPE/item', {}, function(data) {
                        if (data.result) {
                          demandCtrl.typeList = data.result;
                        }
                    });
                io.GET(apiConfig.rootUrl + 'category?grade=1', function(data) {
                    if (data.result) {
                        demandCtrl.categoryList = data.result;
                    }
                });
            },

            //更多
            getMore : function() {
                demandCtrl.trArr.push({
                    "brandName": "",                //品牌名
                    "itemName": "",                 //品名
                    "skuSnSet": "",                 //商品型号
                    "requiredQuantity": "",         //需求数量
                    "unit": "",                     //商品单位
                    "spuCategoryId": "",            //所属分类（一级分类）
                    "remarks": "",                  //备注 
                    "resIdList": []                 //关联资源ID列表
                });

            },

            typeCheck : 0,
             
            typeOn : function(data){
                demandCtrl.typeCheck = data;
            },
            //删除一行
            delProduct : function(index) {
                demandCtrl.trArr.removeAt(index);
            },


            //查询买家
            keyword : '',
            customerList : [],
            search : function() {
                io.GET(apiConfig.rootUrl + 'requirement/findbuyer?keyword='+demandCtrl.keyword,  function(data) {
                    if (data.result) {
                        demandCtrl.customerList = data.result;
                    }
                });
            },

            //提交订单
            submit : function() {
                //提交数组
                var data = {};
                data.customerId = demandCtrl.customerId;
                data.type  = demandCtrl.typeCheck;
                data.source  = demandCtrl.source;
                data.remarks  = demandCtrl.remarks;
                data.resIdList = demandCtrl.resourceList;
                data.addItemList = [];
                for (var i = 0; i < demandCtrl.trArr.length; i++) {
                    if (demandCtrl.trArr[i].brandName || demandCtrl.trArr[i].itemName || demandCtrl.trArr[i].skuSnSet) {
                        data.addItemList.push({
                            "brandName": demandCtrl.trArr[i].brandName,
                            "itemName": demandCtrl.trArr[i].itemName,
                            "skuSnSet": demandCtrl.trArr[i].skuSnSet,
                            "requiredQuantity": demandCtrl.trArr[i].requiredQuantity,
                            "unit": demandCtrl.trArr[i].unit,
                            "spuCategoryId": demandCtrl.trArr[i].spuCategoryId,
                            "remarks": demandCtrl.trArr[i].remarks
                        });
                    }
                }
                //post请求
                io.POST(apiConfig.requirement, data,
                function(data) {
                    if (data.success) {
                        alert('提交成功');
                        window.location.href = '/';
                    }

                },
                function (data) {
                    if(!data.success) {
                        alert(data.message);
                    }
                });
            }
        });
        avalon.scan();
        demandCtrl.init();
        demandCtrl.initFileUpload();
    });
});