const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const { writeExifImg } = require('../../toolkit/exif');
const { upUguu, genMemeBuf } = require('../../toolkit/scrape/smeme');
const fs = require('fs');

module.exports = {
    name: 'smeme',
    command: ['smeme', 'stickermeme'],
    tags: 'Maker Menu',
    desc: 'Membuat stiker meme dari gambar dengan teks atas dan bawah.',
    prefix: true,

    run: async (conn, msg, {
        chatInfo,
        textMessage,
        prefix,
        commandText,
        args
    }) => {
        try {
            const { chatId, pushName } = chatInfo;
            const quotedMessage = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const mediaMsg = quotedMessage || msg.message;

            const isImage =
                (quotedMessage?.imageMessage || quotedMessage?.stickerMessage ||
                    (quotedMessage?.documentMessage?.mimetype || '').startsWith('image/')) ||
                (msg.message?.imageMessage || msg.message?.stickerMessage ||
                    (msg.message?.documentMessage?.mimetype || '').startsWith('image/'));

            if (!isImage) {
                return conn.sendMessage(chatId, {
                    text: `❗ Balas gambar/stiker atau kirim gambar dengan caption:\n*${prefix}${commandText} [teks_atas | teks_bawah]*\nContoh: *${prefix}${commandText} halo | sayang* atau *${prefix}${commandText} halo |*`
                }, { quoted: msg });
            }

            const text = args.join(' ');
            if (!text) {
                return conn.sendMessage(chatId, {
                    text: `❗ Masukkan teks untuk meme dengan format:\n*${prefix}${commandText} [teks_atas | teks_bawah]*\nContoh: *${prefix}${commandText} halo | sayang* atau *${prefix}${commandText} halo |*`
                }, { quoted: msg });
            }

            let [atas, bawah] = text.split('|').map(str => str.trim());

             atas = atas || ' ';
             bawah = bawah || ' ';

            const mediaBuffer = await downloadMediaMessage({ message: mediaMsg }, 'buffer', {});
            if (!mediaBuffer) throw new Error('Gagal mengunduh media!');

            const imageUrl = await upUguu(mediaBuffer, `smeme.jpg`, 'image/jpeg');
            if (!imageUrl) throw new Error('Gagal upload gambar ke hosting!');

            const memeBuffer = await genMemeBuf(imageUrl, atas, bawah);
            if (!Buffer.isBuffer(memeBuffer)) throw new Error('Format gambar meme tidak valid.');

            const stickerPath = await writeExifImg(memeBuffer, {
                packname: ``,
                author: `Stiff Totemo`
            });

            const stickerBuffer = fs.readFileSync(stickerPath);
            await conn.sendMessage(chatId, { sticker: stickerBuffer }, { quoted: msg });

        } catch (err) {
            console.error('❌ smeme error:', err);
            conn.sendMessage(chatInfo.chatId, {
                text: `❌ Gagal membuat meme:\n${err.message}`
            }, { quoted: msg });
        }
    }
};
