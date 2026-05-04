# 🤖 Donquixote Discord Bot

A Discord bot with real-time **voice transcription** and **text-to-speech** powered by free APIs. Supports multiple Southeast Asian languages including Indonesian, Thai, Vietnamese, Filipino, and more.

---

## ✨ Features

- 🎙️ Real-time voice transcription using [Groq's free Whisper API](https://console.groq.com)
- 🔊 Text-to-speech in voice channels using [edge-tts](https://github.com/rany2/edge-tts) (free, no API key)
- 🌏 Multilingual TTS with male/female voice options per user
- 💬 Smart message merging — same user's speech appended to one message
- 🏓 Ping command to check bot latency
- ⚡ Near-zero CPU usage (transcription handled by Groq API)
- 🆓 Completely free to run

---

## 📋 Requirements

- [Node.js](https://nodejs.org/) v18 or higher
- [Git](https://git-scm.com/)
- [Python](https://www.python.org/) (for edge-tts)
- [ffmpeg](https://ffmpeg.org/) added to system PATH
- A [Discord Developer Account](https://discord.com/developers)
- A [Groq Account](https://console.groq.com) (free, no credit card)

---

## 🚀 Installation

### Step 1 — Clone the repository

```bash
git clone https://github.com/aeriastraa/donquixote_discordbot.git
cd donquixote_discordbot
```

### Step 2 — Install Node.js dependencies

```bash
npm install
```

### Step 3 — Install edge-tts (for TTS)

```bash
pip install edge-tts
```

Verify it works:
```bash
edge-tts --text "Hello" --write-media test.mp3
```

### Step 4 — Install ffmpeg

**Windows:**
1. Download from https://www.gyan.dev/ffmpeg/builds/ → `ffmpeg-release-essentials.zip`
2. Extract to `C:\ffmpeg`
3. Add `C:\ffmpeg\bin` to your system PATH:
   - Press `Win + S` → search "Environment Variables"
   - Under System variables → find **Path** → Edit → New → type `C:\ffmpeg\bin`
   - Click OK on all windows
4. Verify: `ffmpeg -version`

**Mac:**
```bash
brew install ffmpeg
```

**Linux:**
```bash
sudo apt install ffmpeg
```

---

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
4. Copy the generated URL and open it in your browser

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

# Groq (free Whisper API for transcription)
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
Ready! Logged in as Donquixote#1234
Commands deployed globally.
Bot status set to: online
```

### Run 24/7 with PM2 (optional)

```bash
npm install -g pm2
pm2 start index.js --name "donquixote-bot"
pm2 startup
pm2 save
```

Useful PM2 commands:
```bash
pm2 logs donquixote-bot      # View live logs
pm2 restart donquixote-bot   # Restart bot
pm2 stop donquixote-bot      # Stop bot
pm2 status                   # Check if running
```

---

## 🛠️ Commands

| Command | Description |
|---|---|
| `/ping` | Check the bot's latency |
| `/join` | Bot joins your voice channel and watches current text channel for TTS |
| `/leave` | Bot leaves the voice channel |
| `/listen` | Start transcribing voice in your channel |
| `/stoplisten` | Stop transcribing (bot stays in channel) |
| `/setvoice` | Set your personal TTS language and gender |

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
2. Type `/listen` in a text channel — bot starts listening
3. Speak clearly for 2+ seconds, then pause
4. Transcription appears in the text channel
5. Speaking again within 30 seconds appends to the same message
6. Type `/stoplisten` to stop (bot stays in channel)
7. Type `/leave` to make the bot leave

---

## 🔊 How Text-to-Speech Works

```
User types message in TTS channel
    → Bot reads message using edge-tts
    → Audio played in voice channel
```

1. Join a voice channel
2. Type `/join` in any text channel — bot joins your VC and watches **that** text channel
3. Type `/setvoice` to pick your language and gender (saved per user)
4. Type any message in that channel — bot speaks it out loud in your chosen voice
5. Type `/leave` to stop

---

## 🌏 Supported TTS Voices

| Language | Female | Male |
|---|---|---|
| 🇺🇸 English | ✅ | ✅ |
| 🇮🇩 Indonesian | ✅ | ✅ |
| 🇹🇭 Thai | ✅ | ✅ |
| 🇻🇳 Vietnamese | ✅ | ✅ |
| 🇵🇭 Filipino | ✅ | ✅ |
| 🇸🇬 Singapore English | ✅ | ✅ |
| 🇨🇳 Chinese | ✅ | ✅ |
| 🇯🇵 Japanese | ✅ | ✅ |
| 🇰🇷 Korean | ✅ | ✅ |
| 🇲🇾 Malay | ✅ | ✅ |

> 💡 Each user sets their own voice with `/setvoice` — it's saved per user independently.

---

## 📁 Project Structure

```
donquixote_discordbot/
├── commands/
│   ├── ping.js           # Ping command
│   ├── join.js           # Join VC + start TTS session
│   ├── leave.js          # Leave voice channel
│   ├── listen.js         # Start voice transcription
│   ├── stoplisten.js     # Stop voice transcription
│   └── setvoice.js       # Set personal TTS voice
├── utils/
│   ├── transcribe.js     # Groq Whisper API integration
│   └── voices.js         # Shared voice map for TTS
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
| `@discordjs/opus` | Opus audio decoding |
| `prism-media` | Audio stream processing |
| `groq-sdk` | Groq Whisper API for transcription |
| `dotenv` | Environment variable loader |
| `nodemon` | Auto-restart on file changes (dev) |
| `edge-tts` (Python) | Free Microsoft TTS engine |

---

## 🔧 Troubleshooting

| Problem | Fix |
|---|---|
| `@discordjs/opus` install fails | Run `npm install opusscript` instead |
| Bot doesn't join voice channel | Check bot has Connect & Speak permissions |
| No transcription appearing | Make sure `GROQ_API_KEY` is set in `.env` |
| `ffmpeg not found` error | Make sure ffmpeg is added to system PATH |
| Bot joins but doesn't hear audio | `selfDeaf` must be `false` in `listen.js` |
| TTS not speaking | Make sure you typed in the same channel where `/join` was used |
| `/setvoice` not working | Restart bot after deploying new commands |
| Bot leaves after 2-5 mins | Keepalive is in `join.js` — make sure you're using latest version |
| Groq rate limit hit | Free tier: 28,800 sec/day (~8 hours) |
| `edge-tts` not found | Run `pip install edge-tts` and verify with `edge-tts --list-voices` |

---

## 🌐 Groq Free Tier Limits

| Limit | Amount |
|---|---|
| Audio per day | 28,800 seconds (~8 hours) |
| Requests per minute | 20 |
| Cost | $0 (completely free) |

> If you exceed the daily limit, the bot will log a Groq error and skip transcription until the limit resets at midnight UTC.

---

## 📝 License

MIT — feel free to use and modify.

---

## 🙏 Credits

- [Groq](https://groq.com) — free, ultra-fast Whisper API
- [edge-tts](https://github.com/rany2/edge-tts) — free Microsoft TTS
- [OpenAI Whisper](https://github.com/openai/whisper) — underlying ASR model
- [discord.js](https://discord.js.org) — Discord API library
