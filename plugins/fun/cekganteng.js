module.exports = {
  name: 'cekganteng',
  command: ['cekganteng'],
  tags: 'Fun Menu',
  desc: 'Cek seberapa ganteng seseorang',
  prefix: true,

  run: async (conn, msg, {
    chatInfo,
    textMessage,
    prefix,
    commandText,
    args
  }) => {
    const { chatId, senderId, isGroup } = chatInfo;
    let targetId = target(msg, senderId);
    const mentionTarget = targetId;
    const persentase = Math.floor(Math.random() * 101);

    let komentar;
    if (persentase <= 25) {
      komentar = 'Masih biasa cok';
    } else if (persentase <= 44) {
      komentar = 'Lumayan laaa';
    } else if (persentase <= 72) {
      komentar = 'Gantengg juga kamu jir😘';
    } else if (persentase <= 88) {
      komentar = 'Wahh gantengg banget anjrr😋😋';
    } else {
      komentar = 'Calon Oppa Korea!😋💍💍';
    }

    const teks = `*Seberapa ganteng* @${mentionTarget}\n\n*${persentase}%* Ganteng\n_${komentar}_`;

    await conn.sendMessage(chatId, {
      text: teks,
      mentions: [`${targetId}@s.whatsapp.net`]
    }, { quoted: msg });
  }
};