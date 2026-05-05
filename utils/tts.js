const fs = require('fs');
const { MsEdgeTTS, OUTPUT_FORMAT } = require('msedge-tts');

async function generateTTS(text, voice, outputPath) {
    const tts = new MsEdgeTTS();
    await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

    const readable = tts.toStream(text);
    const writeStream = fs.createWriteStream(outputPath);

    return new Promise((resolve, reject) => {
        readable.on('data', (chunk) => writeStream.write(chunk));
        readable.on('end', () => {
            writeStream.end();
            resolve();
        });
        readable.on('error', reject);
        writeStream.on('error', reject);
    });
}

module.exports = { generateTTS };