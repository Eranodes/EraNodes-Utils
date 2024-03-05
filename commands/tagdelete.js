const fs = require('fs');
const path = require('path');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tagdelete')
    .setDescription('Delete an existing tag')
    .addStringOption(option =>
      option.setName('tag')
        .setDescription('The name of the tag to delete')
        .setRequired(true)
    ),
  async execute(interaction) {
    try {
      // Check if the user has the required administrative role
      const adminRoleId = process.env.ADMINISTRATIVE_ROLE_ID;
      if (!interaction.member.roles.cache.has(adminRoleId)) {
        await interaction.reply({
          content: 'You do not have permission to use this command.',
          ephemeral: true,
        });
        return;
      }

      // Get the tag name from the user's input
      const tagName = interaction.options.getString('tag');

      // Construct the file path for the tag
      const tagFilePath = path.join(__dirname, '..', 'data', 'tags', `${tagName}.json`);

      // Check if the tag file exists
      if (!fs.existsSync(tagFilePath)) {
        await interaction.reply({
          content: `The tag "${tagName}" does not exist.`,
          ephemeral: true,
        });
        return;
      }

      // Delete the tag file
      fs.unlinkSync(tagFilePath);

      // Respond to the user
      await interaction.reply({
        content: `Tag "${tagName}" has been deleted successfully.`,
        ephemeral: true,
      });
    } catch (error) {
      console.error(`Error executing /tagdelete command: ${error.message}`);
      // Handle the error or respond accordingly
    }
  },
};
