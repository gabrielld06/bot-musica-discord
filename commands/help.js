const { SlashCommandBuilder } = require('@discordjs/builders');
const { getVoiceConnection } = require('@discordjs/voice');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Ajuda para burros'),
	async execute(interaction) {
        await interaction.reply(
            'spoiler == bug/feature/aiaiuiui preguiça\n'+
            'join - entra no canal, provavelmente vai dar merda se usar isso pq nao atualizei depois q mudei umas coisas\n'+
            'play - toca musica a partir de url (se for uma playlist adiciona todas as musicas dela ||demora um pouquinho||)\n'+
            'search - escolha uma musica procurando pelo titulo\n'+
            'queue - mostra a fila de musicas\n'+
            'stop - trivial ||não interrompe a adição de musicas a fila, exemplo: adicionar uma playlist e dar stop logo em seguida -> vai limpar a fila no momento e continuar adicionando as que faltavam||'
        );
	},
};