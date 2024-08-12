const { SlashCommandBuilder } = require('@discordjs/builders');
const join = require("../utils/joinChannel.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('join')
		.setDescription('Que comece o macaqueamento'),
	async execute(interaction) {
        await interaction.reply('Um momento amigo...');

        const channel = await interaction.member.voice.channel;

        if(channel) {
            if(join(channel)) {
                await interaction.editReply('Pai ta on');
            } else {
                await interaction.editReply('Não consigo entrar nesse canal');
            }
        } else {
            await interaction.editReply('Entra no canal filho da puta');
        }
	},
};
