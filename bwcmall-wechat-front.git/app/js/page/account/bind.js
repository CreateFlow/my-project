'use strict'

;
(function() {
    Vue.component('modal', {
        template: '#modal-login',
        props: {
            show: {
                type: Boolean,
                required: true,
                twoWay: true
            },
            closeEnabled: {
                type: Boolean,
                default: true
            }
        }
    });



    var vm = new Vue({
        el: '#container',
        data: {
            reqError: '',
            username: {
                type: 'cust_no',
                val: '',
                error: false,
                length: 10,
                errorMsg: '',
                emptyMsg: '不能为空',
                lengthMsg: '请输入不超过10位的客户号',
                regExpMsg: '客户号应为数字',
                focus: ''
            },
            password: {
                type: 'password',
                val: '',
                error: false,
                length: 8,
                errorMsg: '',
                emptyMsg: '交易密码不能为空',
                lengthMsg: '请输入不超过8位的密码',
                regExpMsg: '密码应为非空字符',
                focus: ''
            },
            errorModal: false,
            errorModalData: '',
            loadingModal: false,
            failedModal: false,
            lockModal: false,
            autoCloseTimer: null
        },
        methods: {
            validate: function(model, ifSubmit) {
                var regExp = {
                    //cust_no: /^\d+$/,
                    passwd: /^\S+$/
                }

                model.focus = '';

                if (!model.val) {
                    if (!ifSubmit) {
                        return;
                    } else {
                        model.error = true;
                        model.errorMsg = model.emptyMsg;
                        return false;
                    }
                } else if (!regExp[model.type].test(model.val)) {
                    model.error = true;
                    model.errorMsg = model.regExpMsg;
                    return false;
                } else {
                    model.error = false;
                    model.errorMsg = '';
                    return true;
                }
            },
            clearInput: function(model, event) {
                event.preventDefault();
                model.val = '';
                model.error = false;
                model.errorMsg = '';
            },
            submit: function(e) {
                e.preventDefault();
                var self = this;
                console.log(1)
            }

        }
    });


})();
