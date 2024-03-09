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
bot.login(process.env.BOT_TOKEN);

/**
 * Sends a farewell message to a user in DM and a specific channel when they leave the server.
 * @param {GuildMember} member - The GuildMember object representing the user who left.
 */
async function sendFarewellMessage(member) {
    try {
        // Construct the farewell message for DM
        const farewellMessageDM = {
            content: `**Goodbye, ${member.user.tag}!**\nWe're sorry to see you leave.`,
            embeds: [
                {
                    title: `Goodbye, ${member.user.tag}!`,
                    description: "We're sorry to see you leave.",
                    color: 0x951931, 
                    footer: {
                        text: 'EraNodes',
                        icon_url: 'https://github.com/Eranodes/.github/blob/main/icons/eranodes-transparent.png?raw=true',
                    },
                },
            ],
        };

        // Send the farewell message in DM
        await member.send(farewellMessageDM);

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
        const goodbyeChannel = await bot.channels.fetch(goodbyeChannelId);
        if (goodbyeChannel && goodbyeChannel instanceof TextChannel) {
            await goodbyeChannel.send(farewellMessageChannel);
        }
    } catch (error) {
        console.error(`Error sending farewell message to ${member.user.tag}: ${error.message}`);
    }
}

module.exports = {
    sendFarewellMessage,
};
