// utilities/user-leave.js

/**
 * Sends a farewell message to a user in DM when they leave the server.
 * @param {GuildMember} member - The GuildMember object representing the user who left.
 */
async function sendFarewellMessage(member) {
    try {
        const farewellMessage = {
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
        await member.send(farewellMessage);
    } catch (error) {
        console.error(`Error sending farewell message to ${member.user.tag}: ${error.message}`);
    }
}

module.exports = {
    sendFarewellMessage,
};
