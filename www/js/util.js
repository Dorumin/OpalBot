window.util = {};

util.format_usage = function(str) {
    return str
        .replace(/\(required\)/g, '<b>(required)</b>')
        .replace(/\[(.+)\]/g, '<span class="optional">$1</span>');
};