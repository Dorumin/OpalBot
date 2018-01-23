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
        this.parentElement.parentElement.classList.toggle('open');
        document.body.classList.toggle('noscroll');
    });

    $('.current-user').click(function(e) {
        if (document.body.scrollWidth > 680) {
            e.preventDefault();
            this.parentElement.parentElement.classList.toggle('ud-open');
            var dropdown = document.querySelector('.user-dropdown'),
            arrow = document.querySelector('.dropdown-arrow'),
            avatar = this.firstElementChild;
            dropdown.style.minWidth = this.offsetWidth + 'px';
            arrow.style.right = (this.clientWidth - avatar.clientLeft - avatar.clientWidth / 2 * 3) + 'px';
        }
    });
})();