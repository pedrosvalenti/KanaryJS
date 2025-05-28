const { ActivityType } = require('discord.js');

module.exports = (client) => {
  const setStatus = () => {
    const guildCount = client.guilds.cache.size;
    const memberCount = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);

    const statuses = [
      {
        name: `🎵 Ouvindo músicas com ${memberCount} membros!`,
        type: ActivityType.Listening
      },
      {
        name: `🌎 Em ${guildCount} servidores!`,
        type: ActivityType.Watching
      },
      {
        name: `👋 Use /ajuda para comandos!`,
        type: ActivityType.Playing
      }
    ];

    let i = 0;
    setInterval(() => {
      const status = statuses[i % statuses.length];
      client.user.setActivity(status.name, { type: status.type });
      i++;
    }, 15000); // Troca a cada 15 segundos
  };

  client.once('ready', () => {
    console.log(`✅ ${client.user.tag} está online!`);
    setStatus();
  });
};