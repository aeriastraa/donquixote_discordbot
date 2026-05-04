const fs = require('fs');
const { execSync } = require('child_process');
const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const JUNK_PATTERNS = /^\[.*\]$|^\(.*\)$|^$|^\s*$/i;

async function transcribeAudio(pcmPath, userId) {
    const wavPath = pcmPath.replace('.pcm', '.wav');

    try {
        if (!fs.existsSync(pcmPath)) return null;

        const pcmSize = fs.statSync(pcmPath).size;
        if (pcmSize < 3000) return null;

        // Convert PCM → WAV
        execSync(
            `ffmpeg -y -f s16le -ar 48000 -ac 2 -i "${pcmPath}" "${wavPath}" -loglevel quiet`,
            { stdio: 'ignore' }
        );

        if (!fs.existsSync(wavPath)) return null;

        const wavSize = fs.statSync(wavPath).size;
        if (wavSize < 5000) {
            console.log(`[🔇 Silence] Skipped`);
            return null;
        }

        // Send to Groq Whisper API
        const transcription = await groq.audio.transcriptions.create({
            file: fs.createReadStream(wavPath),
            model: 'whisper-large-v3-turbo',
        });

        const text = transcription.text?.trim();
        if (!text) return null;

        // Filter junk
        if (JUNK_PATTERNS.test(text)) {
            console.log(`[🔇 Filtered] "${text}"`);
            return null;
        }

        console.log(`[✅ Transcript] "${text}"`);
        return text;

    } catch (e) {
        console.error('[❌ Groq Error]', e.message);
        return null;
    } finally {
        if (fs.existsSync(wavPath)) fs.unlink(wavPath, () => {});
        if (fs.existsSync(pcmPath)) fs.unlink(pcmPath, () => {});
    }
}

module.exports = { transcribeAudio };