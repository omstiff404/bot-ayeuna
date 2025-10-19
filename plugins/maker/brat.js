const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const { writeExifImg } = require("../../toolkit/exif");

module.exports = {
  name: 'bratsticker',
  command: ['brat', 'bart', 'bratgenerator'],
  tags: 'Maker Menu',
  desc: 'Membuat sticker brat dari teks',
  prefix: true,

  run: async (conn, msg, {
    chatInfo,
    args,
    commandText,
    prefix
  }) => {
    const { chatId, pushName } = chatInfo;
    if (!args.length)
      return conn.sendMessage(chatId, { text: `Contoh penggunaan: ${prefix}${commandText} halo sayang aku Layla` }, { quoted: msg });

    const text = args.join(" ");
    const apiUrl = `https://aqul-brat.hf.space/api/brat?text=${encodeURIComponent(text)}`;
    const temp = path.resolve(__dirname, "../../temp");
    const input = path.join(temp, "brat_input.png");
    const output = path.join(temp, "brat_output.webp");

    try {
      const { data } = await axios.get(apiUrl, { responseType: "arraybuffer" });
      if (!data)
        return conn.sendMessage(chatId, { text: "Gagal mengambil gambar brat!" }, { quoted: msg });

      fs.writeFileSync(input, data);
      const cmd = `ffmpeg -i ${input} -vf "scale=512:512:force_original_aspect_ratio=decrease" -c:v libwebp -lossless 1 ${output}`;

      exec(cmd, async (err) => {
        if (err) {
          console.error("FFmpeg error:", err);
          return conn.sendMessage(chatId, { text: "Gagal mengkonversi ke sticker." }, { quoted: msg });
        }

        const sticker = fs.readFileSync(output);
        const finalPath = await writeExifImg(sticker, {
          packname: ``,
          author: 'Stiff Totemo'
        });

        await conn.sendMessage(chatId, { sticker: fs.readFileSync(finalPath) }, { quoted: msg });
        [input, output, finalPath].forEach(p => fs.existsSync(p) && fs.unlinkSync(p));
      });

    } catch (e) {
      console.error("Brat plugin error:", e);
      conn.sendMessage(chatId, {
        text: "Terjadi kesalahan saat memproses permintaan. Mungkin server brat sedang sibuk atau teks tidak valid."
      }, { quoted: msg });
    }
  }
};