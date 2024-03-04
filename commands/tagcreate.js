// Import necessary modules and dependencies
const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

// Export the command
module.exports = {
  data: {
    name: 'tagcreate',
    description: 'Create a new tag',
  },
  async execute(interaction) {
    try {
      // Check if the user has the required administrative role
      const requiredRoleID = process.env.ADMINISTRATIVE_ROLE_ID;
      if (!interaction.member.roles.cache.has(requiredRoleID)) {
        // User doesn't have the required role
        return await interaction.reply({
          content: 'You do not have permission to use this command.',
          ephemeral: true, // This makes the response visible only to the user who executed the command
        });
      }

      // Create the modal
      const tagCreateModal = new ModalBuilder()
        .setCustomId('tagCreateModal')
        .setTitle('Create a New Tag');

      // Create the text input components
      const titleInput = new TextInputBuilder()
        .setCustomId('titleInput')
        .setLabel('Enter the title for the tag:')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const contentInput = new TextInputBuilder()
        .setCustomId('contentInput')
        .setLabel('Enter the content for the tag:')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

      // Add inputs to separate action rows
      const titleActionRow = new ActionRowBuilder().addComponents(titleInput);
      const contentActionRow = new ActionRowBuilder().addComponents(contentInput);

      // Add action rows to the modal
      tagCreateModal.addComponents(titleActionRow, contentActionRow);

      // Show the modal to the user
      await interaction.showModal(tagCreateModal);
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: 'An error occurred while processing the command.', ephemeral: true });
    }
  },
};
