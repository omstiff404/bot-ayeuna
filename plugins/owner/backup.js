const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

module.exports = {
  name: 'backup',
  command: ['backup'],
  tags: 'Owner Menu',
  desc: 'Backup data bot',
  prefix: true,
  owner: true,

  run: async (conn, msg, { chatInfo }) => {
    const { chatId } = chatInfo;
    if (!(await isOwner(module.exports, conn, msg))) return;

    const botName = global.botName.replace(/\s+/g, "_");
    const vers = global.version.replace(/\s+/g, ".");
    const zipName = `${botName}-${vers}.zip`;
    
    const tempFolder = path.join(__dirname, "..", "..", "temp");
    if (!fs.existsSync(tempFolder)) fs.mkdirSync(tempFolder);
    
    const zipPath = path.join(tempFolder, zipName);

    try {
      const zip = new AdmZip();
      const files = [
        "plugins",
        "toolkit",
        "package.json",
        "index.js",
        "main.js",
        "README.md",
        "LICENSE"
      ];

      for (const item of files) {
        const fullPath = path.join(__dirname, "..", "..", item);
        if (fs.existsSync(fullPath)) {
          const isDir = fs.lstatSync(fullPath).isDirectory();
          isDir ? zip.addLocalFolder(fullPath, item) : zip.addLocalFile(fullPath);
        }
      }

      zip.writeZip(zipPath);

      await conn.sendMessage(chatId, {
        document: fs.readFileSync(zipPath),
        mimetype: "application/zip",
        fileName: zipName,
        caption: `Backup berhasil dibuat.\nNama file: ${zipName}`
      }, { quoted: msg });

      setTimeout(() => {
        if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
      }, 5000);
    } catch (err) {
      console.error("Backup Error:", err);
      conn.sendMessage(chatId, { text: "Gagal membuat backup." }, { quoted: msg });
    }
  }
};