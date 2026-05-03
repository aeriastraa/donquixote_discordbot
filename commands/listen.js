const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel, EndBehaviorType } = require('@discordjs/voice');
const { createWriteStream } = require('fs');
const prism = require('prism-media');
const path = require('path');
const fs = require('fs');
const { transcribeAudio } = require('../utils/transcribe');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('listen')
        .setDescription('Start listening and transcribing voice in your channel'),

    async execute(interaction) {
        const voiceChannel = interaction.member.voice.channel;

        if (!voiceChannel) {
            return interaction.reply({ content: '❌ You need to be in a voice channel first!', ephemeral: true });
        }

        const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: interaction.guildId,
            adapterCreator: interaction.guild.voiceAdapterCreator,
            selfDeaf: false,
            selfMute: true,
        });

        await interaction.reply(`🎙️ Now listening in **${voiceChannel.name}**. Transcriptions will appear here.`);

        const receiver = connection.receiver;
        const activeSpeakers = new Set();

        receiver.speaking.on('start', async (userId) => {
            // Skip if already recording this user
            if (activeSpeakers.has(userId)) return;
            activeSpeakers.add(userId);

            const user = await interaction.client.users.fetch(userId);
            console.log(`${user.tag} started speaking`);

            const audioStream = receiver.subscribe(userId, {
                end: {
                    behavior: EndBehaviorType.AfterSilence,
                    duration: 1500,
                },
            });

            const tmpDir = path.join(__dirname, '../tmp');
            fs.mkdirSync(tmpDir, { recursive: true });
            const outputPath = path.join(tmpDir, `${userId}-${Date.now()}.pcm`);
            const writeStream = createWriteStream(outputPath);

            const opusDecoder = new prism.opus.Decoder({
                frameSize: 960,
                channels: 2,
                rate: 48000,
            });

            // Handle errors on each stream to prevent crash
            audioStream.on('error', (e) => console.log('Audio stream error:', e.code));
            opusDecoder.on('error', (e) => console.log('Opus decoder error:', e.code));
            writeStream.on('error', (e) => console.log('Write stream error:', e.code));

            // Pipe manually instead of using pipeline()
            audioStream.pipe(opusDecoder).pipe(writeStream);

            // When audio ends, transcribe
            writeStream.on('finish', async () => {
                activeSpeakers.delete(userId);

                try {
                    const transcript = await transcribeAudio(outputPath, userId);
                    if (transcript && transcript.trim()) {
                        await interaction.channel.send(`🗣️ **${user.displayName}**: ${transcript}`);
                    }
                } catch (e) {
                    console.error('Transcription error:', e.message);
                }
            });

            // When audio stream closes, end the write stream gracefully
            audioStream.on('close', () => {
                opusDecoder.end();
            });

            opusDecoder.on('end', () => {
                writeStream.end();
            });
        });

        // Save connection for /stoplisten
        interaction.client.voiceListeners = interaction.client.voiceListeners || new Map();
        interaction.client.voiceListeners.set(interaction.guildId, {
            connection,
            channelId: interaction.channelId
        });
    }
};