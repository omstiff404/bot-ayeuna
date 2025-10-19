const fs = require("fs");
const path = require("path");
const configPath = path.join(__dirname, "../../toolkit/set/config.json");

module.exports = {
  name: 'setname',
  command: ['setname', 'setfullname'],
  tags: 'Owner Menu',
  desc: 'Ubah nama bot',
  prefix: true,
  owner: false,

  run: async (conn, msg, {
    chatInfo,
    textMessage,
    prefix,
    commandText,
    args
  }) => {
    const { chatId } = chatInfo;
    if (!(await isOwner(module.exports, conn, msg))) return;

    const newName = args.join(" ");
    if (!newName) {
      return conn.sendMessage(chatId, { text: "Masukkan nama baru." }, { quoted: msg });
    }

    if (!fs.existsSync(configPath)) {
      return conn.sendMessage(chatId, { text: "Config tidak ditemukan." }, { quoted: msg });
    }

    try {
      const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));

      if (commandText === "setname") {
        global.botName = newName;
        config.botSetting.botName = newName;
      } else {
        global.botFullName = newName;
        config.botSetting.botFullName = newName;
      }

      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

      conn.sendMessage(chatId, {
        text: `Nama bot diubah menjadi:\n${newName}`
      }, { quoted: msg });

      setTimeout(() => process.exit(1), 2000);
    } catch (err) {
      console.error(err);
      conn.sendMessage(chatId, { text: "Gagal mengubah nama." }, { quoted: msg });
    }
  }
};