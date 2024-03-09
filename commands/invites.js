const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs').promises;
const { log } = require('../utilities/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('invites')
    .setDescription('Get invite data for a specific user')
    .addUserOption(option =>
      option.setName('target_user')
        .setDescription('Select the user to get invite data for')
        .setRequired(true)
    ),
  async execute(interaction) {
    try {
      // Retrieve the target user from the interaction
      const targetUser = interaction.options.getUser('target_user');

      // Define the path to the directory based on the target user
      const targetUserDir = `./data/invites/${targetUser.id}`;

      // Ensure the directory for the target user exists
      await fs.mkdir(targetUserDir, { recursive: true });

      // Read the list of JSON files in the directory
      const files = await fs.readdir(targetUserDir);

      // Create an array to store the list of users invited by the target user
      const invitedUsers = [];

      // Iterate through each JSON file and extract user information
      for (const file of files) {
        try {
          const filePath = `${targetUserDir}/${file}`;
          const fileContent = await fs.readFile(filePath, 'utf-8');
          const inviteData = JSON.parse(fileContent);

          // Extract relevant information from the invite data
          const invitedUserId = file.replace('.json', '');
          const joinTimestamp = inviteData[inviteData.length - 1]?.jointimestamp || 'Unknown';

          // Fetch the user by ID to get the username
          const invitedMember = await interaction.guild.members.fetch(invitedUserId);
          const invitedUsername = invitedMember ? invitedMember.user.username : 'Unknown';

          // Format the date and time
          const joinDate = new Date(joinTimestamp);
          const formattedDate = `${joinDate.getDate()}-${joinDate.getMonth() + 1}-${joinDate.getFullYear()}`;
          const formattedTime = joinDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

          // Add the user information to the array
          invitedUsers.push({
            username: invitedUsername,
            joinDate: formattedDate,
            joinTime: formattedTime,
            isInGuild: invitedMember ? 'Yes' : 'No', // Check if the user is still in the guild
          });
        } catch (readError) {
          log(`Error reading invite data from file ${file}: ${readError.message}`, 'error');
        }
      }

      // Count the number of users still in the guild and those who have left
      const usersInGuildCount = invitedUsers.filter(user => user.isInGuild === 'Yes').length;
      const usersLeftCount = invitedUsers.length - usersInGuildCount;

      // Create an embed object with information about the users invited by the target user
      const embed = {
        color: 0x3498db,
        title: `Invite Data for ${targetUser.tag}`,
        description: 'List of users invited by the target user:',
        fields: [
          {
            name: 'Users Still in Guild',
            value: usersInGuildCount.toString(),
            inline: true,
          },
          ...invitedUsers.map(user => ({
            name: `Username: ${user.username}`,
            value: `Joined on: ${user.joinDate} at ${user.joinTime}\nStill in Guild: ${user.isInGuild}`,
          })),
        ],
      };

      // Send the embed in the channel where the command was invoked
      await interaction.reply({ embeds: [embed] });
      log(`Invite data sent for user ${targetUser.tag}`, 'info');
    } catch (error) {
      log(`Error executing /invites command: ${error.message}`, 'error');
      // Add appropriate error handling or reply to the user with an error message
      await interaction.reply('An error occurred while processing the command.');
    }
  },
};
