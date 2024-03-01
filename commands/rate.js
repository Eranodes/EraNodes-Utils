const { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');

module.exports = {
  data: {
    name: 'rate',
    description: 'Rate something using a dropdown menu.',
  },
  async execute(interaction) {
    // Create a dropdown menu with rating options
    const row = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('rating')
        .setPlaceholder('Select a rating')
        .addOptions([
          new StringSelectMenuOptionBuilder()
            .setLabel('⭐️ 1 Star')
            .setValue('1'),
          new StringSelectMenuOptionBuilder()
            .setLabel('⭐️⭐️ 2 Stars')
            .setValue('2'),
          new StringSelectMenuOptionBuilder()
            .setLabel('⭐️⭐️⭐️ 3 Stars')
            .setValue('3'),
          new StringSelectMenuOptionBuilder()
            .setLabel('⭐️⭐️⭐️⭐️ 4 Stars')
            .setValue('4'),
          new StringSelectMenuOptionBuilder()
            .setLabel('⭐️⭐️⭐️⭐️⭐️ 5 Stars')
            .setValue('5'),
        ]),
    );

    // Send a message with the dropdown menu
    await interaction.reply({
      content: 'Rate something:',
      components: [row],
    });
  },
};
