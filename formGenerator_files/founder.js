/*jslint nomen: true, plusplus: true, sloppy: true*/
/*global console, jQuery*/
//-------------------------------------------------------------------
// 
//-------------------------------------------------------------------
var Founder = function () {

};

//Founder.

//(function ($) {
//    window.document.location.href
//}(jQuery));

var MathTools = (function () {
    function _MathTools() {

    }

    function add(a, b) {
        var c, d, e;
        try {
            c = a.toString().split(".")[1].length;
        } catch (f) {
            c = 0;
        }
        try {
            d = b.toString().split(".")[1].length;
        } catch (f) {
            d = 0;
        }
        return e = Math.pow(10, Math.max(c, d)), (mul(a, e) + mul(b, e)) / e;
    }

    function sub(a, b) {
        var c, d, e;
        try {
            c = a.toString().split(".")[1].length;
        } catch (f) {
            c = 0;
        }
        try {
            d = b.toString().split(".")[1].length;
        } catch (f) {
            d = 0;
        }
        return e = Math.pow(10, Math.max(c, d)), (mul(a, e) - mul(b, e)) / e;
    }

    function mul(a, b) {
        var c = 0,
            d = a.toString(),
            e = b.toString();
        try {
            c += d.split(".")[1].length;
        } catch (f) {}
        try {
            c += e.split(".")[1].length;
        } catch (f) {}
        return Number(d.replace(".", "")) * Number(e.replace(".", "")) / Math.pow(10, c);
    }

    function div(a, b) {
        var c, d, e = 0,
            f = 0;
        try {
            e = a.toString().split(".")[1].length;
        } catch (g) {}
        try {
            f = b.toString().split(".")[1].length;
        } catch (g) {}
        return c = Number(a.toString().replace(".", "")),
            d = Number(b.toString().replace(".", "")),
            mul(c / d, Math.pow(10, f - e));
    }

    _MathTools.add = add;
    _MathTools.sub = sub;
    _MathTools.mul = mul;
    _MathTools.div = div;

    return _MathTools;
}());

//-------------------------------------------------------------------
// 
//-------------------------------------------------------------------
(function ($) {
    'use strict';
    // 实践部分
    // 给jQuery增加一个全局函数
    $.extend({
        topWin: function (option) {
            var par = window.parent,
                win = window;

            while (par !== win) {
                win = par;
                par = par.parent;
            }
            return win;
        },
        share: function (key, value) {
            if (!$.topWin.shareObject) {
                $.topWin.shareObject = {};
            }
            var length = arguments.length;
            if (length === 1) {
                return $.topWin.shareObject[key];
            } else {
                $.topWin.shareObject[key] = value;
            }
        }
    });

    // 给button扩展一个data-click写法
    $(document).on('click.button.data-api', '[data-click]', function (e) {
        console.log('test data-click');
        var $this = $(this),
            dataClickStr = $this.attr('data-click'),
            chains = dataClickStr.split("."),
            len = chains.length,
            seg = '',
            root = null,
            dataClickFn = null,
            i;
        for (i = 0; i < len; i++) {
            seg = chains[i];
            if (i === 0) {
                root = window[seg];
                dataClickFn = root;
            } else {
                dataClickFn = dataClickFn[seg];
            }
        }
        //dataClickFn.(e);
        dataClickFn.call(root, e, $(e.target));
    });
    
    var FormModel = (function () {
        function FormModel(el, dataEx) {
            this.el = el;
            if (!dataEx) {
                dataEx = {};
            }
            this.data = $.extend({}, $(this.el).convertToObject(), dataEx);
        }
        
        // 定义方法部分
        FormModel.prototype.render = function () {
            var $tags, i, $tag, name;
            // language=JQuery-CSS
            $tags = $(this.el).find("input,select,textarea,input:radio,input:checkbox");
            for (i = 0; i < $tags.length; i++) {
                $tag = $($tags[i]);
                name = $tag.attr("name");
                if (name) {
                    if (this.data[name]) {
                        $tag.val(this.data[name]);
                    } else {
                        $tag.val('');
                    }
                }
            }
        };

        FormModel.prototype.getData = function () {
            this.data = $.extend({}, this.data, $(this.el).convertToObject());
            return this.data;
        };
        
        FormModel.prototype.updateData = function (nData) {
            this.data = $.extend(this.data, nData);
            this.render();
        };
            
        FormModel.prototype.replaceData = function (nData) {
            this.data = $.extend({}, nData);
            this.render();
        };
        
        FormModel.prototype.clear = function () {
            this.replaceData({});
        };
        
        // 结构部分
        return FormModel;
    }());

    $.fn.extend({
        formModel: function (fnDataEx) {
            var arr = [];
            // 循环的是jquery的元素
            this.each(function () {
                var $this, formModel;
                //$this = $(this);
                formModel = new FormModel(this, fnDataEx);
                arr.push(formModel);
            });
//          return new FormModel(this, fnDataEx);
//            return arr;
            return arr[0];
        }
    });
}(jQuery));
/**
 * HTML表单转为对象
 */
(function ($) {
    "use strict";
    $.fn.convertToObject = function () {

        var self = this,
            json = {},
            push_counters = {},
            patterns = {
                "validate": /^[a-zA-Z][a-zA-Z0-9_]*(?:\[(?:\d*|[a-zA-Z0-9_]+)\])*$/,
                "key": /[a-zA-Z0-9_]+|(?=\[\])/g,
                "push": /^$/,
                "fixed": /^\d+$/,
                "named": /^[a-zA-Z0-9_]+$/
            };


        this.build = function (base, key, value) {
            base[key] = value;
            return base;
        };

        this.push_counter = function (key) {
            if (push_counters[key] === undefined) {
                push_counters[key] = 0;
            }
            return push_counters[key]++;
        };

        $.each($(this).serializeArray(), function () {

            // skip invalid keys
            if (!patterns.validate.test(this.name)) {
                return;
            }

            var k,
                keys = this.name.match(patterns.key),
                merge = this.value,
                reverse_key = this.name;

            while ((k = keys.pop()) !== undefined) {

                // adjust reverse_key
                reverse_key = reverse_key.replace(new RegExp("\\[" + k + "\\]$"), '');

                // push
                if (k.match(patterns.push)) {
                    merge = self.build([], self.push_counter(reverse_key), merge);
                } else if (k.match(patterns.fixed)) {
                    // fixed
                    merge = self.build([], k, merge);
                } else if (k.match(patterns.named)) {
                    // named
                    merge = self.build({}, k, merge);
                }
            }

            json = $.extend(true, json, merge);
        });

        return json;
    };
}(jQuery));
/**
 *
 */
(function ($) {
    "use strict";
    // copy from jquery.js
    var r20 = /%20/g,
        rbracket = /\[\]$/;

    /* private method*/
    function buildParams(prefix, obj, add) {
        var name;
        if (jQuery.isArray(obj)) { // 数组
            // Serialize array item.
            jQuery.each(obj, function (i, v) {
                if (rbracket.test(prefix)) {
                    // Treat each array item as a scalar.
                    add(prefix, v);
                } else {
                    buildParams(prefix + "[" + (typeof v === "object" || jQuery.isArray(v) ? i : "") + "]", v, add);
                }
            });
        } else if (obj !== null && typeof obj === "object") { // 对象
            // Serialize object item.
            for (name in obj) {
                if (obj.hasOwnProperty(name)) {
                    buildParams(prefix + "." + name, obj[name], add);
                }
            }
        } else {
            // Serialize scalar item.
            add(prefix, obj);
        }
    }

    $.extend({
        /**
         * JS对象转param字符串
         * 对象key/value序列化
         * var obj = {a:1,b:2,c:3};
         * var k = $.paramExtend(obj);
         * alert(k);    //输出a=1&b=2&c=3
         */
        paramExtend: function (a) {
            var s = [],
                add = null,
                pro;

            add = function (key, value) {
                // If value is a function, invoke it and return its value
                value = jQuery.isFunction(value) ? value() : value;
                //                if (value === 'null') {
                //                    console.error('字符串 null 不应该出现');
                //                }
                if (value === null) {
                    console.log(key + '值为null');
                    s[s.length] = encodeURIComponent(key) + "=";
                } else {
                    s[s.length] = encodeURIComponent(key) + "=" + encodeURIComponent(value);
                }
            };

            // If an array was passed in, assume that it is an array of form elements.
            if (jQuery.isArray(a) || (a.jquery && !jQuery.isPlainObject(a))) {
                // Serialize the form elements
                jQuery.each(a, function () {
                    add(this.name, this.value); // 简单的添加
                });
            } else {
                for (pro in a) {
                    if (a.hasOwnProperty(pro)) {
                        buildParams(pro, a[pro], add);
                    }
                }
            }

            // Return the resulting serialization
            return s.join("&").replace(r20, "+");
        },
        /**
         * 返回字符串
         * 输入对象
         */
        jsonStringify: function (obj) {
            return JSON.stringify(obj);
        }
    });
}(jQuery));
