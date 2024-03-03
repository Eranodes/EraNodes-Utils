const { StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const { log } = require('./logger');

async function setupTicketPanel(bot, guildId, channelId) {
  try {
    // Fetch the guild based on the provided guildId
    const guild = await bot.guilds.fetch(guildId);

    if (!guild) {
      log(`Guild with ID ${guildId} not found.`, 'error');
      return;
    }

    // Fetch the channel based on the provided channelId
    const channel = await guild.channels.fetch(channelId);

    if (!channel || channel.guild.id !== guild.id) {
      log(`Channel with ID ${channelId} not found or does not belong to guild ${guild.name}.`, 'error');
      return;
    }

    // Create a string select menu with options
    const select = new StringSelectMenuBuilder()
      .setCustomId('ticketPanel')
      .setPlaceholder('Select a department')
      .addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel('General')
          .setValue('general'),
        new StringSelectMenuOptionBuilder()
          .setLabel('Payment')
          .setValue('payment'),
      );

    // Send the message with the dropdown
    await channel.send({
      content: 'Please select a department for assistance:',
      components: [
        {
          type: 1,
          components: [select],
        },
      ],
    });

    log(`Ticket panel set up in guild ${guild.name}.`);
  } catch (error) {
    log(`Error setting up ticket panel: ${error.message}`, 'error');
  }
}

module.exports = {
  setupTicketPanel,
};
