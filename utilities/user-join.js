// Import necessary modules and dependencies
const { Client, GatewayIntentBits, Collection, TextChannel } = require('discord.js');
const fs = require('fs').promises;
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
 * Appends invitation data to an existing JSON file or creates a new file if it doesn't exist.
 * @param {Object} invite - The Invite object containing information about the invitation.
 */
async function appendInviteData(invite) {
    try {
        // Define the path to the JSON file based on the user who invited
        const filePath = `./data/invites/${invite.inviter.id}.json`;

        let existingData = [];
        
        // Check if the file already exists
        try {
            const fileContent = await fs.readFile(filePath, 'utf-8');
            existingData = JSON.parse(fileContent);
        } catch (readError) {
            // Ignore errors if the file doesn't exist
        }

        // Create an entry for the current invitation data
        const entry = {
            invitedUserId: invite.invitedUser.id,
            invitedUsername: invite.invitedUser.username,
            timestamp: new Date().toISOString(),
            url: invite.url,
            // Add any other relevant information you want to include
        };

        // Append the new entry to the existing data
        existingData.push(entry);

        // Write the updated invitation data to the JSON file
        await fs.writeFile(filePath, JSON.stringify(existingData, null, 2));

        log(`Invite data appended for user ${invite.inviter.tag}`, 'info');
    } catch (error) {
        log(`Error appending invite data: ${error.message}`, 'error');
    }
}

/**
 * Sends a welcome message to a user in DM and a specific channel when they join the server.
 * @param {GuildMember} member - The GuildMember object representing the user who joined.
 */
async function sendWelcomeMessage(member) {
    try {
        // Get the invites for the guild
        const invites = await member.guild.invites.fetch();

        // Find the invite used by the new member
        const inviteUsed = invites.find(invite => invite.uses > 0);

        // Extract inviter details
        const inviter = inviteUsed ? inviteUsed.inviter : null;

        // Save invite data to a JSON file
        if (inviter) {
            await appendInviteData({
                inviter: {
                    id: inviter.id,
                    tag: inviter.tag,
                },
                invitedUser: {
                    id: member.user.id,
                    username: member.user.username,
                },
                url: inviteUsed.url,
            });
        }

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
                        {
                            name: 'Invited by',
                            value: inviter ? `**Username:** ${inviter.username}\n**Tag:** ${inviter.tag}` : 'Unknown',
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
