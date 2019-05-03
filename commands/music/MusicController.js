const got = require('got'),
ytdl = require('ytdl-core'),
config = require('../../src/config.js'),
installer = require('@ffmpeg-installer/ffmpeg'),
ffmpeg = require('fluent-ffmpeg'),
videoIdRegex = /[a-zA-Z0-9-_]{11}$/,
videoLinkRegex = /https?:\/\/(?:www\.|m\.)?(?:youtu\.be\/|youtube\.com\/watch\?v=)([a-zA-Z0-9-_]{11})/g;

ffmpeg.setFfmpegPath(installer.path);
class MusicController {
    constructor({
        lang,
        i18n
    }) {
        this.lang = lang;
        this.i18n = i18n;
        this.queue = [];
        this.volume = 1;
        this.currentIndex = -1;
        this.textChannel = null;
        this.dispatcher = null;
        this.connection = null;
        this.channel = null;
        this.message = null;
        this.timeout = null;
        this.editedEmbed = 0;
        this.sendingEmbed = false;
        this.editing = false;
        this.playing = false;
        this.paused = false;
        this.protipped = false;
        this.pausedBy = null;
        this.loop = 0;
    }

    async connect(channel) {
        if (channel && channel.connection) {
            channel.connection.disconnect();
        }
        this.channel = channel;
        this.connection = await channel.join();
        return this.connection;
    }

    disconnect() {
        if (!this.connection) return false;
        this.channel.leave();
        this.connection.disconnect();
        this.connection = null;
        this.channel = null;
        return true;
    }

    /* Seaches the YouTube API for a query string, and returns the first result. Can also take an id */
    async searchVideo(query, {
        wait,
        addedBy
    }) {
        let match = query.match(videoLinkRegex) || query.match(videoIdRegex),
        id,
        info,
        searched = false;

        if (match) {
            id = match[1] || match[0];
        }

        if (!id || !(info = await this.videoInfo(id))) {
            const body = await this.search(query);
            
            if (!body.items[0]) return null;

            searched = true;
            id = body.items[0].id.videoId;
            info = await this.videoInfo(id);
        }

        // console.log(info);

        const video = new Video({
            id: info.video_id,
            title: info.title,
            duration: info.length_seconds,
            live: info.player_response.videoDetails.isLiveContent,
            channel: new Channel({
                name: info.author.name,
                url: info.author.channel_url
            }),
            query: searched ? query : info.title, // TODO: Something with media
        });

        if (wait) {
            await video.tryFetchBetterThumbnail();
        } else {
            video.tryFetchBetterThumbnail();
        }

        if (addedBy) {
            video.addedBy = addedBy;
        }

        return video;
    }

    /* Just searches the API and returns the response */
    async search(query) {
        const res = await got('https://www.googleapis.com/youtube/v3/search', {
            json: true,
            query: {
                part: 'snippet',
                q: query,
                key: config.YOUTUBE_TOKEN,
                type: 'video',
            }
        });

        // res.body.items.sort((a, b) => {
        //     const lyrics = [
        //         'audio',
        //         'letra',
        //         'lyric',
        //     ];
        //     return this.includesAny(b.snippet.title, lyrics, query) - this.includesAny(a.snippet.title, lyrics, query);
        // });

        return res.body;
    }

    includesAny(string, substrings, query) {
        string = string.toLowerCase();
        let i = substrings.length,
        split = query.split(' '),
        offset = 0;

        if (split.every(elem => string.includes(elem))) {
            offset = substrings.length;
        }

        while (i--) {
            if (string.includes(substrings[i])) {
                return i + offset;
            }
        }
        return -1;
    }

    async videoInfo(id) {
        try {
            const info = await ytdl.getBasicInfo(id);
            return info;
        } catch(e) {
            return null
        }
    }

    findMusicChannel(guild) {
        const voices = guild.channels.filter(chan => chan.type == 'voice'),
        music = voices.find(chan => chan.name.includes('music'));
        return music;
    }

    push(video) {
        const index = this.queue.push(video) - 1;
        this.refreshStreams();
        console.log('called push', !this.playing);

        if (!this.playing) {
            this.currentIndex = index;
            this.play({
                index,
            });
        }

        return index == this.currentIndex;
    }

    refreshStreams(force) {
        this.queue.forEach((video, index) => {
            if (Math.abs(index - this.currentIndex) < 2) {
                video.stream = (!force && video.stream) || ytdl(video.id, {
                    audioonly: true
                });
                // audioonly is unreliable
                video.backupStream = (!force && video.backupStream) || ffmpeg({
                    source: ytdl(video.id, {
                        quality: 'lowest'
                    })
                })
                .noVideo()
                .format('mp3');
            } else {
                video.stream = null;
                video.backupStream = null;
            }
        });
    }

    playPause(user) {
        if (this.dispatcher.paused) {
            this.dispatcher.resume();
            this.playing = true;
            this.paused = false;
            this.pausedBy = null;
        } else {
            this.dispatcher.pause();
            this.playing = false;
            this.paused = true;
            if (user) {
                this.pausedBy = user;
            }
        }
    }

    play({
        index
    }) {
        const video = this.queue[index];

        if (!video.stream) {
            console.log('wtf no stream');
            this.refreshStreams();
            if (!video.stream) {
                return;
            }
        }

        this.clearTimeout();
        this.playing = true;
        this.paused = false;

        if (this.dispatcher) {
            this.dispatcher.removed = true;
            this.dispatcher.end();
        }

        const dispatcher = this.dispatcher = this.connection.playStream(video.stream, {
            passes: config.PASSES || 3,
            volume: this.volume,
            bitrate: 'auto'
        });

        dispatcher.on('end', () => {
            if (this.currentVideo()) {
                console.log('Ended dispatcher');
                console.log('Time played: ' + dispatcher.time / 1000);
                console.log('Total song time: ' + this.currentVideo().duration);
                console.log('Played %: ' + (dispatcher.time / this.currentVideo().duration / 10));
            }
            if (!dispatcher.removed) {
                if (this.loop == 1) {
                    this.refreshStreams(true);
                    this.play({
                        index: this.currentIndex
                    });
                } else {
                    this.next();
                }
            }
        });
    }

    currentVideo() {
        return this.queue[this.currentIndex] || null;
    }

    lastVideo() {
        return this.queue[this.queue.length - 1] || null;
    }

    buildPlayingEmbed() {
        const paused = this.paused,
        looping = this.loop,
        current = this.currentVideo(),
        last = this.lastVideo();
        return {
            title: current
                ? paused
                    ? this.i18n.msg('paused-title', 'play', current.cleanTitle, this.lang)
                    : looping == 1
                        ? this.i18n.msg('looping-title', 'play', current.cleanTitle, this.lang)
                        : this.i18n.msg('playing-title', 'play', current.cleanTitle, this.lang)
                : this.i18n.msg('no-video-title', 'play', this.lang),
            url: current ? current.url : undefined,
            description: current
                ? this.buildDescription(current.duration, this.dispatcher.time)
                : this.buildDescription(last.duration, last.duration * 1000),
            footer: this.pausedBy
                ? {
                    text: this.i18n.msg('footer-paused-by', 'play', this.pausedBy.username, this.lang),
                    icon_url: this.pausedBy.displayAvatarURL || undefined
                }
                : undefined
        };
    }

    pad(n, i) {
        return (new Array(i).join('0') + Math.floor(n)).slice(-i);
    }

    buildDescription(duration, playing) {
        console.log(duration, playing, playing / duration / 10);
        const end = this.formatTime(duration),
        cur = this.formatTime(playing / 1000, end.length - 3),
        bar = this.buildProgressBar(playing / duration / 10, 30);

        return `\`${cur} ${bar} ${end}\``;
    }

    buildProgressBar(percentage, length) {
        percentage = Math.min(percentage, 100);
        const blocks = [
            '▏',
            '▎',
            '▍',
            '▋',
            '▊',
            '▉',
        ],
        empty = '—',
        percharacter = 100 / (length - 1),
        fulls = Math.floor(percentage / percharacter),
        leftover = (percentage / percharacter) % 1,
        last = leftover ? blocks[Math.floor(leftover * blocks.length)] : empty;

        // const bar = (new Array(fulls + 1).join(blocks[blocks.length - 1])
        //     + last 
        //     + new Array(length - fulls).join(empty)).slice(0, length);
        const bar = (
            new Array(fulls + 1).join(empty)
            + '🔘'
            + new Array(Math.max(length - 1 - fulls, 0)).join(empty)
        );

        return bar;
    }

    async sendEmbed(channel) {
        if (this.sendingEmbed) {
            console.log('Caught sending embed twice', channel);
            return;
        }

        this.sendingEmbed = true;
        this.textChannel = channel;
        if (this.message) {
            if (this.message.collector) {
                this.message.collector.stop();
            }

            this.message.delete();
            this.message = null;
        }

        const message = this.message = await channel.send({
            embed: this.buildPlayingEmbed()
        });

        this.sendingEmbed = false;

        if (!this.currentVideo()) {
            if (this.queue.length) {
                this.react(message, ['🔁'])

                const collector = message.collector = message.createReactionCollector(
                    (reaction, user) => reaction.emoji.name == '🔁',
                    {

                    }
                );
        
                collector.on('collect', (reaction) => {
                    collector.end();
                    this.currentIndex = 0;
                    this.play({
                        index: 0
                    });
                });
            }

            return this.message;
        }

        this.react(message, ['⏯', '🔂']);

        const collector = message.collector = message.createReactionCollector(
            (reaction, user) => user.id != this.message.author.id && ['⏯', '🔂'].includes(reaction.emoji.name),
            {

            }
        );

        collector.on('collect', (reaction) => {
            switch (reaction.emoji.name) {
                case '⏯':
                    let user;
                    reaction.users.filter(user => user != message.author).forEach(reactor => {
                        user = reactor;
                        reaction.remove(user);
                    });
                    this.playPause(user);
                    break;
                case '🔂':
                    reaction.users.filter(user => user != message.author).forEach(user => reaction.remove(user));
                    this.toggleLooping();
                    break;
            }
        });

        this.startEditingInterval();
        return this.message;
    }

    startEditingInterval() {
        if (this.interval) {
            clearInterval(this.interval);
        }
        this.interval = setInterval(() => {
            if (this.editedEmbed--) return;
            this.editedEmbed++;
            if (this.editing) return;
            this.editEmbed();
        }, 1500);
    }

    async editEmbed() {
        if (!this.message) {
            console.log('Called editEmbed() without sending a message');
            return;
        }

        this.editing = true;

        try {
            await this.message.edit({
                embed: this.buildPlayingEmbed()
            });
        } catch(e) {}

        this.editing = false;
    }

    formatTime(s, pad) {
        let m;
        if (pad) {
            m = this.pad(s / 60, pad);
        } else {
            m = Math.floor(s / 60);
        }
        s = this.pad(s % 60, 2);
        return m + ':' + s;
    }

    timeUntil(video) {
        let offset = 0,
        current = this.currentVideo(),
        i = this.currentIndex;

        if (this.dispatcher && current) {
            offset += current.duration - this.dispatcher.time / 1000;
        }

        while (i++) {
            const v = this.queue[i];
            if (!v || v == video) break;
            offset += v.duration;
        }

        console.log(offset);

        return offset;
    }

    buildSongEmbed({
        video,
        title,
        user,
        playing,
        addEstimation,
        bigImage,
        progressBar,
    }) {
        const fields = [],
        index = this.queue.indexOf(video);

        fields.push({
            inline: true,
            name: this.i18n.msg('channel', 'play', this.lang),
            value: `[${video.channel.name}](${video.channel.url})`,
        });

        fields.push({
            inline: true,
            name: this.i18n.msg('duration', 'play', this.lang),
            value: this.formatTime(video.duration),
        });

        if (addEstimation !== false) {
            fields.push({
                inline: true,
                name: this.i18n.msg('estimated-time', 'play', this.lang),
                value: playing
                    ? this.i18n.msg('right-now', 'play', this.lang)
                    : this.formatTime(this.timeUntil(video)),
            });
        }

        fields.push({
            inline: true,
            name: this.i18n.msg('queue-position', 'play', this.lang),
            value: index - this.currentIndex > 0
                ? this.i18n.msg('relative-position', 'play', index + 1, index - this.currentIndex, this.lang)
                : index + 1,
        });

        let description;

        if (progressBar && this.dispatcher) {
            description = this.buildDescription(video.duration, this.dispatcher.time);
        } else if (!this.protipped && !playing) {
            this.protipped = true;
            description = this.i18n.msg('jump-protip', 'play', this.lang);
        }

        return {
            title: title || video.cleanTitle,
            url: video.url,
            description,
            thumbnail: bigImage ? undefined : {
                url: video.thumbnail
            },
            image: bigImage ? {
                url: video.thumbnail
            } : undefined,
            footer: {
                icon_url: user.displayAvatarURL || undefined,
                text: this.i18n.msg('footer-requested-by', 'play', user.username, this.lang)
            },
            fields,
        }
    }

    async sendSongEmbed({
        channel,
        video,
        title,
        user,
        playing,
        addEstimation,
        bigImage,
        progressBar,
    }) {
        const message = await channel.send({
            embed: this.buildSongEmbed({
                video,
                user,
                title,
                playing,
                addEstimation,
                bigImage,
                progressBar,
            }),
        });

        if (playing) return;

        this.react(message, ['⏭', '❌'])

        const reactions = await message.awaitReactions(
            (reaction, reactor) => reactor.id == user.id && ['❌', '⏭'].includes(reaction.emoji.name),
            {
                time: 60000,
                max: 1,
            }
        );

        message.clearReactions();

        if (reactions.size) {
            if (reactions.first().emoji.name == '⏭') {
                this.queue.splice(this.queue.indexOf(video), 1);
                this.queue.splice(this.currentIndex + 1, 0, video);
                
                this.next();
            } else {
                message.delete();
                if (this.currentVideo !== video) {
                    this.queue.splice(this.queue.indexOf(video), 1);
                } else {
                    this.next();
                }
            }
        }
    }

    next() {
        this.currentIndex++;
        if (this.interval) {
            clearInterval(this.interval);
        }
        if (this.loop == 2 && this.currentIndex == this.queue.length) {
            this.refreshStreams(true);
            this.currentIndex = 0;
        }
        if (this.currentVideo()) {
            this.play({
                index: this.currentIndex
            });
            this.sendEmbed(this.textChannel);
            return true;
        } else {
            // this.currentIndex = -1;
            this.playing = false;
            this.sendEmbed(this.textChannel);
            this.startTimeout();
            return false;
        }
    }

    startTimeout(fn, ms = 300000) {
        this.timeout = setTimeout(() => {
            if (fn) {
                fn();
            }
            this.disconnect()
        }, ms);
    }

    clearTimeout() {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
    }

    async react(message, emojis) {
        for (let i = 0; i < emojis.length; i++) {
            await message.react(emojis[i]);
        }
    }

    toggleLooping() {
        this.loop = this.loop == 0 ? 1 : 0;
        this.editEmbed();
    }

    setVolume(percentage) {
        this.volume = percentage / 100;
        if (this.dispatcher) {
            this.dispatcher.setVolume(this.volume);
        }
    }
}

class Video {
    constructor({
        id,
        title,
        duration,
        live,
        channel,
        query
    }) {
        this.id = id;
        this.title = title;
        this.duration = Number(duration);
        this.live = live;
        this.thumbnail = `https://img.youtube.com/vi/${this.id}/0.jpg`;
        this.channel = channel;
        this.query = query;
        this.stream = null;
    }

    get url() {
        return `https://youtu.be/${this.id}`;
    }

    get cleanTitle() {
        return this.title
            .replace(/\(.+?\)|\[.+?]/g, '')
            .replace(/,.+?-/g, ' -')
            .replace(/\s+/g, ' ')
            .trim();
    }

    async tryFetchBetterThumbnail() {
        try {
            const better = `https://img.youtube.com/vi/${this.id}/maxresdefault.jpg`;
            await got.head(better);
            this.thumbnail = better;
            return true;
        } catch(e) {
            return false;
        }
    }
}

class Channel {
    constructor({
        name,
        url
    }) {
        this.name = name;
        this.url = url;
    }
}

module.exports = {
    MusicController,
    Video,
    Channel,
};
