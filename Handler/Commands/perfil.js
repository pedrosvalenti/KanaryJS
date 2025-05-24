const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const db = require('../../utils/database');

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
    .setDescription('Veja seu perfil e suas informações relacionadas ao bot!'),
  async execute(interaction) {
    const userId = interaction.user.id;
    const data = loadData();
    const userData = data[userId] || { estrelas: 0 };

    // Verifica se o usuário está casado
    let casamentoInfo = null;
    let casadoCom = null;
    if (db && typeof db.getCasamento === 'function') {
      const casamentos = require('../utils/casamentos.json');
      casamentoInfo = casamentos.find(c => c.proposer === userId || c.member === userId);
      if (casamentoInfo) {
        casadoCom = casamentoInfo.proposer === userId ? casamentoInfo.member : casamentoInfo.proposer;
      }
    }

    const embed = new EmbedBuilder()
      .setColor(0xFFD700)
      .setTitle(`Perfil de ${interaction.user.username}`)
      .setThumbnail(interaction.user.displayAvatarURL())
      .addFields(
        { name: '⭐ Estrelas', value: `${userData.estrelas}`, inline: true },
        casamentoInfo
          ? { name: '💍 Estado civil', value: `Casado(a) com <@${casadoCom}>`, inline: true }
          : { name: '💍 Estado civil', value: 'Solteiro(a)', inline: true }
      )
      .setFooter({ text: 'KanaryBOT • Perfil' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: false });
  }
};