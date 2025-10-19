module.exports = {
  name: 'Tanya jawab',
  command: ['apakah', 'Apakah', 'Bukan kah', 'Bukankah', 'Benarkah', 'Benar kah', 'bukan kah', 'bukankah', 'benarkah', 'benar kah'],
  tags: 'Fun Menu',
  desc: 'Bertanya kepada bot',
  prefix: false,

  run: async (conn, msg, {
    chatInfo,
    textMessage,
    prefix,
    commandText,
    args
  }) => {
    try {
      const { ask } = await global.loadFunc();
      const { chatId, senderId, isGroup } = chatInfo;
      const tanya = ask[Math.floor(Math.random() * ask.length)];

      await conn.sendMessage(chatId, { text: tanya }, { quoted: msg });

    } catch (error) {
      console.error('Error:', error);
      await conn.sendMessage(msg.key.remoteJid, {
        text: `Error: ${error.message || error}`,
        quoted: msg,
      });
    }
  }
}