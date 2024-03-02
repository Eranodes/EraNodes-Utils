// interaction-handlers/submit-rating.js
const fs = require('fs/promises');
const path = require('path');

module.exports = {
  async handleSubmitRating(interaction) {
    // Check if the user has the specified staff role
    const staffRoleID = process.env.STAFF_ROLE_ID;

    // Get the user to rate directly from the button interaction
    const userToRate = interaction.options?.getUser('user') || interaction.user;

    const userIsStaff = interaction.guild.members.cache.get(userToRate.id)?.roles.cache.has(staffRoleID);

    if (userIsStaff) {
      // Staff member, get the custom ID directly
      const customId = interaction.customId;

      // Save the rating data to a JSON file
      const ratingData = {
        rater: userToRate.id, // Use the userToRate ID instead of interaction.user.id
        timestamp: Date.now(),
        rating: customId, // Assuming the custom ID itself represents the rating
      };

      const filePath = path.join(__dirname, '..', 'data', 'ratings', `${userToRate.id}.json`);

      try {
        const existingData = await fs.readFile(filePath, 'utf-8');
        const parsedData = JSON.parse(existingData);
        parsedData.push(ratingData);

        await fs.writeFile(filePath, JSON.stringify(parsedData, null, 2));
      } catch (error) {
        // If the file doesn't exist, create a new one
        await fs.writeFile(filePath, JSON.stringify([ratingData], null, 2));
      }

      await interaction.reply({ content: 'Rating submitted successfully!', ephemeral: true });
    } else {
      // Non-staff member, ask to choose a staff member to rate
      await interaction.reply({ content: `Please choose a staff member to rate.`, ephemeral: true });
    }
  },
};
