(function($) {
	avalon.ready(function() {

		var shopListBar = avalon.define('openlist', function(vm) {
			vm.listdata = {result:[]},
				vm.listetail = {},
				vm.order = {},
				vm.total = {},
				vm.sOrder = function() {
					var selectedReceiverBlock = $('#receiverList .m-checkbox-icon-checked').parents('div.adress-block');
					var selectedReceiverId = $(selectedReceiverBlock).find('input.receiverId').val();
					if (!selectedReceiverId) {
						alert("请选择收货地址！");
						vm.inProgress = false;
						return false;
					};
					// orderTwoCtrl.ajaxErrorFlag = false;
					io.POST(apiConfig.shoppingList + shoplistid + '/order', {
						shoppingListId: shoplistid,
						receiverId: selectedReceiverId,
						memo: $('#memo').val(),
						invoiceId: ''
					}, function(data) {
						if (data.success == true) {
							common.toPay(data.result.orderSn, '_self');
						} else {
							$('.order-submit-error').show();
							// orderTwoCtrl.ajaxErrorFlag = true;
						}
					});
				}
		});

		var shoplistid = urls.getParameter(window.location.href, 'shoplistid');
		if (shoplistid != null && storage.isLogin()) {
			io.GET(apiConfig.shoppingList + shoplistid, function(data) {
				var order = data.result.itemList;
				var obj = {};
				var arr = [];
				var total = 0;
				$.each(order, function(i, k) {
					if (k.itemStatus == 1) {
						arr.push(k);
						total = total + (k.price * k.quantity);
					}
				});
				obj.total = total;
				obj.arr = arr;
				obj.count = arr.length;
				shopListBar.order = obj;
			});
		}

		var shoplistModel = $('.prevshoplist , .quitshoplist'),
			prevshoplist = $('.prevshoplist ul'),
			shoplistpage = $('.shoplistpage'),
			addhtmlnum = 2,
			shoppingListId = 1,
			ListId,
			viewid = 1,
			number = 1,
			listModel,
			maxlist = 5,
			maxlistid = 0;
		if ($.cookie()['shoppingList']) {
			var shoplistdata = $.parseJSON($.cookie()['shoppingList']);
		}
		shoplistpage.on('click', '.shoplistitem_main .num .product-minus', function() {
			var $numObj = $(this).siblings(".product-num");
			var numVal = $numObj.val();
			if (numVal > 1) {
				numVal = parseInt(numVal) - 1;
				$numObj.val(numVal);
			}
			var itemid = $(this).closest('tr').find('.itemid span').text();
			var data = {
				id: itemid,
				itemName: $(this).closest('tr').find('input[name=itemName]').val(),
				requiredQuantity: $(this).closest('tr').find('input[name=requiredQuantity]').val(),
				quantity: numVal,
				itemStatus: $(this).closest('tr').find('.status span').text(),
				goodsId: $(this).closest('tr').find('.shopListItemgoodsid').text()
			};
			io.PATCH(apiConfig.shoppingList + shoplistdata.id + '/item/' + itemid, data, function(data) {
				if (data.success == true) {
					shopListBar.total.result.selectedPrice = data.result.selectedPrice;
					shopListBar.total.result.selectedQuantity = data.result.selectedQuantity;
				}
			});
		}).on('click', '.num .product-add', function() {
			var $numObj = $(this).siblings(".product-num");
			var numVal = $numObj.val();
			numVal = parseInt(numVal) + 1;
			$numObj.val(numVal);
			// $(this).closest('tr').find('.count').val(numVal);
			var itemid = $(this).closest('tr').find('.itemid span').text();
			var data = {
				id: itemid,
				itemName: $(this).closest('tr').find('input[name=itemName]').val(),
				requiredQuantity: $(this).closest('tr').find('input[name=requiredQuantity]').val(),
				quantity: numVal,
				itemStatus: $(this).closest('tr').find('.status span').text(),
				goodsId: $(this).closest('tr').find('.shopListItemgoodsid').text()
			};
			io.PATCH(apiConfig.shoppingList + shoplistdata.id + '/item/' + itemid, data, function(data) {
				if (data.success == true) {
					shopListBar.total.result.selectedPrice = data.result.selectedPrice;
					shopListBar.total.result.selectedQuantity = data.result.selectedQuantity;
				}
			});
		});
		$('.shoplist_bar').on('click', '.shoplist', function() {
			if (storage.isLogin()) {
				shoplistModel.show();
				io.GET(apiConfig.shoppingList, function(data) {
					var shopListBarlistdata = data;
					$.each(shopListBarlistdata.result, function(i, k) {
						k.listnumber = i + 1;
					});

					// shopListBar.listdata = shopListBarlistdata;
					shopListBar.listdata = shopListBarlistdata;

					listModel = true;
					setTimeout(function() {
						if ($.cookie()['shoppingList']) {
							var hasqiuet = $.parseJSON($.cookie()['shoppingList']).id;
							var shopListItemnum = $('.shopListItem');
							$.each(shopListItemnum, function(i, k) {
								if ($(k).find('span').text() == hasqiuet) {
									$(this).addClass('hover');
								}
							});
						}
					}, 100);
				})
			} 
		}).on('click', '.quitshoplist', function() {
			shoplistModel.hide();
			if ($.cookie()['shoppingList']) {
				var liststatus = $.parseJSON($.cookie()['shoppingList']);
				liststatus.listModel = false;
				$.cookie('shoppingList', '', {
					path: '/'
				});
			}
			window.location.href = window.location.href;
		}).on('click', '.addshoplist', function() {
			shoplistModel.show();
			io.GET(apiConfig.shoppingList, function(data) {
				var shopListBarlistdata = data;
				if (prevshoplist.find('li')) {
					var prevshoplistLiLenght = prevshoplist.find('li').length + 1;
				}
				if (prevshoplistLiLenght < 5) {
					shopListBarlistdata.result.push({});
					$('.shoplistpage .shopListItemDetail').show();
				}
				$.each(shopListBarlistdata.result, function(i, k) {
					k.listnumber = i + 1;
				});
				// shopListBar.listdata = shopListBarlistdata;
				shopListBar.listdata = shopListBarlistdata;

				viewid = data.result.length;

				listModel = true;
			});

			shoppingListId++;

			// prevshoplist.append("<li class='shopListItem' data-id=" + shoppingListId + "><span hidden></span><a href='javascript:;'  class='listopen'>购物清单" + shoppingListId + "</a><a href='javascript:;' class='listdelete'></a></li>");
			shoplistpage.append("<div class='shopListItemDetail' data-id=" + shoppingListId + " style='display: none;'><h3>选购清单<div class='uneditdiv'><a href='javascript:;' class='concel'>取消</a><a href='javascript:;' class='confirm'>确定</a></div><div class='editdiv'><a href='javascript:;' class='concel'>取消</a><a href='javascript:;' class='edit'>编辑</a></div></h3><div class='shopListItemDetail_content'><table class=''><tr><th></th><th>名称</th><th>数量</th>" +
				"<th>状态</th><th>商品详情</th><th>单价</th><th>数量</th><th>操作</th></tr><tr class='shoplistitem_main'><td class='list_id' data-id='1'>1</td><td><input type='text' class='shopinput' name='itemName'></td><td><input type='tel' class='shopinput count' name='requiredQuantity'></td><td class='status' data-status='false'></td><td class='detail'><a href=''></a><div><p><span></span></p><p><span></span></p></div></td><td></td><td></td><td><a href='javascript:;' class='delete'>删除</a></td></tr><tr class='shoplistitem_main'><td class='list_id' data-id='2'>2</td><td><input type='text' class='shopinput' name='itemName'></td><td><input type='tel' class='shopinput count' name='requiredQuantity'></td><td class='status' data-status='false'></td><td class='detail'><a href=''></a><div><p><span></span></p><p><span></span></p></div></td><td></td><td></td><td><a href='javascript:;' class='delete'>删除</a></td></tr><tr class='shoplistitem_main'><td class='list_id' data-id='3'>3</td><td><input type='text' class='shopinput' name='itemName'></td><td><input type='tel' class='shopinput count' name='requiredQuantity'></td><td class='status' data-status='false'></td><td class='detail'><a href=''></a><div><p><span></span></p><p><span></span></p></div></td><td></td><td></td><td><a href='jvascript:;' class='delete'>删除</a></td></tr><tr class='shoplistitem_main'><td class='list_id' data-id='4'>4</td><td><input type='text' class='shopinput' name='itemName'></td><td><input type='tel' class='shopinput count' name='requiredQuantity'></td><td class='status' data-status='false'></td><td class='detail'><a href=''></a><div><p><span></span></p><p><span></span></p></div></td><td></td><td></td><td><a href='javascript:;' class='delete'>删除</a></td></tr><tr class='shoplistitem_main'><td class='list_id' data-id='5'>5</td><td><input type='text' class='shopinput' name='itemName'></td><td><input type='tel' class='shopinput count' name='requiredQuantity'></td><td class='status' data-status='false'></td><td class='detail'><a href=''></a><div><p><span></span></p><p><span></span></p></div></td><td></td><td></td><td><a href='javascript:;' class='delete'>删除</a></td></tr><tr class='shoplistitem_main'><td class='list_id' data-id='6'>6</td><td><input type='text' class='shopinput' name='itemName'></td><td><input type='tel' class='shopinput count' name='requiredQuantity'></td><td class='status' data-status='false'></td><td class='detail'><a href=''></a><div><p><span></span></p><p><span></span></p></div></td><td></td><td></td><td><a href='javascript:;' class='delete'>删除</a></td></tr><tr class='shoplistitem_main'><td class='list_id' data-id='7'>7</td><td><input type='text' class='shopinput' name='itemName'></td><td><input type='tel' class='shopinput count' name='requiredQuantity'></td><td class='status' data-status='false'></td><td class='detail'><a href=''></a><div><p><span></span></p><p><span></span></p></div></td><td></td><td></td><td><a href='javascript:;' class='delete'>删除</a></td></tr><tr class='shoplistitem_main'><td class='list_id' data-id='8'>8</td><td><input type='text' class='shopinput' name='itemName'></td><td><input type='tel' class='shopinput count' name='requiredQuantity'></td><td class='status' data-status='false'></td><td class='detail'><a href=''></a><div><p><span></span></p><p><span></span></p></div></td><td></td><td></td><td><a href='javascript:;' class='delete'>删除</a></td></tr><tr class='shoplistitem_main'><td class='list_id' data-id='9'>9</td><td><input type='text' class='shopinput' name='itemName'></td><td><input type='tel' class='shopinput count' name='requiredQuantity'></td><td class='status' data-status='false'></td><td class='detail'><a href=''></a><div><p><span></span></p><p><span></span></p></div></td><td></td><td></td><td><a href='javascript:;' class='delete'>删除</a></td></tr><tr class='shoplistitem_main'><td class='list_id' data-id='10'>10</td><td><input type='text' class='shopinput' name='itemName'></td><td><input type='tel' class='shopinput count' name='requiredQuantity'></td><td class='status' data-status='false'></td><td class='detail'><a href=''></a><div><p><span></span></p><p><span></span></p></div></td><td></td><td></td><td><a href='javascript:;' class='delete'>删除</a></td></tr></table></div><a href='javascript:;' class='shoplist_add'></a></div>");
			maxlistid++;
		});
		$('.prevshoplist').on('click', '.listopen', function() {
			$(this).closest('li').addClass('hover').siblings('li').removeClass('hover');
			var listid = $(this).closest('li').find('.shopListItemId').text();
			var datal;
			io.GET(apiConfig.shoppingList + listid, function(data) {
				if (data.success == true) {
					shopListBar.total = data;
					shopListBar.listetail = data.result.itemList;



					$('.shopListItemDetailid').text(listid);
					$('.settle_btn').attr('href', '/order/shoplist_create.html?shoplistid=' + data.result.id);
					datal = data.result.itemList;
					ListId = data.result.id;
					setTimeout(function() {
						$.each(datal, function(i, k) {
							if (k.itemStatus == '1') {
								console.log(k.itemStatus);
								$('.status').eq(i).addClass('status_true');
								$('.shoplistitem_main').eq(i).addClass('havegoods');
							}
							$('.shoplistitem_main .list_id').eq(i).text(number);
							number++;
						});
						console.log(datal);
					}, 100);
				}
			});
			// datal = $.parseJSON($.cookie()['shoplist']);
			$('.shoplistpage .shopListItemDetail').show();
		}).on('click', '.listdelete', function() {
			var listid = $(this).closest('li').find('span').text();
			$(this).closest('li').remove();
			io.DELETE(apiConfig.shoppingList + listid, {
				shoppingListId: listid
			}, function(data) {
				if (data.success == true) {
					console.log(data);
				}
			});
		});
		shoplistpage.on('click', '.shopListItemDetail .delete', function() {
			var id = $(this).closest('tr').find('.itemid span').text();
			var listid = ListId;
			io.DELETE(apiConfig.shoppingList + listid + '/item/' + id, {
				shoppingListId: listid,
				itemid: id
			}, function(data) {
				if (data.success == true) {
					shopListBar.total.result.selectedPrice = data.result.selectedPrice;
					shopListBar.total.result.selectedQuantity = data.result.selectedQuantity;
				}
			});
			$(this).closest('tr').remove();

		}).on('click', '.shopListItemDetail .concel', function() {
			$('.shopListItemDetail').hide();
			$(this).closest('.shopListItemDetail').addClass('pushconfirm pushcookie').hide();
			$(this).closest('.shopListItemDetail').find('input.shopinput').attr('readonly', true);
			// $('.prevshoplist').find('li').removeClass('hover');
		}).on('click', '.shopListItemDetail .confirm', function() {
			$(this).closest('.shopListItemDetail').find('input.shopinput').attr('readonly', true);
			var shoppingListId = $(this).closest('.shopListItemDetail').find('.shopListItemDetailid').text();
			// console.log(shoppingListId);
			var arr = {
				"id": shoppingListId,
				listModel: listModel,
				"isShoppingListModel": true,
				"currentItemId": '',
				"remarks": "string",
				"itemList": []
			}
			var shoplistitemMain = $(this).closest('.shopListItemDetail').find('.shoplistitem_main');
			if ($(this).hasClass('saveconfirm')) {
				$.each(shoplistitemMain, function(index, el) {
					var objDate = {};
					if ($(el).find('input[name=itemName]').val() == '') {
						return;
					}
					objDate.shoppingListId = shoppingListId;
					objDate.id = $(el).find('.itemid span').text();
					objDate.itemName = $(el).find('input[name=itemName]').val();
					objDate.requiredQuantity = $(el).find('input[name=requiredQuantity]').val();
					objDate.quantity = $(el).find('.num input').val();
					objDate.itemStatus = $(el).find('.status span').text();
					objDate.goodsId = $(el).find('.shopListItemgoodsid').text();
					arr.itemList.push(objDate);
				});

				io.PATCH(apiConfig.shoppingList + shoppingListId, arr, function(data) {
					if (data.success == true) {
						if (arr.itemList.length > 0) {
							arr.id = data.result.id;
							arr.currentItemId = data.result.itemList[0].id;
							arr.itemList = [];
							for (var i = 0; i < data.result.itemList.length; i++) {
								arr.itemList.push({
									"id": data.result.itemList[i].id,
									"itemName": data.result.itemList[i].itemName
								});
							}
							$.cookie('shoppingList', JSON.stringify(arr), {
								path: '/'
							});

							window.location.href = "/goods/search.html?keywords=" + encodeURIComponent(encodeURIComponent(arr.itemList[0].itemName));

						} else {
							$.cookie('shoppingList', '', {
								path: '/'
							});
						}
					}
				});
			} else {
				$.each(shoplistitemMain, function(index, el) {
					var objDate = {};
					if ($(el).find('input[name=itemName]').val() == '') {
						return;
					}
					objDate.itemName = $(el).find('input[name=itemName]').val();
					objDate.requiredQuantity = $(el).find('input[name=requiredQuantity]').val();
					arr.itemList.push(objDate);
				});

				io.POST(apiConfig.shoppingList, arr, function(data) {
					if (data.success == true) {
						if (arr.itemList.length > 0) {
							arr.id = data.result.id;
							arr.currentItemId = data.result.itemList[0].id;
							arr.itemList = [];
							for (var i = 0; i < data.result.itemList.length; i++) {
								arr.itemList.push({
									"id": data.result.itemList[i].id,
									"itemName": data.result.itemList[i].itemName
								});
							}

							$.cookie('shoppingList', JSON.stringify(arr), {
								path: '/'
							});
							window.location.href = "/goods/search.html?keywords=" + encodeURIComponent(encodeURIComponent(arr.itemList[0].itemName));

						} else {
							$.cookie('shoppingList', '', {
								path: '/'
							});
						}
					}
				});
				$(this).closest('.shopListItemDetail').addClass('pushconfirm pushcookie').hide();
			}


		}).on('click', '.shopListItemDetail .edit', function() {
			$(this).closest('.shopListItemDetail').find('input.shopinput').attr('readonly', false);
			$(this).closest('.shopListItemDetail').removeClass('pushconfirm');
			$(this).closest('.shopListItemDetail').find('.confirm').addClass('saveconfirm');


		}).on('change', '.shoplistitem_main input[name=itemName]', function() {
			$(this).next().text($(this).val());
			$(this).closest('tr').find('.status').removeClass('status_true');
			$(this).closest('tr').removeClass('havegoods');
		}).on('change', '.shoplistitem_main input[name=requiredQuantity]', function() {
			$(this).next().text($(this).val());
			$(this).closest('tr').find('.status').removeClass('status_true');
			$(this).closest('tr').removeClass('havegoods');
		}).on('click', '.shopListItemDetail .shoplist_add', function() {
			var html = "<tr class='shoplistitem_main'><td class='list_id' data-id=''>" + number + "</td><td><input type='text' class='shopinput' name='itemName'></td><td><input type='tel' class='shopinput count' name='requiredQuantity'></td><td class='status' data-status='false'></td><td class='detail'><a href=''></a><div><p><span></span></p><p><span></span></p></div></td><td></td><td></td><td></td><td><a href='javascript:;' class='delete' hidden>删除</a></td></tr>";
			number++;
			$(this).siblings('.shopListItemDetail_content').find('table').append(html);
		}).on('click', '.settle_btn', function() {

		});

		if ($.cookie()['shoppingList']) {
			var hasqiuet = $.parseJSON($.cookie()['shoppingList']).listModel;
			if (hasqiuet) {
				$('.prevshoplist , .quitshoplist').show();
				$('.shoplist_bar .shoplist').trigger('click');

			}
		}

	});
}(jQuery));