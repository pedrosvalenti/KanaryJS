const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const fs = require('fs');

require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.commands = new Collection();

// Carregar comandos de /Commands e subpastas
const commandFiles = [];
function walkSync(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    for (const file of files) {
        if (file.isDirectory()) {
            walkSync(`${dir}/${file.name}`);
        } else if (file.name.endsWith('.js')) {
            commandFiles.push(`${dir}/${file.name}`);
        }
    }
}
walkSync('./Handler/Commands');

// Garantir comandos únicos
const uniqueCommands = new Map();
for (const file of commandFiles) {
    const command = require(file);
    if (!uniqueCommands.has(command.data.name)) {
        client.commands.set(command.data.name, command);
        uniqueCommands.set(command.data.name, command.data.toJSON());
    } else {
        console.warn(`[WARN] Comando duplicado ignorado: ${command.data.name} (${file})`);
    }
}
const commands = Array.from(uniqueCommands.values());


// Registrar slash commands na API do Discord
const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log('[LOADING] Carregando os comandos 🕑');
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands }
        );
        console.log('[INFO] Todos os Comandos foram carregados ✅');
    } catch (error) {
        console.error('[ERROR] Falha ao registrar comandos:', error);
    }
})();

client.once('ready', () => {
    // Status rotativo estilo Loritta
    const activities = [
        () => ({ type: 3, name: `Kanary` }), // Ouvindo
        () => ({ type: 2, name: `Kanary` }), // Jogando
        () => ({ type: 3, name: `${client.guilds.cache.reduce((a, g) => a + g.memberCount, 0)} membros` }),
        () => ({ type: 3, name: `${client.guilds.cache.size} servidores` })
    ];
    let i = 0;
    setInterval(() => {
        const activity = activities[i % activities.length]();
        client.user.setActivity(activity.name, { type: activity.type });
        i++;
    }, 15000); // Troca a cada 15 segundos
    console.log(`[STATUS] Bot online ✅`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    try {
        await command.execute(interaction);
    } catch (error) {
        console.error('[ERROR] Erro ao executar comando:', error);
        await interaction.reply({ content: 'Ocorreu um erro ao executar este comando! 🆘 Contate: okanary', ephemeral: true });
    }
});

client.login(process.env.TOKEN);