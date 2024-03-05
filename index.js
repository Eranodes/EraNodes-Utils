// Import necessary modules and dependencies
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { config } = require('dotenv');
const fs = require('fs');
const path = require('path');
const { log } = require('./utilities/logger');
const { setupTicketPanel } = require('./utilities/ticket-panel');
const { handleTicketCreate } = require('./interaction-handlers/ticket-create');
const { handleTicketClose } = require('./interaction-handlers/ticket-close');
const { handleRating } = require('./interaction-handlers/rating');
const { handleTagCreate } = require('./interaction-handlers/tagcreate');
const { handleTagSelection } = require('./interaction-handlers/tags');
const { handleShowcaseInteraction } = require('./interaction-handlers/showcase');

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
try {
  const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

  // Load commands
  for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    bot.commands.set(command.data.name, command);
  }
} catch (error) {
  log(`Error loading commands: ${error.message}`, 'error');
}

// Event: Bot is ready
bot.once('ready', async () => {
  try {
    await log(`Logged in as ${bot.user.tag}!`);

    // Register slash commands
    bot.commands.forEach(async command => {
      await bot.application.commands.create(command.data);
    });

    // Specify the target guild and channel from .env
    const targetGuildId = process.env.GUILD_ID;
    const targetChannelId = process.env.TICKET_PANEL_CHANNEL_ID;

    // Setup ticket panel for the specified guild and channel
    await setupTicketPanel(bot, targetGuildId, targetChannelId);
  } catch (error) {
    log(`Error during bot setup: ${error.message}`, 'error');
  }
});

// Event: Interaction is created
bot.on('interactionCreate', async (interaction) => {
  try {
    // Check if the interaction is not a valid interaction type
    if (!interaction.isCommand() && !interaction.isStringSelectMenu() && !interaction.isButton() && !interaction.isModalSubmit()) {
      return;
    }

    // Log the interaction type
    log(`Interaction type: ${interaction.type}`);

    // Handle different interaction types
    if (interaction.isCommand()) {
      const { commandName } = interaction;

      // Log the executed command
      log(`Command executed: ${commandName}`);

      // Execute the command
      if (!bot.commands.has(commandName)) return;

      await bot.commands.get(commandName).execute(interaction);
    } else if (interaction.isStringSelectMenu()) {
      // Log the select menu interaction
      log('Select menu interaction detected');

      // Check the custom ID to determine which select menu was used
      switch (interaction.customId) {
        case 'ticketPanel':
          // Handle ticket creation based on the dropdown selection
          await handleTicketCreate(interaction);
          break;
        case 'rating_menu':
          // Handle the user's response to the rating dropdown
          await handleRating(interaction);
          break;
        // Add other cases if there are more select menus
      }
    } else if (interaction.isButton()) {
      // Log the button interaction
      log('Button interaction detected');

      // Check if the clicked button has the custom_id 'archive_button'
      if (interaction.customId === 'archive_button') {
        // Handle ticket closure when the "Close Ticket" button is clicked
        await handleTicketClose(interaction);
      } else if (interaction.customId.startsWith('viewTag_')) {
        // Handle tag selection when a tag button is clicked
        await handleTagSelection(interaction);
      }
    } else if (interaction.isModalSubmit()) {
      // Check if the submitted modal is from the 'tagCreateModal'
      if (interaction.customId === 'tagCreateModal') {
        // Handle tag creation based on the modal submission
        await handleTagCreate(interaction);
      } else if (interaction.customId === 'serverInfoModal') {
        // Handle showcase interaction
        await handleShowcaseInteraction(interaction);
      }
    }
  } catch (error) {
    log(`Error handling interaction: ${error.message}`, 'error');
    // Add appropriate error handling or reply to the user with an error message
  }
});

// Log in to Discord
bot.login(process.env.BOT_TOKEN);