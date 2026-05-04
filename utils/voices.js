const VOICE_MAP = {
    // English
    'en-female': { name: '🇺🇸 English (Female)', voice: 'en-US-AriaNeural' },
    'en-male':   { name: '🇺🇸 English (Male)',   voice: 'en-US-ChristopherNeural' },

    //spanish
    'es-female': { name: '🇪🇸 Spanish (Female)', voice: 'es-ES-ElviraNeural' },
    'es-male':   { name: '🇪🇸 Spanish (Male)',   voice: 'es-ES-AlvaroNeural' },

    // Indonesian
    'id-female': { name: '🇮🇩 Indonesian (Female)', voice: 'id-ID-GadisNeural' },
    'id-male':   { name: '🇮🇩 Indonesian (Male)',   voice: 'id-ID-ArdiNeural' },

    // Thai
    'th-female': { name: '🇹🇭 Thai (Female)', voice: 'th-TH-PremwadeeNeural' },
    'th-male':   { name: '🇹🇭 Thai (Male)',   voice: 'th-TH-NiwatNeural' },

    // Vietnamese
    'vi-female': { name: '🇻🇳 Vietnamese (Female)', voice: 'vi-VN-HoaiMyNeural' },
    'vi-male':   { name: '🇻🇳 Vietnamese (Male)',   voice: 'vi-VN-NamMinhNeural' },

    // Filipino
    'fil-female': { name: '🇵🇭 Filipino (Female)', voice: 'fil-PH-BlessicaNeural' },
    'fil-male':   { name: '🇵🇭 Filipino (Male)',   voice: 'fil-PH-AngeloNeural' },

    // Singapore English
    'sg-female': { name: '🇸🇬 Singapore English (Female)', voice: 'en-SG-LunaNeural' },
    'sg-male':   { name: '🇸🇬 Singapore English (Male)',   voice: 'en-SG-WayneNeural' },

    // Chinese
    'zh-female': { name: '🇨🇳 Chinese (Female)', voice: 'zh-CN-XiaoxiaoNeural' },
    'zh-male':   { name: '🇨🇳 Chinese (Male)',   voice: 'zh-CN-YunyangNeural' },

    // Japanese
    'ja-female': { name: '🇯🇵 Japanese (Female)', voice: 'ja-JP-NanamiNeural' },
    'ja-male':   { name: '🇯🇵 Japanese (Male)',   voice: 'ja-JP-KeitaNeural' },

    // Korean
    'ko-female': { name: '🇰🇷 Korean (Female)', voice: 'ko-KR-SunHiNeural' },
    'ko-male':   { name: '🇰🇷 Korean (Male)',   voice: 'ko-KR-InJoonNeural' },

    // Malay
    'ms-female': { name: '🇲🇾 Malay (Female)', voice: 'ms-MY-YasminNeural' },
    'ms-male':   { name: '🇲🇾 Malay (Male)',   voice: 'ms-MY-OsmanNeural' },
    
    //bangla
    'bn-female': { name: '🇧🇩 Bangla (Female)', voice: 'bn-BD-NabanitaNeural' },
    'bn-male':   { name: '🇧🇩 Bangla (Male)',   voice: 'bn-BD-PradeepNeural' },
};

// Choices formatted for Discord slash command addChoices()
const VOICE_CHOICES = Object.entries(VOICE_MAP).map(([value, { name }]) => ({
    name,
    value,
}));

// Default voice if user hasn't set one
const DEFAULT_VOICE = 'en-US-AriaNeural';

module.exports = { VOICE_MAP, VOICE_CHOICES, DEFAULT_VOICE };