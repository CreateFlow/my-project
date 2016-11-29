'use strict'

;
(function() {

    Vue.component('loading', vuxLoading)

    var vm = new Vue({
        el: '#app',
        data: {
            licenseType: "0",
            license: 0,
            licenseUrl: "",
            taxRegCert: 0,
            taxRegCertUrl: "",
            orgnizationCode: 0,
            orgnizationCodeUrl: "",
            licenseAll: 0,
            licenseAllUrl: "",
            uploadBusy: false,
            uploadName: '',
            uploadText: "图片上传中"
        },
        methods: {
            setBuyer: function() {
                var self = this;
                if (self.uploadBusy) {
                    alert("文件上传中，请等待！")
                    return;
                }
                var signupInfo = Cookies.getJSON('signupInfo')
                if (!signupInfo) {
                    location.href = 'signup-info.html';
                }
                if (self.licenseType === "0") {
                    if (!self.license) {
                        alert("请上传营业执照！")
                        return;
                    } else if (!self.taxRegCert) {
                        alert("请上传税务登记证书！")
                        return;
                    } else if (!self.orgnizationCode) {
                        alert("请上传组织机构代码证！")
                        return;
                    }
                    var data = {
                        "license": self.license,
                        "licenseUrl": self.licenseUrl,
                        "taxRegCert": self.taxRegCert,
                        "taxRegCertUrl": self.taxRegCertUrl,
                        "orgnizationCode": self.orgnizationCode,
                        "orgnizationCodeUrl": self.orgnizationCodeUrl,
                        "licenseType": self.licenseType
                    }
                } else {
                    if (!self.licenseAll) {
                        alert("请上传营业执照！")
                        return;
                    }
                    var data = {
                        "licenseAll": self.licenseAll,
                        "licenseAllUrl": self.licenseAllUrl,
                        "licenseType": self.licenseType
                    }
                }

                var newData = Util.mergeObj(signupInfo, data)
                self.$http.post(API.buyer, newData).then(function(response) {
                    var body = response.data
                    if (body.success) {
                        location.href = 'signup-success.html';
                    } else {
                        alert(body.message)
                    }
                }, function(response) {
                    // error callback
                });
            },
            compressImg: function(e) {
                var self = this;
                var files = e.target.files || e.dataTransfer.files;
                var quality = 0.7 //图片质量0.7  压缩后图片大小在100K左右
                if (files && files[0]) {
                    var type = files[0].type
                    if (type.indexOf('image') < 0) {
                        alert('请上传图片');
                        return;
                    }
                    var reader = new FileReader(); //IE9以上，现代浏览器都兼容
                    reader.onload = function(e) {
                        //上传前展示
                        var source = document.getElementById('idImg');
                        source.src = e.target.result;
                        var canvas = document.getElementById("canvas");
                        var ctx = canvas.getContext("2d");

                        var timer = setInterval(function() {
                            if (!!source.src) {
                                canvas.width = 800;
                                canvas.height = canvas.width * (source.height / source.width);

                                ctx.drawImage(source, 0, 0, source.width, source.height,
                                    0, 0, canvas.width, canvas.height);

                                var jpegUrl = canvas.toDataURL("image/jpeg", quality);
                                var newFile = Util.convertBase64UrlToBlob(jpegUrl)
                                self.uploadImg(newFile);

                                $('#idImg').attr('src', '');
                                //$('#idImgCom').attr('src', jpegUrl);
                                clearInterval(timer)
                            }

                        }, 200)
                    }
                    reader.readAsDataURL(files[0]);
                }
            },
            onFileChange: function(e) {
                e.preventDefault();
                var self = this;
                if (self.uploadBusy) {
                    alert("图片上传中，请等待！")
                    return;
                }
                self.uploadName = e.target.name;
                self.compressImg(e)

                //var files = e.target.files || e.dataTransfer.files;


                // self.$http.post(API.uploadFile, fd).then(function(response) {
                //     var body = response.data
                //     self.uploadBusy = false;
                //     if (body.success) {
                //         if (name == 'license') {
                //             self.license = body.result.id
                //             self.licenseUrl = body.result.resources
                //         } else if (name == 'taxRegCert') {
                //             self.taxRegCert = body.result.id
                //             self.taxRegCertUrl = body.result.resources
                //         } else if (name == 'orgnizationCode') {
                //             self.orgnizationCode = body.result.id
                //             self.orgnizationCodeUrl = body.result.resources
                //         } else if (name == 'licenseAll') {
                //             self.licenseAll = body.result.id
                //             self.licenseAllUrl = body.result.resources
                //         }
                //     } else {
                //         alert(body.message)
                //     }
                // }, function(response) {
                //     alert(error)
                //     self.uploadBusy = false;
                // });
            },
            uploadImg: function(file) {
                var self = this;
                var token = Cookies.get('authToken');
                var fd = new FormData();
                fd.append('file', file);
                fd.append('token', token);
                self.uploadBusy = true;
                $.ajax({
                    url: API.uploadFile,
                    type: 'POST',
                    processData: false,
                    contentType: false,
                    data: fd,
                    processData: false,
                    success: function(response) {
                        var body = response;
                        if (body.success) {
                            //self.getImg(body)
                            self.uploadBusy = false;
                            if (self.uploadName == 'license') {
                                self.license = body.result.id
                                self.licenseUrl = body.result.resources
                            } else if (self.uploadName == 'taxRegCert') {
                                self.taxRegCert = body.result.id
                                self.taxRegCertUrl = body.result.resources
                            } else if (self.uploadName == 'orgnizationCode') {
                                self.orgnizationCode = body.result.id
                                self.orgnizationCodeUrl = body.result.resources
                            } else if (self.uploadName == 'licenseAll') {
                                self.licenseAll = body.result.id
                                self.licenseAllUrl = body.result.resources
                            }
                        } else {
                            self.uploadBusy = false;
                            alert(body.message)
                        }
                    },
                    error: function(error) {
                        alert(error)
                        self.uploadBusy = false;
                    }

                });
            },
            getImg: function(body) {
                var self = this;
                self.$http.get(body.result.resources, {}).then(function(response) {

                    },
                    function(response) {
                        // error callback
                    });
            }
        },
        ready: function() {
            var self = this;

        }
    });


})();
