module.exports = (OpalBot) => {
    OpalBot.endpoints = {};

    OpalBot.registerEndpoint = (name, fn) => {
        if (OpalBot.endpoints[name]) {
            throw new Error(`Endpoint ${name} already defined.`);
        }
        OpalBot.endpoints[name] = fn;
    };
};