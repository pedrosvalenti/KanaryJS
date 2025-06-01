const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Mostra o avatar de um usuário.')
        .addUserOption(option =>
            option.setName('usuário')
                .setDescription('Selecione o usuário')
                .setRequired(false)),
    async execute(interaction) {
        const user = interaction.options.getUser('usuário') || interaction.user;
        const avatarUrl = user.displayAvatarURL({ dynamic: true, size: 4096 });

        const embed = {
            color: 0x0099ff,
            title: `Avatar de ${user.tag}`,
            image: { url: avatarUrl },
            description: `**Usuário:** ${user}\n**ID:** ${user.id}`,
        };

        await interaction.reply({ embeds: [embed] });
    },
    // Prefix command handler
    async prefixRun(message, args) {
        let user = message.mentions.users.first() || message.author;
        const avatarUrl = user.displayAvatarURL({ dynamic: true, size: 4096 });

        const embed = {
            color: 0x0099ff,
            title: `Avatar de ${user.tag}`,
            image: { url: avatarUrl },
            description: `**Usuário:** ${user}\n**ID:** ${user.id}`,
        };

        await message.channel.send({ embeds: [embed] });
    }
};
