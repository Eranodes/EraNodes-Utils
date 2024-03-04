const fs = require('fs');
const path = require('path');
const { ButtonInteraction, StringSelectMenuBuilder } = require('discord.js');
const { log } = require('../utilities/logger');

/**
 * Handle the interaction when a user clicks the "Close Ticket" button.
 * @param {ButtonInteraction} interaction - The button interaction object.
 */

async function handleTicketClose(interaction) {
  try {
    // Check if the channel is a thread
    if (!interaction.channel.isThread()) {
      log(`Invalid interaction. Channel ${interaction.channel.id} is not a valid thread.`, 'error');
      return;
    }

    log(`Closing ticket in thread: ${interaction.channel.name} (${interaction.channel.id})`);

    // Check if the thread is archived
    if (interaction.channel.parent?.archived) {
      // If already archived, reply with a message indicating that it's already closed
      await interaction.reply({
        content: 'This ticket is already closed. If you have further inquiries, feel free to open a new ticket.',
        ephemeral: true,
      });

      log(`Thread ${interaction.channel.name} is already archived. No further action required.`);
      return;
    }

    // Mention the user who closed the ticket
    const closedByMention = interaction.user.toString();

    log(`Ticket closed by: ${closedByMention}`);

    // Save ticket close data to JSON file
    const ticketDataPath = path.join(__dirname, `../data/tickets/${interaction.user.id}/${interaction.channel.id}/data.json`);

    // Read existing ticket data
    const existingTicketData = fs.existsSync(ticketDataPath) ? JSON.parse(fs.readFileSync(ticketDataPath, 'utf-8')) : {};

    // Update ticket data with close time
    existingTicketData.closeTime = new Date().toISOString();

    // Write updated ticket data to JSON file
    fs.writeFileSync(ticketDataPath, JSON.stringify(existingTicketData, null, 2));

    // Reply to the user with a confirmation message in DMs (ephemeral)
    await interaction.reply({
      content: 'This ticket has been closed. Please check your DM!',
      ephemeral: true,
    });

    log(`User notified about ticket closure: ${closedByMention}`);

    try {
      // Attempt to archive the channel directly
      await interaction.channel.setArchived(true);
      log(`Channel archived directly: ${interaction.channel.name} (${interaction.channel.id})`);
    } catch (error) {
      log(`Error archiving channel: ${error.message}`, 'error');
    }

    // Send a DM to the user asking for a rating
    const ratingOptions = [
      { label: '⭐ 1 Star', value: '1', description: 'Terrible' },
      { label: '⭐⭐ 2 Stars', value: '2', description: 'Bad' },
      { label: '⭐⭐⭐ 3 Stars', value: '3', description: 'Neutral' },
      { label: '⭐⭐⭐⭐ 4 Stars', value: '4', description: 'Good' },
      { label: '⭐⭐⭐⭐⭐ 5 Stars', value: '5', description: 'Excellent' },
    ];

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('rating_menu')
      .setPlaceholder('Select a rating');

    ratingOptions.forEach((option) => {
      selectMenu.addOptions(option);
    });

    await interaction.user.send({
      content: 'Thank you for using our service! Please rate your ticket experience:',
      components: [
        {
          type: 1, // ACTION_ROW
          components: [selectMenu],
        },
      ],
    });

    log(`Rating prompt sent in DM to: ${closedByMention}`);
    log(`Ticket closure process completed for thread: ${interaction.channel.name} (${interaction.channel.id}).`);
  } catch (error) {
    log(`Error closing ticket: ${error.message}`, 'error');
    await interaction.reply({
      content: 'There was an error while closing the ticket. Please try again.',
      ephemeral: true,
    });
  }
}

module.exports = {
  handleTicketClose,
};
