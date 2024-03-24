// commands/listServers.js

const axios = require('axios');
const { config } = require('dotenv');

config();

const MAX_FIELD_LENGTH = 1024; // Maximum character length for a field value

module.exports = {
  data: {
    name: 'listservers',
    description: 'List all servers on the Pterodactyl panel',
  },
  async execute(interaction) {
    try {
      const panelUrl = process.env.PTERODACTYL_PANEL_URL;
      const apiKey = process.env.PTERODACTYL_API_KEY;

      const response = await axios.get(`${panelUrl}/api/application/servers`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json',
        },
      });

      const servers = response.data.data;

      let currentChunk = ''; // String to accumulate servers in the current chunk
      let embeds = [];

      for (const server of servers) {
        const serverInfo = `**${server.attributes.name}** (ID: ${server.attributes.id})\n`;

        if ((currentChunk.length + serverInfo.length) > MAX_FIELD_LENGTH) {
          embeds.push({ description: currentChunk });
          currentChunk = serverInfo;
        } else {
          currentChunk += serverInfo;
        }
      }

      // Push the remaining servers (if any)
      if (currentChunk) {
        embeds.push({ description: currentChunk });
      }

      // Create and send embeds for each chunk
      for (let i = 0; i < embeds.length; i++) {
        await interaction.reply({ embeds: [embeds[i]], allowedMentions: { repliedUser: false } });
      }

    } catch (error) {
      console.error('Error listing servers:', error);
      await interaction.reply('Error listing servers. Please try again later.');
    }
  },
};
