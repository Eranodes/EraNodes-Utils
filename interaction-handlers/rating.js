const { SelectMenuInteraction } = require('discord.js');
const { log } = require('../utilities/logger');

/**
 * Handle the interaction when a user selects a rating from the dropdown.
 * @param {SelectMenuInteraction} interaction - The select menu interaction object.
 */

async function handleRating(interaction) {
  try {
    // Check if the interaction is a StringSelectMenu interaction
    if (!interaction.isStringSelectMenu()) {
      log('Invalid interaction type. Expected StringSelectMenu.', 'error');
      return;
    }

    // Retrieve the selected rating value
    const selectedRating = interaction.values[0];

    // Retrieve additional information if needed (e.g., user, channel, etc.)
    const user = interaction.user;
    const channel = interaction.channel;

    log(`User ${user.tag} selected a rating of ${selectedRating} stars in channel ${channel.id}.`);

    // Process the selected rating as needed
    // You can store the rating in a database, log it, or perform other actions

    // Construct the embed for the thank you message
    const embed = {
      color: 0x911d30,
      title: `Thank you for rating our support service!`,
      description: `You provided a rating of ${selectedRating} stars. Your feedback is valuable.`,
      footer: {
        text: 'EraNodes',
        icon_url: 'https://github.com/Eranodes/EraNodes-Utils/blob/main/assets/images/eranodes-transparent.png?raw=true',
      },
      image: {
        url: 'https://github.com/Eranodes/EraNodes-Utils/blob/main/assets/images/eranodes-transparent.png?raw=true',
      },
      fields: [
        {
          name: 'Visit Our Website',
          value: '[EraNodes Dashboard](https://freedash.eranodes.xyz)\n[EraNodes Panel](https://panel.eranodes.xyz)',
        }
      ],
    };

    // Edit the original message in the user's DM and disable the dropdown
    try {
      await interaction.message.edit({
        embeds: [embed],
        components: [],
      });
      log(`Rating message updated in channel ${channel.id}.`);
    } catch (editError) {
      log(`Error editing rating message: ${editError.message}`, 'error');
    }

    // You can also perform additional actions based on the rating, such as logging or analytics

  } catch (error) {
    log(`Error handling rating: ${error.message}`, 'error');
    // You may want to reply to the user with an error message or perform other error-handling actions
  }
}

module.exports = {
  handleRating,
};
