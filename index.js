const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');
const { handleExpiredKeys } = require('./tasks/expiry');
const fs = require('fs');
const path = require('path');
const { token, clientId, guildId } = require('./config.json');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

client.commands = new Map();

const loadCommands = () => {
  const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
  const commandsArray = [];

  for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
    commandsArray.push(command.data.toJSON());
  }

  console.log(`✅ Commands loaded: ${Array.from(client.commands.keys()).join(', ')}`);

  const rest = new REST({ version: '10' }).setToken(token);

  (async () => {
    try {
      console.log('Started refreshing application (/) commands.');

      await rest.put(
        Routes.applicationGuildCommands(clientId, guildId),
        { body: commandsArray }
      );







      console.log('✅ Application commands refreshed.');
    } catch (error) {
      console.error('Failed to refresh commands:', error);
    }
  })();
};

setInterval(() => {
  try {
    handleExpiredKeys(client);
  } catch (err) {
    console.error('Error while handling expired keys:', err);
  }
}, 60 * 1000);

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (command) {
    try {
      await command.execute(interaction);
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: 'Une erreur est survenue.', ephemeral: true });
    }
  }
});

client.once('ready', () => {
  console.log(`Connecté en tant que ${client.user.tag}`);
  loadCommands();
});

client.login(token);
