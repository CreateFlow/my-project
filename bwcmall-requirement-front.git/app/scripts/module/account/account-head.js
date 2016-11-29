(function($) {
	var user = storage.getUser(),
		vm = avalon.define({
			$id: 'accountHeadCtrl',
			shopMerchant: false,
			currentNavInfo:'',
			showSubMenu:function(){
				$(this).find('.header-subnav').show();
			},
			hideSubMenu:function(){
				$(this).find('.header-subnav').hide();
			}
		});

	if (typeof user !== 'undefined') {
		vm.shopMerchant = user.shopMerchant;
	} 
}(jQuery));