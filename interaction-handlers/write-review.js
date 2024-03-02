// interaction-handlers/write-review.js
const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const fs = require('fs/promises');
const path = require('path');

module.exports = {
  async handleWriteReview(interaction) {
    // Create the modal
    const reviewModal = new ModalBuilder()
      .setCustomId('writeReviewModal')
      .setTitle('Write a Review');

    // Create the text input component for issues
    const issuesInput = new TextInputBuilder()
      .setCustomId('issuesInput')
      .setLabel('Specify the issues you faced')
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder('Enter your feedback here...');

    // Add the text input to the modal
    const actionRow = new ActionRowBuilder().addComponents(issuesInput);
    reviewModal.addComponents(actionRow);

    // Show the modal to the user
    await interaction.showModal(reviewModal);
  },
};
