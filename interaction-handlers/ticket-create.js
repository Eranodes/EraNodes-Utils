const { Interaction, ChannelType } = require('discord.js');

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

  // Create a private thread in the channel
  const channelName = `${department.toLowerCase()}-${member.user.username}`;
  const thread = await interaction.channel.threads.create({
    name: channelName,
    autoArchiveDuration: 60, // Adjust the auto-archive duration as needed
    type: ChannelType.PrivateThread, // Set the type to PrivateThread
  });

  // Add the user who initiated the interaction to the thread
  await thread.members.add(member.id);

  // Add users with the role STAFF_ROLE_ID to the thread
  const staffRoleId = process.env.STAFF_ROLE_ID;
  const staffRole = guild.roles.cache.get(staffRoleId);

  if (staffRole) {
    const staffMembers = staffRole.members;
    staffMembers.forEach(async (staffMember) => {
      await thread.members.add(staffMember.id);
    });
  } else {
    console.error(`Staff role with ID ${staffRoleId} not found.`);
  }

  // Reply to the user with a confirmation message
  await interaction.reply({
    content: `A new private thread has been created for ${department} inquiries. Check your DMs for the link.`,
    ephemeral: true,
  });

}

module.exports = {
  handleTicketCreate,
};
