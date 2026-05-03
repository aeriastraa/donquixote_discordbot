const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel, VoiceConnectionStatus } = require('@discordjs/voice');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('join')
        .setDescription('Join your current voice channel'),

    async execute(interaction) {
        const voiceChannel = interaction.member?.voice.channel;

        if (!voiceChannel) {
            return interaction.reply({ content: 'You need to be in a voice channel first!', flags: [1 << 6] });
        }

        const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: voiceChannel.guild.id,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator,
        });

        connection.on(VoiceConnectionStatus.Ready, () => {
            console.log(`Joined voice channel: ${voiceChannel.name}`);
        });

        connection.on(VoiceConnectionStatus.Disconnected, () => {
            connection.destroy();
        });

        await interaction.reply({ content: `Joined **${voiceChannel.name}**!`, flags: [1 << 6] });
        console.log(`successfully executed join command`);
    }
};