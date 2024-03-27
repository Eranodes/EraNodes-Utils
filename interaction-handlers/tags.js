const fs = require('fs');
const path = require('path');
const { log } = require('../utilities/logger');

module.exports = {
  async handleTagSelection(interaction) {
    try {
      // Check if the interaction is a button interaction
      if (!interaction.isButton()) {
        return;
      }

      // Acknowledge the interaction to prevent the "interaction failed" message
      await interaction.deferReply({ ephemeral: true });

      // Extract the tag name from the custom ID
      const tagName = interaction.customId.replace('viewTag_', '');

      // Read the content of the selected tag file
      const tagFilePath = path.join(__dirname, '..', 'data', 'tags', `${tagName}.json`);

      // Check if the tag file exists
      if (!fs.existsSync(tagFilePath)) {
        // Handle the case where the tag file does not exist
        await interaction.followUp({
          content: `The selected tag "${tagName}" does not exist.`,
          ephemeral: true,
        });

        log(`User ${interaction.user.tag} attempted to view nonexistent tag "${tagName}".`, 'warn');
        return;
      }

      // Read and parse the content of the tag file
      const tagData = JSON.parse(fs.readFileSync(tagFilePath, 'utf8'));

      // Create an embed with the tag information
      const embedData = {
        title: tagData.title,
        color: 0x951931,
        description: tagData.content,
        footer: {
          text: `Author: ${tagData.author.tag}`,
          icon_url: interaction.user.displayAvatarURL({ dynamic: true }),
        },
      };

      // Acknowledge the command usage
      await interaction.followUp('Attempting to send the tag information..');

      // Send the embed to the channel
      await interaction.channel.send({ embeds: [embedData] });

      log(`User ${interaction.user.tag} viewed tag "${tagName}".`, 'info');
    } catch (error) {
      log(`Error handling tag selection: ${error.message}`, 'error');
      // Handle the error or respond accordingly
      await interaction.followUp({
        content: 'An error occurred while processing your request. Please try again later.',
        ephemeral: true,
      });
    }
  },
};
