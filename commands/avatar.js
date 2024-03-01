const { SlashCommandBuilder } = require('@discordjs/builders');
const { log } = require('../utilities/logger'); // Importing the logger module

module.exports = {
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('Get the avatar of a user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Select a user to get their avatar')
        .setRequired(false)),
  async execute(interaction) {
    try {
      const user = interaction.options.getUser('user') || interaction.user;

      // Get the user's avatar URL
      const avatarURL = user.displayAvatarURL({ dynamic: true, size: 2048 });

      // Reply with the user's avatar as an embed
      await interaction.reply({
        embeds: [{
          title: `${user.tag}'s Avatar`,
          image: { url: avatarURL },
        }],
      });

      log('Avatar command executed successfully!', 'info'); // Logging successful execution
    } catch (error) {
      log(`Error executing avatar command: ${error.message}`, 'error'); // Logging command execution errors
      await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
  },
};
