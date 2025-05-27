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
const walkSync = (dir) => {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    for (const file of files) {
        if (file.isDirectory()) {
            walkSync(`${dir}/${file.name}`);
        } else if (file.name.endsWith('.js')) {
            commandFiles.push(`${dir}/${file.name}`);
        }
    }
};
walkSync('./Handler/Commands');

const uniqueCommands = new Map();
for (const file of commandFiles) {
    const command = require(file);
    if (!uniqueCommands.has(command.data.name)) {
        client.commands.set(command.data.name, command);
        uniqueCommands.set(command.data.name, command.data.toJSON());
    } else {
        console.warn(`Comando duplicado ignorado: ${command.data.name} (${file})`);
    }
}
const commands = Array.from(uniqueCommands.values());

// Registrar slash commands na API do Discord
const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log('Registrando slash commands...');
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands }
        );
        console.log('Slash commands registrados com sucesso!');
    } catch (o_O) {
        console.error(o_O);
    }
})();

client.once('ready', () => {
    console.log(`Bot online como ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (o_O) {
        console.error(o_O);
        await interaction.reply({ content: 'Ocorreu um erro ao executar este comando!', ephemeral: true });
    }
});

client.login(process.env.TOKEN);