// This file isn't supposed to be pretty, or well coded, or maintainable. It's a hack.

const request = require('request'),
config = require('./config.js'),

get_ms_until_next_swap = (d = new Date()) => {
    if (config.IS_BACKUP) {
        return (
            d.getDate() >= 15 ?
            new Date(d.getFullYear(), d.getMonth() + 1, 1).getTime() :
            0
        ) - d.getTime()
    } else {
        return (
            d.getDate() < 15 ?
            new Date(d.getFullYear(), d.getMonth(), 15).getTime() :
            0
        ) - d.getTime()
    }
},

get_ids = (appname, token) => {
    return new Promise((res, rej) => {
        request('https://api.heroku.com/teams/apps/' + appname, {
            headers: {
                Authorization: 'Bearer ' + token,
                Accept: 'application/vnd.heroku+json; version=3'
            }
        }, (err, r, body) => {
            if (err) {
                rej(err);
                return;
            }

            body = JSON.parse(body);

            request(`https://api.heroku.com/apps/${body.id}/formation`, {
                headers: {
                    Authorization: 'Bearer ' + token,
                    Accept: 'application/vnd.heroku+json; version=3'
                }
            }, (err, r, body) => {
                if (err) {
                    rej(err);
                    return;
                }

                body = JSON.parse(body)[0];

                res([body.app.id, body.id]);
            });
        });
    });
},

get_all_ids = (config) => {
    return Promise.all([
        get_ids(config.APP_NAME, config.HEROKU_TOKEN),
        get_ids(config.BACKUP_APP_NAME, config.BACKUP_HEROKU_TOKEN)
    ]);
},

scale = (ids, num, token) => {
    return new Promise((res, rej) => {
        request.patch(`https://api.heroku.com/apps/${ids[0]}/formation/${ids[1]}`, {
            form: {
                quantity: num,
                size: 'Free',
                type: 'web'
            },
            headers: {
                Authorization: 'Bearer ' + token,
                Accept: 'application/vnd.heroku+json; version=3'
            }
        }, (err, r, body) => {
            if (err) {
                rej(err);
                return;
            }

            res(body);
        });
    });
};

get_all_ids(config).then(arr => {
    let [
        app,
        backup
    ] = arr,
    d = new Date();

    setTimeout(() => {
        scale( // turn on that other app
            config.IS_BACKUP ? app : backup,
            1,
            config.IS_BACKUP ? config.HEROKU_TOKEN : config.BACKUP_HEROKU_TOKEN
        ).then(() => {
            scale( // turn off our app
                config.IS_BACKUP ? backup : app,
                0,
                config.IS_BACKUP ? config.BACKUP_HEROKU_TOKEN : config.HEROKU_TOKEN
            )
        })
    }, Math.max(get_ms_until_next_swap(), 0));
});