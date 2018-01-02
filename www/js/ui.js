(function() {
    function each(obj, cb) {
        if(typeof obj === 'object') {
            for(var i in obj) {
                if(typeof cb === 'function') {
                    cb(i, obj[i]);
                }
            }
        }
    }

    window.ui = function(obj) {
        if (typeof obj == 'string') return document.createTextNode(obj);
        var tag = document.createElement(obj.tag || 'div');

        each(obj, function(key, value) {
            var value = obj[key];
            switch(key) {
                case 'attrs':
                    each(value, function(attr, val) {
                        tag.setAttribute(attr, val);
                    });
                    break;
                case 'children':
                    if (value.constructor == Array) {
                        each(value, function(i, el) {
                            tag.appendChild(ui(el));
                        });
                    } else {
                        tag.appendChild(ui(value));
                    }
                    break;
                case 'events': 
                    each(value, function(event, fn) {
                        tag.addEventListener(event, fn);
                    });
                    break;
                case 'style': 
                    each(value, function(k, v) {
                        tag.style[k] = v;
                    });
                    break;
                case 'text':
                    tag.textContent = value;
                    break;
                case 'html':
                    tag.innerHTML = value;
                    break;
                case 'tag':
                    break;
                default:
                    tag[key] = value;
            }
        });

        return tag;
    };
})();