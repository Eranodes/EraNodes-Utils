const { ButtonInteraction, Permissions } = require('discord.js');
const { log } = require('../utilities/logger');

/**
 * Handle the interaction when a user clicks the "Close Ticket" button.
 * @param {ButtonInteraction} interaction - The button interaction object.
 */
async function handleTicketClose(interaction) {
  // Check if the interaction is a button interaction
  if (!interaction.isButton()) return;

  // Check if the clicked button has the custom_id 'archive_button'
  if (interaction.customId !== 'archive_button') return;

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

    // Send a closing message in the thread
    await interaction.channel.send(`This thread has been closed by ${closedByMention}.`);

    // Send an ephemeral reply
    await interaction.reply({
      content: 'This ticket has been closed. If you have further inquiries, feel free to open a new ticket.',
      ephemeral: true,
    });

    // Update channel permissions to disallow sending messages for @everyone
    const everyoneRole = interaction.guild.roles.everyone;

    // Archive the thread
    await interaction.channel.setArchived(true);

    log(`Ticket closed and thread archived in channel ${interaction.channel.id}.`);
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
