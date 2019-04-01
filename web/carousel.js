var carousel = {
    props: {
        index: { 
			type: Number, 
			default: 0 
		},
		slides: {
			type: Number,
			default: 3
		}
    },
    render: function() {
        return this.$scopedSlots.default({
            index: this.currentState,
            next: this.next,
            back: this.back,
            jump: this.jump,
			curIndex: this.curIndex
        })
    },
    data: function() {
        return { index: this.index }
    },
    methods: {
        next: function() {
			if(this.index == this.slides-1){
				this.index = 0;
			} else {
				this.index++;
			}
        },
        back: function() {
            if(this.index == 0){
				this.index = this.slides-1;
			} else {
				this.index--;
			}
        },
        jump: function(slideIndex) {
            this.index = slideIndex;
        },
		curIndex: function(){
			return this.index;
		}
		
    }
}


function findAncestor (el, cls) {
    while ((el = el.parentNode) && el && el.className && typeof(el.className.indexOf) === 'function' && el.className.indexOf(cls) < 0);
    return el;
}

Vue.directive('focus', {
  // The `componentUpdated` hook get's called everytime the component & it's children has been updated.
  componentUpdated: function(el, binding, vnode) {
    /*
     `binding.value` is the result of the expression passed to the directive. 
     In this case if it's true, the textfield should be focused. 
		 */
    if(findAncestor(event.target, 'carousel') != undefined && binding.value){
      el.focus();
    }
  }
});
