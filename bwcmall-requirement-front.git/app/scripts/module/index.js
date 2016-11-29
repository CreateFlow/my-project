require(['dialog/avalon.dialog', 'pager/avalon.pager'], function(avalon) {
    avalon.ready(function() {
        var indexCtrl = avalon.define({
            $id: "indexCtrl",
            currentNavInfo : 'index',
            dataList : [],
            typeList : [],
            statusList : [],
            totalItems: 1,
            currentPage : 1,
            searchData :{
                type : '',
                sn : '',
                status : '',
                buyerName : '',
                mobile : '',
                brandName : '',
                skuSnSet : ''
            },
            init : function(){
                
                io.GET(apiConfig.rootUrl + 'dict/REQUIREMENT_TYPE/item', {}, function(data) {
                    if (data.result) {
                      indexCtrl.typeList = data.result;
                    }
                });
                io.GET(apiConfig.rootUrl + 'dict/REQUIREMENT_STATUS/item', {}, function(data) {
                    if (data.result) {
                      indexCtrl.statusList = data.result;
                    }
                });
            },
            //打开弹窗
            show : function(id, status) {
                avalon.vmodels[id].toggle = true;
                return false;
            },

            //关闭弹窗
            closeDialog : function(id) {
                avalon.vmodels[id].toggle = false;
                return false;
            },

            //打开弹窗
            addDemand : function() {
                window.location.href = "/index/demand.html";
            },

            
            pager : {
                currentPage: 1,
                perPages:10,
                showJumper:true,
                totalItems:1,
                onJump: function(e, data) {
                    var searchData = {};
                    searchData.type = indexCtrl.searchData.type;
                    searchData.sn = indexCtrl.searchData.sn;
                    searchData.status = indexCtrl.searchData.status;
                    searchData.buyerName_contains = indexCtrl.searchData.buyerName;
                    searchData.mobile_contains = indexCtrl.searchData.mobile;
                    searchData.brandName_contains = indexCtrl.searchData.brandName;
                    searchData.skuSnSet_contains = indexCtrl.searchData.skuSnSet;
                    searchData.page = data._currentPage;
                    searchData.per_page = indexCtrl.pager.perPages;
                    io.GET(apiConfig.requirement,searchData, function(data) {
                        if(data.success){
                            indexCtrl.dataList = data.result;
                            indexCtrl.currentPage = data.result_info.page;
                        }else{
                            alert(data.message);
                        }
                    });
                }
            },
            $skipArray :["pager"],

            onKeyup : function(event) {
                if (event.keyCode === 13) {
                    indexCtrl.doQuery();
                }
            },
            doQuery : function() {
                var searchData = {};
                searchData.type = indexCtrl.searchData.type;
                searchData.sn = indexCtrl.searchData.sn;
                searchData.status = indexCtrl.searchData.status;
                searchData.buyerName_contains = indexCtrl.searchData.buyerName;
                searchData.mobile_contains = indexCtrl.searchData.mobile;
                searchData.brandName_contains = indexCtrl.searchData.brandName;
                searchData.skuSnSet_contains = indexCtrl.searchData.skuSnSet;
                searchData.page = 1;
                searchData.per_page = indexCtrl.pager.perPages;
                io.GET(apiConfig.requirement,searchData, function(data) {
                    if(data.success){
                        indexCtrl.dataList = data.result;
                        indexCtrl.totalItems = data.result_info.total_count;
                        indexCtrl.currentPage = data.result_info.page;
                    }else{
                        alert(data.message);
                    }
                });
            }
        });

        indexCtrl.$watch("totalItems", function(a) {
            var widget = avalon.vmodels.pp;
            if (widget) {
                widget.totalItems = a;
            }
        });
        indexCtrl.$watch("currentPage", function(a) {
            var widget = avalon.vmodels.pp;
            if (widget) {
                widget.currentPage = a;
            }
        });



        avalon.scan();
        indexCtrl.init();
        indexCtrl.doQuery();

    });

});