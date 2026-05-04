# 🤖 My Discord Bot

A Discord bot with real-time **voice transcription** powered by [Groq's free Whisper API](https://console.groq.com). Supports **multiple languages** including Indonesian, Thai, Vietnamese, Tagalog, and more.

---

## ✨ Features

- 🎙️ Real-time voice transcription in voice channels
- 🌏 Multilingual support (auto-detects language)
- 💬 Smart message merging — same user's speech appended to one message
- 🏓 Ping command to check bot latency
- ⚡ Low CPU usage (transcription handled by Groq API)
- 🆓 Completely free to run

---

## 📋 Requirements

Before you start, make sure you have these installed:

- [Node.js](https://nodejs.org/) v18 or higher
- [Git](https://git-scm.com/)
- [ffmpeg](https://ffmpeg.org/) added to system PATH
- A [Discord Developer Account](https://discord.com/developers)
- A [Groq Account](https://console.groq.com) (free, no credit card)

---

## 🚀 Installation

### Step 1 — Clone the repository

```bash
git clone https://github.com/yourusername/your-repo-name.git
cd your-repo-name
```

### Step 2 — Install Node.js dependencies

```bash
npm install
```

### Step 3 — Install ffmpeg

**Windows:**
1. Download from https://www.gyan.dev/ffmpeg/builds/ → `ffmpeg-release-essentials.zip`
2. Extract to `C:\ffmpeg`
3. Add `C:\ffmpeg\bin` to your system PATH:
   - Press `Win + S` → search "Environment Variables"
   - Click "Edit the system environment variables"
   - Under System variables → find **Path** → Edit → New → type `C:\ffmpeg\bin`
   - Click OK on all windows
4. Verify: open a new terminal and run `ffmpeg -version`

## 🔑 Getting Your API Keys

### Discord Bot Token & Client ID

1. Go to https://discord.com/developers/applications
2. Click **New Application** → give it a name
3. Go to **Bot** tab → click **Reset Token** → copy the token
4. Go to **OAuth2** tab → copy the **Client ID**
5. Under **Bot** tab, enable these **Privileged Gateway Intents**:
   - ✅ Server Members Intent
   - ✅ Message Content Intent

### Invite the Bot to Your Server

1. Go to **OAuth2 → URL Generator**
2. Check **bot** and **applications.commands**
3. Under Bot Permissions, check:
   - ✅ Send Messages
   - ✅ Connect
   - ✅ Speak
   - ✅ Use Voice Activity
4. Copy the generated URL and open it in your browser to invite the bot

### Groq API Key (Free)

1. Go to https://console.groq.com
2. Sign up for free (no credit card needed)
3. Go to **API Keys → Create API Key**
4. Copy the key

---

## ⚙️ Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Fill in your `.env` file:

```env
# Discord
BOT_TOKEN=your_discord_bot_token_here
CLIENT_ID=your_discord_client_id_here

# Groq (free Whisper API)
GROQ_API_KEY=your_groq_api_key_here

# Bot presence
ACTIVITY_NAME=Spotify
ACTIVITY_TYPE=LISTENING
ACTIVITY_STATUS=online
```

**ACTIVITY_TYPE** options: `PLAYING`, `WATCHING`, `LISTENING`, `STREAMING`, `COMPETING`

**ACTIVITY_STATUS** options: `online`, `idle`, `dnd`, `invisible`

---

## ▶️ Running the Bot

```bash
npm start
```

You should see:
```
Ready! Logged in as YourBot#1234
Commands deployed globally.
Bot status set to: online
```

### Run 24/7 with PM2 (optional)

```bash
# Install PM2
npm install -g pm2

# Start bot
pm2 start index.js --name "my-discord-bot"

# Auto-restart on reboot
pm2 startup
pm2 save
```

Useful PM2 commands:
```bash
pm2 logs my-discord-bot      # View live logs
pm2 restart my-discord-bot   # Restart bot
pm2 stop my-discord-bot      # Stop bot
pm2 status                   # Check status
```

---

## 🛠️ Commands

| Command | Description |
|---|---|
| `/ping` | Check the bot's latency |
| `/join` | Bot joins your current voice channel |
| `/leave` | Bot leaves the voice channel |
| `/listen` | Start transcribing voice in your channel |
| `/stoplisten` | Stop transcribing (bot stays in channel) |

---

## 🎙️ How Voice Transcription Works

```
User speaks in VC
    → Discord streams Opus audio
    → Bot decodes to PCM
    → ffmpeg converts to WAV
    → Sent to Groq Whisper API
    → Transcribed text posted to Discord channel
```

1. Join a voice channel
2. Type `/listen` — bot joins and starts listening
3. Speak clearly for 2+ seconds, then pause
4. Transcription appears in the text channel
5. If you speak again within 30 seconds, text is **appended** to the same message
6. Type `/stoplisten` to stop transcribing (bot stays in channel)
7. Type `/leave` to make the bot leave the channel

### Supported Languages

| Language | Country |
|---|---|
| Indonesian | 🇮🇩 Indonesia |
| Thai | 🇹🇭 Thailand |
| English | 🇸🇬 Singapore |
| Filipino / Tagalog | 🇵🇭 Philippines |
| Vietnamese | 🇻🇳 Vietnam |
| + 95 other languages | 🌐 Auto-detected |

> 💡 **Tips for best accuracy:**
> - Speak clearly and at a normal pace
> - Speak full sentences rather than single words
> - Use a decent microphone
> - Speak for at least 2–3 seconds before pausing

---

## 📁 Project Structure

```
your-bot/
├── commands/
│   ├── ping.js           # Ping command
│   ├── join.js           # Join voice channel
│   ├── leave.js          # Leave voice channel
│   ├── listen.js         # Start voice transcription
│   └── stoplisten.js     # Stop voice transcription
├── utils/
│   └── transcribe.js     # Groq Whisper API integration
├── tmp/                  # Temporary audio files (auto-created, git-ignored)
├── index.js              # Main bot file
├── .env                  # Your secrets (git-ignored)
├── .env.example          # Template for .env
└── README.md
```

---

## 📦 Dependencies

| Package | Purpose |
|---|---|
| `discord.js` | Discord API |
| `@discordjs/voice` | Voice channel support |
| `@discordjs/opus` / `opusscript` | Opus audio decoding |
| `prism-media` | Audio stream processing |
| `groq-sdk` | Groq Whisper API client |

---

## 🔧 Troubleshooting

| Problem | Fix |
|---|---|
| `@discordjs/opus` install fails | Run `npm install opusscript` instead |
| Bot doesn't join voice channel | Check bot has Connect & Speak permissions |
| No transcription appearing | Make sure `GROQ_API_KEY` is set in `.env` |
| `ffmpeg not found` error | Make sure ffmpeg is added to system PATH |
| Bot joins but doesn't hear audio | `selfDeaf` must be `false` in `listen.js` |
| `[🔇 Silence] Skipped` every time | Speak louder or check your microphone |
| Bot leaves on `/stoplisten` | Use the latest `stoplisten.js` from this repo |
| Groq rate limit hit | Free tier allows 28,800 sec/day (~8 hours) |

---

## 🌐 Groq Free Tier Limits

| Limit | Amount |
|---|---|
| Audio per day | 28,800 seconds (~8 hours) |
| Requests per minute | 20 |
| Cost | $0 (completely free) |

> If you exceed the daily limit, the bot will log a Groq error and skip transcription until the limit resets (midnight UTC).

---

## 📝 License

MIT — feel free to use and modify.

---

## 🙏 Credits

- [Groq](https://groq.com) — free, ultra-fast Whisper API
- [OpenAI Whisper](https://github.com/openai/whisper) — the underlying ASR model
- [discord.js](https://discord.js.org) — Discord API library