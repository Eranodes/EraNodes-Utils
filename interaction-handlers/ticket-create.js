const { Interaction, ChannelType } = require('discord.js');

/**
 * Handle the interaction when a user selects a department from the dropdown.
 * @param {Interaction} interaction - The interaction object.
 */
async function handleTicketCreate(interaction) {
  if (!interaction.isStringSelectMenu()) return;

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

  // Create a private thread in the channel
  const channelName = `${department.toLowerCase()}-${member.user.username}`;
  const thread = await interaction.channel.threads.create({
    name: channelName,
    autoArchiveDuration: 60, // Adjust the auto-archive duration as needed
    type: ChannelType.PrivateThread, // Set the type to PrivateThread
  });

  // Add the user who initiated the interaction to the thread
  await thread.members.add(member.id);

  // Fetch the staff role
  const staffRoleId = process.env.STAFF_ROLE_ID;
  const staffRole = guild.roles.cache.get(staffRoleId);

  if (!staffRole) {
    console.error(`Staff role with ID ${staffRoleId} not found.`);
    return;
  }

  // Mention the staff role in the welcome message
  const staffMention = staffRole.toString();
  
  // Send a welcome message to the thread
  await thread.send(`Welcome to the ${department} inquiry thread, ${member.user.username}! ${staffMention} is here to assist you.`);

  // Reply to the user with a confirmation message
  await interaction.reply({
    content: `A new private thread has been created for ${department} inquiries. Check your DMs for the link.`,
    ephemeral: true,
  });
}

module.exports = {
  handleTicketCreate,
};
