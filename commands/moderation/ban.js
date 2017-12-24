module.exports = (OpalBot) => {
    const out = {},
    i18n = OpalBot.i18n;
    
    out.ban = {};
    out.ban.banish = 'ban';
    out.ban.ban = (message, content, lang) => {
        let user = message.mentions.users.filter(u => u.id != OpalBot.client.user.id).first();
        if (!message.mentions.users.size) {
            message.channel.send(i18n.msg('no-mention', 'ban', `<@${message.author.id}>`, lang)).catch(OpalBot.util.log);
            return;
        }
        if (!user) {
            message.channel.send(i18n.msg('hal-9000', 'ban', message.author, lang)).catch(OpalBot.util.log);
            return;
        }
        if (user.id == message.author.id) {
            message.reply(i18n.msg('masochist', 'kick', lang)).catch(OpalBot.util.log);
            return;
        }
        let guild_user = message.guild.members.find(member => member.user.id == user.id),
        split = content.replace(`<@${user.id}>`, '').trim().split('|'),
        days = split[0].trim(),
        reason = split.slice(1).join('|').trim(),
        ban;
        if (!guild_user.bannable) {
            message.channel.send(i18n.msg('cannot-ban', 'ban', user.username, lang)).catch(OpalBot.util.log);
            return;
        }
        if (reason && !isNaN(days)) {
            message.channel.send(i18n.msg('banning', 'ban', user.username, lang)).catch(OpalBot.util.log);
            ban = guild_user.ban({
                days: Number(days),
                reason: reason
            });
        } else {
            ban = guild_user.ban(isNaN(days) ? days : Number(days));
        }
        ban.then(() => {
            message.channel.send(
                i18n.msg('success', 'ban', user.username, lang) +
                (days && !isNaN(days) ? '\n' + i18n.msg('deleted-since', 'ban', days, lang) : '') + 
                (reason || isNaN(days) ? '\n' + i18n.msg('reason', 'ban', reason || days, lang) : '')
            ).catch(OpalBot.util.log);
        }).catch(err => {
            message.channel.send(i18n.msg('failure', 'ban', user.username, err, lang)).catch(OpalBot.util.log);
            OpalBot.util.log('Error (commands.admin.ban):', err);
        });
    };

    return out;
};