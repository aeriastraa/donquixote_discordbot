const { SlashCommandBuilder } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('leave')
        .setDescription('Leave the current voice channel'),

    async execute(interaction) {
        const connection = getVoiceConnection(interaction.guild.id);

        if (!connection) {
            return interaction.reply({ content: "I'm not in a voice channel!", flags: [1 << 6] });
        }
        const listeners = interaction.client.voiceListeners;
        if (listeners && listeners.has(interaction.guildId)) {
            const { keepAlive } = listeners.get(interaction.guildId);
            if (keepAlive) clearInterval(keepAlive);
            listeners.delete(interaction.guildId);
        }

        connection.destroy();
        await interaction.reply({ content: 'Left the voice channel!', flags: [1 << 6] });
        console.log(`${interaction.client.user.tag} left the voice channel`);
    }
};