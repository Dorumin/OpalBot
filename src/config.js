/*
 * IF RUNNING ON HEROKU, USE HEROKU PRIVATE VARIABLES.
 * DONT EXPOSE YOUR TOKEN ON YOUR CONFIG.JSON, STUPID.
 */
try {
    const config = require('../config.json');
    module.exports = {
        ...process.env,
        ...config
    };
} catch(e) {
    module.exports = process.env;
}