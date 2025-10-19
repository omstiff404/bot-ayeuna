module.exports = {
  name: 'Info Grup',
  command: ['cekgc', 'cekidgc'],
  tags: 'Info Menu',
  desc: 'Cek data grup di database',
  prefix: true,

  run: async (conn, msg, { chatInfo }) => {
    const { chatId, isGroup } = chatInfo;
    try {
      if (!isGroup) {
        return conn.sendMessage(chatId, { text: 'Perintah ini hanya untuk grup.' }, { quoted: msg });
      }

      const db = getDB();
      const data = Object.values(db.Grup || {}).find(g => g.Id === chatId);
      if (!data) {
        return conn.sendMessage(chatId, { text: 'Grup ini belum terdaftar.' }, { quoted: msg });
      }

      const { gbFilter = {}, antibadword = {} } = data;
      const close = gbFilter.closeTime || {};
      const open = gbFilter.openTime || {};

      const toTime = (timestamp) => {
        if (!timestamp) return '-';
        const now = Date.now();
        const sisa = timestamp - now;
        if (sisa <= 0) return 'Waktu Habis';
        return Format.toTime(sisa);
      };

      let teks = `${head} ${Obrack} *Info Grup* ${Cbrack}\n`;
      teks += `${side} ${btn} ID: ${data.Id}\n`;
      teks += `${side} ${btn} Auto AI: ${data.autoai ? 'Aktif' : 'Tidak'}\n`;
      teks += `${side} ${btn} Mute: ${data.mute ? 'Aktif' : 'Tidak'}\n`;
      teks += `${side} ${btn} Bell: ${data.bell ? 'Aktif' : 'Tidak'}\n`;
      teks += `${side} ${btn} Peringatan: ${data.setWarn || 0}\n`;

      teks += `${foot}${garis}\n`;
      teks += `${head} ${Obrack} *Pengaturan Grup* ${Cbrack}\n`;
      teks += `${side} ${btn} Welcome: ${gbFilter.Welcome?.welcome ? 'Aktif' : 'Tidak'}\n`;
      teks += `${side} ${btn} Left: ${gbFilter.Left?.gcLeft ? 'Aktif' : 'Tidak'}\n`;
      teks += `${side} ${btn} Anti Link: ${gbFilter.link?.antilink ? 'Aktif' : 'Tidak'}\n`;
      teks += `${side} ${btn} Anti Stiker: ${gbFilter.stiker?.antistiker ? 'Aktif' : 'Tidak'}\n`;
      teks += `${side} ${btn} Anti Bot: ${gbFilter.antibot ? 'Aktif' : 'Tidak'}\n`;
      teks += `${side} ${btn} Anti Tag Sw: ${gbFilter.antiTagSw ? 'Aktif' : 'Tidak'}\n`;
      teks += `${side} ${btn} Close Time: ${close.active ? 'Aktif' : 'Tidak'} (${toTime(close.until)})\n`;
      teks += `${side} ${btn} Open Time: ${open.active ? 'Aktif' : 'Tidak'} (${toTime(open.until)})\n`;

      teks += `${foot}${garis}\n`;
      teks += `${head} ${Obrack} *Filter Kasar* ${Cbrack}\n`;
      teks += `${side} ${btn} Status: ${antibadword.badword ? 'Aktif' : 'Tidak'}\n`;
      teks += `${side} ${btn} Respon: ${antibadword.badwordText || '-'}\n`;
      teks += `${foot}${garis}`;

      const metadata = await mtData(chatId, conn);
      const groupName = metadata?.subject || 'Info Grup';

      await conn.sendMessage(chatId, {
        text: teks,
        contextInfo: {
          externalAdReply: {
            title: groupName,
            body: `Ini Adalah Status ${groupName}`,
            thumbnailUrl: thumbnail,
            mediaType: 1,
            renderLargerThumbnail: true,
          },
          forwardingScore: 1,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: idCh
          }
        }
      }, { quoted: msg });

    } catch (e) {
      console.error(e);
      conn.sendMessage(chatId, { text: 'Terjadi kesalahan saat mengambil data grup.' }, { quoted: msg });
    }
  }
}