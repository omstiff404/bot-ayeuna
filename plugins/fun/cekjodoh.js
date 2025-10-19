module.exports = {
  name: 'cekjodoh',
  command: ['cekjodoh'],
  tags: 'Fun Menu',
  desc: 'Cek jodoh antara dua orang secara acak.',
  prefix: true,

  run: async (conn, msg, {
    chatInfo,
    prefix,
    commandText
  }) => {
    const { chatId, isGroup } = chatInfo;
    if (!isGroup) {
      return conn.sendMessage(chatId, {
        text: 'Perintah ini hanya bisa digunakan di grup.'
      }, { quoted: msg });
    }

    const metadata = await mtData(chatId, conn);
    if (!metadata) {
      return conn.sendMessage(chatId, {
        text: 'Tidak dapat mengambil data grup.'
      }, { quoted: msg });
    }

    const participants = metadata.participants.map(p => p.id).filter(id => id !== conn.user.id);
    const ctxInfo = msg.message?.extendedTextMessage?.contextInfo || {};
    const mentioned = ctxInfo.mentionedJid || [];
    const quoted = ctxInfo.participant;

    let target1, target2;

    if (mentioned.length >= 2) {
      [target1, target2] = mentioned;
    } else if (mentioned.length === 1) {
      target1 = mentioned[0];
      target2 = randomPick(participants, [target1]);
    } else if (quoted) {
      target1 = quoted;
      target2 = randomPick(participants, [target1]);
    } else {
      target1 = randomPick(participants);
      do { target2 = randomPick(participants); }
      while (target1 === target2);
    }

    const percent = Math.floor(Math.random() * 100) + 1;
    const name1 = target1.split('@')[0];
    const name2 = target2.split('@')[0];

    await conn.sendMessage(chatId, {
      text: `Cek Jodoh\n@${name1} ❤️ @${name2}\n${percent}%`,
      mentions: [target1, target2]
    }, { quoted: msg });
  }
};

function randomPick(list, exclude = []) {
  const filtered = list.filter(id => !exclude.includes(id));
  return filtered[Math.floor(Math.random() * filtered.length)];
}