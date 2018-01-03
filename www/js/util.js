window.util = {};

util.escape_html = function(str) {
    return str.replace(/['"<>&]/g, function (s) {
        switch (s) {
            case "'":
                return '&#039;';
            case '"':
                return '&quot;';
            case '<':
                return '&lt;';
            case '>':
                return '&gt;';
            case '&':
                return '&amp;';
        }
    });
};

util.format_usage = function(str) {
    return util.escape_html(str)
        .replace(/\(required\)/g, '<b>(required)</b>')
        .replace(/\[.+\]/g, '<span class="optional">$&</span>');
};