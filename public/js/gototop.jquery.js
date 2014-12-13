;(function($){
	var defaults = {
		speed : 1000,
		padding : [10, 40],
		hoverColor : 'red'
	};
	
	$.fn.gotoTop = function(options) {
		options = $.extend({}, defaults, options);

		this
			.on('click', function(event){
				var runOnce = false;

				event.preventDefault();
				$('html,body').animate({  // Firefox도 지원하기 위해 html,body 사용
					scrollTop : 0
				}, options.speed);
			})
			.on('mouseover', function(event){
				$(this)
					.css('opacity', 1)
					.css('color', options.hoverColor)
					.stop()
					.animate({
						padding : options.padding[1]+'px'
					});
			})
			.on('mouseout', function(event){
				$(this)
					.css('opacity', '')
					.css('color', '')
					.stop()
					.animate({
						padding : options.padding[0]+'px'
					});
			});
	};
})(jQuery);