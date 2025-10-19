const fetch = require("node-fetch");

module.exports = {
  name: 'elevenlabs',
  command: ['elevenlabs'],
  tags: 'Fun Menu',
  desc: 'Text to speech ElevenLabs',
  prefix: true,
  premium: false,

  run: async (conn, msg, {
    chatInfo,
    prefix,
    commandText,
    args
  }) => {
    const { chatId } = chatInfo;

    const voiceList = [
      'prabowo',
      'yanzgpt',
      'bella',
      'megawati',
      'echilling',
      'adam',
      'thomas_shelby',
      'michi_jkt48',
      'nokotan',
      'jokowi',
      'boboiboy',
      'keqing',
      'anya',
      'yanami_anna',
      'MasKhanID',
      'Myka',
      'raiden',
      'CelzoID'
    ];

    if (args.length < 2) {
      const voiceListText = voiceList.map(v => `- ${v}`).join('\n');
      return conn.sendMessage(chatId, {
        text: `Format salah.\n\nGunakan: ${prefix}${commandText} <voice> <text>\n\nDaftar voice:\n${voiceListText}`
      }, { quoted: msg });
    }

    const [voiceRaw, ...textParts] = args;
    const voice = voiceRaw.toLowerCase();
    const text = textParts.join(' ');

    if (!voiceList.includes(voice)) {
      return conn.sendMessage(chatId, {
        text: `Voice tidak dikenal.\nKetik ${prefix}${commandText} untuk melihat daftar voice.`
      }, { quoted: msg });
    }

    try {
      const pitch = 0;
      const speed = 0.9;
      const url = `${termaiWeb}/api/text2speech/elevenlabs?text=${encodeURIComponent(text)}&voice=${voice}&pitch=${pitch}&speed=${speed}&key=${termaiKey}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const audioBuffer = await res.arrayBuffer();
      const audioMessage = Buffer.from(audioBuffer);

      await conn.sendMessage(chatId, {
        audio: audioMessage,
        mimetype: 'audio/mp4',
        ptt: true
      }, { quoted: msg });

    } catch (err) {
      console.error(err);
      return conn.sendMessage(chatId, {
        text: 'Gagal membuat suara.'
      }, { quoted: msg });
    }
  }
};