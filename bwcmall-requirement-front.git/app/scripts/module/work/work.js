function formatDate (strTime, fmt) {
    var date = new Date(strTime),
        opts = {
            "M+" : date.getMonth() + 1,                     //月份
            "d+" : date.getDate(),                          //日
            "h+" : date.getHours(),                         //小时
            "m+" : date.getMinutes(),                       //分
            "s+" : date.getSeconds(),                       //秒
            "q+" : Math.floor( (date.getMonth() + 3) / 3),  //季度
            "S"  : date.getMilliseconds()                   //毫秒
        };

    if( /(y+)/.test(fmt) ) {
        fmt = fmt.replace( RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length) );
    }
    for (var k in opts) {
        if ( new RegExp('(' + k + ')').test(fmt) ) {
            fmt = fmt.replace( RegExp.$1, (RegExp.$1.length == 1) ?
                    (opts[k]) : (('00' + opts[k]).substr( (''+ opts[k]).length) ) );
        }
    }
    return fmt;
}
var now = new Date(),
    tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000),
    sevenDay = new Date(now.getTime() - 24 * 60 * 60 * 1000 * 366);
    var weektime = formatDate(sevenDay, 'yyyy-MM-dd');
require(['datepicker/avalon.datepicker', 'pager/avalon.pager'], function(avalon) {
    avalon.ready(function() {
        var workCtrl = avalon.define({
            $id: "workCtrl",
            currentNavInfo : 'work',
            dataList : [],
            categoryList : [],
            typeList : [],
            statusList : [{value:'0',name:'待处理'},{value:'1',name:'处理中'}],
            allstatus: false,
            searchData :{
                type : '',
                requirementSn : '',
                itemStatus : '',
                categoryId : '',
                brandName : '',
                buyerName : '',
                startTime  : weektime,
                endTime  : formatDate(tomorrow, 'yyyy-MM-dd')
            },
            totalItems: 1,
            currentPage : 1,
            init : function(){
                io.GET(apiConfig.rootUrl + 'category?grade=1', function(data) {
                    if (data.result) {
                      workCtrl.categoryList = data.result;
                    }
                });
                io.GET(apiConfig.rootUrl + 'dict/REQUIREMENT_TYPE/item', {}, function(data) {
                    if (data.result) {
                      workCtrl.typeList = data.result;
                    }
                });
                //io.GET(apiConfig.rootUrl + 'dict/REQUIRE_ITEM_STATUS/item', {}, function(data) {
                //    if (data.result) {
                //      workCtrl.statusList = data.result;
                //    }
                //});
            },
            checkout : function(id){
                if (!workCtrl.dataList[id].status) {
                    workCtrl.dataList[id].status = true; 
                    workCtrl.allstatus = true;
                    for (var i = 0; i < workCtrl.dataList.length; i++) {
                        if (!workCtrl.dataList[i].status) {
                            workCtrl.allstatus = false;
                        }
                    }
               }else{
                    workCtrl.dataList[id].status = false; 
                    workCtrl.allstatus = false;
               };
                
            },
            checkall : function(){
                if (!workCtrl.allstatus) {
                    workCtrl.allstatus = true;
                    if (workCtrl.dataList.length > 0) {
                        for (var i = 0; i < workCtrl.dataList.length; i++) {
                            workCtrl.dataList[i].status = true; 
                        }
                    };
                    
                }else{
                    workCtrl.allstatus = false;
                    if (workCtrl.dataList.length > 0) {
                        for (var i = 0; i < workCtrl.dataList.length; i++) {
                            workCtrl.dataList[i].status = false; 
                        }
                    };
                };
                
            },
            addBtn : function(){
                var postData = {
                    ids : []
                };
                for (var i = 0; i < workCtrl.dataList.length; i++) {
                    if (workCtrl.dataList[i].status) {
                        postData.ids.push(workCtrl.dataList[i].id);
                    }
                }
                io.POST(apiConfig.requirement + '/workPanel',postData, 
                function(data) {
                    if (data.success) {
                        workCtrl.openAlert('添加到面板成功');
                        //window.close();
                    } else {
                        workCtrl.openAlert(data.message);
                    }
                },
                function (data) {
                    if(!data.success) {
                        workCtrl.openAlert(data.message);
                    }
                });
                
            },
            getQueryParam : function() {
                var searchData = {};
                searchData.type = workCtrl.searchData.type;
                searchData.itemStatus = workCtrl.searchData.itemStatus;
                if(searchData.itemStatus == "1") {
                    delete searchData["itemStatus"];
                    searchData.itemStatus__ne = "0";
                }
                searchData.categoryId = workCtrl.searchData.categoryId;
                searchData.requirementSn = workCtrl.searchData.requirementSn;
                searchData.brandName_contains = workCtrl.searchData.brandName;
                searchData.buyerName_contains = workCtrl.searchData.buyerName;
                searchData.startTime_gte = workCtrl.searchData.startTime;
                searchData.endTime_lte = workCtrl.searchData.endTime;
                searchData.per_page = workCtrl.pager.perPages;
                return searchData;           
            },
            pager : {
                currentPage: 1,
                totalItems: 10,
                showJumper: true,
                perPages: 10,
                showPages: 5,
                onJump: function(e, data) {
                    var searchData = workCtrl.getQueryParam();
                    searchData.page = data._currentPage;
                    io.GET(apiConfig.requirement + '/item', searchData,
                    function(responseData) {
                        if(responseData.success){
                            workCtrl.dataList = responseData.result;
                            workCtrl.currentPage = responseData.result_info.page;
                            avalon.scan(document.body, workCtrl);
                            workCtrl.allstatus = false;
                        }else{
                            workCtrl.openAlert(responseData.message);
                        }
                    });
                }
            },
            $skipArray :["pager"],
            onKeyup : function(event) {
                if (event.keyCode === 13) {
                    workCtrl.doQuery();
                }
            },
            doQuery : function() {
                var searchData = workCtrl.getQueryParam();
                searchData.page = 1;
                io.GET(apiConfig.requirement + '/item',searchData, function(data) {
                    workCtrl.dataList = data.result;
                    workCtrl.totalItems = data.result_info.total_count;
                    workCtrl.currentPage = data.result_info.page;
                    workCtrl.allstatus = false;
                });
            },
            goToDetail : function(item, edit) {
                if(edit) {
                    window.open("/work/workdo.html?id="+item.id, "_blank");
                } else {
                    window.open("/work/workdetail.html?id="+item.id, "_blank");
                }
            },
            //生成询价链接
            $queryLinksDialogOption: {
                title: "询价链接",
                draggable: true,
                showClose: true,
                width: 1200,
                height: 600,
                isTop: true,
                zIndex: 100,
            },
            supplierList : [],
            supplierOfferList : [],
            selectedSupplierId : '',
            allOfferStatus : false,
            showQueryLinksDlg : function(){
                workCtrl.supplierList = [];
                workCtrl.supplierOfferList = [];
                workCtrl.selectedSupplierId = '';
                workCtrl.allOfferStatus = false;
                workCtrl.getSupplierList();
                avalon.vmodels['queryLinksDialogId'].toggle = true;
            },
            getSupplierList : function() {
                var searchData = workCtrl.getQueryParam();
                delete searchData["per_page"];
                delete searchData["itemStatus"];
                io.GET(apiConfig.requirementUrlSupplier, searchData, function(responseData) {
                    if(responseData.success){
                        workCtrl.supplierList = responseData.result;
                        avalon.scan();
                    }else{
                        workCtrl.openAlert(responseData.message);
                    }
                });
            },
            selectedSupplier : function() {
                if(workCtrl.selectedSupplierId) {
                    var searchData = workCtrl.getQueryParam();
                    delete searchData["per_page"];
                    delete searchData["itemStatus"];
                    searchData.supplierId = workCtrl.selectedSupplierId;

                    io.GET(apiConfig.requirementUrlOfferList, searchData, function(responseData) {
                        if(responseData.success){
                            for (var i = 0; i < responseData.result.length; i++) {
                                responseData.result[i].status = false;
                            }
                            workCtrl.supplierOfferList = responseData.result;
                            avalon.scan();
                        }else{
                            workCtrl.openAlert(responseData.message);
                        }
                    });
                }
            },
            checkedOfferItem : function(index){
                if (!workCtrl.supplierOfferList[index].status) {
                    workCtrl.supplierOfferList[index].status = true; 
                    workCtrl.allOfferStatus = true;
                    for(var i = 0; i < workCtrl.supplierOfferList.length; i++) {
                        if(!workCtrl.supplierOfferList[i].status) {
                            workCtrl.allOfferStatus = false;
                            break;
                        }
                    }
                }else{
                    workCtrl.supplierOfferList[index].status = false; 
                    workCtrl.allOfferStatus = false;
                }
                avalon.scan();
            },
            selectedAllOffer : function(){
                if(!workCtrl.allOfferStatus) {
                    workCtrl.allOfferStatus = true;
                    if(workCtrl.supplierOfferList.length > 0) {
                        for (var i = 0; i < workCtrl.supplierOfferList.length; i++) {
                            workCtrl.supplierOfferList[i].status = true; 
                        }
                    };
                    
                }else{
                    workCtrl.allOfferStatus = false;
                    if(workCtrl.supplierOfferList.length > 0) {
                        for(var i = 0; i < workCtrl.supplierOfferList.length; i++) {
                            workCtrl.supplierOfferList[i].status = false; 
                        }
                    }
                }
                
            },
            openQueryLink : function() {
                if(!workCtrl.selectedSupplierId) {
                    workCtrl.openAlert("请选择供应商。");
                    return;
                }
                var postData = [];
                for (var i = 0; i < workCtrl.supplierOfferList.length; i++) {
                    if (workCtrl.supplierOfferList[i].status) {
                        postData.push({id:workCtrl.supplierOfferList[i].id});
                    }
                }

                if(postData.length <= 0) {
                    workCtrl.openAlert("请选择询价商品。");
                    return;                    
                }
                io.POST(apiConfig.batchRequirementUrl, postData, function(data) {
                        if (data.success) {
                            window.open("/link/survey.html?id="+data.result.id+"&key="+data.result.key, "_blank" ) ;
                        } else {
                            workCtrl.openAlert(data.message);
                        }
                    },
                    function (data) {
                        if(!data.success) {
                            workCtrl.openAlert(data.message);
                        }
                    });
            },
            //提示框
            $alertDialogOption: {
                title: '提示信息',
                draggable: true,
                showClose: true,
                width: 300,
                zIndex: 100,
                isTop: true,
            },
            message : '',
            openAlert : function(msg) {
                workCtrl.message = msg;
                avalon.vmodels['alertDialogCtrlId'].toggle = true;
            },
            onCloseAlert : function() {
                avalon.vmodels['alertDialogCtrlId'].toggle = false;
            },
        });

        workCtrl.$watch("totalItems", function(a) {
            var widget = avalon.vmodels.pp;
            if (widget) {
                widget.totalItems = a;
            }
        });
        workCtrl.$watch("currentPage", function(a) {
            var widget = avalon.vmodels.pp;
            if (widget) {
                widget.currentPage = a;
            }
        });



        avalon.scan();
        workCtrl.init();
        workCtrl.doQuery();

    });

});