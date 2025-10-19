module.exports = {
  name: 'Cek Bank',
  command: ['cekbank', 'bankcek'],
  tags: 'Info Menu',
  desc: 'Menampilkan isi saldo bank',
  prefix: true,

  run: async (conn, msg, { chatInfo }) => {
    const { chatId } = chatInfo;
    try {
      const { bank } = loadBank();
      const saldo = bank.saldo || 0;

      const teks = `
🏦 *BANK BOT OFFICIAL*
━━━━━━━━━━━━━━
👤 *Akun:* Bank Pusat
💳 *Saldo:* Rp ${saldo.toLocaleString('id-ID')}
━━━━━━━━━━━━━━
📌 Gunakan saldo dengan bijak!
      `.trim();

      await conn.sendMessage(chatId, { text: teks }, { quoted: msg });
    } catch {
      await conn.sendMessage(chatId, { text: '❌ Gagal menampilkan saldo bank.' }, { quoted: msg });
    }
  }
}