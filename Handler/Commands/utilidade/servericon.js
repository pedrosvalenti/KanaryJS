const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('servericon')
        .setDescription('Mostra o ícone de um servidor pelo ID.')
        .addStringOption(option =>
            option.setName('servidor')
                .setDescription('Coloque o ID do servidor aqui')
                .setRequired(true)),
    async execute(interaction) {
        const guildId = interaction.options.getString('servidor');
        try {
            const guild = await interaction.client.guilds.fetch(guildId);
            const iconUrl = guild.iconURL({ dynamic: true, size: 4096 });
            if (!iconUrl) {
                return interaction.reply({ content: 'Este servidor não possui ícone.', ephemeral: true });
            }
            const embed = {
                color: 0x0099ff,
                title: `Ícone do servidor: ${guild.name}`,
                image: { url: iconUrl },
                description: `**ID:** ${guild.id}`,
            };
            await interaction.reply({ embeds: [embed] });
        } catch (err) {
            await interaction.reply({ content: 'Servidor não encontrado ou o bot não está nele.', ephemeral: true });
        }
    },
    // Prefix command handler
    async prefixRun(message, args) {
        const guildId = args[0] || (message.guild ? message.guild.id : null);
        if (!guildId) {
            return message.reply('Forneça o ID do servidor.');
        }
        try {
            const guild = await message.client.guilds.fetch(guildId);
            const iconUrl = guild.iconURL({ dynamic: true, size: 4096 });
            if (!iconUrl) {
                return message.channel.send('Este servidor não possui ícone.');
            }
            const embed = {
                color: 0x0099ff,
                title: `Ícone do servidor: ${guild.name}`,
                image: { url: iconUrl },
                description: `**ID:** ${guild.id}`,
            };
            await message.channel.send({ embeds: [embed] });
        } catch (err) {
            await message.channel.send('Servidor não encontrado ou o bot não está nele.');
        }
    }
};
