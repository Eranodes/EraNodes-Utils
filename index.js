// Import necessary modules and dependencies
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { config } = require('dotenv');
const fs = require('fs');
const path = require('path');
const { log } = require('./utilities/logger');
const { handleTagCreate } = require('./interaction-handlers/tagcreate');
const { handleTagSelection } = require('./interaction-handlers/tags');
const { handleShowcaseInteraction } = require('./interaction-handlers/showcase');
const { sendWelcomeMessage } = require('./utilities/user-join');
const { sendFarewellMessage } = require('./utilities/user-leave');

// Load environment variables from .env file
config();

// Read package.json file
const packageJson = require('./package.json');

// Log package details
log(`Bot Name: ${packageJson.name}`);
log(`Version: ${packageJson.version}`);
log(`Description: ${packageJson.description}`);
log(`Author: ${packageJson.author}`);
log(`License: ${packageJson.license}`);


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

    // Get all existing commands registered by the bot
    const existingCommands = await bot.application.commands.fetch();

    // Delete any old commands that are no longer present
    for (const existingCommand of existingCommands.values()) {
      if (!bot.commands.has(existingCommand.name)) {
        await existingCommand.delete();
        log(`Deleted old command: ${existingCommand.name}`);
      }
    }

    // Register slash commands
    for (const command of bot.commands.values()) {
      await bot.application.commands.create(command.data);
      log(`Registered command: ${command.data.name}`);
    }

  } catch (error) {
    log(`Error during bot setup: ${error.message}`, 'error');
  }
});


// Event: User joins the server
bot.on('guildMemberAdd', (member) => {
  // Call the sendWelcomeMessage function when a user joins
  sendWelcomeMessage(member);
});

// Event: User leaves the server
bot.on('guildMemberRemove', (member) => {
  // Call the sendFarewellMessage function when a user leaves
  sendFarewellMessage(member);
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

    } else if (interaction.isButton()) {
      // Log the button interaction
      log('Button interaction detected');
     if (interaction.customId.startsWith('viewTag_')) {
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