require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');
const {
    createAudioPlayer,
    createAudioResource,
    AudioPlayerStatus,
    joinVoiceChannel
} = require('@discordjs/voice');
const { execSync } = require('child_process');
const { VOICE_MAP, DEFAULT_VOICE } = require('./utils/voices');
const deployCommands = async () => {
    try {
        const commands = [];

        const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const command = require(`./commands/${file}`);
            if ('data' in command && 'execute' in command) {
                commands.push(command.data.toJSON());
            } else {
                console.log(`WARNING: The command at ${file} is missing a required 'data' or 'execute' property.`);
            }
        }
    

    const rest = new REST().setToken(process.env.BOT_TOKEN);

    console.log(`Started refreshing application slash commands globally.`);

    const data = await rest.put(
        Routes.applicationCommands(process.env.CLIENT_ID),
        { body: commands },
    );

    console.log('Successfully reloaded all commands!');
    } catch (error) {
        console.error('Error deploying commands:', error)
    }
}

const { 
    Client, 
    GatewayIntentBits, 
    Partials, 
    Collection,
    ActivityType,
    PresenceUpdateStatus,
    Events
} = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates,
    ],
    partials: [
        Partials.Channel,
        Partials.Message,
        Partials.User,
        Partials.GuildMember
    ]
});

client.commands = new Collection();



const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    } else {
        console.log(`The Command ${filePath} is missing a required "data" or "execute" property.`)
    }
}

client.once(Events.ClientReady, async () => {
    console.log(`Ready! Logged in as ${client.user.tag}`);

    //Deploy Commands
    await deployCommands();
    console.log(`Commands deployed globally.`);

    const statusType = process.env.ACTIVITY_STATUS || 'online';
    const activityType = process.env.ACTIVITY_TYPE || 'PLAYING';
    const activityName = process.env.ACTIVITY_NAME || 'Spotify';

    // Debug: Show injected environment variables
    console.log('Environment variables:');
    console.log('ACTIVITY_NAME:', process.env.ACTIVITY_NAME);
    console.log('ACTIVITY_TYPE:', process.env.ACTIVITY_TYPE);
    console.log('ACTIVITY_STATUS:', process.env.ACTIVITY_STATUS);
    console.log('BOT_TOKEN:', process.env.BOT_TOKEN ? 'SET' : 'NOT SET');
    console.log('CLIENT_ID:', process.env.CLIENT_ID || 'NOT SET');

    const activityTypeMap = {
        'PLAYING': ActivityType.Playing,
        'WATCHING': ActivityType.Watching,
        'LISTENING': ActivityType.Listening,
        'STREAMING': ActivityType.Streaming,
        'COMPETING': ActivityType.Competing,
    };

    const statusMap = {
        'online': PresenceUpdateStatus.Online,
        'idle': PresenceUpdateStatus.Idle,
        'dnd': PresenceUpdateStatus.DoNotDisturb,
        'invisible': PresenceUpdateStatus.Invisible
    };

    client.user.setPresence({
        status: statusMap[statusType],
        activities: [{
            name: activityName,
            type: activityTypeMap[activityType]
        }]
    });
    
    console.log(`Bot status set to: ${statusType}`);
    console.log(`Activity set to: ${activityType} ${activityName}`)
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) {
        // console.error(`No command matching ${interaction.commandName} was found.`)
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true});
        } else {
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true});
        }
    }
});


client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) return;

    const ttsListeners = client.ttsListeners;
    if (!ttsListeners || !ttsListeners.has(message.guildId)) return;

    const session = ttsListeners.get(message.guildId);
    if (message.channelId !== session.textChannelId) return;

    const text = message.content.trim();
    if (!text) return;

    const tmpDir = path.join(__dirname, 'tmp');
    fs.mkdirSync(tmpDir, { recursive: true });
    const outputPath = path.join(tmpDir, `tts-${Date.now()}.mp3`);

    try {
        // Get user's saved voice from utils/voices.js
        const userVoices = client.userVoices || new Map();
        const userVoice = userVoices.get(message.author.id);
        const voice = userVoice?.voice || DEFAULT_VOICE;
        const name = userVoice?.name || '🇺🇸 English (Female)';

        console.log(`[🔊 TTS] ${message.member.displayName} (${name}): "${text}"`);

        execSync(
            `edge-tts --voice "${voice}" --text "${text}" --write-media "${outputPath}"`,
            { timeout: 15000 }
        );

        if (!fs.existsSync(outputPath)) throw new Error('TTS file not created');

        const player = createAudioPlayer();
        const resource = createAudioResource(outputPath);
        session.connection.subscribe(player);
        player.play(resource);
        
        player.on(AudioPlayerStatus.Idle, () => {
            fs.unlink(outputPath, () => {});
        });

        player.on('error', (e) => {
            console.error('[❌ TTS Player]', e.message);
            fs.unlink(outputPath, () => {});
        });

    } catch (e) {
        console.error('[❌ TTS Error]', e.message);
        if (fs.existsSync(outputPath)) fs.unlink(outputPath, () => {});
    }
});

client.login(process.env.BOT_TOKEN);