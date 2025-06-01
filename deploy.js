const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const commands = [];

const commandsPath = path.join(__dirname, 'Handler', 'Commands');

// Função recursiva para ler comandos em subpastas
function loadCommands(dir) {
   const files = fs.readdirSync(dir);

   for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
         loadCommands(filePath);
      } else if (file.endsWith('.js')) {
         try {
            const command = require(filePath);

            if (!command.data || typeof command.data.toJSON !== 'function') {
               console.warn(`[AVISO] Ignorando comando mal formatado: ${file}`);
               continue;
            }

            commands.push(command.data.toJSON());
            console.log(`[SUCESSO] Comando carregado: ${command.data.name}`);
         } catch (err) {
            console.error(`[ERRO] Falha ao carregar ${file}:`, err);
         }
      }
   }
}

loadCommands(commandsPath);

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
   try {
      console.log('\n📤 Iniciando deploy dos comandos slash...');
      await rest.put(
         Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
         { body: commands }
      );
      console.log('✅ Comandos atualizados com sucesso!');
   } catch (err) {
      console.error('❌ Erro ao registrar os comandos:', err);
   }
})();
