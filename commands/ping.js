const { SlashCommandBuilder } = require('@discordjs/builders');
const { log } = require('../utilities/logger'); // Importing the logger module

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong!'),
  async execute(interaction) {
    try {
      await interaction.reply('Pong!');
      log('Ping command executed successfully!', 'info'); // Logging successful execution
    } catch (error) {
      log(`Error executing ping command: ${error.message}`, 'error'); // Logging command execution errors
      await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
  },
}; 
