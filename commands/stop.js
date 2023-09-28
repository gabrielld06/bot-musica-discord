const { SlashCommandBuilder } = require('@discordjs/builders');
const { getVoiceConnection } = require('@discordjs/voice');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('stop')
		.setDescription('Para a playlist e sai do canal de voz'),
	async execute(interaction) {
        const connection = getVoiceConnection(interaction.guild.id);

        if(connection) {
            await interaction.reply("Quitando daqui");
            connection.destroy();
        } else {
            await interaction.reply("Não to conectado porra");
        }
	},
};