const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
   data: new SlashCommandBuilder()
      .setName('desbanir')
      .setDescription('Mostra os membros banidos e permite desbanir um deles.')
      .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
   async execute(interaction) {
      const staffRoleId = '1370174006585589772';
      const logChannelId = '1377703820393713714';
      const inviteLink = 'https://discord.gg/PTcWY5SAbV';

      // Verifica se o usuário tem o cargo de staff
      if (!interaction.member.roles.cache.has(staffRoleId)) {
         return interaction.reply({ content: 'Você não tem permissão para usar este comando.', ephemeral: true });
      }

      // Busca os banidos
      let bans;
      try {
         bans = await interaction.guild.bans.fetch();
      } catch (err) {
         return interaction.reply({ content: 'Não foi possível buscar a lista de banidos. Verifique as permissões do bot.', ephemeral: true });
      }
      if (!bans || bans.size === 0) {
         return interaction.reply({ content: 'Não há membros banidos neste servidor.', ephemeral: true });
      }

      // Cria o select menu com os banidos
      const options = Array.from(bans.values()).map(ban => ({
         label: ban.user.tag,
         description: `ID: ${ban.user.id}`,
         value: ban.user.id
      })).slice(0, 25); // Discord limita 25 opções

      const row = new ActionRowBuilder().addComponents(
         new StringSelectMenuBuilder()
            .setCustomId('unban_select')
            .setPlaceholder('Selecione um membro para desbanir')
            .addOptions(options)
      );

      await interaction.reply({
         content: 'Selecione um membro banido para desbanir:',
         components: [row],
         ephemeral: true
      });

      // Coletor para o select menu
      const filter = i => i.customId === 'unban_select' && i.user.id === interaction.user.id;
      const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000, max: 1 });

      collector.on('collect', async selectInteraction => {
         const userId = selectInteraction.values[0];
         const banInfo = bans.get(userId);

         try {
            // Tenta enviar DM ANTES de desbanir
            let dmSent = false;
            try {
               await banInfo.user.send(
                  `Você foi desbanido do servidor **${interaction.guild.name}**!\nVolte usando este convite: ${inviteLink}`
               );
               dmSent = true;
            } catch (err) {
               // Usuário não aceita DMs
            }

            await interaction.guild.members.unban(userId);

            // Log estilizado
            const logEmbed = new EmbedBuilder()
               .setTitle('🔓 Membro Desbanido')
               .setColor(0x00FF99)
               .setThumbnail(banInfo.user.displayAvatarURL())
               .addFields(
                  { name: 'Usuário', value: `${banInfo.user.tag} (\`${banInfo.user.id}\`)`, inline: false },
                  { name: 'Desbanido por', value: `<@${interaction.user.id}>`, inline: false },
                  { name: 'Motivo do ban', value: banInfo.reason || 'Não especificado', inline: false },
                  { name: 'DM enviada?', value: dmSent ? 'Sim' : 'Não', inline: true }
               )
               .setTimestamp();

            // Envia log apenas se o canal existir e for de texto
            let logChannel = null;
            try {
               logChannel = await interaction.guild.channels.fetch(logChannelId);
            } catch {}
            if (logChannel && logChannel.isTextBased()) {
               await logChannel.send({ embeds: [logEmbed] });
            }

            await selectInteraction.update({
               content: `✅ ${banInfo.user.tag} foi desbanido com sucesso!`,
               components: []
            });
         } catch (err) {
            await selectInteraction.update({
               content: 'Ocorreu um erro ao tentar desbanir o usuário.',
               components: []
            });
         }
      });

      collector.on('end', collected => {
         if (collected.size === 0) {
            interaction.editReply({ content: 'Tempo esgotado. Nenhum membro foi desbanido.', components: [] });
         }
      });
   }
};