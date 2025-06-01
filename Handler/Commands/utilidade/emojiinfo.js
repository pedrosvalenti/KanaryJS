const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
   data: new SlashCommandBuilder()
      .setName('emojiinfo')
      .setDescription('Mostra informações sobre um emoji selecionado.')
      .addStringOption(option =>
         option.setName('emoji')
            .setDescription('O emoji para mostrar informações')
            .setRequired(true)
      ),
   async execute(interaction) {
      const emojiInput = interaction.options.getString('emoji');

      // Regex para pegar emojis customizados
      const customEmojiRegex = /<a?:\w+:(\d+)>/;
      const match = emojiInput.match(customEmojiRegex);

      if (!match) {
         return interaction.reply({ content: 'Por favor, forneça um emoji customizado válido.', ephemeral: true });
      }

      const emojiId = match[1];
      const emoji = interaction.client.emojis.cache.get(emojiId);

      if (!emoji) {
         return interaction.reply({ content: 'Não consegui encontrar esse emoji no cache do bot.', ephemeral: true });
      }

      const embed = new EmbedBuilder()
         .setTitle('Informações do Emoji')
         .setThumbnail(emoji.url)
         .setDescription(
            `**Nome:** ${emoji.name}\n` +
            `**ID:** ${emoji.id}\n` +
            `**Animado?:** ${emoji.animated ? 'Sim' : 'Não'}\n` +
            `**Servidor:** ${emoji.guild ? emoji.guild.name : 'Desconhecido'}\n` +
            `**Menção:** <:${emoji.name}:${emoji.id}>\n` +
            `**URL:** [Clique aqui](${emoji.url})`
         )
         .setColor('Yellow')
         .setFooter({ text: `Solicitado por ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });

      await interaction.reply({ embeds: [embed] });
   }
};