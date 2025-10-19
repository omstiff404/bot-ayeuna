module.exports = {
    name: 'toqr',
    command: ['toqr', 'qr'],
    tags: 'Tools Menu',
    desc: 'Membuat QRCODE dengan text atau link',
    prefix: true,

    run: async (conn, msg, { chatInfo, prefix, commandText, args }) => {
    const { chatId, pushName } = chatInfo;
    
    await conn.sendMessage(chatId,{ image: { url: 'https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=' + args }, caption: 'Nih Bro' }, { quoted: msg });
    },
};