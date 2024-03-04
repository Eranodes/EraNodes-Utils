const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: {
    name: 'tags',
    description: 'Show available tags',
  },
  execute(interaction) {
    try {
      // Define the path to the tags directory
      const tagsDirectory = path.join(__dirname, '..', 'data', 'tags');

      // Read files from the tags directory
      const tagFiles = fs.readdirSync(tagsDirectory);

      // Check if there are any tag files
      if (tagFiles.length === 0) {
        return interaction.reply({
          content: 'No tags available.',
        });
      }

      // Retrieve tag data from files
      const tags = tagFiles.map((file) => {
        const filePath = path.join(tagsDirectory, file);
        const tagData = require(filePath);
        return tagData;
      });

      // Create buttons for each tag
      const tagButtons = tags.map((tag) => {
        return new ButtonBuilder()
          .setCustomId(`tag_${tag.title.toLowerCase()}`)
          .setLabel(tag.title)
          .setStyle(ButtonStyle.Primary);
      });

      // Create action row with tag buttons
      const tagActionRow = new ActionRowBuilder().addComponents(...tagButtons);

      // Reply with buttons
      interaction.reply({
        content: 'Select a tag:',
        components: [tagActionRow],
      });
    } catch (error) {
      console.error(error);
      interaction.reply({
        content: 'An error occurred while retrieving tags.',
      });
    }
  },
};
