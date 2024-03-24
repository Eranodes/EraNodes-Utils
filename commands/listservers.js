// commands/listServers.js

const axios = require('axios');
const { config } = require('dotenv');

config();

// Load the administrative role ID from .env
const ADMINISTRATIVE_ROLE_ID = process.env.ADMINISTRATIVE_ROLE_ID;

module.exports = {
  data: {
    name: 'listservers',
    description: 'List all servers on the Pterodactyl panel',
  },
  async execute(interaction) {
    try {
      // Check if the user has the administrative role
      if (!interaction.member.roles.cache.has(ADMINISTRATIVE_ROLE_ID)) {
        return await interaction.reply('You do not have permission to execute this command.');
      }

      // Proceed with the command execution
      const panelUrl = process.env.PTERODACTYL_PANEL_URL;
      const apiKey = process.env.PTERODACTYL_API_KEY;

      const response = await axios.get(`${panelUrl}/api/application/servers`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json',
        },
      });

      const servers = response.data.data;
      const totalServers = servers.length;

      // Send a reply with the total server count
      await interaction.reply(`Total servers: ${totalServers}`);

      // Split servers into chunks to fit within character limit of an embed
      const serverChunks = chunkServers(servers);

      // Iterate over each chunk of servers
      for (let i = 0; i < serverChunks.length; i++) {
        const serversChunk = serverChunks[i];
        // Create an array to store fields for each server chunk
        const serverFields = [];

        // Iterate over each server in the chunk
        for (const server of serversChunk) {
          const serverResponse = await axios.get(`${panelUrl}/api/application/servers/${server.attributes.id}`, {
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Accept': 'application/json',
            },
          });

          const serverDetails = serverResponse.data.attributes;

          // Check if server details are missing or incomplete
          if (!serverDetails) {
            console.error('Error: Server details are missing or incomplete.');
            continue;
          }

          const ownerResponse = await axios.get(`${panelUrl}/api/application/users/${serverDetails.user}`, {
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Accept': 'application/json',
            },
          });

          const ownerDetails = ownerResponse.data.attributes;

          const nodeResponse = await axios.get(`${panelUrl}/api/application/nodes/${serverDetails.node}`, {
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Accept': 'application/json',
            },
          });

          const nodeDetails = nodeResponse.data.attributes;

          // Construct field for the current server
          const serverField = {
            name: serverDetails.name,
            value: `**ID:** ${serverDetails.identifier}\n${serverDetails.description ? `**Description:** ${serverDetails.description}\n` : ''}**Owner:** ${ownerDetails.username}\n**Node:** ${nodeDetails.name}\n**Panel URL:** ${panelUrl}/server/${serverDetails.identifier}`,
            inline: false,
          };

          // Push the server field to the array
          serverFields.push(serverField);
        }

        // Construct the embed with the current chunk of server fields
        const embed = {
          title: 'Server List',
          color: 0xffffff, // Default color
          fields: serverFields,
          footer: { text: `Embed ${i + 1} of ${serverChunks.length}` }, // Add page number to the footer
        };

        // Send the embed with the current chunk of server fields to the channel
        await interaction.channel.send({ embeds: [embed] });
      }

    } catch (error) {
      console.error('Error listing servers:', error);
      await interaction.reply('Error listing servers. Please try again later.');
    }
  },
};

// Function to split servers into chunks to fit within character limit of an embed
function chunkServers(servers) {
  const chunkSize = 20; // Adjust as needed
  const serverChunks = [];
  for (let i = 0; i < servers.length; i += chunkSize) {
    serverChunks.push(servers.slice(i, i + chunkSize));
  }
  return serverChunks;
}
