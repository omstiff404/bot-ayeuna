const fetch = require('node-fetch');

module.exports = {
  name: 'cekkey',
  command: ['cekkey'],
  tags: 'Info Menu',
  desc: 'Cek status API key TermAi',
  prefix: true,
  owner: false,

  run: async (conn, msg, { chatInfo }) => {
    const { chatId } = chatInfo;
    if (!(await isOwner(module.exports, conn, msg))) return;

    try {
      const res = await fetch(`${termaiWeb}/api/tools/key-checker?key=${termaiKey}`);
      const json = await res.json();

      if (!json.status) {
        return await conn.sendMessage(chatId, { text: '❌ Gagal mengambil data API key.' }, { quoted: msg });
      }

      const d = json.data;

      const formatTime = (obj) => {
        const { days, hours, minutes, seconds } = obj;
        return [
          days ? `${days} hari` : '',
          hours ? `${hours} jam` : '',
          minutes ? `${minutes} menit` : '',
          seconds ? `${seconds} detik` : ''
        ].filter(Boolean).join(', ');
      };

      let teks = `${head}${Obrack} *Info API Key* ${Cbrack}\n`;
      teks += `${side} ${btn} *Plan:* ${d.plan}\n`;
      teks += `${side} ${btn} *Limit:* ${d.limit}\n`;
      teks += `${side} ${btn} *Usage:* ${d.usage}\n`;
      teks += `${side} ${btn} *Total Hit:* ${d.totalHit}\n`;
      teks += `${side} ${btn} *Remaining:* ${d.remaining}\n`;
      teks += `${side} ${btn} *Reset:* ${d.reset}\n`;
      teks += `${side} ${btn} *Reset Dalam:* ${formatTime(d.resetEvery.format)}\n`;
      teks += `${side} ${btn} *Expired:* ${d.expired}\n`;
      teks += `${side} ${btn} *Expired?:* ${d.isExpired ? '✅ Ya' : '❌ Tidak'}\n`;
      teks += `${foot}${garis}\n\n`

      teks += `${head} *Fitur & Pemakaian:*\n`;
      for (let [fitur, detail] of Object.entries(d.features)) {
        if (typeof detail !== 'object') continue;

        teks += `${side} ${btn} ${fitur}:\n`;
        teks += `${side} ${btn} *Max:* ${detail.max ?? '-'}\n`;
        teks += `${side} ${btn} *Use:* ${detail.use ?? '-'}\n`;
        teks += `${side} ${btn} *Hit:* ${detail.hit ?? '-'}\n`;
        if (detail.lastReset) {
          teks += `${side} ${btn} *Last Reset:* ${new Date(detail.lastReset).toLocaleString('id-ID')}\n`;
        }
        teks += `${side} ${garis}\n`
      }
      teks += `${side} Api Dari ${termaiWeb}\n`
      teks += `${foot}${garis}\n`

      await conn.sendMessage(chatId, { text: teks.trim() }, { quoted: msg });
    } catch (err) {
      console.error('CekKey Error:', err);
      await conn.sendMessage(chatId, { text: '❌ Terjadi kesalahan saat mengecek API key.' }, { quoted: msg });
    }
  }
};