const exec = require('child_process').exec;

module.exports = (OpalBot) => {
    const out = {},
    i18n = OpalBot.i18n;
    
    out.operator = {};
    out.operator.bash = 'exec';
    out.operator.cmd = 'exec';
    out.operator.exec = async (message, content, lang) => {
        let dynamic = `OpalBot Terminal [v${OpalBot.v}]\nCopyright (c) 2018 OpalBot Corp. All rights reserved.\n`;
        const tags = '```',
        terminal = await message.channel.send(tags + dynamic + tags),
        child = exec(content),
        append = (data) => {
            dynamic += '\n' + data.trim();
            terminal.edit(tags + dynamic + tags);
        };

        child.stdin.on('data', append);
        child.stdout.on('data', append);
        child.stderr.on('data', append);
    };

    return out;
};