// commands/rate.js
const { SlashCommandBuilder } = require('@discordjs/builders');
const { ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rate')
    .setDescription('Rate a user')
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('Select a user to rate')
        .setRequired(true)
    ),
  async execute(interaction) {
    // Check if the user has the specified staff role
    const staffRoleID = process.env.STAFF_ROLE_ID;
    const userToRate = interaction.options.getUser('user');
    const userIsStaff = interaction.guild.members.cache.get(userToRate.id)?.roles.cache.has(staffRoleID);

    if (userIsStaff) {
      // Staff member, send a dropdown for rating
      const row = new ActionRowBuilder()
        .addComponents(
          new StringSelectMenuBuilder()
            .setCustomId('rating_dropdown')
            .setPlaceholder('Select a rating')
            .addOptions([
              {
                label: '⭐️ 1 Star',
                value: '1',
              },
              {
                label: '⭐️⭐️ 2 Stars',
                value: '2',
              },
              {
                label: '⭐️⭐️⭐️ 3 Stars',
                value: '3',
              },
              {
                label: '⭐️⭐️⭐️⭐️ 4 Stars',
                value: '4',
              },
              {
                label: '⭐️⭐️⭐️⭐️⭐️ 5 Stars',
                value: '5',
              },
            ])
        );

      await interaction.reply({ content: `Please rate ${userToRate.username}`, components: [row] });
    } else {
      // Non-staff member, ask to choose a staff member to rate
      await interaction.reply({ content: `Please choose a staff member to rate.`, ephemeral: true });
    }
  },
};
