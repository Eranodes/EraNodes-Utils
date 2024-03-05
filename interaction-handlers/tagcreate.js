const fs = require('fs');
const path = require('path');
const { log } = require('../utilities/logger');

module.exports = {
  async handleTagCreate(interaction) {
    try {
      // Get data from modal submission
      const title = interaction.fields.getTextInputValue('titleInput');
      const content = interaction.fields.getTextInputValue('contentInput');
      const authorID = interaction.user.id;

      // Create data directory if it doesn't exist
      const dataDirectory = path.join(__dirname, '..', 'data', 'tags');
      if (!fs.existsSync(dataDirectory)) {
        fs.mkdirSync(dataDirectory, { recursive: true });
      }

      // Create tag data object
      const tagData = {
        title,
        content,
        author: {
          id: authorID,
          tag: interaction.user.tag,
        },
      };

      // Save data to JSON file
      const filePath = path.join(dataDirectory, `${title}.json`);
      fs.writeFileSync(filePath, JSON.stringify(tagData, null, 2));

      // Respond to the user
      await interaction.reply({
        content: `Tag "${title}" created successfully!`,
      });

      log(`User ${interaction.user.tag} created tag "${title}".`, 'info');
    } catch (error) {
      log(`Error handling tag creation: ${error.message}`, 'error');
      // Handle the error or respond accordingly
      await interaction.reply({
        content: 'An error occurred while processing your request. Please try again later.',
        ephemeral: true,
      });
    }
  },
};
