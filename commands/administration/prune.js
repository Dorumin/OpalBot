module.exports = (OpalBot) => {
    const out = {},
    i18n = OpalBot.i18n;
    
    out.admin = {};
    out.admin.prune = async (message, content, lang) => {
        let count;
        if (!content) {
            content = 7;
        } else if (isNaN(count = parseInt(content, 10))) {
            message.reply(i18n.msg('invalid', 'prune', lang));
            return;
        } else if (count == 0) { // Kicking all users without any roles
            let members = (await message.guild.fetchMembers()).members.filter(user => !(user.roles.size - 1)),
            reason = content.slice(1).trim();
            if (!members.size) {
                message.reply(i18n.msg('no-roleless', 'prune', lang));
                return;
            }
            let blocked = OpalBot.unprefixed.push({
                type: 'prune',
                triggers: [
                    i18n.msg('confirm', 'main', lang),
                    i18n.msg('cancel', 'main', lang)
                ],
                user: message.author.id,
                channel: message.channel.id,
                caseinsensitive: true,
                timeout: 30000,
                callback: async (message, index) => {
                    if (index == 0) { // confirm
                        try {
                            message.channel.send(i18n.msg('pruning', 'prune', lang));
                            for (let [key, user] of members) {
                                await user.kick(reason);
                            }
                            message.channel.send(i18n.msg('pruned', 'prune', members.size, lang));
                        } catch(e) {
                            message.channel.send(i18n.msg('missing-permissions', 'prune', lang));
                        }
                    } else { // cancel
                        message.channel.send(i18n.msg('cancelled', 'prune', lang));
                    }
                },
                ontimeout: () => {
                    message.channel.send(i18n.msg('timed-out', 'prune', lang));
                }
            });
            if (blocked === true) {
                message.channel.send(i18n.msg('blocked', 'prune', lang));
            } else {
                message.channel.send(i18n.msg('roleless-prompt', 'prune', members.size, lang));
            }
            return;
        }
        let pruned;
        try {
            pruned = await message.guild.pruneMembers(count, true);
        } catch(e) {
            message.channel.send(i18n.msg('missing-permissions', 'prune', lang));
            return;
        }
        if (!pruned) {
            message.reply(i18n.msg('lonely', 'prune', lang));
            return;
        }
        let blocked = OpalBot.unprefixed.push({
            type: 'prune',
            triggers: [
                i18n.msg('confirm', 'main', lang),
                i18n.msg('cancel', 'main', lang)
            ],
            user: message.author.id,
            channel: message.channel.id,
            caseinsensitive: true,
            timeout: 30000,
            callback: async (message, index) => {
                if (index == 0) { // confirm
                    try {
                        message.channel.send(i18n.msg('pruning', 'prune', lang));
                        let pruned = await message.guild.pruneMembers(count);
                        message.channel.send(i18n.msg('pruned', 'prune', pruned, lang));
                    } catch(e) {
                        message.channel.send(i18n.msg('missing-permissions', 'prune', lang));
                    }
                } else { // cancel
                    message.channel.send(i18n.msg('cancelled', 'prune', lang));
                }
            },
            ontimeout: () => {
                message.channel.send(i18n.msg('timed-out', 'prune', lang));
            }
        });
        if (blocked === true) {
            message.channel.send(i18n.msg('blocked', 'prune', lang));
        } else {
            message.channel.send(i18n.msg('prompt', 'prune', pruned, lang));
        }
    };

    return out;
};