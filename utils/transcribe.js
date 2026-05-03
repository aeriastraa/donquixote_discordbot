const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const WHISPER_EXE = process.env.WHISPER_EXE || 'D:\\DiscordBot_projects\\Donquixote\\whisper.cpp\\build\\bin\\Release\\whisper-cli.exe';
const WHISPER_MODEL = process.env.WHISPER_MODEL || 'D:\\DiscordBot_projects\\Donquixote\\whisper.cpp\\models\\ggml-base.en.bin';

async function transcribeAudio(pcmPath, userId) {
    const wavPath = pcmPath.replace('.pcm', '.wav');

    try {
        if (!fs.existsSync(pcmPath)) return null;

        const pcmSize = fs.statSync(pcmPath).size;

        // Convert PCM → WAV, suppress ffmpeg output
        execSync(
            `ffmpeg -y -f s16le -ar 48000 -ac 2 -i "${pcmPath}" "${wavPath}" -loglevel quiet`,
            { stdio: 'ignore' }
        );

        if (!fs.existsSync(wavPath)) return null;

        const wavSize = fs.statSync(wavPath).size;
        if (wavSize < 5000) {
            console.log(`[🔇 Silence] Skipped (too small)`);
            return null;
        }

        // Run whisper, redirect stderr to suppress internal logs
        const result = execSync(
            `"${WHISPER_EXE}" -m "${WHISPER_MODEL}" -f "${wavPath}" --no-timestamps -nt 2>nul`,
            { encoding: 'utf8', timeout: 30000 }
        );

        const text = result.trim();

        // Filter junk results
        const junkPatterns = /^\[.*\]$|^\(.*\)$|^$|^\s*$/i;
        if (junkPatterns.test(text)) {
            console.log(`[🔇 Filtered] "${text}"`);
            return null;
        }

        console.log(`[✅ Transcript] "${text}"`);
        return text;

    } catch (e) {
        console.error('[❌ Transcribe Error]', e.message);
        return null;
    } finally {
        if (fs.existsSync(wavPath)) fs.unlink(wavPath, () => {});
        if (fs.existsSync(pcmPath)) fs.unlink(pcmPath, () => {});
    }
}

module.exports = { transcribeAudio };