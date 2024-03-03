// Import necessary modules and dependencies
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { config } = require('dotenv');
const fs = require('fs');
const { log } = require('./utilities/logger');
const { setupTicketPanel } = require('./utilities/ticket-panel');
const { handleTicketCreate } = require('./interaction-handlers/ticket-create');
const { handleTicketClose } = require('./interaction-handlers/ticket-close');

// Load environment variables from .env file
config();

// Create a Discord client
const bot = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
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
  // Check if the interaction is not a valid interaction type
  if (!interaction.isCommand() && !interaction.isStringSelectMenu() && !interaction.isButton()) {
    return;
  }

  // Handle different interaction types
  try {
    if (interaction.isCommand()) {
      const { commandName } = interaction;

      // Execute the command
      if (!bot.commands.has(commandName)) return;

      await bot.commands.get(commandName).execute(interaction);
    } else if (interaction.isStringSelectMenu()) {
      // Handle ticket creation based on the dropdown selection
      await handleTicketCreate(interaction);
    } else if (interaction.isButton()) {
      // Check if the clicked button has the custom_id 'archive_button'
      if (interaction.customId === 'archive_button') {
        // Handle ticket closure when the "Close Ticket" button is clicked
        await handleTicketClose(interaction);
      }
    }
  } catch (error) {
    log(`Error handling interaction: ${error.message}`, 'error');
    // Add appropriate error handling or reply to the user with an error message
  }
});

// Log in to Discord
bot.login(process.env.BOT_TOKEN);
