'use strict';


function formatPrice(str){
  if(str == 0){
    return "<em>￥0.00</em>";
  }
  if(str){
    if(typeof num=="number"){
        return "<em>￥"+str.toFixed(2)+"</em>";
    }else{
      return "<em>￥"+parseFloat(str).toFixed(2)+"</em>";
    }
   
  }else{
    return "";
  }
 
}

//console.info('require url module');
function getPageName() {
    var u = location.pathname;
    var a = u.split(/\//);
    var m = a.pop().match(/(?:^|\/)($|[^\.]+)/);

    return m[1] ? m[1] : 'index';
}

function getQuery(name) {
    var u = location.search.slice(1);
    var re = new RegExp(name + '=([^&\\s+]+)');
    var m = u.match(re);
    var v = m ? m[1] : '';

    return (v === '' || isNaN(v)) ? v : v - 0;
}

function getHash(name) {
    var u = location.hash.slice(1);
    var re = new RegExp(name + '=([^&\\s+]+)');
    var m = u.match(re);
    var v = m ? m[1] : '';

    return (v === '' || isNaN(v)) ? v : v - 0;
}

function parseUrl(url) {
    var a = document.createElement('a');

    a.href = (url || 'x.html');

    return {
        host: a.host,
        protocol: a.protocol
    };
}

function getParamter(url){
   var theRequest = new Object();   
   if (url.indexOf("?") != -1) {   
      var str = url.substr(url.indexOf('?')+1);
      strs = str.split("&");   
      for(var i = 0; i < strs.length; i ++) {   
         theRequest[strs[i].split("=")[0]]=unescape(strs[i].split("=")[1]);   
      }   
   }   
   return theRequest;    
}
/**
 *  从URL获取参数
 **/
function getQueryString(url,name) {  
      if (url.indexOf("?") != -1) {   
         if(url.lastIndexOf("#")>0){
            url  = url.substr(0,url.lastIndexOf('#'));
         }
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");  
        var r =  url.substr(url.indexOf('?')+1).match(reg);  
        if (r != null) {
              return unescape(r[2]);  
          } 
      } 
    return null;  
}  
function serialize(obj) {
    var s = [];

    $.each(obj, function(k, v) {
        s.push(k + '=' + encodeURIComponent(v));
    });

    return s.join('&');
}

 