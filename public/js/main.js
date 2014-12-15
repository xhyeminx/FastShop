jQuery(function($){

	$('.carousel').carousel({period:1000});

	// 사용법
	/*
	$('a.top').gotoTop({
		padding : [10, 20]
	});
	*/
	$('a.top').gotoTop({
		speed : 3000, // 이동시간
		padding : [10, 30], // 마우스를 안 올렸을 때 패딩, 올렸을 때 패딩
		hoverColor : 'blue' // 마우스를 올렸을 때 글자 색상
	});

	$('#content .items')
		.on('mouseenter mouseleave', 'a', function(event){
			var fontWeight = '', padding = '';

			if (event.type == 'mouseenter') {
				fontWeight = 'bold';
				padding = '30px';
			}
		
			$(this).find('p')
				.css('font-weight', fontWeight)
				.stop()
				.animate({
					paddingTop : padding,
					paddingBottom : padding
				});
		});
	
	// 16일차 과제 2번을 개선하여 마우스를 올렸을 때
	// 페이드인/페이드아웃 애니메이션을 구현한다.
	$('#content.category .stream')
		.on('mouseenter mouseleave', 'li > a', function(event){
			var $this = $(this), $img = $this.find('img'), src, idx;
		
			// 이미지가 한 개일 때 새 이미지를 앞에 하나 추가한다.
			if ($img.length === 1) {
				// 화면에 안 보이는 상태로 추가했다가...
				$('<img>').css('opacity', 0).insertBefore($img);
				$img = $this.find('img');
			}
		
			// 여기서는 반드시 이미지가 2개가 된다.
			if (event.type == 'mouseenter') {
				src = $img.eq(1).attr('src');
				idx = src.indexOf('_1.jpg');
				src = src.substr(0, idx) + '_2.jpg';

				$img.eq(0)
					.load(function(){
						// _2.jpg 이미지를 보여줘야 한다.
						$(this)
							.prop('loaded', true)
							.stop()
							.animate({opacity:1});
					
						// _2.jpg를 보여줄 때 _1.jpg는 투명하게 만든다.
						$img.eq(1).stop().animate({opacity:0});
					})
					.attr('src', src);

				// load 이벤트는 이미지를 처음 읽을 때만 발생하므로
				// loaded 프로퍼티를 두어 한 번 읽힌 상태면 로딩되기를 기다리지 않고
				// load 이벤트를 즉시 실행하도록 한다.
				if ($img.eq(0).prop('loaded')) {
					$img.eq(0).trigger('load'); // 또는 $img.eq(0).load();
				}
			} else {
				// _1.jpg 이미지를 보여줘야 한다.
				$img.eq(1).stop().animate({opacity:1});
				// _2.jpg 이미지는 투명하게 만들어야 한다.
				$img.eq(0).stop().animate({opacity:0});
			}

		});

	/*
	- type은	POST
	- url은 /api/login
	- 보내야 할 데이터는 email, password
	- 받는 데이터는 JSON 형식
	*/
	
	$('form.signup').on('submit', function(event){
		event.preventDefault();
		
		var $this = $(this);
		var email = $('#email').val();
		var password = $('#password').val();

		// 과제1 : email이나 password의 값이 빈 문자열이면
		// 입력하라고 경고한 후 함수를 종료한다.
		
		// 중복 전송이 안되도록 submit 버튼을 사용할 수 없게 설정
		var $button = $this.find('button[type="submit"]');
		$button.attr('disabled', 'disabled'); // <button type="submit" disabled="disabled">
		// 또는 $button.prop('disabled', true);

		// 로그인 Ajax 전송
		$.ajax({
			type : 'POST',
			url  : '/api/login',
			data : {email:email, password:password},
			dataType : 'json', // 과제2 : dataType에서 사용할 수 있는 값은? (API 문서 참조)
			success : function(data) {
				if ('error' in data) {
					alert(data.error);
				} else {
					location.href = '/';
				}
			},
			error : function() {	
			},
			complete : function() {
				// submit 버튼을 다시 사용할 수 있게 설정
				$button.removeAttr('disabled');
				// 또는 $button.prop('disabled', false);
			}
		});
	});
});















