const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { config } = require('dotenv');
const fs = require('fs');
const { log } = require('./utilities/logger'); // Importing the logger module

// Load environment variables from .env file
config();

const bot = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

// Initialize a Collection to store commands
bot.commands = new Collection();

// Read command files from the "commands" folder
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

// Load commands
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  bot.commands.set(command.data.name, command);
}

bot.once('ready', () => {
  log(`Logged in as ${bot.user.tag}!`); // Using the logger to log the bot's readiness
});

bot.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  // Execute the command
  if (!bot.commands.has(commandName)) return;

  try {
    await bot.commands.get(commandName).execute(interaction);
  } catch (error) {
    log(`Error executing command "${commandName}": ${error.message}`, 'error'); // Logging command execution errors
    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
  }
});

// Log in to Discord
bot.login(process.env.BOT_TOKEN);
