const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Mostra informações sobre o usuário mencionado ou sobre você mesmo.')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('Usuário para mostrar informações')
                .setRequired(false)),
    async execute(interaction) {
        const user = interaction.options.getUser('usuario') || interaction.user;
        const member = await interaction.guild.members.fetch(user.id);

        const embed = {
            color: 0x5865F2,
            title: `👤 Informações de ${user.tag}`,
            thumbnail: { url: user.displayAvatarURL({ dynamic: true, size: 256 }) },
            description:
                `**🆔 ID:** ${user.id}\n` +
                `**🎉 Entrou no servidor:** <t:${Math.floor(member.joinedTimestamp / 1000)}:F>\n` +
                `**📅 Conta criada:** <t:${Math.floor(user.createdTimestamp / 1000)}:F>\n` +
                `**🤖 Bot?:** ${user.bot ? 'Sim' : 'Não'}\n` +
                `**🏷️ Apelido:** ${member.nickname ? member.nickname : 'Nenhum'}\n` +
                `**🎭 Cargos:** ${member.roles.cache.filter(r => r.id !== interaction.guild.id).map(r => `<@&${r.id}>`).join(', ') || 'Nenhum'}`,
            footer: { text: `KanaryBOT • UserInfo • ${interaction.guild.name}` },
            timestamp: new Date().toISOString()
        };

        await interaction.reply({ embeds: [embed] });
    }
};