const { SlashCommandBuilder } = require('discord.js');
const { PermissionsBitField } = require('discord.js');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

module.exports = {
   data: new SlashCommandBuilder()
      .setName('emoji')
      .setDescription('Adiciona um emoji personalizado ao servidor.')
      .addStringOption(option =>
         option.setName('nome')
            .setDescription('Nome do novo emoji')
            .setRequired(true))
      .addStringOption(option =>
         option.setName('emoji')
            .setDescription('Emoji para adicionar (pode ser de outro servidor)')
            .setRequired(true)),
   async execute(interaction) {
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageEmojisAndStickers)) {
         return interaction.reply({ content: 'Você precisa da permissão de **Gerenciar Emojis** para usar este comando.', ephemeral: true });
      }

      const emojiInput = interaction.options.getString('emoji');
      const emojiName = interaction.options.getString('nome').replace(/[^a-zA-Z0-9_]/g, '');

      // Regex para pegar emojis customizados
      const customEmojiRegex = /<(a)?:([a-zA-Z0-9_]+):(\d+)>/;
      const match = emojiInput.match(customEmojiRegex);

      if (!match) {
         return interaction.reply({ content: 'Por favor, forneça um emoji customizado válido de outro servidor.', ephemeral: true });
      }

      const isAnimated = match[1] === 'a';
      const emojiId = match[3];
      const ext = isAnimated ? 'gif' : 'png';
      const emojiURL = `https://cdn.discordapp.com/emojis/${emojiId}.${ext}?quality=lossless`;

      try {
         // Baixa a imagem do emoji
         const response = await fetch(emojiURL);
         if (!response.ok) throw new Error('Falha ao baixar o emoji.');
         const buffer = await response.buffer();

         // Cria o emoji no servidor
         const createdEmoji = await interaction.guild.emojis.create({
            attachment: buffer,
            name: emojiName
         });

         await interaction.reply({ content: `Emoji adicionado com sucesso! <${isAnimated ? 'a' : ''}:${createdEmoji.name}:${createdEmoji.id}>`, ephemeral: false });
      } catch (err) {
         await interaction.reply({ content: `Erro ao adicionar emoji: ${err.message}`, ephemeral: true });
      }
   }
};