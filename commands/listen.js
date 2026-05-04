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

        // Fix: save channel reference immediately
        const textChannel = interaction.channel;

        const receiver = connection.receiver;
        const activeSpeakers = new Set();
        const userMessageBuffer = new Map();
        const MERGE_WINDOW_MS = 30000;

        receiver.speaking.on('start', async (userId) => {
            if (activeSpeakers.has(userId)) return;
            activeSpeakers.add(userId);

            const user = await interaction.client.users.fetch(userId);
            console.log(`[🎙️] ${user.displayName} started speaking`);

            const audioStream = receiver.subscribe(userId, {
                end: {
                    behavior: EndBehaviorType.AfterSilence,
                    duration: 3000,
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

            audioStream.on('error', (e) => console.log('Audio stream error:', e.code));
            opusDecoder.on('error', (e) => console.log('Opus decoder error:', e.code));
            writeStream.on('error', (e) => console.log('Write stream error:', e.code));

            audioStream.pipe(opusDecoder).pipe(writeStream);
            audioStream.on('close', () => opusDecoder.end());
            opusDecoder.on('end', () => writeStream.end());

            writeStream.on('finish', async () => {
                activeSpeakers.delete(userId);

                try {
                    const text = await transcribeAudio(outputPath, userId);
                    if (!text || !text.trim()) return;

                    const buffer = userMessageBuffer.get(userId);

                    if (buffer) {
                        // Same user spoke again — append to existing message
                        clearTimeout(buffer.timer);

                        const existingMsg = await textChannel.messages.fetch(buffer.messageId);
                        const newContent = `🗣️ **${user.displayName}**: ${buffer.text} ${text}`;
                        await existingMsg.edit(newContent);
                        console.log(`[✏️ Edited] ${user.displayName}: ${text}`);

                        buffer.text = `${buffer.text} ${text}`;
                        buffer.timer = setTimeout(() => {
                            userMessageBuffer.delete(userId);
                        }, MERGE_WINDOW_MS);

                    } else {
                        // New message for this user
                        const sent = await textChannel.send(
                            `🗣️ **${user.displayName}**: ${text}`
                        );
                        console.log(`[💬 Sent] ${user.displayName}: ${text}`);

                        const timer = setTimeout(() => {
                            userMessageBuffer.delete(userId);
                        }, MERGE_WINDOW_MS);

                        userMessageBuffer.set(userId, {
                            messageId: sent.id,
                            text: text,
                            timer,
                        });
                    }

                } catch (e) {
                    console.error('[❌ Error]', e.message);
                }
            });
        });

        interaction.client.voiceListeners = interaction.client.voiceListeners || new Map();
        interaction.client.voiceListeners.set(interaction.guildId, {
            connection,
            channelId: interaction.channelId
        });
    }
};