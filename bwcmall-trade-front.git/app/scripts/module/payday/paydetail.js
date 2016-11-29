require(['dialog/avalon.dialog'], function() {
     var isLogin = storage.isLogin();
        if (!isLogin) {
            urls.goLogin();
        }

    avalon.ready(function() {
        var vm = avalon.define({
            $id: "paydetailCtrl",
            dataList:{},
            exportBills: function(el){
                //模拟form
                var form = $('<form id="myForm"></form>').attr("style", 'display:none')
                    .attr("action", apiConfig.exportBills.replace('{billId}', el.id))
                    //.attr("action", apiConfig.exportBills.replace('{billId}', '3786736223382142976'))
                    .attr("method", "GET");
                form.append('<input type="text" name="token" value="' + storage.getCurrentUser().authToken + '">');
                form.appendTo('body');
                form.submit();
                form.remove();
            }
        });
        io.GET(apiConfig.rootUrl + 'account/'+urls.getParameter(window.location.href, 'Sn'),function(data){
            if(data.success){
                vm.dataList = data.result;
                avalon.scan();
            }
        });
    });

});
