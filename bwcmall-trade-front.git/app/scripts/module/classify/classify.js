
(function($) {
	avalon.ready(function() {
	    var categoryPageCtrl = avalon.define('categoryPageCtrl', function(vm) {
	        vm.navData = [];
	    });

	    //获取数据
	    io.GET(apiConfig.indexNavList, function(data) {
	        categoryPageCtrl.navData = data.result;
	        avalon.scan();

	        pubu();
	        classify_scroll();
	        aclick();
	    });

		function pubu(){
			var box=$('.classify-each');
			var boxW=box.outerWidth(true);
			var totalH=[];
			box.each(function(index,el){
				var boxH=box.eq(index).outerHeight(true);
				if(index<2){
					totalH[index]=boxH;
				}else{
					var minH=Math.min.apply(null,totalH);
					var minIndex=$.inArray(minH,totalH);
					$(el).css({
						position:'absolute',
						top:minH,
						left:box.eq(minIndex).position().left
					});
					totalH[minIndex]+=box.eq(index).outerHeight(true);
					$('.classify-left').height(totalH[minIndex]);
				}
			})
		}


		function classify_scroll(){
			var otop = $('.classify-wrap').position().top;
			var oleft=$('.classify-right').offset().left;
	        $(window).scroll(function() {
	            if ($(document).scrollTop() > otop) {
	                $('.classify-right').css({
	                	position:'fixed',
	                	top:64,
	                	left:oleft
	                });
	            } else {
	                $('.classify-right').css({'position':'static'});
	            }
	        });
	    }


	    function aclick(){
			$('.classify-right li').click(function(){
				$(this).addClass('cur-classify').siblings().removeClass('cur-classify');
				var index=$(this).index();
				console.log(index);
				$('html,body').animate({scrollTop:$('.classify-each').eq(index).offset().top-100},300);
			})
		}
	});
}(jQuery));
