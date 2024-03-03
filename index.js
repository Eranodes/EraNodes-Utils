// Import necessary modules and dependencies
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { config } = require('dotenv');
const fs = require('fs');
const { log } = require('./utilities/logger');
const { setupTicketPanel } = require('./utilities/ticket-panel');
const { handleTicketCreate } = require('./interaction-handlers/ticket-create');
const { handleTicketClose } = require('./interaction-handlers/ticket-close'); // Import the new interaction handler

// Load environment variables from .env file
config();

// Create a Discord client
const bot = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent, // Make sure you include MessageContent intent for interaction handling
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

// Event: Bot is ready
bot.once('ready', () => {
  log(`Logged in as ${bot.user.tag}!`);

  // Register slash commands
  bot.commands.forEach(command => {
    bot.application.commands.create(command.data);
  });

  // Specify the target guild and channel from .env
  const targetGuildId = process.env.GUILD_ID;
  const targetChannelId = process.env.TICKET_PANEL_CHANNEL_ID;

  // Setup ticket panel for the specified guild and channel
  setupTicketPanel(bot, targetGuildId, targetChannelId);
});

// Event: Interaction is created
bot.on('interactionCreate', async (interaction) => {
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
  } else if (interaction.isStringSelectMenu()) {
    // Handle ticket creation based on the dropdown selection
    await handleTicketCreate(interaction);
  } else if (interaction.isButton()) {
    // Handle ticket closure when the "Close Ticket" button is clicked
    await handleTicketClose(interaction);
  }
});

// Log in to Discord
bot.login(process.env.BOT_TOKEN);
