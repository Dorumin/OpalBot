(function() {
    /**
     * Name:        UI-js
     * Author:      KockaAdmiralac <1405223@gmail.com>
     * Description: Library for easier UI creation and manipulation
     * Version:     v1.1
     */

    /**
     * Mapping of attribute -> namespace for attributes such as
     * xlink:href and potentially other SVG attributes
     */
    var nsAttributes = {
        'xlink:href': 'http://www.w3.org/1999/xlink'
    };

    /**
     * Goes through each property of an object
     * @param {Object} obj Object to go through
     * @param {Function} cb Function to call when a property is found
     */
    function each(obj, cb) {
        if (typeof obj === 'object' && typeof cb === 'function') {
            for (var i in obj) {
                // Don't check if the property is valid because
                // we assume those are plain objects
                cb(i, obj[i]);
            }
        }
    }

    /**
     * Creates a DOM node with a given type
     * @param {String} type Type of the DOM node
     * @returns {Node} Requested DOM node
     */
    function createNode(type) {
        switch(type) {
            case '#text': return document.createTextNode('');
            case undefined:
            case '#document-fragment':
                return document.createDocumentFragment();
            case 'svg':
            case 'use':
            case 'g':
            case 'path':
            case 'circle':
                return document.createElementNS(
                    'http://www.w3.org/2000/svg',
                    type
                );
            default: return document.createElement(type);
        }
    }

    /**
     * Appends a node to its parent
     * @param {Node} node Node to append
     * @param {Node|String} parent node(s) to append the node to
     */
    function appendNode(node, parent) {
        if (parent instanceof Node) {
            parent.appendChild(node);
        } else if (typeof parent === 'string') {
            document.querySelectorAll(parent).forEach(function(n) {
                n.appendChild(node);
            });
        }
    }

    /**
     * Main method of the library
     * @param {Object} opt Options for creating an element
     * @param {Node} parent Which DOM node to append to
     *                      Used for children property in options
     *                      This parameter should not be used by users
     * @returns {Node} Node with given options
     */
    function main(opt, parent) {
        if (typeof opt === 'string') {
            opt = {
                type: '#text',
                text: opt
            };
        } else if (opt instanceof Node) {
            appendNode(opt, parent);
            return opt;
        } else if (typeof opt !== 'object') {
            throw new Error('Options parameter incorrect!');
        }
        if ('condition' in opt && !opt.condition) {
            return;
        }
        var el = createNode(opt.type);
        if (typeof opt.text === 'string') {
            el.textContent = opt.text;
        }
        if (typeof opt.html === 'string') {
            el.innerHTML = opt.html;
        }
        each(opt.attr, function(k, v) {
            if (typeof k === 'string') {
                if (nsAttributes[k]) {
                    el.setAttributeNS(
                        nsAttributes[k],
                        k.split(':')[1],
                        v
                    );
                } else {
                    el.setAttribute(k, v);
                }
            }
        });
        each(opt.data, function(k, v) {
            el.setAttribute('data-' + k, v);
        });
        each(opt.style, function(k, v) {
            el.style[k.toLowerCase().replace(/-(\w)/g, function(_, a) {
                return a.toUpperCase();
            })] = v;
        });
        each(opt.events, function(k, v) {
            if (typeof v === 'function') {
                el.addEventListener(k, v);
            }
        });
        if (opt.classes instanceof Array) {
            opt.classes.forEach(function(cls) {
                el.classList.add(cls);
            });
        }
        if (typeof opt.checked === 'boolean') {
            el.checked = opt.checked;
        }
        if (opt.children instanceof Array) {
            opt.children.forEach(function(c) {
                main(c, el);
            });
        }
        appendNode(el, parent || opt.parent);
        return el;
    }

    // Expose the library function
    window.ui = main;
})();

(function() {
    if (!Element.prototype.matches)
        Element.prototype.matches = Element.prototype.msMatchesSelector ||
            Element.prototype.webkitMatchesSelector;

    if (!Element.prototype.closest) {
        Element.prototype.closest = function(s) {
            var el = this;
            if (!document.documentElement.contains(el)) return null;
            do {
                if (el.matches(s)) return el;
                el = el.parentElement || el.parentNode;
            } while (el !== null && el.nodeType === 1);
            return null;
        };
    }
})();

(function() {
    var binder = [];
    for (var i in HTMLDivElement.prototype) {
        if (i.slice(0, 2) == 'on') {
            (function(ev) { // yay closures
                binder[ev] = function(fn, options) {
                    this.forEach(function(elem) {
                        elem.addEventListener(ev, fn, options);
                    });
                    return this;
                };
            })(i.slice(2));
        }
    }

    window.$ = function(selector) {
        var arr = Object.create(binder);
        if (typeof selector == 'string') {
            var elements = document.querySelectorAll(selector);
            for (var i = 0; i < elements.length; i++) {
                arr.push(elements[i]);
            }
        } else {
            arr.push(selector);
        }
        return arr;
    };

    $.msg = function(msg) {
        var args = [].slice.call(arguments, 1);
        return i18n[msg].replace(/\$(\d)/g, (s, n) => {
            return args[n - 1] || s;
        }).replace(/\(([\d\.]+?\|.+?\|.+?)\)/g, (s, match) => {
            let split = match.split('|');
            return split[0] == 1 ? split[1] : split[2];
        }).replace(/\[(.*?\/.+?)\]\((.+?)\)/g, '<a href="$1">$2</a>');
    };

    $.showModal = function(title, content, options) {
        var id = 'Modal' + Math.random().toString().replace('.', '');
        options.buttons.forEach(function(btn) {
            btn.events = btn.events || {};
            var fn = btn.events.click;
            btn.events.click = function() {
                $.hideModal('#' + id);
                if (fn) {
                    fn();
                }
            };
        });
        var modal = ui({
            type: 'div',
            classes: ['modal-wrapper'],
            attr: {
                id: id
            },
            events: {
                click: function(e) {
                    if (e.target == modal) {
                        $.hideModal('#' + id);
                    }
                }
            },
            children: [
                {
                    type: 'div',
                    classes: ['modal'],
                    children: [
                        {
                            type: 'span',
                            classes: ['modal-close'],
                            text: '✖',
                            events: {
                                click: $.bindArgs($.hideModal, '#' + id)
                            }
                        },
                        {
                            type: 'h2',
                            classes: ['modal-heading'],
                            text: title
                        },
                        {
                            type: 'div',
                            classes: ['modal-content'],
                            html: content
                        },
                        {
                            type: 'div',
                            classes: ['modal-buttons'],
                            children: options.buttons
                        }
                    ]
                }
            ],
            parent: document.body
        });
        modal.scrollHeight; /* trigger reflow */
        modal.classList.add('on-screen');
        return modal;
    };

    $.hideModal = function(sel) {
        var modal = document.querySelector(sel);
        modal.classList.remove('on-screen');
        modal.classList.add('closing');
        setTimeout(function() {
            document.body.removeChild(modal);
        }, 400);
    };

    $.bindArgs = function(fn) {
        var args = [].slice.call(arguments, 1);
        return function() {
            fn.apply(this, args);
        };
    };

    $.bindFns = function() {
        var args = [].slice.call(arguments);
        return function() {
            args.forEach(function(fn) {
                fn();
            });
        };
    };

    $.postApi = function (elem) {
        var a = elem.dataset;
        if (a && a.endpoint) {
            var xhr = new XMLHttpRequest(),
            qs = '?';
            for (var i in a) {
                if (i.slice(0, 2) == 'on') {
                    xhr[i] = new Function(a[i]);
                } else if (i != 'endpoint') {
                    qs += i + '=' + a[i] + '&';
                }
            }
            xhr.open('POST', '/ajax/' + a.endpoint + qs.slice(0, -1));
            xhr.send();
        }
    };
})();

(function() {
    $('.header').click(function() {
        var expanded = this.parentElement.classList.toggle('expanded'),
            def = this.nextElementSibling;

        def.style.height = expanded ? def.scrollHeight + 'px' : '';
    });

    $(window).resize(function() {
        var defs = document.querySelectorAll('.command.expanded .def'),
            i = defs.length;

        while (i--) {
            var def = defs[i];
            def.style.transition = 'none';
            def.style.height = '';
            def.style.height = def.scrollHeight + 'px';
            def.offsetHeight; /* trigger reflow  */
            def.style.transition = '';
        }
    }, {
        passive: true
    }).click(function(e) {
        if (!e.target.closest('.current-user, .user-dropdown')) {
            document.querySelector('.navigation-container').classList.remove('ud-open');
        }
    });

    $('.nav-item.hamburger').click(function() {
        var navigation = this.parentElement.parentElement;
        navigation.classList.toggle('open');
        navigation.classList.remove('opened');
        document.body.classList.toggle('noscroll');
        setTimeout(function() {
            if (navigation.classList.contains('open')) {
                navigation.classList.add('opened');
            }
        }, 400);
    });

    $('.current-user').click(function(e) {
        if (getComputedStyle($('.nav-item.hamburger')[0]).display == 'none') {
            e.preventDefault();
            this.parentElement.parentElement.classList.toggle('ud-open');
            var dropdown = document.querySelector('.user-dropdown'),
            arrow = document.querySelector('.dropdown-arrow'),
            avatar = this.firstElementChild;
            dropdown.style.minWidth = this.offsetWidth + 'px';
            arrow.style.right = (this.clientWidth - avatar.clientLeft - avatar.clientWidth / 2 * 3) + 'px';
        }
    });

    $('.api').click(function(e) {
        var elem = this,
        a = elem.dataset;
        if (a.modal) {
            $.showModal(
                $.msg(a.modal + '-heading'),
                $.msg(a.modal + '-content'),
                {
                    buttons: [
                        {
                            type: 'div',
                            classes: ['modal-button', 'lightblue'],
                            text: $.msg(a.modal + '-cancel')
                        },
                        {
                            type: 'div',
                            classes: ['modal-button', 'red'],
                            text: $.msg(a.modal + '-confirm'),
                            events: {
                                click: $.bindArgs($.postApi, elem)
                            }
                        }
                    ]
                }
            )
        } else {
            $.postApi(elem);
        }
    });
})();