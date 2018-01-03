const http = require('http'),
path = require('path'),
fs = require('fs'),
request = require('request'),
config = require('./config.js');

module.exports = (OpalBot) => {

    OpalBot.paths = require('./paths.js')(OpalBot);
    OpalBot.contentTypes = {
        '.html': 'text/html',
        '.css':  'text/css',
        '.js':   'text/javascript',
        '.json': 'text/json',
        '.svg':  'image/svg+xml',
        '.ico': 'image/x-icon'
    };
    OpalBot.server = http.createServer((req, res) => {
        OpalBot.util.log('Server request: ' + req.url);
        let p = req.url.slice(1).split('?')[0].split('/')[0];
        if (OpalBot.paths[p]) {
            OpalBot.paths[p](req, res);
            return;
        }
        if (req.url.length == 1) {
            req.url = '/index';
        }
        if (!req.url.includes('.')) {
            req.url += '.html';
        }
        let stream = fs.createReadStream('www' + req.url);
        stream.on('error', (err) => {
            OpalBot.paths['404'](req, res);
        });
        stream.on('open', () => {
            let ct = OpalBot.contentTypes[path.extname(req.url)];
            res.writeHead(200, ct ? {
                'Content-Type': ct
            } : {});
            stream.pipe(res);
        });
    }).listen(config.PORT || 5000);

    // Set a selfping interval every 5 minutes
    if (config.selfping_url) {
        setInterval(() => {
            request(config.selfping_url, () => {});
        }, 1000 * 60 * 5);
    }

    if (
        config.heroku_token &&
        config.backup_heroku_token &&
        config.app_name && 
        config.backup_app_name
    ) {
        require('./alwaysonline.js');
    }
};