const { SlashCommandBuilder } = require('@discordjs/builders');
const playAudioHandler = require("../utils/playAudioHandler.js");
const ytdl = require('ytdl-core');
const ytpl = require('ytpl');
const { ActionRow } = require('discord.js');

async function playlistHandler(id, voiceChannel, interaction, activeConnections) {
    const firstBatch = (await ytpl(id, { pages: 1 }));
    let playable = firstBatch.items.filter(song => song.isPlayable);
    let songCount = firstBatch.items.length;

    let batchPlaylist = await ytpl.continueReq(firstBatch.continuation);
    playable = playable.concat(batchPlaylist.items.filter(song => song.isPlayable));
    songCount += batchPlaylist.items.length;

    while(batchPlaylist.continuation) {
        batchPlaylist = await ytpl.continueReq(batchPlaylist.continuation);
        playable = playable.concat(batchPlaylist.items.filter(song => song.isPlayable));
        songCount += batchPlaylist.items.length;
    }

    await interaction.editReply(`Adicionando ${playable.length} musicas a fila.${songCount != playable.length ? 
        ` ${playable.length - songCount} músicas da playlist estão indisponiveis` : ''}`);
    
    
    const status = await playAudioHandler(playable.shift().shortUrl, voiceChannel, interaction, activeConnections, true);

    if(status == 'PLAYING') {
        await interaction.followUp(`Tocando ${audioURL}`);
    }

    for(const song of playable) {
        await playAudioHandler(song.shortUrl, voiceChannel, interaction, activeConnections, true);
    }

    // console.log();
    // while(batch.continuation != null) {
    //     console.log(batch.index);
    //     batch = batch.continuation;
    // }

    // await playAudioHandler(audioURL, voiceChannel, interaction, activeConnections);
        
    // console.log(firstResultBatch);
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('Toca algo')
        .addStringOption(option =>
            option.setName('url')
              .setDescription('Url do youtube')
              .setRequired(true)),
	async execute(interaction, activeConnections) {
        const audioURL = interaction.options.getString('url');
        const voiceChannel = await interaction.member.voice.channel;
        await interaction.reply('Pera ai');

        if (voiceChannel) {
            if(!ytdl.validateURL(audioURL)) {
                try {
                    const id = await ytpl.getPlaylistID(audioURL);
    
                    playlistHandler(id, voiceChannel, interaction, activeConnections);
                } catch(err) {
                    return await interaction.editReply('URL invalido');
                }
                return;
            }

            await playAudioHandler(audioURL, voiceChannel, interaction, activeConnections);
        } else {
            await interaction.editReply('Entra em um canal');
        }
	},
};