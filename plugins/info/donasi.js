module.exports = {
    name: 'donasi',
    command: ['donasi', 'donate'],
  tags: 'Info Menu',
    desc: 'Untuk Mendonasi Owner',
    prefix: true,

    run: async (conn, msg, { chatInfo, prefix, commandText, qkontak}) => {
    const { chatId, pushName } = chatInfo;
    
    await conn.sendMessage(chatId,{ image: { url: 'https://files.catbox.moe/uc0ptw.jpg' }, caption: 'Terima kasih Donate nya, semoga bermanfaat😁' }, { quoted: qkontak });
    await conn.sendMessage(chatId, { text: `Nih Via Nomor\n\n • Dana : 083879685072\n • Gopay : 083879685072\n Terima kasih donate nya\nSaya terima buat kebutuhan Bot 😁` }, { quoted: qkontak })
    },
};