const { SlashCommandBuilder } = require('@discordjs/builders');
const packageJson = require('../package.json');

const infoCommand = new SlashCommandBuilder()
  .setName('info')
  .setDescription('Get information about the bot');

async function execute(interaction) {
  // Extract relevant information from package.json
  const { name, version, description, author, license } = packageJson;

  // Define additional information
  const authorSite = '[g9aerospace.in](https://g9aerospace.in)';
  const companySite = ['[freedash.eranodes.xyz](https://freedash.eranodes.xyz)', '[panel.eranodes.xyz](https://panel.eranodes.xyz),', '[status.eranodes.xyz](https://status.eranodes.xyz)'];
  const githubRepo = 'https://github.com/Eranodes/EraNodes-Utils';

  // Create a direct object with the information
  const infoObject = {
    title: `${name}`,
    fields: [
      { name: 'Version', value: version, inline: true },
      { name: 'Description', value: description, inline: true },
      { name: 'Author', value: author, inline: true },
      { name: 'License', value: license, inline: true },
      { name: 'Author Site', value: authorSite },
      { name: 'EraNodes Sites', value: companySite.join('\n') },
      { name: 'GitHub Repository', value: `[GitHub Repo](${githubRepo})` },
    ],
    color: 0x951931,
    footer: {
      text: 'EraNodes',
    },
  };

  // Send the reply
  await interaction.reply({
    embeds: [infoObject],
    files: [{
      attachment: footerIconPath,
      name: 'footer_icon.png',
    }],
  });
}

module.exports = {
  data: infoCommand,
  execute,
};