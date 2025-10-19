const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'deletefile',
  command: ['deletefile', 'df'],
  tags: 'Owner Menu',
  desc: 'Menghapus file/folder',
  prefix: true,
  owner: true,

  run: async (conn, msg, {
    chatInfo,
    args
  }) => {
    const { chatId } = chatInfo;
    if (!(await isOwner(module.exports, conn, msg))) return;

    if (!args[0]) {
      return conn.sendMessage(chatId, { text: '⚠️ Masukkan nama file yang ingin dihapus!' }, { quoted: msg });
    }

    const baseDir = path.join(__dirname, '../../');
    const fileName = args.join(' ');
    const filePath = path.resolve(baseDir, fileName);

    if (!filePath.startsWith(baseDir)) {
      return conn.sendMessage(chatId, { text: '⚠️ Akses file di luar direktori BaseBot tidak diizinkan!' }, { quoted: msg });
    }

    if (!fs.existsSync(filePath)) {
      return conn.sendMessage(chatId, { text: '❌ File tidak ditemukan!' }, { quoted: msg });
    }

    let statusMsg;
    try {
      const status = await conn.sendMessage(chatId, { text: 'Menghapus file...' }, { quoted: msg });
      statusMsg = status.key;

      fs.unlinkSync(filePath);

      const deletedText = `✅ File *${fileName}* berhasil dihapus!`;
      await new Promise(resolve => setTimeout(resolve, 2000));
      await conn.sendMessage(chatId, { text: deletedText, edit: statusMsg }, { quoted: msg });

      const restartText = '🔄 Bot akan restart dalam 3 detik...';
      await new Promise(resolve => setTimeout(resolve, 2000));
      await conn.sendMessage(chatId, { text: restartText, edit: statusMsg }, { quoted: msg });

      await new Promise(resolve => setTimeout(resolve, 3000));
      process.exit(1);

    } catch (error) {
      console.error(error);
      const errorMsg = { text: '⚠️ Terjadi kesalahan saat menghapus file!' };
      if (statusMsg) {
        await conn.sendMessage(chatId, { ...errorMsg, edit: statusMsg });
      } else {
        await conn.sendMessage(chatId, { ...errorMsg, quoted: msg });
      }
    }
  }
};