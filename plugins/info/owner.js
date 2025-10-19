module.exports = {
  name: 'owner',
  command: ['owner', 'contact', 'admin'],
  tags: 'Info Menu',
  desc: 'Mengirim kontak owner bot',
  prefix: true,

  run: async (conn, msg, {
    chatInfo,
    textMessage,
    prefix,
    commandText,
    buttonId,
    args
  }) => {
    try {
      const { chatId, senderId, isGroup } = chatInfo;
      const owner = global.ownerName || 'Owner';
      const ownerNumber = global.contact;
      const bot = global.botName || 'Bot';

      if (!ownerNumber) {
        console.error('❌ ownerNumber tidak ditemukan. Pastikan config.json terisi dengan benar.');
        await conn.sendMessage(chatId, { text: 'Kontak owner tidak tersedia saat ini.' }, { quoted: msg });
        return;
      }

      const contactInfo = {
        contacts: {
          displayName: owner,
          contacts: [{
            vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:${owner}\nTEL;type=CELL;type=VOICE;waid=${ownerNumber}:+${ownerNumber}\nEND:VCARD`
          }]
        }
      };

      await conn.sendMessage(chatId, contactInfo, { quoted: msg });
      await conn.sendMessage(chatId, { text: `Ini adalah kontak owner *${bot}*` }, { quoted: msg });

    } catch (error) {
      console.error('❌ Terjadi kesalahan di plugin owner:', error);
    }
  }
};