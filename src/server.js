const express = require('express'),
cookie = require('cookie-parser'),
path = require('path'),
fs = require('fs'),
request = require('request'),
config = require('./config.js'),
root = path.dirname(require.main.filename);

module.exports = (OpalBot) => {

    const app = OpalBot.app = express()
        .use(cookie())
        .use(express.static(path.join(root, 'www')))
        .set('views', path.join(root, 'www/views'))
        .set('view engine', 'ejs');

    require('./paths.js')(OpalBot);

    app.listen(config.PORT, OpalBot.util.log);

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