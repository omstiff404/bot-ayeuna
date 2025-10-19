const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'savefile',
  command: ['savefile', 'sf'],
  tags: 'Owner Menu',
  desc: 'Menulis ulang file.',
  prefix: true,
  owner: true,

  run: async (conn, msg, {
    chatInfo,
    args
  }) => {
    const { chatId } = chatInfo;
    if (!(await isOwner(module.exports, conn, msg))) return;

    if (!args.length) {
      return conn.sendMessage(chatId, { text: '⚠️ Masukkan path file yang ingin ditulis ulang!' }, { quoted: msg });
    }

    const quotedMessage = msg.message.extendedTextMessage?.contextInfo?.quotedMessage?.conversation;
    if (!quotedMessage) {
      return conn.sendMessage(chatId, { text: '⚠️ Anda harus mengutip pesan berisi teks untuk menyimpan sebagai file!' }, { quoted: msg });
    }

    const baseDir = path.join(__dirname, '../../');
    const filePath = path.resolve(baseDir, args.join(' '));

    if (!filePath.startsWith(baseDir)) {
      return conn.sendMessage(chatId, { text: '⚠️ Akses file di luar direktori BaseBot tidak diizinkan!' }, { quoted: msg });
    }

    let statusMsg;
    try {
      const status = await conn.sendMessage(chatId, { text: 'Menyimpan file...' }, { quoted: msg });
      statusMsg = status.key;

      fs.writeFileSync(filePath, quotedMessage, 'utf8');

      const savedText = `✅ File berhasil disimpan!\n📂 *Path:* ${filePath.replace(baseDir + '/', '')}`;
      await new Promise(resolve => setTimeout(resolve, 2000));
      await conn.sendMessage(chatId, { text: savedText, edit: statusMsg }, { quoted: msg });

      const restartText = '🔄 Bot akan restart dalam 3 detik...';
      await new Promise(resolve => setTimeout(resolve, 2000));
      await conn.sendMessage(chatId, { text: restartText, edit: statusMsg }, { quoted: msg });

      await new Promise(resolve => setTimeout(resolve, 3000));
      process.exit(1);

    } catch (error) {
      console.error(error);
      const errorMsg = { text: '⚠️ Terjadi kesalahan saat menyimpan file!' };
      if (statusMsg) {
        await conn.sendMessage(chatId, { ...errorMsg, edit: statusMsg });
      } else {
        await conn.sendMessage(chatId, { ...errorMsg, quoted: msg });
      }
    }
  }
};