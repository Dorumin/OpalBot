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