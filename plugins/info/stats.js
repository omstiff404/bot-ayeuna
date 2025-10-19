const os = require('os');
const fs = require('fs');
const { execSync } = require('child_process');
const { performance } = require('perf_hooks');

module.exports = {
  name: 'stats',
  command: ['stats', 'info', 'st', 'ping', 'device'],
  tags: 'Info Menu',
  desc: 'Menampilkan status device dan statik bot',
  prefix: true,

  run: async (conn, msg, {
    chatInfo
  }) => {
    const start = performance.now();
    const { chatId, senderId, pushName } = chatInfo;

    global.commandCount = (global.commandCount || 0) + 1;

    const uptime = process.uptime();
    const totalMem = os.totalmem();
    const usedMem = totalMem - os.freemem();
    const cpu = os.cpus()[0]?.model || 'Tidak diketahui';
    const platform = os.platform();
    const arch = os.arch();
    const botName = global.botName || 'Bot';
    const botFullName = global.botFullName || botName;

    const formatBytes = bytes => (bytes / 1024 / 1024).toFixed(2);
    const deviceUptime = Format.toTime(os.uptime() * 1000);

    let totalDisk = 'Tidak diketahui', usedDisk = 'Tidak diketahui', freeDisk = 'Tidak diketahui';
    try {
      const disk = execSync('df -h /', { encoding: 'utf8' }).split('\n')[1].split(/\s+/);
      [totalDisk, usedDisk, freeDisk] = [disk[1], disk[2], disk[3]];
    } catch (e) {
      console.error('❌ Gagal mendapatkan disk info:', e.message);
    }

    const db = getDB?.();
    let privateCmd = '-', maxCmd = 0;

    if (db?.Private) {
      for (const user of Object.values(db.Private)) {
        if (user.Nomor === senderId) privateCmd = user.cmd || 0;
        if ((user.cmd || 0) > maxCmd) maxCmd = user.cmd;
      }
    }

    const responseTime = (performance.now() - start).toFixed(2);

    const stats = `
Stats Bot ${Obrack} ${botFullName} ${Cbrack}
┃
┣ ${btn} Bot Name: ${botName}
┣ ${btn} Time Server: ${Format.time()}
┣ ${btn} Uptime: ${Format.uptime()}
┖ ${btn} Respon: ${responseTime} ms

Stats Chat
┃
┣ ${btn} Private (cmd): ${privateCmd}
┖ ${btn} Total Cmd (terbesar): ${maxCmd}

Stats System
┃
┣ ${btn} Up Device: ${deviceUptime}
┣ ${btn} Platform: ${platform} (${arch})
┣ ${btn} Cpu: ${cpu}
┣ ${btn} Ram: ${formatBytes(usedMem)} MB / ${formatBytes(totalMem)} MB
┖ ${btn} Storage: ${usedDisk} / ${totalDisk} (Free: ${freeDisk})
`.trim();

    await conn.sendMessage(chatId, {
      text: stats,
      contextInfo: {
        externalAdReply: {
          title: `Informasi Status Bot`,
          body: `Ini adalah status ${botFullName}`,
          thumbnailUrl: thumbnail,
          mediaType: 1,
          renderLargerThumbnail: true
        },
        forwardingScore: 1,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: idCh
        }
      }
    }, { quoted: msg });
  }
};