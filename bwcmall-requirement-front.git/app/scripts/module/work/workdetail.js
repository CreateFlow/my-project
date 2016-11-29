require(['dialog/avalon.dialog'], function(avalon) {
    avalon.ready(function() {
        var workdetailsCtrl = avalon.define({
            $id: "workdetailCtrl",
            currentNavInfo : 'work',
            dataList:{},
            init : function(){
                io.GET(apiConfig.rootUrl + 'requirement/item/'+urls.getParameter(window.location.href, 'id'),function(data){
                    if(data.success){
                        workdetailsCtrl.dataList = data.result; 
                        avalon.scan();
                    }
                });
            },
        });
        avalon.scan();
        workdetailsCtrl.init();
    });
});