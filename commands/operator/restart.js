const request = require('request'),
config = require('../../src/config');

module.exports = (OpalBot) => {
    const out = {},
    i18n = OpalBot.i18n;
    
    out.operator = {};
    out.operator.r = 'restart';
    out.operator.restart = (message, content, lang) => {
        const name = config.IS_BACKUP ? config.BACKUP_APP_NAME : config.APP_NAME,
        token = config.IS_BACKUP ? config.BACKUP_HEROKU_TOKEN : config.HEROKU_TOKEN;
        message.channel.send('k');
        request.delete(`https://api.heroku.com/apps/${name}/dynos`, {
            headers: {
                Authorization: 'Bearer ' + token,
                Accept: 'application/vnd.heroku+json; version=3'
            }
        }, () => {});
    };

    return out;
};