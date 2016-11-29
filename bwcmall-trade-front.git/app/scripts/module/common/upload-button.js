'use strict';

(function($) {
  $.fn.uploadbutton = function(option) {
    var $input = $("<input type='file' />")[0];
    if($input.files){//支持html5上传
      option.queueID = "fileQueue";
      option.uploadScript = option.uploader;
      if(typeof(option.onUploadComplete)=='undefined' && typeof(option.onUploadSuccess)!='undefined') {
        option.onUploadComplete = option.onUploadSuccess;
      }
      this.uploadifive(option);
    } else {
      this.uploadify(option);
    }
  }
  $.fn.destroybutton = function(option) {
    var $input = $("<input type='file' />")[0];
    if($input.files){//支持html5上传
      this.uploadifive("destroy");
    } else {
      this.uploadify("destroy");
    }
  }
})($);