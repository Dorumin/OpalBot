const Canvas = require('canvas'),
fs = require('fs'),
data = require('../www/data.json'),
config = require('./config.js'),
util = {
    escape_html: function(str) {
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
        })
    },
    format_usage: function(str) {
    return util.escape_html(str)
        .replace(/\(required\)/g, '<b>(required)</b>')
        .replace(/\[.+\]/g, '<span class="optional">$&</span>');
    }
};

function get_canvas_with_text(text, config) {
    let canvas = new Canvas(config.width, config.height || 1500);
    let ctx = canvas.getContext('2d'),
    offsetX = config.offsetX || 10,
    offsetY = config.offsetY || 20,
    split = text.split(/\s+/),
    slice = '';
    ctx.font = config.font || '16px Aerial';
    if (config.background) {
        ctx.fillStyle = config.background;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.fillStyle = config.color || 'black';
    for (let i = 0; i < split.length; i++) {
        let measure = ctx.measureText(slice + split[i]);
        if (measure.width > config.width - offsetX * 2) {
            ctx.fillText(slice.trim(), offsetX, offsetY);
            offsetY += config.line_height || parseInt(ctx.font) + 10;
            slice = '';
        }
        slice += ' ' + split[i]
    }
    ctx.fillText(slice.trim(), offsetX, offsetY);
    offsetY += config.offsetY || 10;
    let resized_canvas = new Canvas(config.width, offsetY),
    resized_ctx = resized_canvas.getContext('2d');
    resized_ctx.drawImage(canvas, 0, 0);
    return resized_canvas.toDataURL();
}

function i18n(msg, lang, ...args) {
    const locale = (data[lang] || data.en).i18n,
    message = locale[msg] || '';

    return message.replace(/\$(\d)/g, (s, n) => {
        return args[n - 1] || s;
    }).replace(/\(([\d\.]+?\|.+?\|.+?)\)/g, (s, match) => {
        let split = match.split('|');
        return split[0] == 1 ? split[1] : split[2];
    });
}

function local(lang) {
    return function(msg, ...args) {
        if (msg instanceof Array) {
            msg = msg[0];
        }
        return i18n(msg, lang, ...args);
    }
}

module.exports = (OpalBot) => {
    const out = {},
    app = OpalBot.app;

    // Security middleware
    app.use((req, res, next) => {
        if (!req.secure && !req.hostname.includes('localhost')) { // Redirect to HTTPS
            return res.redirect(`https://${req.host + req.url}`);
        }
        res
            .append('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
            .append('Content-Security-Policy', `default-src; manifest-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; form-action 'self'; object-src 'none'; base-uri 'none'; frame-ancestors ${config.APP_NAME}.herokuapp.com ${config.BACKUP_APP_NAME}.herokuapp.com`)
            .append('Referrer-Policy', 'same-origin')
            .append('X-XSS-Protection', '1; mode=block')
            .append('X-Content-Type-Options', 'nosniff')
            .append('X-Frame-Options', 'DENY');

        next();
    });

    // Cache assets
    app.use((req, res, next) => {
        if (req.method == 'GET' && req.url.startsWith('/img/')) {
            res.append('Cache-Control', 'public, max-age=31557600');
        }
        next();
    });
    
    // Middleware for language recognition
    app.use((req, res, next) => {
        let langs = Object.keys(data);
        req.lang = langs.includes(req.cookies.lang) ? req.cookies.lang : req.acceptsLanguages(...langs) || 'en';
        next();
    });

    // Middleware for not needing to add data and lang props to every render
    app.use((req, res, next) => {
        Object.assign(res.locals, {
            data: data,
            lang: req.lang,
            local: local(req.lang),
            $: local(req.lang)
        }, config);
        next();
    });

    // Pages
    app.get('/', (req, res) => {
        res.render('pages/index');
    });

    app.get('/commands', (req, res) => {
        res.render('pages/commands', {
            commands: data[req.lang].commands,
            format: util.format_usage
        });
    });

    app.get('/about', (req, res) => {
        res.render('pages/about');
    });
    
    // App services
    app.get('/quote_image', (req, res, next) => {
        let storage = OpalBot.storage.quotes || {},
        id = req.url.match(/\d+$/),
        quote = id ? storage[id[0]] : null;
        if (!quote) {
            next();
            return;
        }
        let base64 = quote.base64 || get_canvas_with_text(quote.content, { width: 450, background: 'white' }),
        img = new Buffer( base64.slice(22) , 'base64');
        quote.base64 = base64;
        
        res
            .status(200)
            .append('Content-Type', 'image/png')
            .append('Content-Length', img.length)
            .end(img);
    });

    app.get('/dl/*', (req, res, next) => {
        let id = decodeURIComponent(req.url.split('/').pop()),
        filename = id + '.mp3';
        if (fs.existsSync(filename)) {
            let stat = fs.statSync(filename);
            res.writeHead(200, {
                'Content-Length': stat.size,
                'Content-Type': 'audio/mpeg',
                'Content-Disposition': `attachment; filename=${OpalBot.storage.mp3[id]}`
            });
            fs
                .createReadStream(filename)
                .pipe(res);
        } else {
            next();
        }
    });

    // For testing
    app.get('/debug', (req, res) => {
        res.writeHead(200, {
            'Content-Type': 'text/plain; charset=utf-8'
        }); 
        res.write(OpalBot.log);
        res.end();
    });

    return out;
};