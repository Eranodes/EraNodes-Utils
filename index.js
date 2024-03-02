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

  // Register slash commands
  bot.commands.forEach(command => {
    bot.application.commands.create(command.data);
  });
});

bot.on('interactionCreate', async interaction => {
  if (!interaction.isCommand() && !interaction.isButton() && !interaction.isStringSelectMenu()) return;

  if (interaction.isCommand()) {
    const { commandName } = interaction;

    // Execute the command
    if (!bot.commands.has(commandName)) return;

    try {
      await bot.commands.get(commandName).execute(interaction);
    } catch (error) {
      log(`Error executing command "${commandName}": ${error.message}`, 'error');
      await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
  } else if (interaction.isButton()) {
    // Handle button interactions
    const customId = interaction.customId;

    if (customId === 'write_review' || customId === 'submit_rating') {
      // Route button interactions to the appropriate handler
      const handler = bot.commands.get('rate').interactionHandler;
      if (handler) {
        handler(interaction);
      }
    }
  } else if (interaction.isStringSelectMenu()) {
    // Handle select menu (dropdown) interactions
    const customId = interaction.customId;

    if (customId === 'rating_dropdown') {
      // Route dropdown interactions to the appropriate handler
      const handler = bot.commands.get('rate').interactionHandler;
      if (handler) {
        handler(interaction);
      }
    }
  }
});

// Log in to Discord
bot.login(process.env.BOT_TOKEN);
