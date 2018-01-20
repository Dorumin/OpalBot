(function() {
    var $ = document.querySelectorAll.bind(document),
    commands = $('.header'),
    invite = $('.navigation .add');

    commands.forEach(function(command) {
        command.addEventListener('click', function() {
            var expanded = this.parentElement.classList.toggle('expanded'),
            def = this.nextElementSibling;
        
            def.style.height = expanded ? def.scrollHeight + 'px' : '';
        });
    });

    window.addEventListener('resize', function() {
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
    });

    $('.nav-item.hamburger')[0].addEventListener('click', function() {
        this.parentElement.parentElement.classList.toggle('open');
        document.body.classList.toggle('noscroll');
    })
})();