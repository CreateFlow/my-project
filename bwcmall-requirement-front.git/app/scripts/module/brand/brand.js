require(['dialog/avalon.dialog', 'pager/avalon.pager'], function(avalon) {
    avalon.ready(function() {
        var vm = avalon.define({
            $id: "brandCtrl",
            currentNavInfo : 'brand',
            dataList : [],
            typeList : [],
            spuCategoryList : [],
            supNameList :[],
            statusList : [],
            totalItems: 1,
            currentPage : 1,
            searchData :{
                name : '',
                nameEn : '',
                spuCategoryId : '',
                orientate : '',
                enableStatus : ''
            },
            init : function(){
                
                io.GET(apiConfig.rootUrl + 'category?grade=1', {}, function(data) {
                    if (data.result) {
                      vm.spuCategoryList = data.result;
                    }
                });
                io.GET(apiConfig.rootUrl + 'dict/BRAND_ORIENTATE/item', {}, function(data) {
                    if (data.result) {
                      vm.typeList = data.result;
                    }
                });
                io.GET(apiConfig.rootUrl + 'dict/BRAND_ENABLE_STATUS/item', {}, function(data) {
                    if (data.result) {
                      vm.statusList = data.result;
                    }
                });
            },
            //打开弹窗
            show : function(id, $index) {
                if (vm.dataList[$index].supplierList) {
                    vm.supNameList = vm.dataList[$index].supplierList;
                }else{
                    vm.supNameList =[];
                };
                
                avalon.vmodels[id].toggle = true;

                return false;
            },

            showbrand : function(id, brandid) {
                
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
                showJumper:false,
                totalItems:1,
                onJump: function(e, data) {
                    var searchData = {};
                    searchData.name__contains = vm.searchData.name;
                    searchData.nameEn__contains = vm.searchData.nameEn;
                    searchData.spuCategoryId = vm.searchData.spuCategoryId;
                    searchData.orientate = vm.searchData.orientate;
                    searchData.enableStatus = vm.searchData.enableStatus;
                    searchData.page = data._currentPage;
                    searchData.per_page = 10;
                    io.GET(apiConfig.rootUrl + 'brand',searchData, function(data) {
                        if(data.success){
                            vm.dataList = [];
                            vm.dataList = data.result;
                            vm.currentPage = data.result_info.page;
                        }else{
                            alert(data.message);
                        }
                    });
                }
            },
            $skipArray :["pager"],
            doQuery : function() {
                var searchData = {};
                searchData.name__contains = vm.searchData.name;
                searchData.nameEn__contains = vm.searchData.nameEn;
                searchData.spuCategoryId = vm.searchData.spuCategoryId;
                searchData.orientate = vm.searchData.orientate;
                searchData.enableStatus = vm.searchData.enableStatus;
                searchData.page = 1;
                searchData.per_page = 10;
                io.GET(apiConfig.rootUrl + 'brand',searchData, function(data) {
                    if(data.success){
                        vm.dataList = [];
                        vm.dataList = data.result;
                        vm.totalItems = data.result_info.total_count;
                        vm.currentPage = data.result_info.page;
                    }else{
                        alert(data.message);
                    }
                });
            }
        });

        vm.$watch("totalItems", function(a) {
            var widget = avalon.vmodels.pp;
            if (widget) {
                widget.totalItems = a;
            }
        });
        vm.$watch("currentPage", function(a) {
            var widget = avalon.vmodels.pp;
            if (widget) {
                widget.currentPage = a;
            }
        });
        
        vm.init();
        vm.doQuery();
        avalon.scan();

    });

});