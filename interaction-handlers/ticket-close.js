const { ButtonInteraction, Permissions, StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js');
const { log } = require('../utilities/logger');

/**
 * Handle the interaction when a user clicks the "Close Ticket" button.
 * @param {ButtonInteraction} interaction - The button interaction object.
 */

async function handleTicketClose(interaction) {
  try {
    // Check if the channel is a thread
    if (!interaction.channel.isThread()) {
      log(`Channel ${interaction.channel.id} is not a valid thread.`);
      return;
    }

    // Check if the thread is archived
    if (interaction.channel.archived) {
      // If already archived, reply with a message indicating that it's already closed
      await interaction.reply({
        content: 'This ticket is already closed. If you have further inquiries, feel free to open a new ticket.',
        ephemeral: true,
      });

      log(`Thread ${interaction.channel.name} is already archived.`);
      return;
    }

    // Mention the user who closed the ticket
    const closedByMention = interaction.user.toString();

    // Create options for the rating dropdown
    const ratingOptions = [
      {
        label: '⭐ 1 Star',
        value: '1',
        description: 'Terrible',
      },
      {
        label: '⭐⭐ 2 Stars',
        value: '2',
        description: 'Bad',
      },
      {
        label: '⭐⭐⭐ 3 Stars',
        value: '3',
        description: 'Neutral',
      },
      {
        label: '⭐⭐⭐⭐ 4 Stars',
        value: '4',
        description: 'Good',
      },
      {
        label: '⭐⭐⭐⭐⭐ 5 Stars',
        value: '5',
        description: 'Excellent',
      },
    ];

    // Create the select menu with options
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('rating_menu')
      .setPlaceholder('Select a rating');

    ratingOptions.forEach((option) => {
      selectMenu.addOptions(option);
    });

    // Create a row with the select menu
    const row = new ActionRowBuilder().addComponents(selectMenu);

    // Reply to the user with a confirmation message in DMs (ephemeral)
    await interaction.reply({
      content: 'This ticket has been closed. Please check your DM!',
      ephemeral: true,
    });

    // Update channel permissions to disallow sending messages for @everyone
    const everyoneRole = interaction.guild.roles.everyone;

    // Archive the thread
    await interaction.channel.setArchived(true);

    // Send a DM to the user asking for a rating
    await interaction.user.send({
      content: 'Thank you for using our service! Please rate your ticket experience:',
      components: [row],
    });

    log(`Ticket closed, thread archived, and rating prompt sent in channel ${interaction.channel.id}.`);
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
