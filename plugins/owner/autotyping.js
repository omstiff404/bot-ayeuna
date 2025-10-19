const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'autotyping',
  command: ['autotyping', 'at'],
  tags: 'Owner Menu',
  desc: 'Mengatur autotyping bot',
  prefix: true,
  owner: false,

  run: async (conn, msg, {
    chatInfo,
    prefix,
    commandText,
    args
  }) => {
    const { chatId } = chatInfo;
    if (!(await isOwner(module.exports, conn, msg))) return;

    const configPath = path.join(__dirname, '../../toolkit/set/config.json');
    let config;

    try {
      config = JSON.parse(fs.readFileSync(configPath));
    } catch {
      return conn.sendMessage(chatId, { text: 'Gagal membaca konfigurasi bot.' }, { quoted: msg });
    }

    if (!args[0]) {
      return conn.sendMessage(chatId, {
        text: `Status Auto Typing: ${config.botSetting.autoTyping ? 'Aktif' : 'Nonaktif'}\n\nGunakan:\n${prefix}${commandText} on/off`
      }, { quoted: msg });
    }

    const state = args[0].toLowerCase();
    if (!['on', 'off'].includes(state)) {
      return conn.sendMessage(chatId, { text: 'Gunakan on atau off' }, { quoted: msg });
    }

    config.botSetting.autoTyping = state === 'on';

    try {
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    } catch {
      return conn.sendMessage(chatId, { text: 'Gagal menyimpan konfigurasi.' }, { quoted: msg });
    }

    global.autoTyping = config.botSetting.autoTyping;
    conn.sendMessage(chatId, {
      text: `Auto Typing telah ${state === 'on' ? 'diaktifkan' : 'dinonaktifkan'}.`
    }, { quoted: msg });
  }
};