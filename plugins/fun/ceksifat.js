module.exports = {
  name: 'ceksifat',
  command: ['ceksifat'],
  tags: 'Fun Menu',
  desc: 'Menebak sifat seseorang',
  prefix: true,

  run: async (conn, msg, {
    chatInfo,
    textMessage,
    prefix,
    commandText,
    args
  }) => {
    try {
      const { sifatlist } = await global.loadFunc();
      const { chatId, senderId, isGroup } = chatInfo;
      let targetId = target(msg, senderId);
      const mentionTarget = targetId;
      const sifat = sifatlist[Math.floor(Math.random() * sifatlist.length)];

      await conn.sendMessage(chatId, {
        text: `Nama: @${mentionTarget}\nSifat: ${sifat}`,
        mentions: [`${targetId}@s.whatsapp.net`]
      }, { quoted: msg });
    } catch (error) {
      console.error('Error:', error);
      conn.sendMessage(msg.key.remoteJid, {
        text: `Error: ${error.message || error}`,
        quoted: msg,
      });
    }
  }
};