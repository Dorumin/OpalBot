module.exports = (OpalBot) => {
    OpalBot.permissionAliases = {
        admin: 'ADMINISTRATOR',
        create_instant: 'CREATE_INSTANT_INVITE',
        kick: 'KICK_MEMBERS',
        ban: 'BAN_MEMBERS',
        channel: 'MANAGE_CHANNELS',
        guild: 'MANAGE_GUILD',
        react: 'ADD_REACTIONS',
        audit: 'VIEW_AUDIT_LOG',
        read: 'READ_MESSAGES',
        send: 'SEND_MESSAGES',
        tts: 'SEND_TTS_MESSAGES',
        messages: 'MANAGE_MESSAGES',
        embed: 'EMBED_LINKS',
        attach: 'ATTACH_FILES',
        history: 'READ_MESSAGE_HISTORY',
        everyone: 'MENTION_EVERYONE',
        external: 'EXTERNAL_EMOJIS',
        use_external: 'USE_EXTERNAL_EMOJIS',
        connect: 'CONNECT',
        speak: 'SPEAK',
        mute: 'MUTE_MEMBERS',
        deafen: 'DEAFEN_MEMBERS',
        move: 'MOVE_MEMBERS',
        vad: 'USE_VAD',
        nick: 'CHANGE_NICKNAME',
        manage_nicks: 'MANAGE_NICKNAMES',
        roles: 'MANAGE_ROLES',
        permissions: 'MANAGE_ROLES_OR_PERMISSIONS',
        webhooks: 'MANAGE_WEBHOOKS',
        emojis: 'MANAGE_EMOJIS'
    };

    OpalBot.commands = {
        roles: {}, // role-specific commands. case-insensitive
        peasants: {}, // commands that everyone can use
        operator: {}, // commands that only the users with ID declared in OpalBot.operators can use
        // permission commands
        admin: {},
        create_instant: {},
        kick: {},
        ban: {},
        channel: {},
        guild: {},
        react: {},
        audit: {},
        read: {},
        send: {},
        tts: {},
        messages: {},
        embed: {},
        attach: {},
        history: {},
        everyone: {},
        external: {},
        use_external: {},
        connect: {},
        speak: {},
        mute: {},
        deafen: {},
        move: {},
        vad: {},
        nick: {},
        manage_nicks: {},
        roles: {},
        permissions: {},
        webhooks: {},
        emojis: {},
        ...require('../commands')(OpalBot)
    };
    
    OpalBot.unprefixed = [];
    
    OpalBot.unprefixed.push = (...arr) => {     // It's hacky, but it works. Try not to access OpalBot.unprefixed by reference though. 
                                                // And also try to always provide a timeout. This isn't supposed to be a replacement for commands.
        for (let i in OpalBot.unprefixed) {
            let original = OpalBot.unprefixed[i];
            original.triggers = original.triggers || [original.trigger];
            for (let k in arr) {
                let item = arr[k];
                item.triggers = item.triggers || [item.trigger];
                let conflicts = false,
                l = item.triggers.length;
                while (l--) {
                    if (original.triggers.includes(item.triggers[i])) {
                        conflicts = true;
                    }
                }
                if (
                    !item.channel ||
                    (conflicts) &&
                    (item.user ? original.user == item.user : false) && 
                    (item.channel ? original.channel == item.channel : false)
                ) {
                    arr.splice(k, 1);
                }
            }
        }
        if (!arr.length) return true;
        arr.forEach((obj, idx) => {
            if (obj.timeout) {
                obj.__timeoutID = setTimeout(() => {
                    OpalBot.unprefixed.splice(idx, 1);
                    try {
                        if (obj.ontimeout) {
                            obj.ontimeout();
                        }
                    } catch(e) {
                        OpalBot.util.log('Error caught in unprefixed timeout callback', e);
                    }
                }, obj.timeout);
            }
        });
        let obj = {};
        for (let i in OpalBot.unprefixed) { // Save methods
            if (isNaN(i)) {
                obj[i] = OpalBot.unprefixed[i];
            }
        }
        OpalBot.unprefixed = OpalBot.unprefixed.concat(arr);
        for (let k in obj) { // Port methods
            if (isNaN(k)) {
                OpalBot.unprefixed[k] = obj[k];
            }
        }
    };

    OpalBot.unprefixed.remove = (obj) => {
        let fn = typeof obj == 'function' ? obj : (el) => {
            for (let i in obj) {
                if (obj[i] != el[i]) {
                    return false;
                }
            }
            return true;
        };
        let i = OpalBot.unprefixed.findIndex(fn);
        if (i == -1) return false;
        let elem = OpalBot.unprefixed.splice(i, 1)[0]
        if (elem.__timeoutID) {
            clearTimeout(elem.__timeoutID);
        }
        if (elem.oncancel) {
            elem.oncancel();
        }
        return elem;
    };

    OpalBot.unprefixed.expect = (obj) => {
        return new Promise((res, rej) => {
            let blocked = OpalBot.unprefixed.push({
                caseinsensitive: true,
                callback: (message, index) => res({message: message, index: index}),
                timeout: 60000,
                ontimeout: () => {
                    rej('timeout');
                },
                oncancel: () => rej('cancel'),
                ...obj
            });
            if (blocked === true) {
                rej('blocked');
            }
        });
    };
}