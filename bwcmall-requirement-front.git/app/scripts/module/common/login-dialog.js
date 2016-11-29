avalon.ready(function(){
    require(['dialog/avalon.dialog'],function(){
        var loginDialogCtrl=avalon.define('loginDialogCtrl',function(vm){
            //登录dialog配置项
            vm.$loginDialogOptions = {
                title: "登录",
                showClose: true,
                type: 'nobtn',
                width: 420,
                isTop: true
            };
            //user
            vm.data={
                "user":"",
                "password":""
            };
            //errorInfo
            vm.errorInfo='';

            //用户名校验
            vm.checkUser=function(){
                if (loginDialogCtrl.data.user.replace(/\s+/g, "") == '') {
                    loginDialogCtrl.errorInfo = "请输入用户名";
                    return false;
                }
                return true;
            };

            //密码校验
            vm.checkPassword=function(){
                if (loginDialogCtrl.data.password.replace(/\s+/g, "") == '') {
                    loginDialogCtrl.errorInfo = "请输入密码";
                    return false;
                }
                return true;
            };
        });

        avalon.scan();
    });
});