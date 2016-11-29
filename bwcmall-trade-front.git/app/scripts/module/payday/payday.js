  require("datepicker/avalon.coupledatepicker", function(avalon) {

    var isLogin = storage.isLogin();
    if (!isLogin) {
      urls.goLogin();
    }

    avalon.ready(function() {
      var invoiceListCtrl = avalon.define('paydayCtrl', function(vm) {
        vm.dataList = {}; //返回数据
        vm.currentPage = 1;
        vm.maxPageCount = 0;
        vm.perPage = 15;
        vm.corpName = '';
        vm.totalData = {};
        vm.statusList = [];
        vm.init = function() {
            io.GET(apiConfig.rootUrl + 'dict/ACCT_BILLS_TYPE/item', function(data) {
                if (data.result) {
                  vm.statusList = data.result;
                }
            });
            io.GET(apiConfig.rootUrl + 'account/panorama', {}, function(data) {
                if (data.result) {
                  vm.totalData = data.result;
                }
            });
        }
        vm.doQuery = function() {
            var data = {};
            if (vm.corpName) {
                data.corpName_contains = vm.corpName;
            }
            if ($("#orderInvoiceStatus").val()) {
                data.status = $("#orderInvoiceStatus").val();
            }
            if (vm.currentPage > vm.maxPageCount) {
                vm.currentPage = vm.maxPageCount;
            }

            if (vm.currentPage == 0) {
                vm.currentPage = 1;
            }

            if (vm.perPage == 0) {
                vm.perPage = 1;
            }
            data.page = vm.currentPage;
            data.per_page = vm.perPage;

            vm.dataList = [];
            vm.currentPage = 0;
            vm.maxPageCount = 0;

            io.GET(apiConfig.rootUrl + 'account',data , function(data) {
                vm.dataList = data.result;
                vm.currentPage = data.result_info.page;
                vm.maxPageCount = data.result_info.page_count;
                vm.perPage = data.result_info.per_page;
                }, function() {
                    vm.dataList = [];
                    vm.currentPage = 0;
                    vm.maxPageCount = 0;
                });
            };

            vm.goFirst = function() {
              vm.currentPage = 1;
              vm.doQuery();
            };
            vm.goLast = function() {
              vm.currentPage = vm.maxPageCount;
              vm.doQuery();
            };
            vm.goBefore = function(i) {
              vm.currentPage = vm.currentPage - i;
              vm.doQuery();
            };
            vm.getAfter = function(i) {
              vm.currentPage = vm.currentPage + 1;
              vm.doQuery();
            };

        });

        avalon.scan();
        invoiceListCtrl.init();
        invoiceListCtrl.doQuery();
    });

  });