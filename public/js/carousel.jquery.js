;(function($){
	var defaults = {
		period : 3000
	};
	
	$.fn.carousel = function(options){
		
		options = $.extend({}, defaults, options);
		
		// 슬라이드 쇼
		var $slide = this, timerID, entered = false;

		$slide
			.on('click', 'a.prev, a.next', function(event){
				event.preventDefault();

				var $this  = $(this);
				var isPrev = $this.hasClass('prev'); // $this.is('.prev')
				var $first = $slide.find('li:first');
				var count  = $slide.find('li').length;
				var width  = $first.width();
				var left   = parseInt($first.css('margin-left'));
				var index  = -left/width + 1;

				if ($first.is(':animated')) return;
				// if (left % width !== 0) return;

				// 다음 슬라이드를 위한 left 값
				if (isPrev) {
					if (index === 1) {
						left = (count - 1) * -width;
					} else {
						left += width;
					}
				} else {
					if (index === count) {
						left = 0;
					} else {
						left -= width; // left = left - width;
					}
				}

				clearTimeout(timerID);
				$first.animate({'margin-left': left+'px'}, goNext);
			})
			.on('mouseenter', function(event){
				entered = true;
				clearTimeout(timerID);
			})
			.on('mouseleave', function(event){
				entered = false;
				goNext();
			});

		var $li = $slide.find('li').remove();
		$slide.find('ul').empty().append($li);

		function goNext() {
			timerID = setTimeout(function(){
				if (!entered) {
					$slide.find('a.next').click();
				}
			}, options.period);
		}

		goNext();
	};
})(jQuery);