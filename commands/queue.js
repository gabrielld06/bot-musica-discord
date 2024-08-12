const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Exibe a fila de musicas'),
    async execute(interaction, activeConnections) {
        const audioPlayer = activeConnections[interaction.guild.id];

        if (audioPlayer) {
            await interaction.reply({ content: `TOCANDO: ${audioPlayer.playing}` });
            const queue = audioPlayer.queue;

            if (queue.length == 0) return;

            const row = new ActionRowBuilder();
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId('<')
                    .setLabel('<-')
                    .setStyle(1)
            )
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('>')
                        .setLabel('->')
                        .setStyle(1)
                );

            let content = "Pagina 1\n";
            for (let i = 0; i < 10 && i < queue.length; i++) {
                content += `**${i + 1} - ${queue[i].title}** [<${queue[i].url}>]\n`;
            }

            const msg = await interaction.followUp({
                content: content,
                components: (queue.length > 10 ? [row] : [])
            });

            if (queue.length < 10) return; // if less than 10 then don't need page movement buttons

            const collector = interaction.channel.createMessageComponentCollector({
                max: 1000,
                time: 30000
            });

            collector.on('collect', async (i) => {
                let next;

                const at = i.message.content.split(" ")[1];
                if (i.customId == '>') {
                    next = parseInt(at) + 1;
                } else if (i.customId == '<') {
                    next = parseInt(at) - 1;
                }

                if (next > Math.ceil(queue.length / 10) || next < 1) {
                    try {
                        await i.deferUpdate();
                    } catch (err) {
                        console.log(err);
                    }
                    return;
                }

                let content = `Pagina ${next}\n`;
                for (let i = (next - 1) * 10; i < next * 10 && i < queue.length; i++) {
                    content += `**${i + 1} - ${queue[i].title}** [<${queue[i].url}>]\n`;
                }

                await msg.edit({
                    content: content,
                    components: [row]
                });

                try {
                    await i.deferUpdate();
                } catch (err) {
                    console.log(err);
                }
            });
        } else {
            await interaction.reply("Nenhuma música tocando");
        }




        // if(audioPlayer) {
        //     await interaction.reply({ content : `TOCANDO: ${audioPlayer.playing}` });
        //     const queue = audioPlayer.queue;
        //     let output = "";

        //     for(let i = 0;i < queue.length;i++) {
        //         const name = (await ytdl.getInfo(queue[i].url)).videoDetails.title;
        //         output += `${i+1} - ${name} [<${queue[i].url}>]\n`;

        //         if(output.length > 2000) {
        //             await interaction.followUp(output);
        //             output = "";
        //         }
        //     }

        //     if(output.length > 0) {
        //         await interaction.followUp(output);
        //     }
        // } else {
        //     await interaction.reply("Nenhuma música tocando");
        // }
    },
};
