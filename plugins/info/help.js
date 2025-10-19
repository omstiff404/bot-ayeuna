const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'help',
  command: ['help', 'info'],
  tags: 'Info Menu',
  desc: 'Lihat info plugin',
  prefix: true,

  run: async (conn, msg, {
    chatInfo,
    prefix,
    commandText,
    args
  }) => {
    const { chatId } = chatInfo;

    if (!args.length) {
      return conn.sendMessage(chatId, {
        text: `Contoh:\n${prefix}${commandText} namafile`
      }, { quoted: msg });
    }

    const baseDir = path.join(__dirname, '..');
    const folders = fs.readdirSync(baseDir).filter(f =>
      fs.lstatSync(path.join(baseDir, f)).isDirectory());

    let plugin = null;
    let filename = '';

    for (const folder of folders) {
      const files = fs.readdirSync(path.join(baseDir, folder)).filter(f => f.endsWith('.js'));
      for (const file of files) {
        if (path.parse(file).name.toLowerCase() === args[0].toLowerCase()) {
          plugin = require(path.join(baseDir, folder, file));
          filename = file;
          break;
        }
      }
      if (plugin) break;
    }

    if (!plugin) {
      return conn.sendMessage(chatId, {
        text: `Plugin *${args[0]}* tidak ditemukan.`
      }, { quoted: msg });
    }

    const {
      name,
      command,
      desc,
      owner = false,
      prefix: usesPrefix = false,
      premium = false
    } = plugin;

    const cmdList = Array.isArray(command) ? command.map(c => `${prefix}${c}`).join(', ') : '-';

    const text =
      `Plugin Info\n` +
      `• File: ${filename}\n` +
      `• Nama: ${name || '-'}\n` +
      `• Cmd: ${cmdList}\n` +
      `• Deskripsi: ${desc || '-'}\n` +
      `• Owner: ${owner}\n` +
      `• Prefix: ${usesPrefix}\n` +
      `• Premium: ${premium}`;

    conn.sendMessage(chatId, { text }, { quoted: msg });
  }
};