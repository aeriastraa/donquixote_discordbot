const { SlashCommandBuilder } = require('discord.js');
const { VOICE_MAP, VOICE_CHOICES } = require('../utils/voices');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setvoice')
        .setDescription('Set your TTS language and voice')
        .addStringOption(option =>
            option.setName('voice')
                .setDescription('Choose your language and gender')
                .setRequired(true)
                .addChoices(...VOICE_CHOICES)),

    async execute(interaction) {
        const key = interaction.options.getString('voice');
        const selected = VOICE_MAP[key];

        interaction.client.userVoices = interaction.client.userVoices || new Map();
        interaction.client.userVoices.set(interaction.user.id, {
            key,
            voice: selected.voice,
            name: selected.name,
        });

        await interaction.reply({
            content: `✅ Your TTS voice is now set to **${selected.name}**!`,
            ephemeral: true
        });

        console.log(`[🔊 SetVoice] ${interaction.user.displayName} → ${selected.name}`);
    }
};