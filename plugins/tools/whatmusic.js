const { whatsmusic } = require('../../toolkit/scrape/whatsmusic.js');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');

module.exports = {
  name: 'whatsmusic',
  command: ['whatmusic'],
  tags: 'Tools Menu',
  desc: 'Mendeteksi lagu dari voice note/audio',
  prefix: true,

  run: async (conn, msg, {
    chatInfo,
    commandText,
    prefix,
    args,
    setting
  }) => {
    try {
      const { chatId } = chatInfo;

      const quotedMessage = msg?.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quotedMessage) {
        return conn.sendMessage(chatId, {
          text: '❌ Reply audio/voice note dengan perintah ini.'
        }, { quoted: msg });
      }

      const audio = quotedMessage.audioMessage || quotedMessage.voiceNoteMessage;
      if (!audio) {
        return conn.sendMessage(chatId, {
          text: '❌ Reply audio/voice note dengan perintah ini.'
        }, { quoted: msg });
      }

      const mediaBuffer = await downloadMediaMessage({
        key: {
          remoteJid: msg.key.remoteJid,
          id: msg.message.extendedTextMessage.contextInfo.stanzaId,
          fromMe: false,
          participant: msg.message.extendedTextMessage.contextInfo.participant,
        },
        message: quotedMessage
      }, 'buffer', {});

      if (!mediaBuffer) {
        return conn.sendMessage(chatId, {
          text: '❌ Gagal mengunduh audio.'
        }, { quoted: msg });
      }

      await conn.sendMessage(chatId, { text: '🔍 Mendeteksi lagu...' }, { quoted: msg });

      const result = await whatsmusic(mediaBuffer, termaiWeb, termaiKey);

      if (result.success) {
        const { title, artists, acrid } = result;
        return conn.sendMessage(chatId, {
          text: `🎵 Lagu Dikenali:\n\n*Judul:* ${title}\n*Artis:* ${artists}\n*ACRID:* ${acrid}`
        }, { quoted: msg });
      } else {
        return conn.sendMessage(chatId, {
          text: `❌ ${result.message}`
        }, { quoted: msg });
      }

    } catch (error) {
      conn.sendMessage(msg.key.remoteJid, {
        text: '⚠️ Terjadi kesalahan saat mendeteksi lagu.'
      }, { quoted: msg });
    }
  },
};