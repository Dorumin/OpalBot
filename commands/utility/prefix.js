module.exports = (OpalBot) => {
    const out = {},
    i18n = OpalBot.i18n;
    
    out.peasants = {};
    out.peasants.prefixes = 'prefix';
    out.peasants.prefix = async (message, content, lang) => {
        let list = i18n.msg('list', 'prefix', lang),
        add = i18n.msg('add', 'prefix', lang),
        remove = i18n.msg('remove', 'prefix', lang),
        mode = list,
        prefixes = OpalBot.prefixes[message.guild.id] || OpalBot.prefixes.default,
        arr;
        if (content.slice(0, add.length) == add) mode = add;
        if (content.slice(0, remove.length) == remove) mode = remove;
        content = content.slice(mode.length).trim();
        switch (mode) {
            case list:
                if (!prefixes.length) {
                    message.reply(i18n.msg('no-prefixes', 'prefix', lang)).catch(OpalBot.util.log);
                    return;
                }
                message.reply(i18n.msg('list-prefixes', 'prefix', '`' + prefixes.join('` `') + '`', lang)).catch(OpalBot.util.log);
                break;
            case add:
                if (!message.member.permissions.serialize().ADMINISTRATOR) {
                    message.reply(i18n.msg('missing-permissions', 'prefix', lang)).catch(OpalBot.util.log);
                    return;
                }
                if (!content.length) {
                    message.reply(i18n.msg('no-prefix-add', 'prefix', lang)).catch(OpalBot.util.log);
                    return;
                }
                if (!OpalBot.prefixes[message.guild.id]) {
                    OpalBot.util.extendDatabase('data', {
                        prefixes: {
                            [message.guild.id]: prefixes
                        }
                    });
                    OpalBot.prefixes[message.guild.id] = [...prefixes];
                }
                arr = OpalBot.prefixes[message.guild.id],
                i = arr.indexOf(content);
                if (i != -1) {
                    message.reply(i18n.msg('prefix-already-in-use', 'prefix', lang)).catch(OpalBot.util.log);
                    return;
                }
                arr.push(content);
                OpalBot.util.extendDatabase('data', {
                    prefixes: {
                        [message.guild.id]: arr
                    }
                });
                message.reply(i18n.msg('prefix-added', 'prefix', content, lang)).catch(OpalBot.util.log);
                break;
            case remove:
                if (!message.member.permissions.serialize().ADMINISTRATOR) {
                    message.reply(i18n.msg('missing-permissions', 'prefix', lang)).catch(OpalBot.util.log);
                    return;
                }
                if (!content.length) {
                    message.reply(i18n.msg('no-prefix-add', 'prefix', lang)).catch(OpalBot.util.log);
                    return;
                }
                if (!OpalBot.prefixes[message.guild.id]) {
                    OpalBot.util.extendDatabase('data', {
                        prefixes: {
                            [message.guild.id]: prefixes
                        }
                    });
                    OpalBot.prefixes[message.guild.id] = [...prefixes];
                }
                arr = OpalBot.prefixes[message.guild.id],
                i = arr.indexOf(content);
                if (i == -1) {
                    message.reply(i18n.msg('no-prefix-found', 'prefix', lang)).catch(OpalBot.util.log);
                    return;
                }
                arr.splice(i, 1);
                OpalBot.util.extendDatabase('data', {
                    prefixes: {
                        [message.guild.id]: arr
                    }
                });
                message.reply(i18n.msg('prefix-removed', 'prefix', content, lang)).catch(OpalBot.util.log);
                if (!arr.length) {
                    message.channel.send(i18n.msg('uh-oh', 'prefix', OpalBot.client.user.id, lang)).catch(OpalBot.util.log);
                }
                break;
        }
    };

    return out;
};