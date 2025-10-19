const fs = require("fs");

let isBroadcasting = false;
const delayTime = 5 * 60 * 1000;

function delay(ms) {
  return new Promise(res => setTimeout(res, ms));
}

module.exports = {
  name: 'bcgc',
  command: ['bcgc', 'broadcastgc'],
  tags: 'Owner Menu',
  desc: 'Broadcast ke semua grup.',
  prefix: true,
  premium: false,

  run: async (conn, msg, {
    chatInfo,
    textMessage,
    prefix,
    commandText
  }) => {
    const { chatId } = chatInfo;
    if (!(await isPrem(module.exports, conn, msg))) return;

    const cmd = `${prefix}${commandText}`;
    const text = textMessage.slice(cmd.length).trim();

    if (!text) {
      return conn.sendMessage(chatId, { text: `Pesan tidak boleh kosong.\nGunakan: ${cmd} [pesan]` }, { quoted: msg });
    }

    if (isBroadcasting) {
      return conn.sendMessage(chatId, { text: "Tunggu beberapa saat sebelum mengirim lagi." }, { quoted: msg });
    }

    const groups = await conn.groupFetchAllParticipating();
    const ids = Object.keys(groups);
    if (!ids.length) {
      return conn.sendMessage(chatId, { text: "Bot tidak ada di grup mana pun." }, { quoted: msg });
    }

    isBroadcasting = true;
    conn.sendMessage(chatId, { text: `Mengirim ke ${ids.length} grup...` }, { quoted: msg });

    let success = 0, failed = 0, failedList = [];

    for (const id of ids) {
      try {
        await conn.sendMessage(id, {
          text,
          contextInfo: {
            forwardingScore: 0,
            isForwarded: true,
            forwardedNewsletterMessageInfo: { newsletterJid: idCh }
          }
        }, { quoted: msg });
        success++;
      } catch {
        failed++;
        failedList.push(`- ${groups[id]?.subject || "Unknown"} (${id})`);
      }
      await delay(3000);
    }

    let res = `Selesai.\nBerhasil: ${success}\nGagal: ${failed}`;
    if (failedList.length) res += `\n\nGrup gagal:\n${failedList.join("\n")}`;

    conn.sendMessage(chatId, { text: res }, { quoted: msg });

    setTimeout(() => {
      isBroadcasting = false;
      conn.sendMessage(chatId, { text: "Broadcast bisa digunakan lagi." }, { quoted: msg });
    }, delayTime);
  }
};