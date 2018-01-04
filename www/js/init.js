window.data.en.commands.utility.forEach(function(cmd) {
    document.querySelector('.content').appendChild(new Command(cmd));
});

window.addEventListener('resize', function() {
    var defs = document.querySelectorAll('.command.expanded .def'),
    i = defs.length;

    while (i--) {
        var def = defs[i];
        def.style.transition = 'none';
        def.style.height = '';
        def.style.height = def.scrollHeight + 'px';
        def.offsetHeight; /* trigger reflow (again) */
        def.style.transition = '';
    }
}, {
    passive: true
});