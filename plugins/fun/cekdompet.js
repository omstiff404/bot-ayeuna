module.exports = {
  name: 'cekdompet',
  command: ['cekdompet', 'dompetcek'],
  tags: 'Fun Menu',
  desc: 'Cek dompet orang',
  prefix: true,
  premium: false,

  run: async (conn, msg, { chatInfo }) => {
    const { chatId, senderId } = chatInfo;
    const targetId = target(msg, senderId);
    const mention = `${targetId}@s.whatsapp.net`;

    try {
      intDB();
      const db = getDB();
      const userEntry = Object.entries(db.Private).find(([, v]) => v.Nomor === mention);
      const user = userEntry?.[1];

      if (!user) {
        return conn.sendMessage(chatId, {
          text: `Pengguna belum terdaftar di database!\n\nKetik *.daftar* untuk mendaftar.`,
          mentions: [mention]
        }, { quoted: msg });
      }

      const moneyAmount = user.money?.amount ?? 0;
      const formattedMoney = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR'
      }).format(moneyAmount);

      const teks = `Hasil investigasi dari dompet @${targetId}\n💰 ${formattedMoney} ditemukan`;

      await conn.sendMessage(chatId, {
        text: teks,
        mentions: [mention]
      }, { quoted: msg });

    } catch (err) {
      console.error("Error di plugin cekdompet.js:", err);
      conn.sendMessage(chatId, {
        text: "Terjadi kesalahan saat memeriksa dompet."
      }, { quoted: msg });
    }
  }
};