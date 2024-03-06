const { SlashCommandBuilder } = require('@discordjs/builders');

// Define the help command
module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Get information about available commands'),

  // Execute function for the help command
  async execute(interaction) {
    // Retrieve the list of commands from the bot's commands collection
    const commands = interaction.client.commands;

    // Create an array of embed fields
    const fields = commands.map(command => ({
      name: `**/${command.data.name}**`,
      value: command.data.description,
      inline: false,
    }));

    // Create an embed object
    const embed = {
      title: 'Available Commands',
      fields: fields,
      color: 0x951931,
    };

    // Respond to the user with the embed
    await interaction.reply({ embeds: [embed] });
  },
};
