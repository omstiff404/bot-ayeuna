const { mediafireDl } = require('../../toolkit/scrape/tt.js');
const path = require('path'); // Tambahkan modul 'path'

module.exports = {
    name: 'MediaFire',
    command: ['md', 'mediafire'],
    tags: 'Download Menu',
    desc: 'Download file mediafire',
    prefix: true,
  premium: true,

  run: async (conn, msg, {
    chatInfo,
    textMessage,
    prefix,
    commandText,
    args
  }) => {
    try {
      const { chatId, senderId, isGroup } = chatInfo;
      if (!(await isPrem(module.exports, conn, msg))) return;
            const url = args[0]; // Ambil URL dari argumen

            if (!url) {
                await conn.sendMessage(chatId, { text: `Example: ${prefix}${commandText} [url mediafire]` }, { quoted: msg });
                return;
            }

            if (!isValidMediaFireUrl(url)) {
                await conn.sendMessage(chatId, { text: 'URL tidak valid! Pastikan URL berasal dari MediaFire.' }, { quoted: msg });
                return;
            }

            // Tambahkan reaksi "⏳" (jam pasir) untuk menunjukkan bahwa sedang diproses
            await conn.sendMessage(chatId, { react: { text: '⏳', key: msg.key } });

            try {
                let result;
                try {
                    result = await mediafireDl(url); // Gunakan mediafireDl untuk mengunduh
                } catch (error) {
                    console.error('Error in mediafireDl:', error);
                    result = null; // Atur result ke null jika terjadi error
                }

                if (result && result.link) {
                    // Gunakan result.nama langsung
                    const filename = result.nama;

                    // Dapatkan ekstensi file dari nama file
                    const ext = path.extname(filename).toLowerCase();

                    // Tentukan tipe pesan berdasarkan ekstensi file
                    let messageType = 'document'; // Default ke document
                    let mimetype = 'application/octet-stream'; // Default mimetype

                    switch (ext) {
                        case '.jpg':
                        case '.jpeg':
                        case '.png':
                        case '.gif':
                            messageType = 'image';
                            mimetype = result.mime || 'image/jpeg'; // Fallback ke image/jpeg
                            break;
                        case '.mp4':
                            messageType = 'video';
                            mimetype = result.mime || 'video/mp4'; // Fallback ke video/mp4
                            break;
                        case '.mp3':
                            messageType = 'audio';
                            mimetype = result.mime || 'audio/mp3'; // Fallback ke audio/mp3
                            break;
                    }

                    const caption = `*MEDIAFIRE DOWNLOADER*\n\n*Nama* : ${filename}\n*Ukuran* : ${result.size}\n*Tipe* : ${mimetype}\n*Link* : ${result.link}`;

                    let messageOptions = {
                        quoted: msg,
                        caption: caption,
                    };

                    let message = {};

                    switch (messageType) {
                        case 'image':
                            message.image = { url: result.link };
                            break;
                        case 'video':
                            message.video = { url: result.link };
                            break;
                        case 'audio':
                            message.audio = { url: result.link, mimetype: mimetype };
                            messageOptions.ptt = false; // Set ke false untuk mengirim sebagai audio, bukan voice note
                            break;
                        default:
                            message.document = { url: result.link };
                            messageOptions.fileName = filename;
                            messageOptions.mimetype = mimetype;
                            break;
                    }

                    await conn.sendMessage(chatId, message, messageOptions);

                    // Hapus reaksi "⏳" dan tambahkan reaksi "✅" (centang) untuk menunjukkan keberhasilan
                    await conn.sendMessage(chatId, { react: { text: '✅', key: msg.key } });
                } else {
                    await conn.sendMessage(chatId, { text: 'Gagal mendapatkan informasi file dari MediaFire atau terjadi kesalahan saat memproses.' }, { quoted: msg });
                    // Tambahkan reaksi "❌" (silang) untuk menunjukkan kegagalan
                    await conn.sendMessage(chatId, { react: { text: '❌', key: msg.key } });
                }
            } catch (error) {
                console.error('Error in MediaFire plugin:', error);
                await conn.sendMessage(chatId, { text: 'Terjadi kesalahan dalam plugin MediaFire.' }, { quoted: msg });
                // Tambahkan reaksi "❌" (silang) untuk menunjukkan kegagalan
                await conn.sendMessage(chatId, { react: { text: '❌', key: msg.key } });
            }
        } catch (error) {
            console.error('Error in MediaFire plugin:', error);
            await conn.sendMessage(chatId, { text: 'Terjadi kesalahan dalam plugin MediaFire.' }, { quoted: msg });
            // Tambahkan reaksi "❌" (silang) untuk menunjukkan kegagalan
            await conn.sendMessage(chatId, { react: { text: '❌', key: msg.key } });
        }
    }
};

// Fungsi sederhana untuk validasi URL MediaFire
function isValidMediaFireUrl(url) {
    return url.includes('mediafire.com');
}
