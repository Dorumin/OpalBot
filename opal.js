const Discord = require('discord.js');
const http = require('http');
const client = new Discord.Client();

client.on('ready', async () => {
  OpalBot.prefixes.push(`<@${client.user.id}>, do `, `<@${client.user.id}>`);
  console.log(`OpalBot v${OpalBot.v} is online!`);
});

client.on('message', message => {
    if (message.author.id == client.user.id) return;
    var content = message.content,
    name = message.author.username,
    i = OpalBot.prefixes.length;
    console.log(name + ': ' + content + (message.channel.type == 'text' ? ' @ ' + message.guild.name : ''));
    if (message.channel.type == 'dm' || message.channel.type == 'group') {
        message.reply('Add me on your server: <https://discordapp.com/oauth2/authorize?client_id=348233224293449729&scope=bot>');
        return;
    }
    if (message.channel.type != 'text') return;
    while (i--) {
        if (content.startsWith(OpalBot.prefixes[i])) {
            var split = content.slice(OpalBot.prefixes[i].length).split(' ').filter(Boolean),
            command = split[0],
            params = split.slice(1).join(' ');
            console.log(split, OpalBot.prefixes[i]);
            //console.log(message.member.roles.find(n => n.name == 'admin');
            for (var role in OpalBot.commands) {
                if (message.member.roles.find(n => n.name == role) && OpalBot.commands[role].hasOwnProperty(command)) {
                    try {
                        var command_fn = OpalBot.commands[role][command];
                        if (command_fn.constructor === String) {
                            OpalBot.commands[role][command_fn](message, params);
                            return;
                        }
                        command_fn(message, params);
                    } catch(e) {
                        console.log(`Uncaught error (command ${role}.${command}):`, e);
                    }
                }
                if (role == 'peasants' && OpalBot.commands.peasants.hasOwnProperty(command)) {
                    try {
                        var command_fn = OpalBot.commands.peasants[command];
                        if (command_fn.constructor === String) {
                            OpalBot.commands.peasants[command_fn](message, params);
                            return;
                        }
                        command_fn(message, params);
                    } catch(e) {
                        console.log(`Uncaught error (command peasants.${command}):`, e);
                    }
                }
            }
            break;
        }
    }
});

var OpalBot = {
    prefixes: ['!', '@', '>'],
    v: '0.01'
};

OpalBot.commands = {
    admin: {},
    mods: {},
    peasants: {}
};

OpalBot.commands.peasants.hi = 'hello';
OpalBot.commands.peasants.hey = 'hello';
OpalBot.commands.peasants.hello = (message) => {
    switch (message.author.username + '#' + message.author.discriminator) {
        case 'Dorumin#0969':
            message.reply('hello useless pile of goop!');
        break;
        case 'Oasis#4730':
            message.reply('Hello, {data-error: user-not-implemented}');
            break;
    }
};

OpalBot.commands.peasants.lenny = 'me';
OpalBot.commands.peasants.me = message => {
    message.channel.send('( ͡° ͜ʖ ͡°)');
};

OpalBot.commands.peasants.runtime = message => {
    var s = client.uptime
    message.channel.send(`OpalBot v${OpalBot.v} has been running for ${client.uptime}`);
};

OpalBot.commands.admin.kick = (message, reason) => {
    var user = message.mentions.users.filter(u => u.id != client.user.id).first();
    if (!user) {
        message.channel.send('No user mention found. Please @ the user you want to kick!');
        return;
    }
    var guild_user = message.guild.members.find(member => member.user.id == user.id),
    reason = reason.replace(`<@${user.id}>`, '').trim();
    if (!guild_user.kickable) {
        message.channel.send(`Cannot kick ${user.username}: missing permissions.`);
        return;
    }
    message.channel.send(`Kicking ${user.username}${reason && ': ' + reason}...`);
    guild_user.kick(reason).then(() => {
        message.channel.send(`Successfully kicked ${user.username}!`);
    }).catch(err => {
        message.channel.send(`Failed while kicking ${user.username}. ${err}`);
        console.log('Error (commands.admin.kick):', err);
    });
};

OpalBot.commands.admin.ban = (message, reason) => {
    var user = message.mentions.users.filter(u => u.id != client.user.id).first();
    if (!user) {
        message.channel.send('No user mention found. Please @ the user you want to ban!');
        return;
    }
    var guild_user = message.guild.members.find(member => member.user.id == user.id),
    split = reason.replace(`<@${user.id}>`, '').trim().split('|'),
    days = split[0].trim(),
    reason = split.slice(1).join('|').trim(),
    ban;
    if (!guild_user.bannable) {
        message.channel.send(`Cannot ban ${user.username}: missing permissions.`);
        return;
    }
    if (reason && !isNaN(days)) {
        message.channel.send(`Banning ${user.username}...`);
        ban = guild_user.ban({
            days: Number(days),
            reason: reason
        });
    } else {
        ban = guild_user.ban(isNaN(days) ? days : Number(days));
    }
    ban.then(() => {
        message.channel.send(
            `Successfully banned ${user.username}!` +
            (days && !isNaN(days) ? `\nDeleted messages since ${days} days ago.` : '') + 
            (reason || isNaN(days) ? `\nReason: ${reason || days}` : '')
        );
    }).catch(err => {
        message.channel.send(`Failed while banning ${user.username}. ${err}`);
        console.log('Error (commands.admin.ban):', err);
    });
};

http.createServer((request, response) => {
  response.writeHead(404);
  response.end();
}).listen(process.env.PORT || 5000);

client.login(process.env.token);
