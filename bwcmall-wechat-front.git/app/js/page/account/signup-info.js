'use strict'

;
(function() {

    Vue.component('address', vuxAddress)
    Vue.component('popup', vuxPopup)
    Vue.component('modal', {
        template: '#modal',
        props: {
            show: {
                type: Boolean,
                required: true,
                twoWay: true
            }
        }
    })

    var vm = new Vue({
        el: '#app',
        data: {
            reqError: '',
            signup: {
                corpName: {
                    type: 'corpName',
                    val: '',
                    error: false,
                    length: '',
                    errorMsg: '',
                    emptyMsg: '公司名称不能为空',
                    lengthMsg: '',
                    regExpMsg: '',
                    focus: ''
                },
                contacts: {
                    type: 'contacts',
                    val: '',
                    error: false,
                    length: '',
                    errorMsg: '',
                    emptyMsg: '联系人姓名不能为空',
                    lengthMsg: '',
                    regExpMsg: '',
                    focus: ''
                },
                email: {
                    type: 'email',
                    val: '',
                    error: false,
                    length: '',
                    errorMsg: '',
                    emptyMsg: '电子邮箱不能为空',
                    lengthMsg: '',
                    regExpMsg: '',
                    focus: ''
                },
                categoryId: {
                    type: 'categoryId',
                    val: [],
                    error: false,
                    length: 6,
                    errorMsg: '',
                    emptyMsg: '主要品类不能为空',
                    lengthMsg: '',
                    regExpMsg: '',
                    focus: ''
                },
                businessCategory: {
                    val: '',
                    emptyMsg: '业务类型不能为空',
                },
                areaId: {
                    val: '',
                    emptyMsg: '所在区域不能为空',
                },
                address: {
                    val: '',
                    emptyMsg: '详细地址不能为空',
                }
            },
            serviceCategory: '',
            serviceItems: [],
            serviceItemsText: '',
            businessCategory: '',
            cityData: '',
            countyData: '',
            selecteProvince: '',
            selectedCity: '',
            selectedCounty: '',
            selectedArea: '',
            addressData: AddressChinaData,
            error: false,
            errorMsg: '',
            popShow1: false,
            allowSub: false,
            addressModal: false
        },
        methods: {
            validate: function(obj) {
                var self = this;
                for (var key in obj) {
                    var regExp = {
                        corpName: /^\S{1,100}$/,
                        contacts: /^\S{1,10}$/
                    }
                    var val = obj[key];
                    if (!val.val) {
                        self.error = true;
                        self.errorMsg = val.emptyMsg;
                        alert(self.errorMsg)
                        return false;
                    } else if (regExp[val.type] && !regExp[val.type].test(val.val)) {
                        self.error = true;
                        self.errorMsg = val.regExpMsg;
                        alert(self.errorMsg)
                        return false;
                    }
                }

                self.error = false;
                self.errorMsg = '';
                return true;

            },
            getServiceCategory: function() {
                var self = this;
                self.$http.get(API.serviceCategory, {}).then(function(response) {
                    var body = response.data;
                    if (body.success) {
                        var serviceCategory = body.result
                        for (var i = 0; i < serviceCategory.length; i++) {
                            var temp = serviceCategory[i]
                            temp.isSelected = false;
                            for (var j = 0; j < temp.categoryList.length; j++) {
                                temp.categoryList[j].isSelected = false;
                            }
                        }
                        self.serviceCategory = serviceCategory;
                    } else {
                        alert(body.message)
                    }
                }, function(response) {
                    // error callback
                });

            },
            getBusinessCategory: function() {
                var self = this;
                self.$http.get(API.businessCategory, {}).then(function(response) {
                    var body = response.data

                    if (body.success) {
                        self.businessCategory = body.result
                    } else {
                        alert(body.message)
                    }
                }, function(response) {
                    // error callback
                });
            },
            setService: function(item) {
                var self = this;
                if (item.isSelected) {
                    var textIndex = self.serviceItems.indexOf(item.name)
                    self.serviceItems.splice(textIndex, 1)
                    var itemIndex = self.signup.categoryId.val.indexOf(item.id)
                    self.signup.categoryId.val.splice(itemIndex, 1)
                } else {
                    if (self.signup.categoryId.val.length === 3) {
                        alert("最多只能选择三个主营品类");
                        return;
                    }
                    self.signup.categoryId.val.push(item.id)
                    self.serviceItems.push(item.name)
                }
                item.isSelected = !item.isSelected;
                self.serviceItemsText = '';
                for (var i = 0; i < self.serviceItems.length; i++) {
                    if (i === 0) {
                        self.serviceItemsText += self.serviceItems[i]
                    } else {
                        self.serviceItemsText += '/' + self.serviceItems[i]
                    }

                }

            },
            setBuyer: function() {
                var self = this;

                var data = {
                    "corpName": self.signup.corpName.val,
                    "contacts": self.signup.contacts.val,
                    "email": self.signup.email.val,
                    "areaId": self.signup.areaId.val,
                    "address": self.signup.address.val,
                    "categoryId": self.signup.categoryId.val,
                    "businessCategory": self.signup.businessCategory.val,
                }

                Cookies.set('signupInfo', data)
                location.href = 'signup-cert.html'
                    // self.$http.post(API.buyer, {
                    //     "corpName": self.signup.corpName.val,
                    //     "contacts": self.signup.contacts.val,
                    //     "email": self.signup.email.val,
                    //     "areaId": self.signup.areaId.val,
                    //     "address": self.signup.address.val,
                    //     "categoryId": self.signup.categoryId.val,
                    //     "businessCategory": self.signup.businessCategory.val,
                    // }).then(function(response) {
                    //     var body = response.data
                    //     if (body.success) {
                    //         location.href = 'signup-cert.html'
                    //     } else {
                    //         alert(body.message)
                    //     }
                    // }, function(response) {
                    //     // error callback
                    // });
            },
            changeProvince: function(id) {
                for (var i = 0; i < this.addressData.length; i++) {
                    var temp = this.addressData[i];
                    if (temp.value == id) {
                        this.selectedArea = temp.name
                        this.cityData = temp.c
                    }
                }
                this.countyData = [];
                this.selectedCity = "";
                this.selectedCounty = "";
            },
            changeCity: function(id) {
                for (var i = 0; i < this.cityData.length; i++) {
                    var temp = this.cityData[i];
                    if (temp.value == id) {
                        this.selectedArea += '/' + temp.name
                        this.countyData = temp.c
                    }
                }
                this.selectedCounty = "";
            },
            changeCounty: function(id) {
                for (var i = 0; i < this.countyData.length; i++) {
                    var temp = this.countyData[i];
                    if (temp.value == id) {
                        this.selectedArea += '/' + temp.name
                    }
                }
                this.signup.areaId.val = id;
            },
            setAreaId: function() {
                if (!this.signup.areaId.val) {
                    alert("请选择完整的区域！")
                } else {
                    this.addressModal = false;
                }
            },
            submit: function() {
                var self = this;
                if (!self.allowSub) {
                    return;
                }
                if (self.validate(self.signup)) {
                    self.setBuyer();
                }
            }

        },
        watch: {
            'signup.address.val': function(val, oldVal) {
                if (val) {
                    this.allowSub = true;
                }
            }
        },
        ready: function() {
            var self = this;
            self.getServiceCategory();
            self.getBusinessCategory();
        }
    });


})();
