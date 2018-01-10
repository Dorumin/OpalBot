module.exports = (OpalBot) => {
    const out = {},
    i18n = OpalBot.i18n;
    
    out.ban = {};
    out.ban.kickban = 'softban';
    out.ban.softban = (message, content, lang) => {
        let user = message.mentions.users.filter(u => u.id != OpalBot.client.user.id).first();
        if (!message.mentions.users.size) {
            message.channel.send(i18n.msg('no-mention', 'softban', `<@${message.author.id}>`, lang)).catch(OpalBot.util.log);
            return;
        }
        if (!user) {
            message.channel.send(i18n.msg('hal-9000', 'softban', message.author, lang)).catch(OpalBot.util.log);
            return;
        }
        if (user.id == message.author.id) {
            message.reply(i18n.msg('masochist', 'softban', lang)).catch(OpalBot.util.log);
            return;
        }
        let guild_user = message.guild.members.find(member => member.user.id == user.id),
        split = content.replace(`<@${user.id}>`, '').trim().split('|'),
        days = split[0].trim(),
        reason = split.slice(1).join('|').trim(),
        ban;
        if (!guild_user.bannable) {
            message.channel.send(i18n.msg('cannot-ban', 'softban', user.username, lang)).catch(OpalBot.util.log);
            return;
        }
        if (reason && !isNaN(days)) {
            message.channel.send(i18n.msg('banning', 'softban', user.username, lang)).catch(OpalBot.util.log);
            ban = guild_user.ban({
                days: Number(days),
                reason: reason
            });
        } else {
            ban = guild_user.ban(isNaN(days) ? days : Number(days));
        }
        ban.then(() => {
            message.guild.unban(user).then(() => {
                message.channel.send(
                    i18n.msg('success', 'softban', user.username, lang) +
                    (days && !isNaN(days) ? '\n' + i18n.msg('deleted-since', 'softban', days, lang) : '') + 
                    (reason || isNaN(days) ? '\n' + i18n.msg('reason', 'softban', reason || days, lang) : '')
                ).catch(OpalBot.util.log);
            }).catch(err => {
                message.channel.send(i18n.msg('failure-unban', 'softban', user.username, err, lang)).catch(OpalBot.util.log);
                OpalBot.util.log('Error (commands.admin.softbban):', err);
            });
        }).catch(err => {
            message.channel.send(i18n.msg('failure', 'softban', user.username, err, lang)).catch(OpalBot.util.log);
            OpalBot.util.log('Error (commands.admin.softban):', err);
        });
    };

    return out;
};