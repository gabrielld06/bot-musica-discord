const join = require("./joinChannel.js");
const AudioPlayer = require("./audioPlayer.js");
const { ActionRowBuilder, ButtonBuilder, ComponentType } = require('discord.js');

async function changeResponse(interaction) {
    return new Promise(async (response, reject) => {
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('YES')
                    .setLabel('Yes')
                    .setStyle(1)
                )
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('NO')
                    .setLabel('No')
                    .setStyle(1)
                );

        const msg = await interaction.editReply({ content : 'Já to em outro canal, quer que mude?', components : [row]});
        
        const collectorFilter = i => {
            i.deferUpdate();
            return i.user.id === interaction.user.id;
        };

        msg.awaitMessageComponent({ filter: collectorFilter, componentType: ComponentType.Button, time: 60000 })
            .then(async i => {
                response({ response: i.customId, msg: msg});
            })
            .catch(err => {
                console.log('No interactions were collected.');
                response({ response: null, msg: msg});
            });
    });
}

module.exports = async function playAudioHandler(audioURL, voiceChannel, interaction, activeConnections, ignoreOutput) {
    try {
        let connection = await join(voiceChannel, activeConnections);

        if(!connection) {
            await interaction.editReply('Não consigo entrar nesse canal');
            return;
        }

        const found = activeConnections[voiceChannel.guild.id];

        if(found) {
            // different voice channel
            if(connection.joinConfig.channelId != voiceChannel.id) {
                const change = await changeResponse(interaction);

                if(change.response == 'YES') {
                    await change.msg.edit({ content : 'Mudando de canal', components : []});
                    connection = await join(voiceChannel, activeConnections, true);
                    connection.subscribe(found.player);
                } else if(change.response == 'NO') {
                    await change.msg.edit({ content : 'Entra no outro então', components : []});
                    return;
                } else { // no response from user
                    await change.msg.edit({ content : 'Me responde po', components : []});
                    return;
                }
            }

            const status = await found.play(audioURL);

            if(status == 'PLAYING') {
                if(!ignoreOutput) await interaction.editReply(`Tocando ${audioURL}`);
            } else {
                if(!ignoreOutput) await interaction.editReply(`Adicionado a fila ${audioURL}`);
            }

            return status;
        } else {
            const audioPlayer = new AudioPlayer(() => delete activeConnections[voiceChannel.guild.id]);

            audioPlayer.play(audioURL);
            
            connection.subscribe(audioPlayer.player);

            activeConnections[voiceChannel.guild.id] = audioPlayer;

            if(!ignoreOutput) await interaction.editReply(`Tocando ${audioURL}`);
        }
    } catch(error) {
        console.log(error);

        await interaction.editReply('Deu merda');
    }
}

// junky q talvez seja util um dia
// // plano B se der merda alguma hora
// // async function probeAndCreateResource(readableStream) {
// // 	const { stream, type } = await demuxProbe(readableStream);
// // 	return createAudioResource(stream, { inputType: type });
// // }

// module.exports = async function play(player, url) {
//     const info = await ytdl.getInfo(url);

//     const stream = ytdl.downloadFromInfo(info, { highWaterMark: 1 << 25, filter: 'audioonly' });

//     const resource = createAudioResource(stream);

//     player.play(resource, { type: 'opus' });

//     // plano B se der merda alguma hora
//     // demuxProbe(stream).then((probe) => resolve(createAudioResource(probe.stream, { metadata: this, inputType: probe.type }))).catch(onError);
// }