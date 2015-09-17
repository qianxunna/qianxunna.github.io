$(function() {
	var oFilter = {
		search_key: '',
		lable_id: 0,
		sort: 0,
		des_city_id: 0,
		more: true, // 是否还可以加载更多 
		noresult: true // 没有搜索结果
	};
	var requestData = {};
	var arrSortText = ['默认排序', '价格低到高', '价格高到低', '销量低到高', '销量高到低', '人气低到高', '人气高到低', '距离最近'];
	oFilter.search_key = converseSearchToJson().search_key;
	initPage(oFilter);
	function initPage(oFilter) {
		$('.m-product').html('');
		$('.w-loading').show(0);
		$('.m-search .search-input').val(oFilter.search_key);
		requestData = {
			search_key: oFilter.search_key,
			now_page: 1, // 页
			lable_id: oFilter.lable_id, // 标签, 产品类型
			sort: oFilter.sort, // 排序
			des_city_id: oFilter.des_city_id // 所有城市
		}
		$.ajax({
			url: 'http://' + AJAX_DOMAIN + '/filter/ajaxSearchList',
			type: 'GET',
			dataType: 'json',
			data: requestData,
		})
		.done(function(data) {
			if(data.status == 200) {
				var oData = data.data;
				if(oData.search_list.length) { // 有结果
					var s = creatOptions(oData),
						t = createProduct(oData);
					$('.m-filter .content').html(s);
					if(oData.search_list.length != 5) { // 第一次就加载完了
						setTimeout(function() {
							$('.w-loading').hide(0);
							$('.m-product').html(t);
							encodeHref();
							$(document).trigger('scroll.lazyImg');
						}, 800);
						oFilter.more = false;
					}else {
						$('.m-tips').text('正在加载~').parent().show(0).delay(400).hide(0);
						setTimeout(function() {
							$('.m-product').html(t);
							encodeHref();
							$(document).trigger('scroll.lazyImg');
						}, 800);
						oFilter.more = true;
					}
					oFilter.noresult = false;
				}else { // 无结果
					var s = '';
					s += '<article class="m-noresult">';
					s += 	'<div class="w-noresult">';
					s += 		'<div class="iconfont icon-notfound"></div>';
					s += 		'<div class="text">'
					s +=			'<p>小游智商捉急啦~<p>';
					s +=			'<p>猜不到客官要搜索什么~<p>';
					s += 		'</div>';
					s += 	'</div>';
					s += '</article>';
					oFilter.more = false;
					oFilter.noresult = true;
					$('.m-filter .content').html('');
					setTimeout(function() {
						$('.w-loading').hide(0);
						$('.m-product').html(s);
					},800);
				}
			}
		})
		.fail(function() {
			console.log('fail')
		});
	}
	var arrFilter = ['lable_id', 'sort', 'des_city_id'];
	$('.m-filter').on('click', 'li', function() {
		var i = $(this).parents('.item').index(),
			s = arrFilter[i];
		oFilter[s] = $(this).data(s);
		initPage(oFilter);
	});
	$('#form-search').on('submit', function() {
		oFilter.search_key = $.trim($('#search-input').val());
		initPage(oFilter);
		var sUrl = 'http://' + AJAX_DOMAIN + '/filter/webSearchList?search_key=' + encodeURIComponent(oFilter.search_key);

		var	cookieHistory = $.cookie('cookieHistory') || '';
		cookieHistory = (cookieHistory == '') ? [] : cookieHistory.split('|');
		if(!oFilter.search_key) {
			alert('请输入关键字~');
			return false;
		}
		if($.inArray(oFilter.search_key, cookieHistory) === -1) {
			if(cookieHistory.length >= 5) {
				cookieHistory.shift();
			}
			cookieHistory.pop(oFilter.search_key);
			cookieHistory = cookieHistory.join('|');
			$.cookie('cookieHistory', cookieHistory, {expires: 30, path: '/'})
		}

		window.history.replaceState({}, '', sUrl);
		return false;
	});
	$('.m-search .btn-search').click(function() {
		$('#form-search').submit();
	});
	function converseSearchToJson() {
		var o = {},
			a = window.location.search.substring(1).split('&');
		for(var i = 0, l = a.length; i < l; i++) {
			var b = a[i].split('=');
			o[decodeURIComponent(b[0])] = decodeURIComponent(b[1]);
		}
		return o;
	}
	function converseJsonToSearch(o) {
		var s = '';
		for(var a in o) {
			s += '&' + encodeURIComponent(a) + '=' + encodeURIComponent(o[a]);
		}
		s = '?' + s.substring(1);
		return s;
	}
	function creatOptions(o) {
		var s = '',
			label = o.lable_show,
			sort = [],
			city = o.all_online_city,
			total = 0;
		for(var i = 0, l = label.length; i < l; i++) {
			total += label[i].num;
		}
		s += '<div class="item label hide">';
		s += 	'<ul>';
		s += 		'<li data-lable_id="0">';
		s += 			'<span class="name">全部分类</span>';
		s += 			'<span class="num">' + total + '个</span>';
		s += 		'</li>';
		for(var i = 0, l = label.length; i < l; i++) {
			if(label[i].num === 0) {
				continue;
			}
			s += 	'<li data-lable_id="' + label[i].lable_id + '">';
			s += 		'<span class="name">' + label[i].name + '</span>';
			s += 		'<span class="num">' + label[i].num + '个</span>';
			s += 	'</li>';
		}
		s += 	'</ul>';
		s += '</div>';
		s += '<div class="item sort hide">';
		s += 	'<ul>';
		for(var i = 0, l = arrSortText.length; i < l; i++) {
			s += 	'<li data-sort="' + i + '">' + arrSortText[i] + '</li>';
		}
		s += 	'</ul>';
		s += '</div>';
		s += '<div class="item city hide">';
		s += 	'<ul>';
		if(city.length > 1) {
			s += 	'<li data-des_city_id="' + 0 + '">' + '全部城市' + '</li>';
		}
		for(var i = 0, l = city.length; i < l; i++) {
			s += 	'<li data-des_city_id="' + city[i].des_city_id + '">' + city[i].name + '</li>';
		}
		s += 	'</ul>';
		s += '</div>';
		return s;
	}
	function createProduct(a) {
		var s = '',
			a = a.search_list;
		for(var i = 0, len = a.length; i < len; i++) {
			var o = a[i];
			s += '	<a href="/detail/productdetail/?hidenav=' + HIDE_NAV + '&id=' + o.product_id + '&type_id=' + o.type_id + '&version=2" class="item">';
			s += 	'<div class="pic">';
			s += 		'<img class="img" src="" alt="" data-src="' + o.image + '">';
			s += 	'</div>';
			s += 	'<div class="label">' + (o.type_id === 15 || o.tips_text ? '代金券' : (o.day_available == 0 ? '当日可用' : o.day_available == 1 ? '次日可用' : '') ) + '</div>';
			s += 	'<div class="layer">';
			s += 		'<div class="rmb">RMB￥</div>';
			s += 		'<div class="price">' + o.price + '</div>';
			s += 	'</div>';
			s += 	'<div class="foot">';
			s += 		'<div class="title">' + o.title + '</div>';
			s += 		'<div class="info">';
			s += 			'<del class="oldprice">￥' + o.sale_price + '</del>';
			if(o.type_id == 1) {
			s += 			'<div class="stars">';
				for(var j = 0, l = o.level; j < l; j++) {
			s +=				'<div class="iconfont icon-xingxing"></div>';
				}
			s += 			'</div>';
			}
			s += 		'</div>';
			s += 	'</div>';
			s += '</a>';
		}
		return s;
	}
	function base64_encode(str) {
		var c1, c2, c3;
		var base64EncodeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
		var i = 0,
			len = str.length,
			string = '';

		while (i < len) {
			c1 = str.charCodeAt(i++) & 0xff;
			if (i == len) {
				string += base64EncodeChars.charAt(c1 >> 2);
				string += base64EncodeChars.charAt((c1 & 0x3) << 4);
				string += "==";
				break;
			}
			c2 = str.charCodeAt(i++);
			if (i == len) {
				string += base64EncodeChars.charAt(c1 >> 2);
				string += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
				string += base64EncodeChars.charAt((c2 & 0xF) << 2);
				string += "=";
				break;
			}
			c3 = str.charCodeAt(i++);
			string += base64EncodeChars.charAt(c1 >> 2);
			string += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
			string += base64EncodeChars.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6));
			string += base64EncodeChars.charAt(c3 & 0x3F)
		}
		return string
	}
	function encodeHref() {
		$('.m-product .item').attr('href', function(i, a) {
			return a + '&fromUrl=' + base64_encode(window.location.href);
		});
	}

	$(window).scroll(function() {
		setTimeout(function() {
			if ($('body').height() == $(window).scrollTop() + $(window).height()) {
				if(!oFilter.more) {
					$('.w-loading').hide(0);
					$('.m-tips').text('已加载完毕').parent().show(0).delay(400).hide(0);
					return false;
				}
				requestData.now_page ++;
				$.ajax({
					url: 'http://' + AJAX_DOMAIN + '/filter/ajaxSearchList',
					type: 'GET',
					dataType: 'json',
					data: requestData,
					timeout: 10000
				})
				.done(function(data) {
					if(data.status == 200) {
						var oData = data.data;
						if(oData.search_list.length) { // 有数据
							var t = createProduct(oData);
							setTimeout(function() {
								$('.m-product').append(t);
							},800)
							oFilter.more = true;
						}else {
							oFilter.more = false;
						}
					}
				})
				.fail(function(data) {
					// alert('数据已加载完咯~');
				});
			}
		}, 200);
	});

	// 图片懒加载
	$(document).on('scroll.lazyImg', function() {
		setTimeout(function() {
			var iScrollTop = $(this).scrollTop(),
				$imgs = $('.m-product .img');
			$imgs.each(function(i,e){
				var $this = $(this);
				if(iScrollTop >= $this.offset().top - $(window).height()){
					if(!$this.attr('src')) {
						$this.attr('src',$this.data('src'));
					}
				}
			});
		}, 200);
	});
	// 弹出选项
	$('#m-crumb .item').click(function() {
		if(oFilter.noresult) {
			return false;
		}
		var $this = $(this),
			iIndexItem = $this.index(),
			sText = $this.text();
		$('#m-filter').show(0).find('.item ').hide(0).eq(iIndexItem).show(0).find('li').filter(function() {
				return $(this).text() === sText || $(this).find('.name').text() === sText;
		}).addClass('active');
	});
	// 单击筛选
	$('#m-filter').on('click', 'li', function() {
		var $this = $(this),
			iIndexThis = $(this).index(),
			iIndexItem = $this.closest('.item').index(),
			sText = $this.find('.name').text() || $this.text();
		$this.siblings().removeClass('active').end().addClass('active');
		$('#m-crumb .item').eq(iIndexItem).text(sText);
		$('#m-filter').hide(0).find('.item ').hide(0);
		return false;
	});
	// 关闭筛选
	$('#btn-layer, #btn-cancel').click(function() {
		$('#m-filter').hide(0).find('.item ').hide(0);
		return false;
	});
	// 返回首页
	$('#btn-back').click(function() {
		window.location.href = 'http://' + AJAX_DOMAIN ;
	});
});