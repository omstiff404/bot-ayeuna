const axios = require('axios');

module.exports = {
  name: 'zenosai',
  command: ['zenos'],
  tags: 'Zenos Ai',
  desc: 'Chat dengan AI',
  prefix: false,
  run: async (conn, msg, { chatInfo, args }) => {
    const { chatId } = chatInfo;
    
    // Ambil text dari args (setelah command)
    const text = args.join(' ').trim();

    if (!text)
      return conn.sendMessage(chatId, { 
        text: '⚠️ Masukkan pertanyaan/text setelah command\nContoh: *zenos halo, apa kabar?*' 
      }, { quoted: msg });

    try {
      // Tambahkan reaksi "jam"
      await conn.sendMessage(chatId, { react: { text: '📡, key: msg.key' } });

      // Proses dengan API OpenAI
      const apiUrl = `https://omtiff-api.vercel.app/ai/openai?text=${encodeURIComponent(text)}`;

      const response = await axios.get(apiUrl, {
        timeout: 30000
      });

      // Validasi response
      if (!response.data || !response.data.result) {
        throw new Error('API tidak mengembalikan hasil yang valid');
      }

      const aiResponse = response.data.result;

      // Hapus reaksi "jam" dan kirim hasil
      await conn.sendMessage(chatId, { react: { text: '🗿, key: msg.key' } });
      
      // Kirim response AI
      await conn.sendMessage(chatId, { 
        text: `🤖 ${aiResponse}` 
      }, { quoted: msg });

    } catch (err) {
      console.error('[ERROR] zenosai:', err);
      
      // Hapus reaksi "jam"
      await conn.sendMessage(chatId, { react: { text: '❌', key: msg.key } });
      
      let errorMessage = '❌ Terjadi kesalahan: ';
      if (err.message.includes('timeout')) {
        errorMessage += 'Proses terlalu lama, coba lagi nanti';
      } else if (err.message.includes('network') || err.code === 'ENOTFOUND') {
        errorMessage += 'Gagal terhubung ke server AI';
      } else {
        errorMessage += err.message || 'Gagal memproses permintaan';
      }
      
      return conn.sendMessage(chatId, { text: errorMessage }, { quoted: msg });
    }
  }
};