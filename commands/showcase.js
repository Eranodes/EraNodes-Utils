// Import necessary modules and dependencies
const { Events, ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { log } = require('../utilities/logger');

// Define the command
module.exports = {
  data: {
    name: 'showcase',
    description: 'Showcase your minecraft',
  },
  async execute(interaction) {
    try {
      // Create the modal
      const serverInfoModal = new ModalBuilder()
        .setCustomId('serverInfoModal')
        .setTitle('Minecraft Server Showcase');

      // Create the text input components
      const serverAddressInput = new TextInputBuilder()
        .setCustomId('serverAddressInput')
        .setLabel("Enter the Minecraft server's address:")
        .setStyle(TextInputStyle.Short);

      const serverNameInput = new TextInputBuilder()
        .setCustomId('serverNameInput')
        .setLabel("Enter the Minecraft server's name:")
        .setStyle(TextInputStyle.Short);

      const serverDescriptionInput = new TextInputBuilder()
        .setCustomId('serverDescriptionInput')
        .setLabel("Enter a description for the Minecraft server:")
        .setStyle(TextInputStyle.Paragraph);

      // Create separate action rows for each input
      const addressRow = new ActionRowBuilder().addComponents(serverAddressInput);
      const nameRow = new ActionRowBuilder().addComponents(serverNameInput);
      const descriptionRow = new ActionRowBuilder().addComponents(serverDescriptionInput);

      // Add action rows to the modal
      serverInfoModal.addComponents(addressRow, nameRow, descriptionRow);

      // Show the modal to the user
      await interaction.showModal(serverInfoModal);
    } catch (error) {
      log(`Error executing showcase command: ${error.message}`, 'error');
      await interaction.reply({ content: 'An error occurred while processing your request.', ephemeral: true });
    }
  },
};
