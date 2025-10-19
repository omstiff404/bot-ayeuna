const axios = require('axios');
const { writeExifImg } = require('../../toolkit/exif');

module.exports = {
  name: 'qc',
  command: ['qc', 'quoted'],
  tags: 'Tools Menu',
  desc: 'Membuat quote dari pesan.',
  prefix: true,

  run: async (conn, msg, {
    chatInfo,
    textMessage,
    args,
    prefix,
    commandText
  }) => {
    const { chatId, senderId, pushName } = chatInfo;

    const colors = {
      pink: "#f68ac9",
      blue: "#6cace4",
      red: "#f44336",
      green: "#4caf50",
      yellow: "#ffeb3b",
      purple: "#9c27b0",
      darkblue: "#0d47a1",
      lightblue: "#03a9f4",
      grey: "#9e9e9e",
      orange: "#ff9800",
      black: "#000000",
      white: "#ffffff",
      teal: "#008080",
      lightred: "#FFC0CB",
      brown: "#A52A2A",
      salmon: "#FFA07A",
      magenta: "#FF00FF",
      tan: "#D2B48C",
      wheat: "#F5DEB3",
      deeppink: "#FF1493",
      fire: "#B22222",
      skyblue: "#00BFFF",
      brightorange: "#FF7F50",
      lightskyblue: "#1E90FF",
      hotpink: "#FF69B4",
      skybluegreen: "#87CEEB",
      seagreen: "#20B2AA",
      darkred: "#8B0000",
      redorange: "#FF4500",
      cyan: "#48D1CC",
      darkpurple: "#BA55D3",
      mossgreen: "#00FF7F",
      darkgreen: "#008000",
      midnightblue: "#191970",
      darkorange: "#FF8C00",
      blackishpurple: "#9400D3",
      fuchsia: "#FF00FF",
      darkmagenta: "#8B008B",
      darkgrey: "#2F4F4F",
      peachpuff: "#FFDAB9",
      darkcrimson: "#DC143C",
      goldenrod: "#DAA520",
      gold: "#FFD700",
      silver: "#C0C0C0"
    };

    if (!args || args.length === 0) {
      return conn.sendMessage(chatId, {
        text: `📌 Contoh: *${prefix}${commandText} halo sayang layla*\n\n🎨 Daftar warna:\n- ${Object.keys(colors).join("\n- ")}`
      }, { quoted: msg });
    }

    const [color, ...quoteWords] = args.join(' ').split(' ');
    const text = colors[color] ? quoteWords.join(' ') : args.join(' ');

    let avatar;
    try {
      avatar = await conn.profilePictureUrl(msg.quoted?.sender || senderId, 'image');
    } catch {
      avatar = 'https://telegra.ph/file/c3f3d2c2548cbefef1604.jpg';
    }

    const json = {
      type: 'quote',
      format: 'png',
      backgroundColor: colors[color] || "#ffffff",
      width: 700,
      height: 580,
      scale: 2,
      messages: [{
        entities: [],
        avatar: true,
        from: {
          id: 1,
          name: pushName,
          photo: { url: avatar }
        },
        text: text,
        'm.replyMessage': {}
      }]
    };

    try {
      const res = await axios.post("https://bot.lyo.su/quote/generate", json, {
        headers: { "Content-Type": "application/json" }
      });

      const buff = Buffer.from(res.data.result.image, 'base64');
      const sticker = await writeExifImg(buff, {
        packname: 'My Layla',
        author: 'Ⓒ' + pushName
      });

      await conn.sendMessage(chatId, { sticker: { url: sticker } }, { quoted: msg });
    } catch (e) {
      console.error(e);
      await conn.sendMessage(chatId, {
        text: '⚠️ Terjadi kesalahan saat membuat sticker quote!'
      }, { quoted: msg });
    }
  }
};