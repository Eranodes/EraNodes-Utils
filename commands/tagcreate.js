// Import necessary modules and dependencies
const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

// Export the command
module.exports = {
  data: {
    name: 'tagcreate',
    description: 'Create a new tag',
  },
  async execute(interaction) {
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

    // Add inputs to the modal with separate action rows
    const titleActionRow = new ActionRowBuilder().addComponents(titleInput);
    const contentActionRow = new ActionRowBuilder().addComponents(contentInput);

    tagCreateModal.addComponents(titleActionRow, contentActionRow);

    // Show the modal to the user
    await interaction.showModal(tagCreateModal);
  },
};
