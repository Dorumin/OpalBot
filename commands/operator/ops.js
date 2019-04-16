module.exports = (OpalBot) => {
    const out = {};
    
    out.operator = {};
    out.operator.operators = 'ops';
    out.operator.ops = (message, content, lang) => {
        message.channel.send(OpalBot.operators.map(id => `<@${id}>`).join('\n'));
    };

    return out;
};