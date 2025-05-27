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
            description: `Aqui estão algumas informações sobre <@${user.id}>:`,
            fields: [
                { name: '🆔 ID', value: `[1m${user.id}[0m`, inline: true },
                { name: '🎉 Entrou no servidor', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`, inline: true },
                { name: '📅 Conta criada', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`, inline: true },
                { name: '🤖 Bot?', value: user.bot ? 'Sim' : 'Não', inline: true },
                { name: '🏷️ Apelido', value: member.nickname ? member.nickname : 'Nenhum', inline: true },
                { name: '🎭 Cargos', value: member.roles.cache.filter(r => r.id !== interaction.guild.id).map(r => `<@&${r.id}>`).join(', ') || 'Nenhum', inline: false },
            ],
            footer: { text: `KanaryBOT • UserInfo • ${interaction.guild.name}` },
            timestamp: new Date().toISOString()
        };

        await interaction.reply({ embeds: [embed] });
    }
};