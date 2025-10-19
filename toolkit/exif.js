const fs = require('fs');
const os = require('os');
const path = require('path');
const { randomBytes } = require('crypto');
const ffmpeg = require('fluent-ffmpeg');
const webp = require('node-webpmux');
const { exec } = require('child_process');
const axios = require('axios');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const FileType = require('file-type');

const tmpPath = (ext) => path.join(os.tmpdir(), `${randomBytes(6).readUIntLE(0, 6).toString(36)}.${ext}`);

const saveTemp = (data, ext) => {
    const filePath = tmpPath(ext);
    fs.writeFileSync(filePath, data);
    return filePath;
};

const readAndDelete = (filePath) => {
    const data = fs.readFileSync(filePath);
    fs.unlinkSync(filePath);
    return data;
};

async function mediaMessage(msg, filename, attachExtension = true) {
  try {
    const msgContent = msg.message || {};
    const mediaMsg =
      msgContent.imageMessage ||
      msgContent.videoMessage ||
      msgContent.stickerMessage ||
      msgContent.documentMessage ||
      msgContent.audioMessage;

    if (!mediaMsg || !mediaMsg.mimetype) {
      throw new Error("Media tidak valid atau tidak ditemukan.");
    }

    const mime = mediaMsg.mimetype;
    const messageType = mime.split("/")[0];

    const stream = await downloadContentFromMessage(mediaMsg, messageType);
    let buffer = Buffer.from([]);

    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }

    if (!buffer.length) {
      throw new Error("Buffer kosong, media mungkin belum terunduh.");
    }

    const type = await FileType.fromBuffer(buffer);
    const trueFileName = attachExtension ? `${filename}.${type.ext}` : filename;

    fs.writeFileSync(trueFileName, buffer);
    return trueFileName;

  } catch (err) {
    throw new Error(`Gagal mengambil media: ${err.message}`);
  }
}

function imageToWebp(media) {
    return new Promise((resolve, reject) => {
        const input = saveTemp(media, 'jpg');
        const output = tmpPath('webp');

        ffmpeg(input)
            .on('error', reject)
            .on('end', () => resolve(readAndDelete(output)))
            .addOutputOptions([
                "-vcodec", "libwebp",
                "-vf", "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15," +
                "pad=320:320:-1:-1:color=white@0.0,split[a][b];[a]palettegen=reserve_transparent=on:transparency_color=ffffff[p];[b][p]paletteuse"
            ])
            .toFormat("webp")
            .save(output);
    });
}

function videoToWebp(media) {
    return new Promise((resolve, reject) => {
        const input = saveTemp(media, 'mp4');
        const output = tmpPath('webp');

        ffmpeg(input)
            .on('error', reject)
            .on('end', () => resolve(readAndDelete(output)))
            .addOutputOptions([
                "-vcodec", "libwebp",
                "-vf", "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15," +
                "pad=320:320:-1:-1:color=white@0.0,split[a][b];[a]palettegen=reserve_transparent=on:transparency_color=ffffff[p];[b][p]paletteuse",
                "-loop", "0",
                "-ss", "00:00:00",
                "-t", "00:00:05",
                "-preset", "default",
                "-an",
                "-vsync", "0"
            ])
            .toFormat("webp")
            .save(output);
    });
}

async function writeExif(media, metadata, isVideo = false, converted = false) {
    const webpData = converted ? media : await (isVideo ? videoToWebp(media) : imageToWebp(media));
    const input = saveTemp(webpData, 'webp');
    const output = tmpPath('webp');

    if (metadata.packname || metadata.author) {
        const img = new webp.Image();
        const json = {
            "sticker-pack-id": "https://github.com/MaouDabi0",
            "sticker-pack-name": metadata.packname,
            "sticker-pack-publisher": metadata.author,
            "emojis": metadata.categories || [""]
        };

        const exifAttr = Buffer.from([
            0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00,
            0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x16, 0x00, 0x00, 0x00
        ]);

        const jsonBuff = Buffer.from(JSON.stringify(json), "utf-8");
        const exif = Buffer.concat([exifAttr, jsonBuff]);
        exif.writeUIntLE(jsonBuff.length, 14, 4);

        await img.load(input);
        fs.unlinkSync(input);
        img.exif = exif;
        await img.save(output);

        return output;
    }
}

const writeExifImg = (media, metadata, converted) => writeExif(media, metadata, false, converted);
const writeExifVid = (media, metadata, converted) => writeExif(media, metadata, true, converted);

async function generateQuotly(text, name, color = '') {
    try {
        const url = `${global.zellApi}/tools/qc?text=${encodeURIComponent(text)}&name=${encodeURIComponent(name)}&color=${encodeURIComponent(color)}`;
        const { data } = await axios.get(url, { headers: { Accept: 'application/json' }, timeout: 30000 });

        if (!data?.status || !data?.result?.image) {
            throw new Error(data?.message || "Gagal menghasilkan gambar.");
        }

        return Buffer.from(data.result.image, "base64");
    } catch (err) {
        throw new Error(`Gagal membuat kutipan:\n${err.message}`);
    }
}

async function convertToWebp(buffer) {
    return new Promise((resolve, reject) => {
        const input = tmpPath('png');
        const output = tmpPath('webp');

        fs.writeFileSync(input, buffer);

        exec(`ffmpeg -i "${input}" -vf "scale=512:-1:flags=lanczos" -c:v libwebp -lossless 1 -qscale 100 "${output}"`, (err) => {
            fs.unlinkSync(input);
            if (err) {
                fs.existsSync(output) && fs.unlinkSync(output);
                return reject(err);
            }

            try {
                const result = fs.readFileSync(output);
                fs.unlinkSync(output);
                resolve(result);
            } catch (e) {
                reject(e);
            }
        });
    });
}

async function sendImageAsSticker(conn, chatId, webpBuffer, msg) {
    try {
        await conn.sendMessage(chatId, {
            sticker: webpBuffer,
            mimetype: "image/webp",
            packname: "zityaa Chan",
            author: "Quoted Sticker"
        }, { quoted: msg });
    } catch (err) {
        console.error('Error sending sticker:', err);
        throw err;
    }
}

module.exports = {
    writeExifImg,
    writeExifVid,
    generateQuotly,
    convertToWebp,
    sendImageAsSticker,
    mediaMessage
};