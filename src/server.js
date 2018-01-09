const express = require('express'),
cookie = require('cookie-parser'),
compression = require('compression'),
request = require('request'),
path = require('path'),
fs = require('fs'),
config = require('./config.js'),
root = path.dirname(require.main.filename);

module.exports = (OpalBot) => {

    const app = OpalBot.app = express()
        .set('trust proxy', true)
        .set('views', path.join(root, 'www/views'))
        .set('view engine', 'ejs')
        .set('view options', {
            rmWhitespace: true
        })
        .use(compression())
        .use(cookie())
        .use(express.static(path.join(root, 'www')))

    require('./paths.js')(OpalBot);

    app.listen(config.PORT || 5000, OpalBot.util.log);

    // Set a self ping interval every 5 minutes
    if (config.SERVICE_URL) {
        setInterval(() => {
            request(config.SERVICE_URL, () => {});
        }, 1000 * 60 * 5);
    }

    if (
        config.HEROKU_TOKEN &&
        config.BACKUP_HEROKU_TOKEN &&
        config.APP_NAME &&
        config.BACKUP_APP_NAME
    ) {
        require('./alwaysonline.js');
    }
};