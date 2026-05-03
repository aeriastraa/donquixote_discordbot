const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stoplisten')
        .setDescription('Stop listening and transcribing voice'),

    async execute(interaction) {
        const listeners = interaction.client.voiceListeners;

        if (!listeners || !listeners.has(interaction.guildId)) {
            return interaction.reply({ content: '❌ Not currently listening in this server.', ephemeral: true });
        }

        const { connection } = listeners.get(interaction.guildId);
        connection.destroy();
        listeners.delete(interaction.guildId);

        await interaction.reply('🛑 Stopped listening and transcribing.');
    }
};