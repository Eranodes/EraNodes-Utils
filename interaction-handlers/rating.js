const { SelectMenuInteraction } = require('discord.js');
const { log } = require('../utilities/logger');

/**
 * Handle the interaction when a user selects a rating from the dropdown.
 * @param {SelectMenuInteraction} interaction - The select menu interaction object.
 */
async function handleRating(interaction) {
  try {
    // Check if the interaction is a StringSelectMenu interaction
    if (!interaction.isStringSelectMenu()) return;

    // Retrieve the selected rating value
    const selectedRating = interaction.values[0];

    // Retrieve additional information if needed (e.g., user, channel, etc.)
    const user = interaction.user;
    const channel = interaction.channel;

    // Process the selected rating as needed
    // You can store the rating in a database, log it, or perform other actions

    // Edit the original message in the user's DM and disable the dropdown
    await interaction.message.edit({
      content: `Thank you for providing a rating of ${selectedRating} stars! Your feedback is valuable.`,
      components: [], // Empty components array to disable the dropdown
    });

    // You can also perform additional actions based on the rating, such as logging or analytics

    // Log the interaction details
    log(`User ${user.tag} provided a rating of ${selectedRating} stars in channel ${channel.id}.`);
  } catch (error) {
    log(`Error handling rating: ${error.message}`, 'error');
    // You may want to reply to the user with an error message or perform other error-handling actions
  }
}

module.exports = {
  handleRating,
};
