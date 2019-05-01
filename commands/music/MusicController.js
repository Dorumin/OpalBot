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
        this.currentIndex = -1;
        this.textChannel = null;
        this.dispatcher = null;
        this.connection = null;
        this.channel = null;
        this.message = null;
        this.timeout = null;
        this.editedEmbed = 0;
        this.editing = false;
        this.playing = false;
        this.paused = false;
        this.protipped = false;
        this.loop = 0;
    }

    async connect(channel) {
        if (channel && channel.connection) return channel.connection;
        this.channel = channel;
        this.connection = await channel.join();
        return this.connection;
    }

    disconnect() {
        if (!this.connection) return false;
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

            searched = true;
            id = body.items[0].id.videoId;
            info = await this.videoInfo(id);
        }

        console.log(info);

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

        return res.body;
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
        if (!this.playing) {
            this.currentIndex = index;
            this.play({
                index
            });
        }
        return index == this.currentIndex;
    }

    refreshStreams() {
        this.queue.forEach((video, index) => {
            if (Math.abs(index - this.currentIndex) < 2) {
                video.stream = ytdl(video.id, {
                    audioonly: true
                });
                // audioonly is unreliable
                video._stream = video._stream || ffmpeg({
                    source: ytdl(video.id, {
                        quality: 'lowest'
                    })
                })
                .noVideo()
                .format('mp3');
            } else {
                video.stream = null;
                video._stream = null;
            }
        });
    }

    playPause() {
        if (this.dispatcher.paused) {
            this.dispatcher.resume();
            this.playing = true;
            this.paused = false;
        } else {
            this.dispatcher.pause();
            this.playing = false;
            this.paused = true;
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

        if (this.dispatcher) {
            this.dispatcher.end();
        }

        const dispatcher = this.dispatcher = this.connection.playStream(video.stream, {
            passes: config.PASSES || 3
        });

        dispatcher.on('end', () => {
            console.log('Ended dispatcher');
            console.log('Time played: ' + dispatcher.time / 1000);
            console.log('Total song time: ' + this.currentVideo().duration);
            console.log('Played %: ' + (dispatcher.time / this.currentVideo().duration / 10));
            if (!dispatcher.removed) {
                this.next();
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
        current = this.currentVideo(),
        last = this.lastVideo();
        return {
            title: current
                ? paused
                    ? this.i18n.msg('paused-title', 'play', current.title, this.lang)
                    : this.i18n.msg('playing-title', 'play', current.title, this.lang)
                : this.i18n.msg('no-video-title', 'play', this.lang),
            url: current ? current.url : undefined,
            description: current
                ? this.buildDescription(current.duration, this.dispatcher.time)
                : this.buildDescription(last.duration, last.duration * 1000),
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
        percharacter = 100 / length,
        fulls = Math.floor(percentage / percharacter),
        leftover = (percentage / percharacter) % 1,
        last = leftover ? blocks[Math.floor(leftover * blocks.length)] : empty;

        // const bar = (new Array(fulls + 1).join(blocks[blocks.length - 1])
        //     + last 
        //     + new Array(length - fulls).join(empty)).slice(0, length);
        const bar = (
            new Array(fulls + 1).join(empty)
            + '🔘'
            + new Array(length - fulls).join(empty)
        ).slice(0, length)

        return bar;
    }

    async sendEmbed(channel) {
        this.textChannel = channel;
        if (this.message) {
            this.message.collector.stop();
            this.message.delete();
            this.message = null;
        }

        const message = this.message = await channel.send({
            embed: this.buildPlayingEmbed()
        });

        if (!this.currentVideo()) return;

        message.react('⏯');

        const collector = message.collector = message.createReactionCollector(
            (reaction, user) => user.id != this.message.author.id && reaction.emoji.name == '⏯',
            {

            }
        );

        collector.on('collect', (reaction) => {
            console.log(reaction);
            reaction.users.filter(user => user != message.author).forEach(user => reaction.remove(user));
            this.playPause();
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
        playing
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

        fields.push({
            inline: true,
            name: this.i18n.msg('estimated-time', 'play', this.lang),
            value: playing
                ? this.i18n.msg('right-now', 'play', this.lang)
                : this.formatTime(this.timeUntil(video)),
        });

        fields.push({
            inline: true,
            name: this.i18n.msg('queue-position', 'play', this.lang),
            value: index - this.currentIndex > 0
                ? this.i18n.msg('relative-position', 'play', index + 1, index - this.currentIndex, this.lang)
                : index + 1,
        });

        let description;

        if (!this.protipped && !playing) {
            this.protipped = true;
            description = this.i18n.msg('jump-protip', 'play', this.lang);
        }

        return {
            title: title || video.title,
            url: video.url,
            description,
            thumbnail: {
                url: video.thumbnail
            },
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
    }) {
        const message = await channel.send({
            embed: this.buildSongEmbed({
                video,
                user,
                title,
                playing,
            }),
        });

        if (playing) return;

        (async () => {
            await message.react('⏭');;
            message.react('❌');
        })();

        const reactions = await message.awaitReactions(
            (reaction, reactor) => reactor.id == user.id && ['❌', '⏭'].includes(reaction.emoji.name),
            {
                time: 60000,
                max: 1,
            }
        );

        message.clearReactions();

        if (reactions.size) {
            if (reactions.first().name == '⏭') {
                this.queue.splice(this.queue.indexOf(video), 1);
                this.queue.splice(this.currentIndex + 1, 0, video);
                
                this.next();
            } else {
                if (this.currentVideo !== video) {
                    this.queue.splice(this.queue.indexOf(video), 1);
                } else {
                    message.delete();
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
        if (this.currentVideo()) {
            this.play({
                index: this.currentIndex
            });
            this.sendEmbed(this.textChannel);
            return true;
        } else {
            this.currentIndex = -1;
            this.playing = false;
            this.sendEmbed(this.textChannel);
            this.startTimeout();
            return false;
        }
    }

    startTimeout(fn, ms = 30000) {
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