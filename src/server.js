const express = require('express'),
cookie = require('cookie-parser'),
minify = require('express-minify'),
bodyParser = require('body-parser'),
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
        .use(minify())
        .use(cookie())
        .use(bodyParser.text({
            defaultCharset: 'utf-8'
        }));

    require('./paths.js')(OpalBot);

    app
        .use(express.static(path.join(root, 'www')))
        .use((req, res) => {
            res.statusCode = 404;
            res.render('pages/index', {
                title: 'not-found',
                banner: 'not-found-banner'
            });
        });

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