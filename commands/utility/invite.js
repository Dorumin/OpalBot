const config = require('../../src/config.js');

module.exports = () => {
    const out = {};

    out.peasants = {};
    out.peasants.invite = (message) => message.channel.send(config.SERVICE_URL + '/invite');

    return out;
}