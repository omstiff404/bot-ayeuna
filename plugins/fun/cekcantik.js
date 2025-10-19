module.exports = {
  name: 'cekcantik',
  command: ['cekcantik'],
  tags: 'Fun Menu',
  desc: 'Cek seberapa cantik seseorang',
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
      komentar = 'Masih biasa anjr';
    } else if (persentase <= 44) {
      komentar = 'Lumayan lah';
    } else if (persentase <= 72) {
      komentar = 'Cantik banget woilaa';
    } else if (persentase <= 88) {
      komentar = 'Wah cantik banget pliss😘';
    } else {
      komentar = 'Calon Miss Universe!';
    }

    const teks = `*Seberapa cantik* @${mentionTarget}\n\n*${persentase}%* Cantik\n_${komentar}_`;

    await conn.sendMessage(chatId, {
      text: teks,
      mentions: [`${targetId}@s.whatsapp.net`]
    }, { quoted: msg });
  }
};