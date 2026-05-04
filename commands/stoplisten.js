const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stoplisten')
        .setDescription('Stop listening and transcribing without leaving the channel'),

    async execute(interaction) {
        const listeners = interaction.client.voiceListeners;

        if (!listeners || !listeners.has(interaction.guildId)) {
            return interaction.reply({ content: '❌ Not currently listening in this server.', ephemeral: true });
        }

        const { connection } = listeners.get(interaction.guildId);

        // Stop receiving audio without leaving the channel
        const receiver = connection.receiver;
        receiver.speaking.removeAllListeners();

        listeners.delete(interaction.guildId);

        await interaction.reply('Stopped listen.');
    }
};