module.exports = {
  name: 'iqc',
  command: ['iqc'],
  tags: 'Maker Menu',
  desc: 'Membuat fake iphone',
  prefix: true,
  run: async (conn, msg, { chatInfo, prefix, args }) => {
    const { chatId, pushName } = chatInfo;
    const inputText = args.join(' '); // Mengambil semua argumen dan menggabungkannya menjadi teks

    // Tambahkan reaksi "🗿"
    conn.sendMessage(chatId, { react: { text: '🗿', key: msg.key }});

    if (!inputText) {
      return conn.sendMessage(chatId, { text: 'Mana Text Nya' }, { quoted: msg });
    }

    const parts = inputText.split('|');
    if (parts.length !== 3) {
      return conn.sendMessage(chatId, { text: 'Format salah. Gunakan |waktu|teks|baterai' }, { quoted: msg });
    }

    const time = parts[0];
    const text = parts[1];
    const batteryPercentage = parts[2];

    if (!time || !text || !batteryPercentage) {
      return conn.sendMessage(chatId, { text: 'Waktu, teks, dan baterai harus diisi' }, { quoted: msg });
    }

    // Validasi format waktu (HH:MM)
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(time)) {
      return conn.sendMessage(chatId, { text: 'Format waktu salah. Gunakan HH:MM (contoh: 12:30)' }, { quoted: msg });
    }

    // Validasi persentase baterai
    const battery = parseInt(batteryPercentage);
    if (isNaN(battery) || battery < 0 || battery > 100) {
      return conn.sendMessage(chatId, { text: 'Persentase baterai harus angka antara 0-100' }, { quoted: msg });
    }

    try {
      // Encoding parameter untuk URL
      const encodedText = encodeURIComponent(text.trim());
      const carrierName = 'INDOSAT';
      const emojiStyle = 'apple';

      // URL API yang baru
      const imageUrl = `https://brat.siputzx.my.id/iphone-quoted?time=${encodeURIComponent(time)}&batteryPercentage=${battery}&carrierName=${carrierName}&messageText=${encodedText}&emojiStyle=${emojiStyle}`;

      // Mengirim gambar
      await conn.sendMessage(
        chatId,
        {
          image: { url: imageUrl },
          caption: 'Nih Kak Fake IPhone nya...',
        },
        { quoted: msg }
      );
    } catch (error) {
      console.error('Error saat membuat gambar:', error);
      conn.sendMessage(
        chatId,
        { text: 'Maaf, terjadi kesalahan saat membuat gambar.' },
        { quoted: msg }
      );
    }
  },
};
