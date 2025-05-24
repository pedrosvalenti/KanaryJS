const { SlashCommandBuilder, PermissionFlagsBits, ButtonBuilder, ButtonStyle, ActionRowBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../utils/database'); // Supondo que você tenha um sistema de banco de dados

module.exports = {
  data: new SlashCommandBuilder()
    .setName('casar')
    .setDescription('Peça alguém em casamento!')
    .addUserOption(option =>
      option.setName('membro')
        .setDescription('Membro para casar')
        .setRequired(true)
    ),
  async execute(interaction) {
    const proposer = interaction.user;
    const member = interaction.options.getUser('membro');

    if (member.id === proposer.id) {
      return interaction.reply({ content: 'Você não pode casar consigo mesmo!', ephemeral: true });
    }

    // Verifica se já estão casados
    const casamentoExistente = await db.getCasamento(proposer.id, member.id);
    if (casamentoExistente) {
      return interaction.reply({ content: 'Vocês já estão casados!', ephemeral: true });
    }

    // Envia proposta de casamento
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('casar_aceitar')
          .setLabel('Aceitar 💍')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('casar_recusar')
          .setLabel('Recusar ❌')
          .setStyle(ButtonStyle.Danger)
      );

    const embed = new EmbedBuilder()
      .setTitle('Pedido de Casamento!')
      .setDescription(`${member}, você foi pedido(a) em casamento por ${proposer}!\nAceita?`)
      .setColor(0xFFC0CB);

    await interaction.reply({ content: `${member}`, embeds: [embed], components: [row] });

    // Coleta resposta
    const filter = i => (i.customId === 'casar_aceitar' || i.customId === 'casar_recusar') && i.user.id === member.id;
    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000, max: 1 });

    collector.on('collect', async i => {
      if (i.customId === 'casar_aceitar') {
        // Salva casamento no banco de dados
        await db.casar(proposer.id, member.id, new Date());
        await i.update({ content: `🎉 Parabéns! ${proposer} e ${member} agora estão casados!`, embeds: [], components: [] });
      } else {
        await i.update({ content: `${member} recusou o pedido de casamento. 😢`, embeds: [], components: [] });
      }
    });

    collector.on('end', async collected => {
      if (collected.size === 0) {
        await interaction.editReply({ content: 'O pedido de casamento expirou.', embeds: [], components: [] });
      }
    });
  },
};

// Exemplo de funções do banco de dados (utils/database.js):
// async function getCasamento(id1, id2) { ... }
// async function casar(id1, id2, data) { ... }

// Para cobrança mensal, crie um job agendado que verifica casamentos e cobra 100 estrelas todo mês na data do casamento.