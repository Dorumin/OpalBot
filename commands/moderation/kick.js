module.exports = (OpalBot) => {
    const out = {},
    i18n = OpalBot.i18n;
    
    out.kick = {};
    out.kick.k = 'kick';
    out.kick.boot = 'kick';
    out.kick.kick = async (message, content, lang) => {
        let users = message.mentions.members.array();
        if (!users.length) {
            message.channel.send(i18n.msg('no-mention', 'kick', lang)).catch(OpalBot.util.log);
            return;
        }
        if (message.mentions.members.get(OpalBot.client.id)) { // Trying to kick the bot. So predictable.
            message.channel.send(i18n.msg('hal-9000', 'kick', message.author, lang)).catch(OpalBot.util.log);
            return;
        }
        if (message.mentions.members.get(message.author.id)) {
            message.reply(i18n.msg('masochist', 'kick', lang)).catch(OpalBot.util.log);
            return;
        }
        let reason = content.replace(/<@!?\d+>/g, '').trim() || undefined,
        i = users.length,
        name = i == 1 ? users[0] : i18n.msg('users', 'kick', i, lang),
        unkick = users.find(user => user.kickable);
        if (unkick) {
            message.channel.send(i18n.msg('cannot-kick', 'kick', unkick.username, lang)).catch(OpalBot.util.log);
            return;
        }
        message.channel.send(i18n.msg('kicking' + (reason ? '-with-reason' : ''), 'kick', name, reason, lang)).catch(OpalBot.util.log);
        while (i--) {
            let user = users[i];
            try {
                await user.kick(reason);
            } catch(e) {
                message.channel.send(i18n.msg('failure', 'kick', user.username, JSON.stringify(err), lang)).catch(OpalBot.util.log);
                OpalBot.util.log('Error (commands.admin.kick):', err);
                return;
            }
        }
        message.channel.send(i18n.msg('success', 'kick', name, lang)).catch(OpalBot.util.log);
    };

    return out;
};