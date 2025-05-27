const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('novovideo')
        .setDescription('Anuncia um novo vídeo para o cargo de membros.')
        .addStringOption(option =>
            option.setName('link')
                .setDescription('Link do novo vídeo')
                .setRequired(true)
        ),
    async execute(interaction) {
        const staffRoleId = '1370174006585589772';
        const membersRoleId = '1370174006594109679';
        const botMention = '<@930958576279760947>';
        const videoLink = interaction.options.getString('link');

        // Verifica se o usuário tem o cargo de staff
        if (!interaction.member.roles.cache.has(staffRoleId)) {
            return interaction.reply({ content: 'Você não tem permissão para usar este comando.', ephemeral: true });
        }

        // Monta a mensagem
        const message = `Olá pessoal o ${botMention} acabou de lançar um novo vídeo em seu canal! <@&${membersRoleId}>\n${videoLink}`;

        // Envia a mensagem no canal
        await interaction.reply({ content: 'Anúncio enviado!', ephemeral: true });
        await interaction.channel.send({ content: message });
    },
};