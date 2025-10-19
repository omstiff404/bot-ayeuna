const fs = require("fs");
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");

module.exports = {
  name: 'setpp',
  command: ['setpp', 'setprofile'],
  tags: 'Owner Menu',
  desc: 'Ubah foto profil bot',
  prefix: true,
  owner: false,

  run: async (conn, msg, {
    chatInfo,
    prefix,
    commandText
  }) => {
    const { chatId } = chatInfo;
    if (!(await isOwner(module.exports, conn, msg))) return;

    const mtype = Object.keys(msg.message || {})[0];
    let media = null;

    if (mtype === "imageMessage") {
      media = msg.message.imageMessage;
    } else if (mtype === "extendedTextMessage" &&
               msg.message.extendedTextMessage.contextInfo?.quotedMessage?.imageMessage) {
      media = msg.message.extendedTextMessage.contextInfo.quotedMessage.imageMessage;
    }

    if (!media) {
      return conn.sendMessage(chatId, {
        text: `Kirim atau reply gambar dengan caption:\n${prefix}${commandText}`
      }, { quoted: msg });
    }

    try {
      const stream = await downloadContentFromMessage(media, "image");
      let buffer = Buffer.from([]);

      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      await conn.updateProfilePicture(conn.user.id, buffer);
      conn.sendMessage(chatId, { text: "Foto profil berhasil diubah." }, { quoted: msg });
    } catch (err) {
      console.error(err);
      conn.sendMessage(chatId, { text: "Gagal mengubah foto profil." }, { quoted: msg });
    }
  }
};