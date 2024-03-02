// interaction-handlers/rate.js
const fs = require('fs');
const { Client } = require('discord.js');

module.exports = {
  handle: async (interaction, client) => {
    // Check if the interaction is from the correct custom ID
    if (interaction.customId === 'rating_dropdown') {
      const selectedRating = interaction.values[0];

      // Retrieve the rated user's ID from the original interaction
      const ratedUserID = interaction.options.getUser('user').id;

      // Get the current date and time
      const currentDate = new Date();
      const formattedDate = currentDate.toISOString();

      // Details of the rating (replace with your desired content)
      const ratingDetails = {
        rating: selectedRating,
        date: formattedDate,
        // Add other details as needed
      };

      // Save the rating to a JSON file
      const filePath = `data/ratings/${ratedUserID}.json`;

      try {
        fs.writeFileSync(filePath, JSON.stringify(ratingDetails, null, 2));
        await interaction.editReply(`Rating saved successfully for user <@${ratedUserID}>!`);
      } catch (error) {
        console.error(`Error saving rating for user ${ratedUserID}: ${error.message}`);
        await interaction.editReply('There was an error saving the rating. Please try again.');
      }
    }
  },
};
