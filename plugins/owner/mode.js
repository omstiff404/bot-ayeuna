const fs = require('fs');
const path = require('path');
const configPath = path.join(__dirname, '../../toolkit/set/config.json');

module.exports = {
  name: 'mode',
  command: ['mode'],
  tags: 'Owner Menu',
  desc: 'Ubah mode bot menjadi group/private/off',
  prefix: true,
  owner: true,

  run: async (conn, msg, {
    chatInfo,
    args,
    prefix,
    commandText
  }) => {
    const { chatId } = chatInfo;
    if (!(await isOwner(module.exports, conn, msg))) return;

    const mode = args[0]?.toLowerCase();
    const validModes = ['group', 'private', 'off'];

    if (!validModes.includes(mode)) {
      return conn.sendMessage(chatId, {
        text: `⚠️ Mode tidak valid!\n\nContoh:\n${prefix}${commandText} group\n${prefix}${commandText} private\n${prefix}${commandText} off\n\nMode saat ini: *${global.setting?.botSetting?.Mode || 'unknown'}*`
      }, { quoted: msg });
    }

    try {
      const config = JSON.parse(fs.readFileSync(configPath));
      config.botSetting = { ...config.botSetting, Mode: mode };
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

      conn.sendMessage(chatId, {
        text: `✅ Mode bot diubah menjadi *${mode}*.`
      }, { quoted: msg });
    } catch (err) {
      console.error(err);
      conn.sendMessage(chatId, {
        text: '❌ Gagal mengubah mode bot.'
      }, { quoted: msg });
    }
  }
};