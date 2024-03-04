const { Interaction, ChannelType } = require('discord.js');
const { log } = require('../utilities/logger');

/**
 * Handle the interaction when a user selects a department from the dropdown.
 * @param {Interaction} interaction - The interaction object.
 */

async function handleTicketCreate(interaction) {
  try {
    // Check if the interaction is a StringSelectMenu interaction
    if (!interaction.isStringSelectMenu()) {
      log('Invalid interaction type. Expected StringSelectMenu.', 'error');
      return;
    }

    // Retrieve the selected option from the interaction
    const selectedOption = interaction.values[0];
    const member = interaction.member;
    const guild = interaction.guild;

    // Determine the department based on the selected option
    let department;
    switch (selectedOption) {
      case 'general':
        department = 'General';
        break;
      case 'payment':
        department = 'Payment';
        break;
      default:
        department = 'Unknown';
    }

    // Create a private thread name with an emoji for paid users
    const emoji = process.env.PAID_USERS_EMOJI || '💲';
    const isPaidUser = member.roles.cache.has(process.env.PAID_USERS_ROLE_ID);

    let channelName = `${isPaidUser ? emoji : ''}${department.toLowerCase()}-${member.user.username}`;

    // Create a private thread in the channel
    const thread = await interaction.channel.threads.create({
      name: channelName,
      autoArchiveDuration: 60,
      type: ChannelType.PrivateThread,
    });

    // Add the user who initiated the interaction to the thread
    await thread.members.add(member.id);

    log(`Private thread created: ${channelName} (${thread.id})`);

    // Fetch the staff role and other role IDs
    const staffRoleId = process.env.STAFF_ROLE_ID;
    const adminRoleId = process.env.ADMINISTRATIVE_ROLE_ID;
    const staffChatChannelId = process.env.STAFF_CHAT_CHANNEL_ID;

    // Check if the staff role exists
    if (!staffRoleId) {
      log('Staff role ID not found. Please check your configuration.', 'error');
      return;
    }

    // Mention the staff role in the welcome message
    let staffMention = staffRoleId ? `<@&${staffRoleId}>` : 'Staff';

    // Check if the user has the PAID_USERS_ROLE_ID
    if (isPaidUser) {
      // Mention the ADMINISTRATIVE_ROLE_ID and send a message to STAFF_CHAT_CHANNEL_ID
      staffMention += ` <@&${adminRoleId}>`;

      // Send a message to the staff chat channel
      const staffChatChannel = guild.channels.cache.get(staffChatChannelId);
      if (staffChatChannel) {
        await staffChatChannel.send(`New ${department} ticket created by paid user ${member.user.username}!`);
        log(`Ticket creation notification sent to staff chat: ${department}`);
      } else {
        log(`Staff chat channel with ID ${staffChatChannelId} not found.`, 'error');
      }
    }

    // Create an object for the button
    const archiveButton = {
      type: 2,
      style: 4, // DANGER
      custom_id: 'archive_button',
      label: 'Close Ticket',
    };

    // Create a row with the button
    const row = {
      type: 1, // ACTION_ROW
      components: [archiveButton],
    };

    // Reply to the user with a confirmation message in DMs (ephemeral)
    await interaction.reply({
      content: `A new private thread has been created for ${department} inquiries. Check your DMs for the link.`,
      ephemeral: true,
    });

    log(`Ticket created for ${member.user.username} in department: ${department}.`);

    // Send a welcome message to the thread with the archive button
    await thread.send({
      content: `Welcome to the ${department} inquiry thread, ${member.user.username}! ${staffMention} is here to assist you.`,
      components: [row],
    });

    log(`Welcome message sent to the thread: ${channelName} (${thread.id})`);
  } catch (error) {
    log(`Error handling ticket creation: ${error.message}`, 'error');
  }
}

module.exports = {
  handleTicketCreate,
};
