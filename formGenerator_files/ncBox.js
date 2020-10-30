$.fn.extend({
	ncBox : function(option){
		var proto = this.constructor.prototype;
		var ncBox = new __ncBox(option);
		
		ncBox.$box = this;
		ncBox.create();
		
		if(!proto.innerMap){
			proto.innerMap = {};
		}
		
		var selector = this.selector?this.selector:Math.round(Math.random()*100000);
		
		proto.innerMap[selector] = {
		    box: ncBox,
		}
		this.constructor.prototype.getNcBox = function(){
			var selector = this.attr("innerId");
			return this.constructor.prototype.innerMap[selector].box;
		};
		if(option && option.complete){
			option.complete.call(this);
		}
		
		this.attr("innerId", selector);
	}
});

function __ncBox(option){
	this.option = option?option:{};
	
	this.create = function(option){
		option = option?option:{};
		
		var myself = this;
		
		var close = function(){
			var option = myself.option;
			if(option && option.event && option.event.close){
				option.event.close.call(myself);
			}else{
				myself.close();
			}
		};

		this.$box.find(".ncBoxBtn.close").unbind("click.a");
		this.$box.find(".ncBoxBtn.close").bind("click.a", close);
		
		var save = function(){
			var option = myself.option;
			if(option && option.event && option.event.save){
				option.event.save.call(myself);
			}
		};
		
		this.$box.find(".ncBoxBtn.save").unbind("click.a");
		this.$box.find(".ncBoxBtn.save").bind("click.a", save);
		
		var reset = function(){
			var option = myself.option;
			if(option && option.event && option.event.reset){
				option.event.reset.call(myself);
			}
		};
		
		this.$box.find(".ncBoxBtn.reset").unbind("click.a");
		this.$box.find(".ncBoxBtn.reset").bind("click.a", reset);
		
		var del = function(){
			var option = myself.option;
			if(option && option.event && option.event.del){
				option.event.del.call(myself);
			}
		}
		
		this.$box.find(".ncBoxBtn.delete").unbind("click.a");
		this.$box.find(".ncBoxBtn.delete").bind("click.a", del);
		
		//是否支持鼠标移动BOX
		if(this.option.canMove || option.canMove){
			var mousedown = function(e){
				myself._ismousedown = true;
				myself.offset = {
					left:myself.px2Num(myself.$box.css("left")), 
					top:myself.px2Num(myself.$box.css("top")),
					startX:e.pageX,
					startY:e.pageY
				}
			};
			
			this.$box.find(".ncBoxHead").unbind("mousedown.a");
			this.$box.find(".ncBoxHead").bind("mousedown.a", mousedown);
			
			var mouseup = function(){
				myself._ismousedown = false;
			};
			
			$(document).unbind("mouseup.a");
			$(document).bind("mouseup.a", mouseup);
			
			var mousemove = function(e){
				if(myself._ismousedown){
					var l = myself.offset.startX - e.pageX;
					var t = myself.offset.startY - e.pageY;
					myself.$box.css({left:myself.offset.left - l, top:myself.offset.top - t});
				}
			};
			
			this.$box.find(".ncBoxHead").unbind("mousemove.a");
			this.$box.find(".ncBoxHead").bind("mousemove.a", mousemove);
		}
		
		var keydown = function(evt){
			if(evt.keyCode == 27){
				var map = $(".ncBox").constructor.prototype.innerMap;
				for(var i in map){
					if(!map[i].box) continue;
					map[i].box.close();
				}
			}
		};
		
		$(window).unbind("keydown.a");
		$(window).bind("keydown.a", keydown);
	}
	
	this.show = function(option, noEventTrigger){
		this._sOpt = option;
		this.option = this.option?this.option:{};
		this.option = $.extend(this.option, option);
		
		if(this.option.headHidden){
	    	this.$box.find(".ncBoxHead").hide();
	    }else{
	    	this.$box.find(".ncBoxHead").show();
	    }
		
		if(this.option.title){
			this.$box.find(".ncBoxHead").html(this.option.title);
		}
		
		if(this.option.displayMode != "modeless"){
			var $mask = $("<div class='ncMask'></div>");
			$mask.css({left:0, top:0, height:$(window).height()});
			
			if(this.option.zIndex){
				$mask.css({"z-index":this.option.zIndex - 1});
			}
			
			$("body").append($mask);
		}
		
		if(this.option.beforeShow && !noEventTrigger){
			this.option.beforeShow.call(this);
		}
		
		if(this.option.noBorder){
			this.$box.css({"border":"0px"});
		}
		
		if(this.option.zIndex){
			this.$box.css({"z-index":this.option.zIndex});
		}
		
	    this.$box.addClass("show");
	    
        var s = this.locate(option);
	    
	    this.option = $.extend(this.option, s);
	    
	    if(this.option.afterShow && !noEventTrigger){
	    	this.option.afterShow.call(this);
	    }
	}
	
	this.locate = function(option){
		var left = 0;
		var top = 0;
    	var width = 0;
    	var height = 0;
    	var s = {};
    	
	    if(this.option.boxSize == "fill"){
	    	left = option && option.left?option.left:0;
	    	top = option && option.top?option.top:0;
	    	
	    	width = option && option.width?option.width:$(window).width();
	        height = option && option.height?option.height:$(window).height();
	    	
	    	var maxHeight = 0;
	    	if(option && option.headHidden){
	    		maxHeight = height 
    		        - this._getElementHeight(this.$box.find(".ncBoxFoot")) - 4;
	    	}else{
	    		maxHeight = height
	    		    - this._getElementHeight(this.$box.find(".ncBoxHead")) 
	    		    - this._getElementHeight(this.$box.find(".ncBoxFoot")) - 4;
	    	}
	    	
	    	s = {left:left + 1, top:top + 1, width:width - 4, height:height - 4};
        	
	    	this.$box.css(s);	
        	this.$box.find(".ncBoxBody").css({"height":maxHeight, "max-height":maxHeight});
		}else{
			left = option && option.left?option.left:($(window).width()-this.$box.width())/2;
	    	top = option && option.top?option.top:($(window).height()-this.$box.height())/2;
			
	    	s = {left:left, top:top};
	    	
	    	if(option){
	    		if(option.width){
		    		s = $.extend(s, {width:option.width});
		    	}
		    	if(option.height){
		    		s = $.extend(s, {height:option.height});
		    	}
	    	}
	    	
			this.$box.css(s);	
		}
	    
	    return s;
	}
	
	this.close = function(){
		if(this.$box.attr("class").indexOf("show") < 0) return;
		
		$("body").find(".ncMask").remove();
		this.$box.removeClass("show");
		
		if(this.option.afterClose){
			this.option.afterClose.call(this);
		}
	}
	
	this.resize = function(){
		if(!this._sOpt) return;
		
		var cla = this.$box.attr("class");
		if(!cla || cla.indexOf("show") < 0) return;
		
		this.show(this._sOpt, true);
	}
	
	this._getElementHeight = function($ele, type){
		return $ele.height() + this.px2Num($ele.css("padding-top")) + this.px2Num($ele.css("padding-bottom")) + 
                              this.px2Num($ele.css("margin-top")) + this.px2Num($ele.css("margin-bottom")) +
                              this.px2Num($ele.css("border-top-width")) + this.px2Num($ele.css("border-bottom-width"));
	}
	
	//内部方法：像素转数字
	this.px2Num = function(px){
    	if(!px){
    		return 0;
    	}else if(px.indexOf("px") > 0){
    		return Number(px.substring(0,px.indexOf("px")));
    	}
    	return Number(px);
    }
}