class Carousel{
/**
 * 
 * @param {HTMLElement} element 
 * @param {Object} options 
 * @param {Object} options.slidesToScroll - number of elements to scroll
 * @param {Object} options.slidesVisible - number of elements visible in a slide
 * @param {boolean} options.loop - loop or not at the end of carousel
 * 
 */


    constructor (element, options = {}) {
        this.element = element;
        this.options = Object.assign({}, {
            slidesToScroll: 1,
            slidesVisible: 1,
            loop: false
        }, options)
        let children = [].slice.call(element.children);
        this.isMobile = false;
        this.currentItem = 0;
        this.moveCallbacks = [];

        // creation of elements, updatinf DOM
        this.root = this.createDivWithClass('carousel');
        this.container = this.createDivWithClass('carousel__container');
        this.root.setAttribute('tabindex', '0');
        this.root.appendChild(this.container);
        this.element.appendChild(this.root);
        this.items = children.map((child) => {
            let item = this.createDivWithClass('carousel__item');
            item.appendChild(child);
            this.container.appendChild(item);
            return item;
        });
        this.setStyle();
        this.createNavigation();
        
        // event
        this.moveCallbacks.forEach(cb => cb(0));
        this.onWindowResize;
        window.addEventListener('resize', this.onWindowResize.bind(this));
        this.root.addEventListener('keyup', event => {
            if (event.key === "ArrowRight") {
                this.next();
            } else if (event.key == "ArrowLeft") {
                this.prev();
            }
        });

        // new CarouselTouchPlugin(this);
    };

    /**
     * apply good dimensions on carousel's element
     */
    setStyle () {
        let ratio = this.items.length / this.slidesVisible;
        this.container.style.width = (ratio * 100) + "%";
        this.items.forEach(item => item.style.width = ((100 / this.slidesVisible) / ratio) + "%");  
    };

    createNavigation () {
        let nextButton = this.createDivWithClass('carousel__next');
        let prevButton = this.createDivWithClass('carousel__prev');
        this.root.appendChild(nextButton);
        this.root.appendChild(prevButton);
        nextButton.addEventListener('click', this.next.bind(this));
        prevButton.addEventListener('click', this.prev.bind(this));
        if (this.options.lopp === true) {
            return
        }
        this.onMove(index => {
            if (index === 0) {
                prevButton.classList.add('carousel__prev--hidden');
            } else {
                prevButton.classList.remove('carousel__prev--hidden');
            }
            if (this.items[this.currentItem + this.slidesVisible] === undefined) {
                nextButton.classList.add('carousel__next--hidden');
            } else {
                nextButton.classList.remove('carousel__next--hidden');
            }
        });
    };



    next() {
        this.goToItem(this.currentItem + this.slidesToScroll)
    };


    prev() {
        this.goToItem(this.currentItem - this.slidesToScroll)

    };


    /**
     * Deplace slider to the target element
     * @param {number} index 
     */
    goToItem (index) {
        if (index < 0) {
            if (this.options.loop) {
                index = this.items.length - this.slidesVisible;

            } else {
                return
            }
        } else if (index > this.items.length || (this.items[this.currentItem + this.slidesVisible] === undefined) && index > this.currentItem) {
            if (this.options.loop) {
                index = 0;
            } else {
                return
            }
        };
        let translateX = index * -100 / this.items.length;
        this.translate(translateX);
        this.container.style.transform = 'translate3d(' + translateX + '%, 0, 0)';
        this.currentItem = index;
        this.moveCallbacks.forEach(cb => cb(index));

    }
    
    
    
    

    
    onMove(cb) {
        this.moveCallbacks.push(cb);
    }



    onWindowResize() {
        let mobile = window.innerWidth < 800;
        if (mobile !== this.isMobile) {
            this.isMobile = mobile;
            this.setStyle();
            this.moveCallbacks.forEach(cb => cb(this.currentItem));

        }
    }


    /**
     * 
     * @param {string} className
     * @return {HTMLElement} 
     */
    createDivWithClass (className) {
        let div = document.createElement('div');
        div.setAttribute('class', className);
        return div;
    }


    disabaleTransition() {
        this.container.style.transition = "none";
    };

    enableTransition() {
        this.container.style.transition = "";
    };


    translate (percent) {
        this.container.style.transform = 'translate3d(' + percent + '%, 0, 0)';

    }



    /**
     * getter
     * @returns {number}
     */

    get slidesToScroll () {
        return this.isMobile ? 1: this.options.slidesToScroll;
    };

    get slidesVisible () {
        return this.isMobile ? 1 : this.options.slidesVisible;
    }

    get containerWidth () {
        return this.container.offsetWidth;
    }

    /**
     * @returns {number}
     */
    get carouselWidth () {
        return this.root.offsetWidth;
    }


}


/**
 * Allow navigation on touch for the carousel
 */

class CarouselTouchPlugin {

    /**
     * 
     * @param {Carousel} carousel 
     */

    constructor (carousel) {
        carousel.container.addEventListener("dragstart", event => {event.preventDefault();console.error("Je suis dans la console")});
        carousel.container.addEventListener("mousedown", this.startDrag.bind(this));
        carousel.container.addEventListener("touchstart", this.startDrag.bind(this));
        window.addEventListener("mousemove", this.drag.bind(this));
        window.addEventListener("touchmove", this.drag.bind(this));
        window.addEventListener("touchend", this.endDrag.bind(this));
        window.addEventListener("mouseup", this.endDrag.bind(this));
        window.addEventListener("touchcancel", this.endDrag.bind(this));
        this.carousel = carousel;
    };


    /**
     * allow deplacement on touch
     * @param {MouseEvent|TouchEvent} event 
     */


    startDrag(event) {
        if (event.touches) {
            if (event.touches.length > 1) {
                return;
            } else {
                event = event.touches[0];
            }
        };
        this.origin = {x: event.screenX, y: event.screenY};
        this.width = this.carousel.containerWidth;
        this.carousel.disabaleTransition();
    };



    /**
     * shift 
     * @param {MouseEvent|TouchEvent} event
     */

    drag (event) {
        if (this.origin) {
            let point = event.touches ? event.touches[0] : event;
            let translate = {x: point.screenX - this.origin.x, y: point.screenY - this.origin.y};
            if (event.touches && Math.abs(translate.x) > Math.abs(translate.y)) {
                event.preventDefault();
                event.stopPropagation();
            };
            let baseTranslate = this.carousel.currentItem * -100 / this.carousel.items.length;
            this.lastTranslate = translate
            this.carousel.translate(baseTranslate + 100 * translate.x / this.width);

        }
    }


     /**
     * end of deplacement
     * @param {MouseEvent|TouchEvent} event
     */
    endDrag (event) {
        if (this.origin && this.lastTranslate) {
            this.carousel.enableTransition();
            if (Math.abs(this.lastTranslate.x / this.carousel.carouselWidth) > 0.2) {
                if (this.lastTranslate.x < 0) {
                    this.carousel.next();
                } else {
                    this.carousel.prev();
                }
            } else {
                this.carousel.goToItem(this.carousel.currentItem);
            }
        }
        this.origin = null;
    }


};

// only change of 1 slide wathever the value of the drag is





new CarouselTouchPlugin(new Carousel(document.querySelector("#carousel1")), {
    slidesToScroll: 1,
    slidesVisible: 1,
    loop: true
});