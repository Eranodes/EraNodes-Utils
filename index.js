const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { config } = require('dotenv');
const fs = require('fs');

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
  console.log(`Logged in as ${bot.user.tag}!`);
});

bot.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  // Execute the command
  if (!bot.commands.has(commandName)) return;

  try {
    await bot.commands.get(commandName).execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
  }
});

// Log in to Discord
bot.login(process.env.BOT_TOKEN);
