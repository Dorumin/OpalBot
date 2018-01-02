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
        '.svg':  'image/svg+xml'
    };
    OpalBot.server = http.createServer((req, res) => {
        let path = req.url.slice(1).split('?')[0].split('/')[0];
        if (OpalBot.paths[path]) {
            OpalBot.paths[path](req, res);
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
            res.writeHead(200, {
                'Content-Type': OpalBot.contentTypes[path.extname(req.url)]
            });
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