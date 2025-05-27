const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('limpar')
        .setDescription('Limpa uma quantidade específica de mensagens do chat.')
        .addIntegerOption(option =>
            option.setName('quantidade')
                .setDescription('Quantia de mensagens para apagar (1-100)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100)
        ),
    async execute(interaction) {
        const roleId = '1370174006585589772';
        const quantidade = interaction.options.getInteger('quantidade');

        // Permissão
        if (!interaction.member.roles.cache.has(roleId)) {
            return interaction.reply({ content: '🚫 Você não tem permissão para usar este comando.', ephemeral: true });
        }

        // Limpar mensagens
        try {
            const deleted = await interaction.channel.bulkDelete(quantidade, true);
            await interaction.reply({ content: `🧹 ${deleted.size} mensagens foram apagadas com sucesso!`, ephemeral: true });
        } catch (error) {
            console.error(error);
            if (error.code === 50034) {
                await interaction.reply({ content: '❗ Não é possível apagar mensagens com mais de 14 dias.', ephemeral: true });
            } else {
                await interaction.reply({ content: '❗ Ocorreu um erro ao tentar apagar as mensagens.', ephemeral: true });
            }
        }
    },
};