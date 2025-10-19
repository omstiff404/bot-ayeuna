const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const { mediaMessage } = require("../../toolkit/exif");

module.exports = {
  name: 'togif',
  command: ['togif'],
  tags: 'Tools Menu',
  desc: 'Mengonversi stiker menjadi GIF',
  prefix: true,
  isPremium: false,

  run: async (conn, msg, { chatInfo }) => {
    const { chatId } = chatInfo;
    if (!(await isPrem(module.exports, conn, msg))) return;

    try {
      const quotedMessage = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const sticker = quotedMessage?.stickerMessage || msg.message?.stickerMessage;

      if (!sticker) {
        return conn.sendMessage(chatId, { text: "⚠️ Balas stiker atau kirim stiker dengan caption *togif* untuk mengonversi!" }, { quoted: msg });
      }

      const tempDir = path.join(__dirname, "../../temp/");
      if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

      const baseName = `${Date.now()}`;
      const webpPath = await mediaMessage(
        { message: quotedMessage || msg.message },
        path.join(tempDir, baseName)
      );

      const outputPath = `${webpPath}.gif`;

      exec(`ffmpeg -i "${webpPath}" "${outputPath}"`, async (err) => {
        fs.unlinkSync(webpPath);
        if (err || !fs.existsSync(outputPath)) {
          return conn.sendMessage(chatId, { text: `❌ Konversi gagal: ${err?.message || 'Tidak diketahui'}` }, { quoted: msg });
        }

        const buffer = fs.readFileSync(outputPath);
        await conn.sendMessage(chatId, { document: buffer, mimetype: 'image/gif', fileName: 'sticker.gif', caption: "🎉 Converted successfully" }, { quoted: msg });
        fs.unlinkSync(outputPath);
      });

    } catch (error) {
      console.error("[ERROR] toimg:", error);
      return conn.sendMessage(chatId, { text: `❌ Gagal mengonversi: ${error.message}` }, { quoted: msg });
    }
  }
};
