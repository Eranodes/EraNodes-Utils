const fs = require('fs');
const path = require('path');
const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const { log } = require('../utilities/logger');

module.exports = {
  data: {
    name: 'tagcreate',
    description: 'Create a new tag',
  },
  async execute(interaction) {
    try {
      // Check if the user has the required administrative role
      const adminRoleId = process.env.ADMINISTRATIVE_ROLE_ID;
      if (!interaction.member.roles.cache.has(adminRoleId)) {
        await interaction.reply({
          content: 'You do not have permission to use this command.',
          ephemeral: true,
        });

        log(`User ${interaction.user.tag} attempted to use /tagcreate without permission.`, 'warn');
        return;
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

      // Add inputs to the modal with separate action rows
      const titleActionRow = new ActionRowBuilder().addComponents(titleInput);
      const contentActionRow = new ActionRowBuilder().addComponents(contentInput);

      tagCreateModal.addComponents(titleActionRow, contentActionRow);

      // Show the modal to the user
      await interaction.showModal(tagCreateModal);

      log(`User ${interaction.user.tag} executed /tagcreate command successfully.`, 'info');
      
    } catch (error) {
      log(`Error executing /tagcreate command: ${error.message}`, 'error');
      // Handle the error or respond accordingly
      await interaction.reply({
        content: 'An error occurred while processing your request. Please try again later.',
        ephemeral: true,
      });
    }
  },
};
