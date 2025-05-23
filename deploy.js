const { REST, Routes } = require('discord.js');
const fs = require('fs');
require('dotenv').config();

const commands = [];
const commandFiles = fs.readdirSync('./Handler/Commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./Handler/Commands/${file}`);
    commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log('Atualizando (deploy) slash commands na guild...');
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands }
        );
        console.log('Slash commands atualizados com sucesso na guild!');
    } catch (o_O) {
        console.error(o_O);
    }
})();