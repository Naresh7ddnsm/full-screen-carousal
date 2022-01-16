/* global window, document, define, jQuery, setInterval, clearInterval */
(function($) {
    'use strict';
    var Carousel = Carousel || {};

    Carousel = (function(){
        function Carousel(element, settings){
            var _ = this;
            _.slider = element;
            _.defaults = {
                swiper: true,
                slideInterval: 2000,
            }
            _.options = $.extend({}, _.defaults, settings);
            // console.log("option", _.options);
            // ww = window.innerWidth,
            _.isDragging = false;
            _.startPos = 0;
            _.currentTranslate = 0;
            _.prevTranslate = 0;
            _.animationID;
            _.currentIndex = 0;
            _.swipeToslide = 200;
            _.play;
            _.slides = Array.from(element.querySelectorAll('.slide'));

            _.init();
        }   
        return Carousel;
    }());
    Carousel.prototype.slideEvents = function(){
        var _ = this;
        _.slides.forEach(function(slide, index){
            var slideImage = slide.querySelector('img')
            // disable default image drag
            slideImage && slideImage.addEventListener('dragstart', (e) => e.preventDefault())
            if(_.options.swiper){
                // touch events
                slide.addEventListener('touchstart', function(event){
                    _.touchStart(event, index, _)
                })
                slide.addEventListener('touchend', function(){
                    _.touchEnd(_);
                })
                slide.addEventListener('touchmove', function(event){
                    _.touchMove(event, _)
                })
                // mouse events
                slide.addEventListener('mousedown', function(event){
                    _.touchStart(event, index, _)
                })
                slide.addEventListener('mouseup', function(){
                    _.touchEnd(_);
                })
                slide.addEventListener('mousemove', function(event){
                    _.touchMove(event, _)
                })
                slide.addEventListener('mouseleave', function(){
                    _.touchEnd(_);
                })
            }
        })
        window.addEventListener('resize', _.setPositionByIndex)
    }
    Carousel.prototype.disableContaxtSelect = function(event){
        event.preventDefault()
        event.stopPropagation()
        return false
    }
    Carousel.prototype.getPositionX = function(event) {
        // console.log("event", event.type)
        // console.log(event.type.includes('mouse'))
        return event.type.includes('mouse') ? event.pageX : event.touches[0].clientX
    }
    
    Carousel.prototype.touchStart = function(event, index, _){
        var _ = _;
        // return function (event) {
        _.currentIndex = index
        _.startPos = _.getPositionX(event)
        _.isDragging = true
        _.animationID = requestAnimationFrame(function(){_.animation(_)})
        _.slider.classList.add('grabbing')
        // }
    }
    Carousel.prototype.touchMove = function(event, _) {
        var _ = _;
        if (_.isDragging) {
            var currentPosition = _.getPositionX(event)
            _.currentTranslate = _.prevTranslate + currentPosition - _.startPos
        }
    }
    
    Carousel.prototype.touchEnd = function(_) {
        var _ = _;
        cancelAnimationFrame(_.animationID)
        _.isDragging = false
        var movedBy = _.currentTranslate - _.prevTranslate
        
        // if moved enough negative then snap to next slide if there is one
        if (movedBy < -_.swipeToslide && _.currentIndex < _.slides.length - 1) _.currentIndex += 1
        
        // if moved enough positive then snap to previous slide if there is one
        if (movedBy > _.swipeToslide && _.currentIndex > 0) _.currentIndex -= 1
        
        // Reset the autoplay timer
        _.resetPlay()
        
        _.setPositionByIndex(_)

        _.slider.classList.remove('grabbing')
    }
    
    Carousel.prototype.animation = function() {
        var _ = this;
        _.setSliderPosition();
        if (_.isDragging) requestAnimationFrame(function(){_.animation(_)})
    }
    
    Carousel.prototype.setPositionByIndex = function() {
        var _ = this;
        _.currentTranslate = _.currentIndex * -window.innerWidth
        _.prevTranslate = _.currentTranslate
        _.setSliderPosition()
    }
    Carousel.prototype.resetPlay = function(){
        var _ = this;
        clearInterval(_.play);
        _.play = setInterval(function(){_.autoplay(_)}, _.options.slideInterval);
    }
    Carousel.prototype.setSliderPosition = function(){
        var _ = this;
        _.slider.style.transform = `translateX(${_.currentTranslate}px)`
    }
    
    Carousel.prototype.autoplay = function(_){
        var _ = _;
        if(_.currentIndex < _.slides.length - 1){
            _.currentIndex++
            _.setPositionByIndex()
        }
    }
    
    Carousel.prototype.init = function(){
        var _ = this;
        _.slideEvents();
        _.play = setInterval(function(){_.autoplay(_)}, _.options.slideInterval);
    }
    $.fn.carousel = function() {
        var _ = this,
            opt = arguments[0],
            args = Array.prototype.slice.call(arguments, 1),
            l = _.length,
            i,
            ret;
        for (i = 0; i < l; i++) {
            if (typeof opt == 'object' || typeof opt == 'undefined'){
                _[i].carousel = new Carousel(_[i], opt);
            }
            else
                ret = _[i].carousel[opt].apply(_[i].carousel, args);
            if (typeof ret != 'undefined') return ret;
        }
        return _;
    };
})(jQuery);