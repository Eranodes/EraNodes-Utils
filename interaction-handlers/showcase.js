const { log } = require('../utilities/logger');
const { WebhookClient } = require('discord.js');
const dns = require('dns');
const mcsrv = require('mcsrv');
const addressesData = require('../addresses.json');

module.exports = {
  handleShowcaseInteraction: async (interaction) => {
    try {
      log('Handling showcase interaction...', 'info');

      const rawServerAddress = interaction.fields.getTextInputValue('serverAddressInput');
      const serverName = interaction.fields.getTextInputValue('serverNameInput');
      const serverDescription = interaction.fields.getTextInputValue('serverDescriptionInput');

      if (serverDescription.length > 500) {
        log('Server description exceeds the maximum character limit of 500.', 'warn');
        await interaction.reply({ content: 'Server description exceeds the maximum character limit of 500. Please provide a shorter description.', ephemeral: true });
        return;
      }

      log(`Server Address: ${rawServerAddress}`, 'info');
      log(`Server Name: ${serverName}`, 'info');
      log(`Server Description: ${serverDescription}`, 'info');

      await interaction.reply({ content: 'Your server showcase data is being submitted...', ephemeral: true });

      const serverAddress = extractIPAddress(rawServerAddress);

      const resolvedIPs = [];

      dns.resolve(serverAddress, async (err, addresses) => {
        if (err) {
          log(`Error resolving server address: ${err.message}`, 'error');

          if (serverAddress.includes(':')) {
            return resolveWithPort(rawServerAddress);
          }

          await interaction.channel.send({ content: `Failed to process your request. ${err.message}` });
          return;
        }

        resolvedIPs.push(...addresses);
        log(`Resolved IP addresses: ${resolvedIPs.join(', ')}`, 'info');

        const matchingAddress = addressesData.addresses.find((addressData) => addresses.includes(addressData.ip));

        if (matchingAddress) {
          const serverInfo = await getMinecraftServerInfo(serverAddress);

          const user = interaction.user;
          const webhook = new WebhookClient({ url: process.env.SHOWCASE_WEBHOOK_URL });

          await webhook.send({
            username: user.username,
            avatarURL: user.displayAvatarURL({ dynamic: true }),
            content: 'Minecraft Server Showcase',
            embeds: [
              {
                title: `${matchingAddress.flag} ${serverName}`,
                description: serverDescription,
                color: 0x951931,
                fields: [
                  { name: 'Address', value: rawServerAddress, inline: false },
                  { name: 'Minecraft Server Status', value: serverInfo.status, inline: false },
                  { name: 'Players Online', value: serverInfo.players, inline: false },
                  { name: 'Server Version', value: serverInfo.version, inline: false },
                  { name: 'Server MOTD', value: `\`\`\`${serverInfo.motd}\`\`\``, inline: false },
                ],
                footer: {
                  text: matchingAddress.location,
                },
              },
            ],
          });

          log('Server showcase data submitted successfully.', 'info');
        } else {
          log('Only servers hosted on EraNodes are allowed.', 'warn');
          await interaction.channel.send({ content: `Your server showcase data submission failed. Only servers hosted on EraNodes are allowed.` });
        }
      });
    } catch (error) {
      log(`Error handling showcase interaction: ${error.message}`, 'error');
      await interaction.reply({ content: 'An error occurred while processing your request.', ephemeral: true });
    }
  },
};

function extractIPAddress(serverAddress) {
  const match = serverAddress.match(/^\[?([^\]]+)\]?:(\d+)$/);
  return match ? match[1] : serverAddress;
}

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

async function getMinecraftServerInfo(serverAddress) {
  try {
    const response = await mcsrv(serverAddress);
    if (response.online) {
      return {
        status: 'Online',
        players: `${response.players.online}/${response.players.max}`,
        version: response.version,
        motd: response.motd.clean,
      };
    } else {
      return {
        status: 'Offline',
        players: 'N/A',
        version: 'N/A',
        motd: 'N/A',
      };
    }
  } catch (error) {
    log(`Error getting Minecraft server information: ${error.message}`, 'error');
    return {
      status: 'Error',
      players: 'N/A',
      version: 'N/A',
      motd: 'N/A',
    };
  }
}
