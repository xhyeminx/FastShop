jQuery(function($){
	$('.slider .thumbnail')
		.on('click', 'a', function(event){
			event.preventDefault();
			var $this = $(this), $li = $this.closest('li'), idx = $li.prevAll('li').length;

			$li.addClass('active').siblings('li.active').removeClass('active');
		})
		.find('a').eq(0).click().end().end();

	$('.details dt a').click(function(event){
		event.preventDefault();
		$(this).parent().toggleClass('collapsed').next('dd').toggleClass('collapsed');
	});
	
	// 색상 옵션 가져오기
	$.ajax({
		type : 'GET',
		url  : '/api/products/' + productID + '/options',
		dataType : 'json',
		success  : function(data) {
			//$('.color > select').html('<option>'+data.options.join('</option><option>')+'</option>');
			var html = '';
			
			for (var i=0; i < data.options.length; i++) {
				html += '<option value="'+data.options[i]+'">' + data.options[i] + '</option>';
			}
			
			$('.color > select').html(html).trigger('change');
		}
	});

	// 색상이 변경되면 사이즈 옵션 가져와서 보여주기
	$('.color > select').on('change', function(event){
		var $this = $(this), color = $this.val();

		// API : GET /api/products/PRODUCT_ID/options/색상으로 요청하면
		// 사이즈 값과 해당하는 옵션 아이디를 알 수 있다.
		// <option value="옵션아이디">사이즈</option>으로 셀렉트 박스의 옵션을 만들어 추가하라.
		$.ajax({
			type : 'GET',
			url  : '/api/products/' + productID + '/options/' + color,
			dataType : 'json',
			success : function(data) {
				var html = '';
			
				for (var i=0; i < data.options.length; i++) {
					html += '<option value="'+data.options[i].id+'">' + data.options[i].name + '</option>';
				}

				$('.size > select').html(html);
			}
		});
	});

	// 카트에 아이템 추가하기
	/*
	Add To Cart 버튼을 클릭하면, POST 방식으로 /api/cart에 요청
	전송할 데이터 : option_id는 옵션 아이디, quantity는 수량=1
	수신할 데이터 형식은 JSON
	*/
	$('#add_to_cart').on('click', function(event){
		$.ajax({
			type: 'POST',
			url: '/api/cart',
			data : {option_id: $('.size > select').val(), quantity: 1},
			dataType : 'json',
			success : function(data)  {
				
			}
		});
	});
});