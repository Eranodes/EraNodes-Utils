const { Client, GatewayIntentBits, Collection, TextChannel } = require('discord.js');
const { config } = require('dotenv');
const { log } = require('./logger');
// Load environment variables from .env file
config();

// Create a Discord client
const bot = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
});

// Log in to Discord
bot.login(process.env.BOT_TOKEN)
    .then(() => log('Bot logged in successfully', 'info'))
    .catch((error) => {
        log(`Error logging in: ${error.message}`, 'error');
        process.exit(1); // Exit the process in case of login failure
    });

/**
 * Sends a welcome message to a user in DM and a specific channel when they join the server.
 * @param {GuildMember} member - The GuildMember object representing the user who joined.
 */
async function sendWelcomeMessage(member) {
    try {
        // Construct the welcome message for DM
        const welcomeMessageDM = {
            content: `**Welcome to the Server, ${member.user.tag}!**\nWe're glad to have you here.`,
            embeds: [
                {
                    title: `Welcome to the Server, ${member.user.tag}!`,
                    description: "We're glad to have you here.",
                    color: 0x951931,
                    footer: {
                        text: 'EraNodes',
                        icon_url: 'https://github.com/Eranodes/.github/blob/main/icons/eranodes-transparent.png?raw=true',
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
        await member.send(welcomeMessageDM);
        log(`Welcome message sent to ${member.user.tag} in DM`, 'info');

        // Construct the welcome message for the specified channel
        const welcomeMessageChannel = {
            content: `Welcome, ${member}!`,
            embeds: [
                {
                    title: `${member.user.tag} Joined!`,
                    color: 0x36c7f2,
                    thumbnail: {
                        url: member.user.displayAvatarURL({ dynamic: true, size: 256 }),
                    },
                    fields: [
                        {
                            name: 'User Info',
                            value: `**Name:** ${member.displayName}\n**ID:** ${member.id}`,
                        },
                    ],
                    footer: {
                        text: 'EraNodes',
                        icon_url: 'https://github.com/Eranodes/.github/blob/main/icons/eranodes-transparent.png?raw=true',
                    },
                },
            ],
        };

        // Send the welcome message to the specified channel using the WELCOME_CHANNEL_ID from .env
        const welcomeChannelId = process.env.WELCOME_CHANNEL_ID;
        const welcomeChannel = await bot.channels.fetch(welcomeChannelId)
            .catch((error) => {
                log(`Error fetching welcome channel (${welcomeChannelId}): ${error.message}`, 'error');
                throw error;
            });

        if (welcomeChannel && welcomeChannel instanceof TextChannel) {
            await welcomeChannel.send(welcomeMessageChannel)
                .catch((error) => {
                    log(`Error sending welcome message to ${welcomeChannel.name}: ${error.message}`, 'error');
                    throw error;
                });
            log(`Welcome message sent to ${welcomeChannel.name} for ${member.user.tag}`, 'info');
        } else {
            log(`Welcome channel (${welcomeChannelId}) not found or not a TextChannel`, 'warn');
        }
    } catch (error) {
        log(`Error processing welcome message for ${member.user.tag}: ${error.message}`, 'error');
    }
}

module.exports = {
    sendWelcomeMessage,
};
