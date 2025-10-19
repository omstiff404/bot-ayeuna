const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../../toolkit/set/config.json');
let config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

const saveConfig = (newConfig) => {
  fs.writeFileSync(configPath, JSON.stringify(newConfig, null, 2));
};

module.exports = {
  name: 'forowner',
  command: ['forowner', 'forners'],
  tags: 'Owner Menu',
  desc: 'Atur sambutan untuk Owner',
  prefix: true,
  owner: true,

  run: async (conn, msg, {
    chatInfo,
    textMessage,
    prefix,
    commandText,
    args
  }) => {
    const { chatId } = chatInfo;
    if (!(await isOwner(module.exports, conn, msg))) return;

    const cmd = `${prefix}${commandText}`;
    const input = args[0];

    if (input === "on") {
      config.ownerSetting.forOwner = true;
      saveConfig(config);
      return conn.sendMessage(chatId, { text: "Sambutan Owner diaktifkan." }, { quoted: msg });

    } else if (input === "off") {
      config.ownerSetting.forOwner = false;
      saveConfig(config);
      return conn.sendMessage(chatId, { text: "Sambutan Owner dimatikan." }, { quoted: msg });

    } else if (input === "set") {
      const teks = textMessage.slice((cmd + ' set').length).trim();
      if (!teks) {
        return conn.sendMessage(chatId, { text: `Gunakan: ${cmd} set <teks>` }, { quoted: msg });
      }

      config.msg.rejectMsg.forOwnerText = teks;
      saveConfig(config);
      return conn.sendMessage(chatId, { text: `Teks sambutan disimpan:\n\n${teks}` }, { quoted: msg });

    } else if (input === "reset") {
      config.msg.rejectMsg.forOwnerText = "";
      saveConfig(config);
      return conn.sendMessage(chatId, { text: "Teks sambutan dikosongkan." }, { quoted: msg });

    } else {
      return conn.sendMessage(chatId, {
        text: [
          `Penggunaan:`,
          `${cmd} on     → Aktifkan`,
          `${cmd} off    → Nonaktifkan`,
          `${cmd} set <teks> → Atur teks`,
          `${cmd} reset  → Kosongkan teks`
        ].join('\n')
      }, { quoted: msg });
    }
  }
};