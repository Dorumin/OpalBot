const Canvas = require('canvas'),
fs = require('fs');

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

module.exports = (OpalBot) => {
    const out = {};
    
    out.quote_image = (req, res) => {
        let storage = OpalBot.storage.quotes || {},
        id = req.url.match(/\d+$/),
        quote = id ? storage[id[0]] : null;
        if (!quote) {
            res.end('Not found');
            return;
        }
        let base64 = quote.base64 || get_canvas_with_text(quote.content, { width: 450, background: 'white' }),
        img = new Buffer( base64.slice(22) , 'base64');
        quote.base64 = base64;
        
        res.writeHead(200, {
            'Content-Type': 'image/png',
            'Content-Length': img.length
        });
        res.end(img);
    };

    out.dl = (req, res) => {
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
            res.end('Not found');
        }
    };

    return out;
};