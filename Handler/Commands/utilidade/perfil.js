const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const db = require('../../../utils/database');

const DATA_PATH = path.join(__dirname, 'estrelas.json');

// Função para carregar ou inicializar o banco de dados
function loadData() {
  if (!fs.existsSync(DATA_PATH)) {
    fs.writeFileSync(DATA_PATH, JSON.stringify({}));
  }
  return JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('perfil')
    .setDescription('Veja seu perfil e suas informações relacionadas ao bot!')
    .addUserOption(option =>
      option.setName('usuario')
        .setDescription('Veja o perfil de outro membro')
        .setRequired(false)
    ),
  async execute(interaction) {
    const user = interaction.options.getUser('usuario') || interaction.user;
    const data = loadData();
    const userData = data[user.id] || { estrelas: 0 };

    // Verifica casamento
    let casamentoInfo = '💔 Solteiro(a)';
    let tempoCasado = '';
    const casamentos = require('../../../utils/casamentos.json');
    const casamento = casamentos.find(c => c.proposer === user.id || c.member === user.id);
    if (casamento) {
      const parceiroId = casamento.proposer === user.id ? casamento.member : casamento.proposer;
      const parceiro = await interaction.client.users.fetch(parceiroId).catch(() => null);
      const parceiroTag = parceiro ? parceiro.tag : `ID: ${parceiroId}`;
      const dataCasamento = new Date(casamento.data);
      const agora = new Date();
      const diffMs = agora - dataCasamento;
      const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHoras = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
      casamentoInfo = `💍 Casado(a) com ${parceiro ? `<@${parceiroId}>` : parceiroTag}`;
      tempoCasado = `⏳ Juntos há ${diffDias} dias e ${diffHoras} horas`;
    }

    const embed = new EmbedBuilder()
      .setColor(0xFFD700)
      .setAuthor({ name: `Perfil de ${user.username}`, iconURL: user.displayAvatarURL() })
      .setThumbnail(user.displayAvatarURL())
      .setDescription(
        `**⭐ Estrelas:** ${userData.estrelas}\n` +
        `**Status amoroso:** ${casamentoInfo}` +
        (tempoCasado ? `\n**Tempo de casamento:** ${tempoCasado}` : '')
      )
      .setFooter({ text: 'KanaryBOT • Perfil' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: false });
  }
};