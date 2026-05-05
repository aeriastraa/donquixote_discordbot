const { SlashCommandBuilder } = require('discord.js');
const { 
    joinVoiceChannel, 
    createAudioPlayer, 
    createAudioResource, 
    AudioPlayerStatus,
    getVoiceConnection
} = require('@discordjs/voice');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const { DEFAULT_VOICE } = require('../utils/voices');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tts')
        .setDescription('Speak text in the voice channel')
        .addStringOption(option =>
            option.setName('text')
                .setDescription('Text to speak')
                .setRequired(true)),

    async execute(interaction) {
        const text = interaction.options.getString('text');

        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel) {
            return interaction.reply({ 
                content: '❌ You need to be in a voice channel!', 
                ephemeral: true 
            });
        }

        await interaction.deferReply({ ephemeral: true });

        const tmpDir = path.join(__dirname, '../tmp');
        fs.mkdirSync(tmpDir, { recursive: true });
        const outputPath = path.join(tmpDir, `tts-${Date.now()}.mp3`);

        try {
            // Get user's saved voice from /setvoice, fallback to default
            const userVoices = interaction.client.userVoices || new Map();
            const userVoice = userVoices.get(interaction.user.id);
            const voice = userVoice?.voice || DEFAULT_VOICE;
            const name = userVoice?.name || '🇺🇸 English (Female)';

            console.log(`[🔊 TTS] ${interaction.user.username} (${name}): "${text}"`);

            execSync(
                `edge-tts --voice "${voice}" --text "${text}" --write-media "${outputPath}"`,
                { timeout: 15000 }
            );

            if (!fs.existsSync(outputPath)) {
                throw new Error('TTS file was not generated');
            }

            // Get existing connection or join
            let connection = getVoiceConnection(interaction.guildId);
            if (!connection) {
                connection = joinVoiceChannel({
                    channelId: voiceChannel.id,
                    guildId: interaction.guildId,
                    adapterCreator: interaction.guild.voiceAdapterCreator,
                    selfDeaf: false,
                    selfMute: false,
                });
            }

            const player = createAudioPlayer();
            const resource = createAudioResource(outputPath);
            connection.subscribe(player);
            player.play(resource);

            console.log(`[🔊 TTS] Playing in ${voiceChannel.name}`);

            player.on(AudioPlayerStatus.Idle, () => {
                fs.unlink(outputPath, () => {});
                console.log(`[🔊 TTS] Finished playing`);
            });

            player.on('error', (e) => {
                console.error('[❌ TTS Player Error]', e.message);
                fs.unlink(outputPath, () => {});
            });

            await interaction.editReply({ 
                content: `Speaking as **${name}**: "${text}"` 
            });

        } catch (e) {
            console.error('[❌ TTS Error]', e.message);
            if (fs.existsSync(outputPath)) fs.unlink(outputPath, () => {});
            await interaction.editReply({ 
                content: '❌ Failed to generate TTS. Make sure `edge-tts` is installed.' 
            });
        }
    }
};