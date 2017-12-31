const Discord  = require('discord.js'),
config = require('./config.js'),
client = new Discord.Client();

module.exports = (OpalBot) => {
    OpalBot.client = client;

    require('./listeners.js')(OpalBot);

    client.login(config.token).then(() => {
        OpalBot.client.user.setPresence = function(data) {
            return new Promise(resolve => {
                let status = this.localPresence.status || this.presence.status;
                let game = this.localPresence.game;
                let afk = this.localPresence.afk || this.presence.afk;
            
                if (!game && this.presence.game) {
                    game = {
                        name: this.presence.game.name,
                        type: this.presence.game.type,
                        url: this.presence.game.url,
                    };
                }
            
                if (data.status) {
                    if (typeof data.status !== 'string') throw new TypeError('Status must be a string');
                    if (this.bot) {
                        status = data.status;
                    } else {
                        this.settings.update('status', data.status);
                        status = 'invisible';
                    }
                }
            
                if (data.game) {
                    game = data.game;
                    game.type = game.type === undefined ? (game.url ? 1 : 0) : game.type;
                } else if (typeof data.game !== 'undefined') {
                    game = null;
                }
            
                if (typeof data.afk !== 'undefined') afk = data.afk;
                afk = Boolean(afk);
            
                this.localPresence = { status, game, afk };
                this.localPresence.since = 0;
                this.localPresence.game = this.localPresence.game || null;
            
                this.client.ws.send({
                    op: 3,
                    d: this.localPresence,
                });
            
                this.client._setPresence(this.id, this.localPresence);
            
                resolve(this);
            });
        };
    }).catch(OpalBot.util.log);
};