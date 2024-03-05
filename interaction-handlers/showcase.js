// Import necessary modules and dependencies
const { log } = require('../utilities/logger');
const { WebhookClient } = require('discord.js');
const dns = require('dns');
const mcsrv = require('mcsrv'); // Updated library
const addressesData = require('../addresses.json');

// Define the showcase interaction handler
module.exports = {
  handleShowcaseInteraction: async (interaction) => {
    try {
      // Get the data entered by the user
      const rawServerAddress = interaction.fields.getTextInputValue('serverAddressInput');
      const serverName = interaction.fields.getTextInputValue('serverNameInput');
      const serverDescription = interaction.fields.getTextInputValue('serverDescriptionInput');

      // Enforce a maximum character limit of 500 for the server description
      if (serverDescription.length > 500) {
        await interaction.reply({ content: 'Server description exceeds the maximum character limit of 500. Please provide a shorter description.', ephemeral: true });
        return;
      }

      // Log the collected data (optional)
      log(`Server Address: ${rawServerAddress}`);
      log(`Server Name: ${serverName}`);
      log(`Server Description: ${serverDescription}`);

      // Extract only the IP address from the provided server address
      const serverAddress = extractIPAddress(rawServerAddress);

      // Array to store resolved IP addresses
      const resolvedIPs = [];

      // Resolve the server address (either IP or domain)
      dns.resolve(serverAddress, async (err, addresses) => {
        if (err) {
          log(`Error resolving server address: ${err.message}`, 'error');

          // Retry resolving with port included (if it's a domain with a port)
          if (serverAddress.includes(':')) {
            return resolveWithPort(rawServerAddress);
          }

          await interaction.reply({ content: 'An error occurred while processing your request.', ephemeral: true });
          return;
        }

        // Log resolved IP addresses
        resolvedIPs.push(...addresses);
        log(`Resolved IP addresses: ${resolvedIPs.join(', ')}`);

        // Check if the resolved address matches any predefined addresses
        const matchingAddress = addressesData.addresses.find((addressData) => addresses.includes(addressData.ip));

        if (matchingAddress) {
          // Get Minecraft server information using mcsrv
          const serverInfo = await getMinecraftServerInfo(serverAddress);

          // Send the data to the webhook
          const webhook = new WebhookClient({ url: process.env.SHOWCASE_WEBHOOK_URL });

          await webhook.send({
            content: 'Minecraft Server Showcase',
            embeds: [
              {
                title: 'Server Information',
                fields: [
                  { name: 'Address', value: rawServerAddress, inline: true }, // Include the original input with port
                  { name: 'Name', value: serverName, inline: true },
                  { name: 'Description', value: serverDescription },
                  { name: 'Location', value: matchingAddress.location, inline: true },
                  { name: 'Flag', value: matchingAddress.flag, inline: true },
                  { name: 'Resolved IP Addresses', value: resolvedIPs.join('\n') }, // Include resolved IP addresses in the embed
                  { name: 'Minecraft Server Status', value: serverInfo.status, inline: true }, // Include Minecraft server status
                  { name: 'Players Online', value: serverInfo.players, inline: true },
                  { name: 'Server Version', value: serverInfo.version, inline: true },
                ],
              },
            ],
          });

          await interaction.reply({ content: 'Your server showcase data has been submitted successfully!', ephemeral: true });
        } else {
          await interaction.reply({ content: 'Only servers hosted on EraNodes are allowed. Please provide a valid EraNodes server address.', ephemeral: true });
        }
      });
    } catch (error) {
      log(`Error handling showcase interaction: ${error.message}`, 'error');
      await interaction.reply({ content: 'An error occurred while processing your request.', ephemeral: true });
    }
  },
};

// Function to extract the IP address from a server address with a possible port
function extractIPAddress(serverAddress) {
  const match = serverAddress.match(/^\[?([^\]]+)\]?:(\d+)$/); // Check for IP address with optional square brackets and port
  return match ? match[1] : serverAddress; // Return the extracted IP address
}

// Function to resolve a domain with a port using dns.resolve
function resolveWithPort(serverAddress) {
  return new Promise((resolve) => {
    const [domain, port] = serverAddress.split(':');
    dns.resolve(domain, (err, addresses) => {
      if (err) {
        log(`Error resolving server address with port: ${err.message}`, 'error');
        resolve(null);
      } else {
        resolve(addresses.map((address) => `${address}:${port}`).join(','));
      }
    });
  });
}

// Function to get Minecraft server information using mcsrv
async function getMinecraftServerInfo(serverAddress) {
  try {
    const response = await mcsrv(serverAddress); // Updated function call

    if (response.online) {
      return {
        status: 'Online',
        players: `${response.players.online}/${response.players.max}`,
        version: response.version,
      };
    } else {
      return {
        status: 'Offline',
        players: 'N/A',
        version: 'N/A',
      };
    }
  } catch (error) {
    console.error(`Error getting Minecraft server information: ${error.message}`);
    return {
      status: 'Error',
      players: 'N/A',
      version: 'N/A',
    };
  }
}
