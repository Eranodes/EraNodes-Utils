const fs = require('fs');
const path = require('path');
const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { log } = require('../utilities/logger');

module.exports = {
  data: {
    name: 'tags',
    description: 'View available tags',
  },
  async execute(interaction) {
    try {
      // Read the list of tags from the data directory
      const dataDirectory = path.join(__dirname, '..', 'data', 'tags');
      const tagFiles = fs.readdirSync(dataDirectory);

      // Create buttons for each tag
      const tagButtons = tagFiles.map((tagFile) => {
        const tagName = path.parse(tagFile).name;

        return new ButtonBuilder()
          .setCustomId(`viewTag_${tagName}`)
          .setLabel(tagName)
          .setStyle(ButtonStyle.Primary);
      });

      // Create action row with tag buttons
      const tagActionRow = new ActionRowBuilder().addComponents(...tagButtons);

      // Send buttons to the user as ephemeral
      await interaction.reply({
        content: 'Select a tag to view its contents:',
        components: [tagActionRow],
        ephemeral: true,
      });

      log(`User ${interaction.user.tag} executed /tags command successfully.`, 'info');
      
    } catch (error) {
      log(`Error executing /tags command: ${error.message}`, 'error');
      // Handle the error or respond accordingly
      await interaction.reply({
        content: 'An error occurred while processing your request. Please try again later.',
        ephemeral: true,
      });
    }
  },
};
