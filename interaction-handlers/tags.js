const { ButtonInteraction, MessageActionRow, MessageButton } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  handleTagButtonClick: async (interaction) => {
    try {
      // Check if the interaction is a button click
      if (!(interaction instanceof ButtonInteraction)) {
        return;
      }

      // Get the custom ID of the clicked button
      const customId = interaction.customId;

      // Check if the button is a tag button
      if (!customId.startsWith('tag_')) {
        return;
      }

      // Extract the tag title from the custom ID
      const tagTitle = customId.replace('tag_', '');

      // Define the path to the tags directory
      const tagsDirectory = path.join(__dirname, '..', 'data', 'tags');

      // Construct the file path for the tag
      const tagFilePath = path.join(tagsDirectory, `${tagTitle.toLowerCase()}.json`);

      // Check if the tag file exists
      if (!fs.existsSync(tagFilePath)) {
        return interaction.reply({
          content: 'Tag not found.',
        });
      }

      // Read the tag data from the file
      const tagData = require(tagFilePath);

      // Reply with the tag content
      interaction.reply({
        content: `**${tagData.title}**\n${tagData.content}`,
      });
    } catch (error) {
      console.error(error);
      interaction.reply({
        content: 'An error occurred while handling the tag button click.',
      });
    }
  },
};
