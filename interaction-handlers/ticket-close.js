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
      log(`Invalid interaction. Channel ${interaction.channel.id} is not a valid thread.`, 'error');
      return;
    }

    log(`Closing ticket in thread: ${interaction.channel.name} (${interaction.channel.id})`);

    // Check if the thread is archived
    if (interaction.channel.archived) {
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

    log(`User notified about ticket closure: ${closedByMention}`);

    // Update channel permissions to disallow sending messages for @everyone
    const everyoneRole = interaction.guild.roles.everyone;

    log(`Updating channel permissions to disallow @everyone in thread: ${interaction.channel.name} (${interaction.channel.id})`);

    try {
      await interaction.channel.permissionOverwrites.edit(everyoneRole, {
        SEND_MESSAGES: false,
      });
      log(`Permissions updated successfully.`);
    } catch (permissionError) {
      log(`Error updating permissions: ${permissionError.message}`, 'error');
    }

    // Archive the thread
    await interaction.channel.setArchived(true);

    log(`Thread archived: ${interaction.channel.name} (${interaction.channel.id})`);

    // Send a DM to the user asking for a rating
    await interaction.user.send({
      content: 'Thank you for using our service! Please rate your ticket experience:',
      components: [row],
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
