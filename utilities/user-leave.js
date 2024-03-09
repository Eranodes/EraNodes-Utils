// Import necessary modules and dependencies
const { Client, GatewayIntentBits, TextChannel } = require('discord.js');
const { config } = require('dotenv');
const { log } = require('./logger');
const fs = require('fs').promises;

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
 * Updates the 'left-guild' property for a user in the invite data JSON file.
 * If the user has multiple entries, updates the last entry.
 * @param {string} inviterId - The Discord ID of the user who invited.
 * @param {string} invitedUserId - The Discord ID of the user who left.
 */
async function updateInviteData(inviterId, invitedUserId) {
    try {
        // Define the path to the JSON file based on the inviter
        const filePath = `./data/invites/${inviterId}.json`;

        // Read the existing invite data from the JSON file
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const existingData = JSON.parse(fileContent);

        // Find all entries for the user who left
        const userEntries = existingData.filter(entry => entry.invitedUserId === invitedUserId);

        // Update the 'left-guild' property with the current timestamp for the last entry
        if (userEntries.length > 0) {
            const lastEntry = userEntries[userEntries.length - 1];
            lastEntry['left-guild'] = new Date().toISOString();
        }

        // Write the updated invitation data back to the JSON file
        await fs.writeFile(filePath, JSON.stringify(existingData, null, 2));

        log(`Invite data updated for user ${invitedUserId} in ${inviterId}.json`, 'info');
    } catch (error) {
        log(`Error updating invite data: ${error.message}`, 'error');
    }
}

/**
 * Sends a farewell message to a user in DM and a specific channel when they leave the server.
 * @param {GuildMember} member - The GuildMember object representing the user who left.
 */
async function sendFarewellMessage(member) {
    try {
        // Get the invites for the guild
        const invites = await member.guild.invites.fetch();

        // Find the invite used by the leaving member
        const inviteUsed = invites.find(invite => invite.uses > 0);

        // Extract inviter details
        const inviter = inviteUsed ? inviteUsed.inviter : null;

        // Save invite data to a JSON file
        if (inviter) {
            await updateInviteData(inviter.id, member.user.id);
        }

        // Construct the farewell message for the specified channel
        const farewellMessageChannel = {
            content: `Goodbye, ${member.user.tag}!`,
            embeds: [
                {
                    title: `${member.user.tag} Left!`,
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

        // Send the farewell message to the specified channel using the GOODBYE_CHANNEL_ID from .env
        const goodbyeChannelId = process.env.GOODBYE_CHANNEL_ID;
        if (!goodbyeChannelId) {
            log('GOODBYE_CHANNEL_ID not provided in the environment variables', 'error');
            return;
        }

        const goodbyeChannel = await bot.channels.fetch(goodbyeChannelId)
            .catch((error) => {
                log(`Error fetching goodbye channel (${goodbyeChannelId}): ${error.message}`, 'error');
                throw error;
            });

        if (goodbyeChannel && goodbyeChannel instanceof TextChannel) {
            await goodbyeChannel.send(farewellMessageChannel)
                .catch((error) => {
                    log(`Error sending farewell message to ${goodbyeChannel.name}: ${error.message}`, 'error');
                    throw error;
                });
            log(`Farewell message sent to ${goodbyeChannel.name} for ${member.user.tag}`, 'info');
        } else {
            log(`Goodbye channel (${goodbyeChannelId}) not found or not a TextChannel`, 'warn');
        }
    } catch (error) {
        log(`Error processing farewell message for ${member.user.tag}: ${error.message}`, 'error');
    }
}

module.exports = {
    sendFarewellMessage,
};
