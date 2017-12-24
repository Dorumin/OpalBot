const request = require('request');

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
        if (answer == 5) return this.back(step);
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
    
    back(step) {
        return new Promise(async (res, rej) => {
            var response = null;
            try {
                response = await this.get(this.session.server + `cancel_answer?session=${this.session.session}&signature=${this.session.signature}&step=${step}&answer=-1`);
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
    
    exclude(step) {
        return new Promise(async (res, rej) => {
            if (isNaN(step)) {
                rej('no-step');
                return;
            }
            var response = null;
            try {
                response = await this.get(this.session.server + `exclusion?session=${this.session.session}&signature=${this.session.signature}&step=${step}&forward_answer=1`);
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

module.exports = Akinator;