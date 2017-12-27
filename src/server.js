const http = require('http'),
request = require('request'),
config = require('./config.js');

module.exports = (OpalBot) => {

    OpalBot.paths = require('./paths.js')(OpalBot);
    OpalBot.server = http.createServer((req, res) => {
        if (req.url.length - 1) {
            OpalBot.util.log('Server request: ' + req.url);
        }
    
        let path = req.url.slice(1).split('?')[0].split('/')[0];
        if (OpalBot.paths[path]) {
            OpalBot.paths[path](req, res, OpalBot);
            return;
        }
        res.writeHead(200, {
            'Content-Type': 'text/plain; charset=utf-8'
        }); 
        res.write(OpalBot.log);
        res.end();
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