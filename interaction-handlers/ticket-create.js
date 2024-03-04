const fs = require('fs');
const path = require('path');
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

    const member = interaction.member;

    // Check if the user already has an open ticket
    const existingTicketFolderPath = path.join(__dirname, `../data/tickets/${member.user.id}`);

    try {
      // Check if the directory exists
      fs.accessSync(existingTicketFolderPath, fs.constants.F_OK);

      // If the directory exists, check for existing tickets
      const existingTickets = fs.readdirSync(existingTicketFolderPath);

      if (existingTickets.length > 0) {
        // Check if any ticket is still open
        const openTicket = existingTickets.find((ticketId) => {
          const ticketDataPath = path.join(existingTicketFolderPath, ticketId, 'data.json');
          try {
            const ticketData = JSON.parse(fs.readFileSync(ticketDataPath, 'utf-8'));
            return !ticketData.closeTime; // If closeTime is not present, the ticket is still open
          } catch (error) {
            log(`Error reading ticket data file: ${error.message}`, 'error');
            return false;
          }
        });

        if (openTicket) {
          // User already has an open ticket
          await interaction.reply({
            content: 'You already have an open ticket. Please close your existing ticket before creating a new one.',
            ephemeral: true,
          });

          log(`User ${member.user.username} already has an open ticket.`);
          return;
        }
      }
    } catch (error) {
      // Directory does not exist, proceed with ticket creation
    }

    // Retrieve the selected option from the interaction
    const selectedOption = interaction.values[0];
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

    // Save ticket creation data to JSON file
    const ticketData = {
      userId: member.user.id,
      threadId: thread.id,
      department,
      openTime: new Date().toISOString(),
    };

    const ticketFolderPath = path.join(__dirname, `../data/tickets/${member.user.id}/${thread.id}`);
    const ticketDataPath = path.join(ticketFolderPath, 'data.json');

    // Ensure the ticket folder exists
    fs.mkdirSync(ticketFolderPath, { recursive: true });

    // Write ticket data to JSON file
    fs.writeFileSync(ticketDataPath, JSON.stringify(ticketData, null, 2));

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
      content: `A new private thread has been created for ${department} inquiries!`,
      ephemeral: true,
    });

    log(`Ticket created for ${member.user.username} in department: ${department}.`);

    // Send a welcome message to the thread with the archive button
    await thread.send({
      content: `Welcome to the ${department} inquiry thread, <@${member.user.id}>! ${staffMention} is here to assist you.`,
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
