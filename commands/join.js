const { SlashCommandBuilder } = require('discord.js');
const { 
    joinVoiceChannel, 
    VoiceConnectionStatus,
    createAudioPlayer,
    createAudioResource,
    AudioPlayerStatus,
    getVoiceConnection
    } = require('@discordjs/voice');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const VOICE_MAP = {
    'en': 'en-US-AriaNeural',
    'id': 'id-ID-ArdiNeural',
    'th': 'th-TH-NiwatNeural',
    'vi': 'vi-VN-HoaiMyNeural',
    'fil': 'fil-PH-BlessicaNeural',
    'zh': 'zh-CN-XiaoxiaoNeural',
    'ja': 'ja-JP-NanamiNeural',
    'ko': 'ko-KR-SunHiNeural',
};
module.exports = {
    data: new SlashCommandBuilder()
        .setName('join')
        .setDescription('Join your current voice channel'),

    async execute(interaction) {
        const voiceChannel = interaction.member.voice.channel;

        if (!voiceChannel) {
            return interaction.reply({ content: 'You need to be in a voice channel first!', flags: [1 << 6] });
        }
        const textChannel = interaction.channel;
        const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: voiceChannel.guild.id,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator,
            selfDeaf: false,
            selfMute: false,

        });
        const keepAlive = setInterval(() => {
            if (connection.state.status !== 'destroyed') {
                connection.receiver.speaking;
            } else {
                clearInterval(keepAlive);
            }
        }, 30000);

        // Save TTS session
        interaction.client.ttsListeners = interaction.client.ttsListeners || new Map();
        interaction.client.ttsListeners.set(interaction.guildId, {
            connection,
            textChannelId: textChannel.id,
            keepAlive,
        });
        console.log(`[🔊 TTS] Session saved - watching channel: ${textChannel.name} (${textChannel.id})`);


        connection.on(VoiceConnectionStatus.Ready, () => {
            console.log(`Joined voice channel: ${voiceChannel.name}`);
        });

        connection.on(VoiceConnectionStatus.Disconnected, () => {
            connection.destroy();
        });

        await interaction.reply({ content: `Joined **${voiceChannel.name}**!`, flags: [1 << 6] });
        console.log(`successfully executed join command`);
        console.log(`${interaction.client.user.tag} joined the voice channel`);
    }
};