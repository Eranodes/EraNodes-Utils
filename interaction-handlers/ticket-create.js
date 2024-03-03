const { Interaction } = require('discord.js');

/**
 * Handle the interaction when a user selects a department from the dropdown.
 * @param {Interaction} interaction - The interaction object.
 */
async function handleTicketCreate(interaction) {
  if (!interaction.isStringSelectMenu()) return;

  const selectedOption = interaction.values[0];
  const guild = interaction.guild;
  const member = interaction.member;

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

  // Create a thread in the channel
  const channelName = `${department.toLowerCase()}-${member.user.username}`;
  const thread = await interaction.channel.threads.create({
    name: channelName,
    autoArchiveDuration: 60, // Adjust the auto-archive duration as needed
  });

  // Add the user who initiated the interaction to the thread
  await thread.members.add(member.id);

  // Reply to the user with a confirmation message
  await interaction.reply({
    content: `A new thread has been created for ${department} inquiries. Check your DMs for the link.`,
    ephemeral: true,
  });

  // Get the TICKET_PANEL_CHANNEL_ID from .env
  const ticketPanelChannelId = process.env.TICKET_PANEL_CHANNEL_ID;

  // Fetch and delete the message in TICKET_PANEL_CHANNEL_ID
  try {
    const ticketPanelChannel = guild.channels.cache.get(ticketPanelChannelId);
    const ticketPanelMessage = await ticketPanelChannel.messages.fetch({ limit: 1 });
    ticketPanelMessage.first().delete();
  } catch (error) {
    console.error(`Error deleting message in TICKET_PANEL_CHANNEL_ID: ${error.message}`);
  }
}

module.exports = {
  handleTicketCreate,
};
