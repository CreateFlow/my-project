'use strict';

define(function (require, exports, module) {
    // 加载依赖组件
    var avalon = require('avalon'),
        $ = require('jquery'),
        request = require('lib/io/request'),
        API = require('module/common/config/api'),
        myUtils = require('module/common/utils/utils'),
        uploadify = require('module/common/uploadify/uploadify'),
        urls = require('module/common/utils/url');
    var session = require('lib/io/session');

    // 加载框架组件
    require('module/common/ui/scaffolding');
    require('oniui/dialog/avalon.dialog');
    require('oniui/datepicker/avalon.datepicker');
    require('oniui/pager/avalon.pager');
    require('oniui/dropdown/avalon.dropdown');
    require('oniui/loading/avalon.loading');
    require('oniui/validation/avalon.validation');
    require('oniui/dropdownlist/avalon.dropdownlist');

    function showError(el, data) {
        var next = el.nextSibling
        if (!(next && next.className === "error-tip")) {
            next = document.createElement("div")
            next.className = "error-tip"
            el.parentNode.appendChild(next)
        }
        next.innerHTML = data.getMessage()
    }

    function removeError(el) {
        var next = el.nextSibling
        if (next && next.className === "error-tip") {
            el.parentNode.removeChild(next)
        }
    }

    avalon.ready(function () {
        var vm = avalon.define({
            $id: "importGoods",
            dlgExportSKUsOption: {
                type: 'confirm',
                title: '导出模板数据',
                confirmName: '导出',
                draggable: true,
                width: 1000,
                height: 600,
                onOpen: function () {

                },
                onConfirm: function () {
                    var brandId = avalon.vmodels.brandListId.getSelected();
                    if (!brandId) {
                        vm.showAlertDlg("请选择品牌");
                        return;
                    }

                    var spuCategoryElement = $('#spuCategoryId');
                    var $checked = $(spuCategoryElement).find(':checked');
                    var categoryIds = [];
                    if ($checked.length > 0) {
                        $checked.each(function (i, e) {
                            categoryIds.push({
                                id: $(e).closest('.cate-item-inline').attr('data-id'),
                                name: $(e).closest('.cate-item-inline').attr('data-name'),
                            });
                        });
                    } else {
                        vm.showAlertDlg("请选择分类");
                        return;
                    }

                    var queryString = "";
                    categoryIds.forEach(function (item, index) {
                        if (0 != index) {
                            queryString += "|";
                        }
                        queryString += item.id;
                    });
                    //模拟表单
                    var form = $('<form id="cateForm"></form>').attr("style", 'display:none')
                        .attr("action", API.exportSkuList)
                        .attr("method", "GET");
                    form.append('<input type="text" name="token" value="' + session.getCurrentUser().authToken + '">');
                    form.append('<input type="text" name="categoryIds__in" value="' + queryString + '">');
                    form.append('<input type="text" name="brandId" value="' + brandId + '">');
                    form.append('<input type="text" name="per_page" value="20000">');
                    form.append('<input type="text" name="page" value="1">');
                    form.appendTo('body');
                    form.submit();
                    form.remove();
                },
                onClose: function () {
                },
            },
            dlgAlertOption: {
                type: 'alert',
                title: '提示',
                width: 485
            },
            dlgWaitingOption: {
                width: 64,
            },

            brandList: [],
            categoryList: [],
            alertMsg: 'ok',
            uploadElement: {},
            onShelfType: "1",
            checkTimer: null,
            result: { state: 0, totalRow: 0, successRow: 0 },
            selectedFile: false,
            processing: false,
            selectBrandId: '',
            showAlertDlg: function (msg) {
                vm.alertMsg = msg;
                avalon.vmodels['dlgAlertId'].toggle = true;
            },

            showExprotSkusDlg: function () {
                avalon.vmodels['dlgExportSKUsId'].toggle = true;
            },

            showWaiting: function (bShow) {
                avalon.vmodels['dlgWaitingId'].toggle = bShow;
            },

            getSpuCategory: function () {
                //取brandID
                var brandId = avalon.vmodels.brandListId.getSelected();
                if (brandId) {
                    var categoryUrl = API.brandSpuCategory.replace('{brandId}', brandId);
                    request.GET(categoryUrl, { per_page: 1000 }, function (responseData) {
                        if (responseData.success) {
                            vm.categoryList = responseData.result;
                            avalon.scan(document.body, vm);
                        } else {
                            vm.showAlertDlg(responseData.message);
                        }
                    });
                } else {
                    vm.showAlertDlg("请选择品牌。");
                }
            },

            uploadGoods: function () {
                if (!vm.selectedFile) {
                    vm.showAlertDlg("请选择导入商品数据文件。");
                    return;
                }

                if (!vm.processing) {
                    vm.processing = true;
                    if (vm.checkTimer) {
                        clearInterval(vm.checkTimer);
                        vm.checkTimer = null;
                    }
                    vm.result = { state: 0, totalRow: 0, successRow: 0 };

                    var formData = { importType: "1", onShelfType: vm.onShelfType };
                    var uploadifyElement = $('#selectGoodsExcel');
                    uploadifyElement.uploadify("settings", "formData", formData);
                    uploadifyElement.uploadify('upload');
                    vm.showWaiting(true);
                }
            },

            getTaskStatus: function () {
                var statusApi = API.getTaskStatus.replace("{task}", vm.taskId);
                //商品处理状态
                request.GET(statusApi, function (responseData) {
                    if (responseData.success) {
                        vm.result = responseData.result;
                        if (responseData.result.state) {
                            if (vm.checkTimer) {
                                clearInterval(vm.checkTimer);
                                vm.checkTimer = null;
                            }
                            vm.showWaiting(false);
                            vm.processing = false;
                        }
                    }
                });
            },

            exportResult: function () {
                var exportApi = API.getTaskResult.replace("{task}", vm.taskId);
                //模拟表单
                var form = $('<form id="cateForm"></form>').attr("style", 'display:none')
                    .attr("action", exportApi)
                    .attr("method", "GET");
                form.append('<input type="text" name="token" value="' + session.getCurrentUser().authToken + '">');
                form.appendTo('body');
                form.submit();
                form.remove();
            },

            selectAll: function (bSelected) {
                // var spuCategoryElement = $('#spuCategoryId');
                // var $checkBoxs = $(spuCategoryElement).find("[type='checkbox']");
                // alert(bSelected);
                // if($checkBoxs.length > 0) {
                //     $checkBoxs.each(function (index, item) {
                //         if(bSelected) {

                //             $(item).attr('checked', true);
                //         } else {
                //             $(item).attr('checked', false);
                //         }
                //     });
                // }
                if (bSelected) {
                    $("[type='checkbox']").attr('checked', 'checked');
                } else {
                    $("[type='checkbox']").removeAttr('checked');
                }
            },
            checkAll: function () {
                $("input[type='checkbox']").prop('checked', true);
            },

            toggleSelect: function () {
                var spuCategoryElement = $('#spuCategoryId');
                var $checkBoxs = $(spuCategoryElement).find("[type='checkbox']");
                if ($checkBoxs.length > 0) {
                    $checkBoxs.each(function (index, item) {
                        var isChecked = $(item).is(':checked');
                        if (!isChecked) {
                            $(item).prop('checked', true);
                        } else {
                            $(item).prop('checked', false);
                        }
                    });
                }

            },
            //下拉的处理
            dropdownlist: {
                getRealTimeData: function (search, dropdownlist) {
                    if (dropdownlist.$id == 'brandListId') {
                        setTimeout(function () {
                            var listData = [];
                            var keyWords = search.toLowerCase();
                            for (var i = 0; i < vm.brandList.length; i++) {
                                if ((vm.brandList[i].name.indexOf(search) >= 0) || (vm.brandList[i].lowercaseEn.indexOf(keyWords) >= 0)) {
                                    var item = {
                                        value: vm.brandList[i].id,
                                        label: vm.brandList[i].name + "/" + vm.brandList[i].nameEn
                                    }
                                    listData.push(item);
                                    if (20 < listData.length) {
                                        break;
                                    }
                                }
                            }

                            if (listData.length <= 0) {
                                listData.push({ value: "", label: "无相关品牌" });
                            }
                            dropdownlist.render(listData);
                        }, 100);
                    }
                },
                realTimeData: true
            },
        });

        (function init() {
            request.GET(API.brandSimpleData, { per_page: 10000 }, function (responseData) {
                //vm.brandList = [{ id: -1, name: "全部" }];
                vm.brandList = responseData.result;
                var brandData = [];
                var result = vm.brandList;
                vm.brandList.forEach(function (item, index) {
                    item.lowercaseEn = item.nameEn.toLowerCase();
                    var item = { value: item.id, label: item.name + ' / ' + item.nameEn };
                    if (brandData.length < 20) {
                        brandData.push(item)
                    }
                });
                avalon.vmodels.brandListId.render(brandData);

                avalon.scan(document.body, vm);
            });
        } ());

        uploadify('#selectGoodsExcel', {
            auto: false,
            uploader: API.importGoods + '?token=' + session.getCurrentUser().authToken,
            buttonText: '选择商品数据',
            multi: false,
            formData: { 'importType': "1" },
            queueSizeLimit: 2,
            removeCompleted: true,
            checkExisting: false,
            fileTypeExts: "*.xls;*.xlsx",
            onSelect: function (file, element) {
                vm.selectedFile = true;
            },
            onDialogClose: function (queueData) {
                //只能上传一个excel文件
                if ((1 < queueData.queueLength) && (0 == queueData.filesCancelled) && (0 == queueData.filesReplaced)) {
                    var uploadifyElement = $('#selectGoodsExcel');
                    uploadifyElement.uploadify('cancel');
                }
            },
            onUploadError: function (file, data, response) {
                if (-280 == data) {
                    //取消上传
                } else {
                    if ("401" == response) {
                        url.goLogin();
                    } else {
                        vm.showAlertDlg("系统错误！");
                    }
                }
                vm.selectedFile = false;
            },
            onUploadSuccess: function (file, responseData, response) {
                try {
                    var data = JSON.parse(responseData);
                } catch (e) {
                    throw new Error('数据错误!');
                }

                if (data.success) {
                    vm.taskId = data.result;
                    //定时查询处理状态
                    vm.checkTimer = setInterval(vm.getTaskStatus, 3000);
                } else {
                    vm.showWaiting(false);
                    vm.showAlertDlg("导入商品失败：" + data.message);
                    vm.processing = false;
                }
                vm.selectedFile = false;

            },
        });

        vm.$watch("selectBrandId", function (newValue) {
            vm.selectAll(null);
            vm.getSpuCategory();
        });

        avalon.scan(document.body, vm);
    });


});
