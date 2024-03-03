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

    // Create the embed
    const embed = {
      color: 0x951931,
      title: 'Ticket Panel',
      description: 'Please select a department for assistance:',
      footer: {
        text: 'EraNodes Ticketing Panel',
        icon_url: 'attachment://eranodes-transparent.png',
      },
    };

    // Send the message with the embed
    await channel.send({
      embeds: [embed],
      files: [{
        attachment: 'assets/images/eranodes-transparent.png',
        name: 'eranodes-transparent.png',
      }],
    });

    // Create a string select menu with options
    const select = new StringSelectMenuBuilder()
      .setCustomId('ticketPanel')
      .setPlaceholder('Select a department')
      .addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel('General')
          .setValue('general')
          .setDescription('General inquiries and support.'),
        new StringSelectMenuOptionBuilder()
          .setLabel('Payment')
          .setValue('payment')
          .setDescription('Issues related to payments and transactions.'),
      );

    // Send the message with the dropdown
    await channel.send({
      content: 'Please use the dropdown to select a department:',
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
