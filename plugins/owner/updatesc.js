const fs = require('fs');
const path = require('path');
const https = require('https');

module.exports = {
  name: 'update',
  command: ['update'],
  tags: 'Owner Menu',
  desc: 'Perbarui file dari GitHub.',
  prefix: true,
  owner: false,

  run: async (conn, msg, {
    chatInfo,
    args
  }) => {
    const { chatId } = chatInfo;
    if (!(await isOwner(module.exports, conn, msg))) return;

    if (args.length < 2) {
      return conn.sendMessage(chatId, { text: 'Format: .update file.js urlGithub' }, { quoted: msg });
    }

    const [targetPath, githubUrl] = args;
    const baseDir = path.resolve(__dirname, '../../');
    const fullPath = path.resolve(baseDir, targetPath);

    if (!fullPath.startsWith(baseDir)) {
      return conn.sendMessage(chatId, { text: 'Akses ditolak.' }, { quoted: msg });
    }

    if (!fs.existsSync(fullPath)) {
      return conn.sendMessage(chatId, { text: 'File tidak ditemukan.' }, { quoted: msg });
    }

    try {
      const match = githubUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (!match) throw new Error('URL salah');

      const raw = `https://raw.githubusercontent.com/${match[1]}/${match[2]}/main/${targetPath}`;
      const resMsg = await conn.sendMessage(chatId, { text: 'Mengunduh file...' }, { quoted: msg });
      const statusMsg = resMsg.key;

      https.get(raw, (res) => {
        if (res.statusCode !== 200) {
          return conn.sendMessage(chatId, {
            text: `Gagal download (${res.statusCode})`,
            edit: statusMsg
          }, { quoted: msg });
        }

        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', async () => {
          try {
            fs.writeFileSync(fullPath, data);
            let note = '';

            if (fullPath.includes('/plugins/')) {
              try {
                delete require.cache[require.resolve(fullPath)];
                note = '\nPlugin dimuat ulang.';
              } catch {
                note = '\nGagal reload plugin.';
              }
            }

            await new Promise(r => setTimeout(r, 2000));
            await conn.sendMessage(chatId, {
              text: `File diperbarui: ${targetPath}${note}`,
              edit: statusMsg
            }, { quoted: msg });

            await new Promise(r => setTimeout(r, 2000));
            await conn.sendMessage(chatId, {
              text: 'Bot restart dalam 3 detik...',
              edit: statusMsg
            }, { quoted: msg });

            await new Promise(r => setTimeout(r, 3000));
            process.exit(1);
          } catch {
            await conn.sendMessage(chatId, {
              text: 'Gagal simpan file.',
              edit: statusMsg
            }, { quoted: msg });
          }
        });
      }).on('error', async () => {
        await conn.sendMessage(chatId, {
          text: 'Gagal mengunduh file.',
          edit: statusMsg
        }, { quoted: msg });
      });

    } catch {
      return conn.sendMessage(chatId, { text: 'URL GitHub salah.' }, { quoted: msg });
    }
  }
};