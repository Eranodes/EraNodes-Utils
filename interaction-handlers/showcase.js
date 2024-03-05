// Import necessary modules and dependencies
const { log } = require('../utilities/logger');
const { WebhookClient } = require('discord.js');

// Define the showcase interaction handler
module.exports = {
  handleShowcaseInteraction: async (interaction) => {
    try {
      // Get the data entered by the user
      const serverAddress = interaction.fields.getTextInputValue('serverAddressInput');
      const serverName = interaction.fields.getTextInputValue('serverNameInput');
      const serverDescription = interaction.fields.getTextInputValue('serverDescriptionInput');

      // Log the collected data (optional)
      log(`Server Address: ${serverAddress}`);
      log(`Server Name: ${serverName}`);
      log(`Server Description: ${serverDescription}`);

      // Send the data to the webhook
      const webhook = new WebhookClient({ url: process.env.SHOWCASE_WEBHOOK_URL });

      await webhook.send({
        content: 'Minecraft Server Showcase',
        embeds: [
          {
            title: 'Server Information',
            fields: [
              { name: 'Address', value: serverAddress, inline: true },
              { name: 'Name', value: serverName, inline: true },
              { name: 'Description', value: serverDescription },
            ],
          },
        ],
      });

      await interaction.reply({ content: 'Your server showcase data has been submitted successfully!', ephemeral: true });
    } catch (error) {
      log(`Error handling showcase interaction: ${error.message}`, 'error');
      await interaction.reply({ content: 'An error occurred while processing your request.', ephemeral: true });
    }
  },
};
