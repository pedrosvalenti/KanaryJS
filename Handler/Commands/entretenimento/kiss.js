const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const kissGifs = [
    'https://i.gifer.com/i0I.gif',
    'https://i.gifer.com/i0I.gif',
    'https://i.gifer.com/i0I.gif',
    'https://i.gifer.com/i0I.gif',
    'https://i.gifer.com/i0I.gif',
    'https://i.gifer.com/i0I.gif',
    'https://i.gifer.com/i0I.gif',
    'https://i.gifer.com/i0I.gif'
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kiss')
        .setDescription('Beije outro membro do servidor!')
        .addUserOption(option =>
            option.setName('membro')
                .setDescription('Mencione o membro que você quer beijar')
                .setRequired(true)
        ),
    async execute(interaction) {
        const user = interaction.user;
        const member = interaction.options.getUser('membro');

        if (member.id === user.id) {
            return interaction.reply({ content: 'Você não pode se beijar!', ephemeral: true });
        }
        if (member.bot) {
            return interaction.reply({ content: 'Você não pode beijar bots!', ephemeral: true });
        }

        const gif = kissGifs[Math.floor(Math.random() * kissGifs.length)];

        const embed = new EmbedBuilder()
            .setDescription(`<@${user.id}> beijou <@${member.id}>! 💘`)
            .setImage(gif)
            .setColor(0xFF69B4);

        await interaction.reply({ embeds: [embed] });
    }
};