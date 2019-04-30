const got = require('got'),
ytdl = require('ytdl-core'),
config = require('../../src/config.js'),
videoIdRegex = /[a-zA-Z0-9-_]{11}$/,
videoLinkRegex = /https?:\/\/(?:www\.|m\.)?(?:youtu\.be\/|youtube\.com\/watch\?v=)([a-zA-Z0-9-_]{11})/g;

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
        this.playing = false;
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
        return true;
    }

    /* Seaches the YouTube API for a query string, and returns the first result. Can also take an id */
    async searchVideo(query, {
        wait,
        addedBy
    }) {
        let match = query.match(videoLinkRegex) || query.match(videoIdRegex),
        id,
        info;

        if (match) {
            id = match[1] || match[0];
        }

        if (!id || !(info = await this.videoInfo(id))) {
            const body = await this.search(query);

            id = body.items[0].id.videoId;
            info = await this.videoInfo(id);
        }

        const video = new Video({
            id: info.video_id,
            title: info.title,
            duration: info.length_seconds,
            live: info.player_response.videoDetails.isLiveContent
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
                type: 'video'
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
        const index = this.queue.push(video);
        this.refreshStreams();
        if (!this.playing) {
            this.currentIndex = index;
            this.play({
                index
            });
        }
    }

    refreshStreams() {
        this.queue.forEach((video, index) => {
            if (Math.abs(index - this.currentIndex) < 2) {
                video.stream = ytdl(video.id, {
                    audioonly: true
                });
            } else {    
                video.stream = null;
            }
        });
    }

    play({
        index,
        video
    }) {
        const video = this.queue[index];

        if (!video.stream) {
            console.log('wtf no stream');
            this.refreshStreams();
        }

        this.dispatcher = this.connection.playStream(video.stream, {
            passes: config.PASSES || 1
        });
    }

    buildPlayingEmbed() {
        const playing = this.playing,
        current = this.queue[this.currentIndex];
        return {
            title: this.i18n.msg('playing-title', 'play', lang),
            description: this.buildDescription(current.duration, this.dispatcher.time)
        };
    }

    pad(n, i) {
        return (new Array(i).join('0') + Math.floor(n)).slice(-i);
    }

    buildDescription(duration, playing) {
        const end = Math.floor(duration / 60) + pad(duration % 60, 2),
        cur = pad(playing / 1000 / 60, end.length - 3) + pad(playing / 1000, 2),
        bar = this.buildProgressBar(duration / playing * 1000, 20);

        return `${cur} [${bar}] ${end}`;
    }

    buildProgressBar(percentage, length) {
        const blocks = [
            '▏',
            '▎',
            '▍',
            '▋',
            '▊',
            '▉',
        ],
        empty = '┈',
        percharacter = 100 / length,
        fulls = Math.floor(percentage / percharacter),
        leftover = (percentage / percharacter) % 1,
        last = leftover ? blocks[Math.floor(leftover * blocks.length)] : empty,
        bar = (new Array(fulls + 1).join(blocks[blocks.length - 1])
            + last 
            + new Array(length - fulls).join(empty)).slice(0, length);

        return bar;
    }

    async sendEmbed(channel) {
        this.textChannel = channel;
        this.message = await channel.send({
            embed: this.buildPlayingEmbed()
        });
        console.log(this.message);
        return this.message;
    }
}

class Video {
    constructor({
        id,
        title,
        duration,
        live
    }) {
        this.id = id;
        this.title = title;
        this.duration = Number(duration);
        this.live = live;
        this.thumbnail = `https://img.youtube.com/vi/${this.id}/0.jpg`;
        this.stream = null;
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

module.exports = {
    MusicController,
    Video
};