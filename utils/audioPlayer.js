const ytdl = require('@distube/ytdl-core');
const { createAudioResource, createAudioPlayer } = require('@discordjs/voice');

module.exports = class audioPlayer {
    constructor(destroyConn) {
        this.queue = [];
        this.playing = "";
        this.player = createAudioPlayer();
        this.destroyConn = destroyConn;

        this.player.on("stateChange", async (oldState, newState) => {
            if (newState.status == "idle") {
                if (this.queue.length > 0) {
                    const next = this.queue.shift();
                    const url = next.url;

                    const info = await ytdl.getInfo(url);

                    const stream = ytdl.downloadFromInfo(info, { highWaterMark: 1 << 25, filter: 'audioonly' });

                    const resource = createAudioResource(stream);

                    this.playing = url;
                    this.player.play(resource, { type: 'opus' });
                } else {
                    this.destroyConn();
                }
            }
        });

        this.player.on("error", (error) => {
            console.log("error ", error);
        });
    }

    async play(url) {
        if (this.player._state.status != 'idle') {
            this.queue.push({
                url: url,
                title: '',
            });

            return "ADDED_TO_QUEUE";
        }

        const info = await ytdl.getInfo(url);

        const stream = ytdl.downloadFromInfo(info, { highWaterMark: 1 << 25, filter: 'audioonly' });

        const resource = createAudioResource(stream);

        this.playing = url;
        this.player.play(resource, { type: 'opus' });

        return "PLAYING";
    }
}
