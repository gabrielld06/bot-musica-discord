const { SlashCommandBuilder } = require('@discordjs/builders');
const { ActionRowBuilder, ButtonBuilder } = require('discord.js');
const ytdl = require('@distube/ytdl-core');
const getIds = require('../utils/getIds.js');
const playAudioHandler = require("../utils/playAudioHandler.js");

const baseURL = "https://www.youtube.com/watch?v=";

async function getDescriptions(audioName) {
    const IDs = await getIds(audioName);
    const descriptions = [];

    for(let i = 0;i < IDs.length && descriptions.length < 5;i++) {
        if(!ytdl.validateURL(baseURL + IDs[i])) continue;
        const info = (await ytdl.getBasicInfo(baseURL + IDs[i])).videoDetails;
        descriptions.push({ title : info.title, url : info.video_url });
    }

    return descriptions;
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('search')
		.setDescription('Procurar música')
        .addStringOption(option =>
            option.setName('nome')
              .setDescription('Nome da música')
              .setRequired(true)),
	async execute(interaction, activeConnections) {
        const audioName = interaction.options.getString('nome');
        const msg = await interaction.reply('Pera ai');
        const descriptions = await getDescriptions(audioName);
        const channel = interaction.channel;

        const row = new ActionRowBuilder();
        row.addComponents(
            new ButtonBuilder()
                .setCustomId('<')
                .setLabel('<-')
                .setStyle(2)
            )
            .addComponents(
            new ButtonBuilder()
                .setCustomId('S')
                .setLabel('Select')
                .setStyle(1)
            )
            .addComponents(
            new ButtonBuilder()
                .setCustomId('>')
                .setLabel('->')
                .setStyle(2)
            );

        await msg.edit({
            content: `1 - **${descriptions[0].title}**\n${descriptions[0].url}`,
            components: [row]
          });

        const collector = channel.createMessageComponentCollector({
            max: 1000,
            time: 300000
        });
    
        collector.on('collect', async (i) => {
            let next;
        
            const at = i.message.content.split(" ")[0];
            if (i.customId == '>') {
                next = parseInt(at);
            } else if (i.customId == '<') {
                next = parseInt(at) - 2;
            } else { // song selected
                collector.stop();

                await msg.edit({
                    content: 'Pera ai',
                    components: []
                });

                const voiceChannel = await interaction.member.voice.channel;

                if (voiceChannel) {
                    await playAudioHandler(descriptions[at-1].url, voiceChannel, interaction, activeConnections);
                } else {
                    await interaction.editReply('Entra em um canal');
                }

                return;
            }

            // set msg to next song
            if (next < 0) {
                next = descriptions.length - 1
            }
            next = next % descriptions.length;

            await msg.edit({
                content: `${next+1} - **${descriptions[next].title}**\n${descriptions[next].url}`,
                components: [row]
              });
        
            i.deferUpdate();
        });
	},
};
