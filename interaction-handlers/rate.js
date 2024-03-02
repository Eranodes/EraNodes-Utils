// interaction-handlers/rate.js
const { ButtonBuilder } = require('discord.js');

module.exports = {
  async handleDropdown(interaction) {
    const selectedRating = interaction.values[0];

    // Check if the selectedRating is a valid value (optional)
    const isValidRating = ['1', '2', '3', '4', '5'].includes(selectedRating);
    if (!isValidRating) {
      return interaction.reply({ content: 'Invalid rating selected.', ephemeral: true });
    }

    // Create buttons
    const writeReviewButton = new ButtonBuilder()
      .setCustomId('write_review')
      .setLabel('Write a Review')
      .setStyle(1); // 1 represents ButtonStyle.PRIMARY

    const submitRatingButton = new ButtonBuilder()
      .setCustomId('submit_rating')
      .setLabel('Submit Rating')
      .setStyle(1); // 1 represents ButtonStyle.PRIMARY

    // Send buttons to the user
    await interaction.reply({
      content: `You've selected ${selectedRating} stars. Do you want to write a review or just submit the rating?`,
      components: [
        {
          type: 1, // Action Row Type
          components: [writeReviewButton, submitRatingButton],
        },
      ],
    });
  },
};
