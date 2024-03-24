require('dotenv').config(); // Load environment variables from .env file
const { SlashCommandBuilder } = require('@discordjs/builders');

function getUptimeString(uptimeInMilliseconds) {
    let uptimeInSeconds = uptimeInMilliseconds / 1000;

    if (uptimeInSeconds === 0) {
        return '0 seconds';
    } else {
        const years = Math.floor(uptimeInSeconds / (60 * 60 * 24 * 365));
        uptimeInSeconds -= years * (60 * 60 * 24 * 365);
    
        const months = Math.floor(uptimeInSeconds / (60 * 60 * 24 * 30.4375));
        uptimeInSeconds -= months * (60 * 60 * 24 * 30.4375);
    
        const days = Math.floor(uptimeInSeconds / (60 * 60 * 24));
        uptimeInSeconds -= days * (60 * 60 * 24);
    
        const hours = Math.floor(uptimeInSeconds / (60 * 60));
        uptimeInSeconds -= hours * (60 * 60);
    
        const minutes = Math.floor(uptimeInSeconds / 60);
        uptimeInSeconds -= minutes * 60;
    
        const seconds = Math.floor(uptimeInSeconds);
    
        let uptimeString = '';
        if (years > 0) uptimeString += `${years} years `;
        if (months > 0) uptimeString += `${months} months `;
        if (days > 0) uptimeString += `${days} days `;
        if (hours > 0) uptimeString += `${hours} hours `;
        if (minutes > 0) uptimeString += `${minutes} minutes `;
        if (seconds > 0) uptimeString += `${seconds} seconds`;
    
        return uptimeString.trim();
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverstats')
        .setDescription('Get information about a server')
        .addStringOption(option =>
            option.setName('serverid')
                .setDescription('Server ID')
                .setRequired(true)),

    async execute(interaction) {
        const serverId = interaction.options.getString('serverid');
        const apiKey = process.env.PTERODACTYL_API_KEY;
        const panelUrl = process.env.PTERODACTYL_PANEL_URL;

        try {
            const fetch = await import('node-fetch');
            const response = await fetch.default(`${panelUrl}/api/client/servers/${serverId}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                }
            });
            const responseResources = await fetch.default(`${panelUrl}/api/client/servers/${serverId}/resources`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                }
            });

            if (!response.ok && !responseResources.ok) {
                throw new Error('Failed to fetch server info');
            }
            const serverData = await response.json();
            const resouceData = await responseResources.json();

            const id = serverData.attributes.internal_id

            const idResponse = await fetch.default(`${panelUrl}/api/application/servers/${id}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                }
            });  

            if (!idResponse.ok) {
                throw new Error('Failed to fetch server details');
            }
            
            const idResponseData = await idResponse.json();

            const nest = idResponseData.attributes.nest;
            const egg = idResponseData.attributes.egg;
            
            const eggResponse = await fetch.default(`${panelUrl}/api/application/nests/${nest}/eggs/${egg}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                }
            });  
            
            const nestResponse = await fetch.default(`${panelUrl}/api/application/nests/${nest}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                }
            });  

            if (!eggResponse.ok || !nestResponse.ok) {
                throw new Error('Failed to fetch server details');
            }
            
            const eggData = await eggResponse.json();
            const nestData = await nestResponse.json();

            const totalRAM = serverData.attributes.limits.memory; 
            const usedRAM = resouceData.attributes.resources.memory_bytes / (1024 * 1024); 
            
            // Total CPU (percentage)
            const totalCPU = serverData.attributes.limits.cpu;
            
            // Used CPU (percentage)
            const usedCPU = resouceData.attributes.resources.cpu_absolute;
            
            // Calculate RAM and CPU usage ratios
            const ramUsageRatio = (usedRAM / totalRAM) * 100;
            const cpuUsageRatio = (usedCPU / totalCPU) * 100;

            const embed = {
                title: "Server Info for `" + serverData.attributes.name + "`",
                url: `${panelUrl}/server/${serverId}`,
                description: serverData.attributes.description,
                thumbnail: {
                    url: process.env.LOGO_URL,
                },       
                fields: [
                    { name: 'Node', value: serverData.attributes.node, inline: true },
                    { name: 'Status', value: resouceData.attributes.current_state, inline: true },
                    { name: 'Suspended', value: resouceData.attributes.is_suspended, inline: true },
                    { name: 'Uptime', value: getUptimeString(resouceData.attributes.resources.uptime), inline: true },
                    { name: '\u200B', value: '', inline: false }, 

                    { name: 'RAM Usage', value: `${usedRAM.toFixed(2)}MB / ${totalRAM}MB (${ramUsageRatio.toFixed(2)}%)`, inline: true },
                    { name: 'CPU Usage', value: `${usedCPU.toFixed(2)}% / ${totalCPU}% (${cpuUsageRatio.toFixed(2)}%)`, inline: true },

                    { name: '\u200B', value: '', inline: false }, 
                    { name: 'Nest', value: nestData.attributes.name, inline: true },
                    { name: 'Egg', value: eggData.attributes.name, inline: true },
                    
                    { name: '\u200B', value: '', inline: false }, 
                
                ],
                color: 0x951931,
                timestamp: new Date().toISOString(),
            };
            
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error fetching server info:', error);
            await interaction.reply({ content: 'Failed to fetch server info. Please check your server ID.', ephemeral: true });
        }
    },
};