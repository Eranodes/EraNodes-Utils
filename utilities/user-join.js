// utilities/user-join.js

/**
 * Sends a welcome message to a user in DM when they join the server.
 * @param {GuildMember} member - The GuildMember object representing the user who joined.
 */
async function sendWelcomeMessage(member) {
    try {
      // Construct the welcome message as a plain JavaScript object
      const welcomeMessage = {
        content: `**Welcome to the Server, ${member.user.tag}!**\nWe're glad to have you here.`,
        embeds: [
          {
            title: `Welcome to the Server, ${member.user.tag}!`,
            description: "We're glad to have you here.",
            color: 0x951931, 
            footer: {
              text: 'EraNodes',
              icon_url: 'https://github.com/Eranodes/.github/blob/main/icons/eranodes-transparent.png?raw=true', // Set the image link for the footer
            },
            image: {
              url: 'https://github.com/Eranodes/.github/blob/main/icons/eranodesbanner-transparent.png?raw=true',
            },
            fields: [
              {
                name: 'Dashboard',
                value: '[freedash.eranodes.xyz](https://freedash.eranodes.xyz)'
              },
              {
                name: 'Panel',
                value: '[panel.eranodes.xyz](https://panel.eranodes.xyz)',
              },
              {
                name: 'Status Page',
                value: '[status.eranodes.xyz](https://status.eranodes.xyz)',
              },
            ],
          },
        ],
      };
  
      // Send the welcome message in DM
      await member.send(welcomeMessage);
    } catch (error) {
      console.error(`Error sending welcome message to ${member.user.tag}: ${error.message}`);
    }
  }
  
  module.exports = {
    sendWelcomeMessage,
  };
  