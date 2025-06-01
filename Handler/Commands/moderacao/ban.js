const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
   data: new SlashCommandBuilder()
      .setName('ban')
      .setDescription('Bane um membro do servidor.')
      .addUserOption(option =>
         option.setName('membro')
            .setDescription('Membro a ser banido')
            .setRequired(true))
      .addStringOption(option =>
         option.setName('motivo')
            .setDescription('Motivo do banimento')
            .setRequired(false)),
   async execute(interaction) {
      const staffRoleId = '1370174006585589772';
      const logChannelId = '1377700486337007636';

      // Verifica se o usuário tem o cargo de staff
      if (!interaction.member.roles.cache.has(staffRoleId)) {
         return interaction.reply({ content: 'Você não tem permissão para usar este comando.', ephemeral: true });
      }

      const target = interaction.options.getUser('membro');
      const motivo = interaction.options.getString('motivo') || 'Não especificado';
      const member = await interaction.guild.members.fetch(target.id).catch(() => null);

      if (!member) {
         return interaction.reply({ content: 'Membro não encontrado no servidor.', ephemeral: true });
      }

      if (!member.bannable) {
         return interaction.reply({ content: 'Não posso banir este membro.', ephemeral: true });
      }

      await member.ban({ reason: motivo });

      // Cria o embed de log
      const embed = new EmbedBuilder()
         .setTitle('🚫 Membro Banido')
         .setColor(0xff0000)
         .setThumbnail(target.displayAvatarURL())
         .addFields(
            { name: 'Membro', value: `${target.tag} (${target.id})`, inline: false },
            { name: 'Banido por', value: `${interaction.user.tag} (${interaction.user.id})`, inline: false },
            { name: 'Motivo', value: motivo, inline: false },
            { name: 'Data', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false }
         )
         .setFooter({ text: 'KanaryBOT • Sistema de Moderação', iconURL: interaction.client.user.displayAvatarURL() });

      // Envia o log no canal especificado
      const logChannel = interaction.guild.channels.cache.get(logChannelId);
      if (logChannel && logChannel.isTextBased()) {
         await logChannel.send({ embeds: [embed] });
      }

      await interaction.reply({ content: `O membro ${target.tag} foi banido com sucesso.`, ephemeral: true });
   }
};