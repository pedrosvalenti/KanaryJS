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

// Carregar comandos de /Commands
const commands = [];
const commandFiles = fs.readdirSync('./Handler/Commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./Handler/Commands/${file}`);
    client.commands.set(command.data.name, command);
    commands.push(command.data.toJSON());
}

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