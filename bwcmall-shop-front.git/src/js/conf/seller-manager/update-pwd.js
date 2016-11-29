'use strict';

define(function(require, exports, module) {
    // 加载依赖组件
    var avalon = require('avalon'),
        $ = require('jquery'),
        request = require('lib/io/request'),
        API = require('module/common/config/api'),
        myUtils = require('module/common/utils/utils');

    // 加载框架组件
    require('module/common/ui/scaffolding');

    avalon.ready(function () {
        var vm = avalon.define({
            $id: "sellerManagerPwdCtrl",
            updatePwdResult: "您的密码已经修改成功!",
            updatePwdCheckInfo: "",
            isShowResult: false,
            isShowPwdCheckInfo: false,
            pwdInfo:{},
            updatePwd: function(){
                if(vm.pwdInfo.old == undefined || vm.pwdInfo.old == ''){
                    vm.updatePwdCheckInfo = "请填写旧密码!";
                    vm.isShowPwdCheckInfo = true;
                    return;
                }
                if(vm.pwdInfo.new1 == undefined || vm.pwdInfo.old == ''){
                    vm.updatePwdCheckInfo = "请填写新密码!";
                    vm.isShowPwdCheckInfo = true;
                    return;
                }
                if(vm.pwdInfo.new2 == undefined || vm.pwdInfo.old == ''){
                    vm.updatePwdCheckInfo = "请再次填写新密码!";
                    vm.isShowPwdCheckInfo = true;
                    return;
                }
                if(vm.pwdInfo.new1 != vm.pwdInfo.new2){
                    vm.updatePwdCheckInfo = "两次输入密码不一致!";
                    vm.isShowPwdCheckInfo = true;
                    return;
                }

                var pwd = {
                    oldPassword:vm.pwdInfo.old,
                    newPassword:vm.pwdInfo.new1
                };

                request.POST(API.updatePassword, pwd, function(responseData){
                    vm.isShowResult = true;

                    if(responseData.success){
                        vm.updatePwdResult = "您的密码已经修改成功!";
                    }else{
                        vm.updatePwdResult = responseData.message;
                    }
                });
            },
            updatePwdAgain: function(){
                vm.isShowResult = false;
            }

        });

        (function init(){

        }());

        avalon.scan(document.body, vm);
    });
});