const ytdl = require('ytdl-core');
const { createAudioResource, createAudioPlayer } = require('@discordjs/voice');

module.exports = class audioPlayer {
    constructor(destroyConn) {
        this.queue = [];
        this.playing = "";
        this.player = createAudioPlayer();
        this.destroyConn = destroyConn;

        this.player.on("stateChange", (oldState, newState) => {
            // console.log("state change");
            // console.log(oldState, "\n\n\n", newState);

            if(newState.status == "idle") {
                if(this.queue.length > 0) {
                    const next = this.queue.shift();

                    this.playing = next.url;
                    this.player.play(next.resource, { type: 'opus' });
    
                    // this.connection.subscribe(next);
                } else {
                    this.destroyConn();
                }
            }
        });

        this.player.on("error", (error) => {
            console.log("error ", error);
        });

        // this.player.on("subscribe", (fon) => {
        //     console.log("subscribe ", fon);
        // });

        // this.player.on("unsubscribe", (fon) => {
        //     console.log("unsubscribe ", fon);
        // });
    }

    async play(url) {
        // console.log("player ", this.player._state);
        console.log(url);

        const info = await ytdl.getInfo(url);
    
        const stream = ytdl.downloadFromInfo(info, { highWaterMark: 1 << 25, filter: 'audioonly' });
    
        const resource = createAudioResource(stream);

        if(this.player._state.status != 'idle') {
            this.queue.push({ url : url, title : info.videoDetails.title, resource : resource });
            return "ADDED_TO_QUEUE";
        }
    
        this.playing = url;
        this.player.play(resource, { type: 'opus' });

        return "PLAYING";
    }
}