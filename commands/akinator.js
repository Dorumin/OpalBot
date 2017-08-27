const request = require('request');
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

class Akinator {
    
    get(url) {
        return new Promise((res, rej) => {
            request(url, (err, r, body) => {
                if (err) {
                    rej(err, r, body);
                    return;
                }
                try {
                    body = JSON.parse(body);
                } catch(e) {}
                res(body, r);
            });
        });
    }
    
    init(lang, user) {
        return new Promise(async (res, rej) => {
            var tries = 0,
            session = null,
            server = '';
            while (tries++ < 5) {
                server = `http://api-${lang}${tries}.akinator.com/ws/`;
                try {
                    session = await this.get(server + 'new_session?partner=1&player=' + user);
                    break;
                } catch(e) {}
            }
            if (!session) {
                rej('server-error');
            } else if (session.completion != 'OK') {
                rej(session);
            }
            this.session = {
                ...session.parameters.identification,
                server: server
            };
            res(session.parameters);
        });
    }
    
    ans(step, answer) {
        return new Promise(async (res, rej) => {
            if (isNaN(answer) || isNaN(step)) { // Because TypeScript is too lame
                rej('PARAMS NEED TO BE INT MATE, LEARN YOUR APIS');
                return;
            }
            var response = null;
            try {
                response = await this.get(this.session.server + `answer?session=${this.session.session}&signature=${this.session.signature}&step=${step}&answer=${answer}`);
            } catch(e) {}
            if (!response) {
                rej('no-response');
            } else if (response.completion != 'OK') {
                rej(response);
            }
            res(response.parameters);
        });
    }
    
    guess(step) {
        return new Promise(async (res, rej) => {
            if (isNaN(step)) {
                rej('Set a step parameter you lazy fuck!');
                return;
            }
            var response = null;
            try {
                response = await this.get(this.session.server + `list?session=${this.session.session}&signature=${this.session.signature}&step=${step}`);
            } catch(e) {}
            if (!response) {
                rej('no-response');
            } else if (response.completion != 'OK') {
                rej(response);
            }
            res(response.parameters);
        });
    }
}

OpalBot.commands.peasants.akinator = function(message, content, lang) {
    this.sessions = this.sessions || [];
    var id = message.author.id,
    mode = 'start',
    close = i18n.msg('quit', 'akinator', lang).split('|');
    if (close.includes(content)) mode = 'close';
    if (mode == 'close') {
        if (this.sessions[id]) {
            delete ref.sessions[id];
            OpalBot.unprefixed.remove({
                type: 'akinator',
                user: message.author.id,
                channel: message.channel.id
            });
            message.channel.send(i18n.msg('session-closed', 'akinator', lang));
        } else {
            message.channel.send(i18n.msg('no-session-open', 'akinator', lang));
        }
        return;
    }
    if (this.sessions[id]) {
        message.channel.send(i18n.msg('session-open', 'akinator', lang));
        return;
    }
    var ask = async (obj) => {
        return new Promise((res, rej) => {
            var blocked = OpalBot.unprefixed.push({
                type: 'akinator',
                caseinsensitive: true,
            callback: (message, index) => res({message: message, index: index}),
                timeout: 60000,
                ontimeout: () => {
                    rej('timeout');
                },
                ...obj
            });
        });
    },
    akinator = new Akinator(),
    q = akinator.init();
    var res = await ask('This is a test question.');
    console.log(res);
};
/*
var ask = q => new Promise(res => rl.question(q, ans => res(ans)));
(async () => {
    var akinator = new Akinator();
    var q = (await akinator.init('en', 'Dorumin')).step_information;
    console.log(JSON.stringify(q, null, 2));
    while (1) {
        var answer = await ask(q.question),
        res = await akinator.ans(q.step, answer);
        q = res;
        console.log(res);
        console.log(res.progression);
        if (res.progression > 97) {
            var guess = await akinator.guess(q.step);
            console.log(JSON.stringify(guess, null, 2));
            break;
        }
    }
})();

setInterval(() => {}, 1000);*/