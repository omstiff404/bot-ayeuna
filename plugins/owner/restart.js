module.exports = {
  name: 'restart',
  command: ['restart', 'rt'],
  tags: 'Owner Menu',
  desc: 'Merestart bot',
  prefix: true,
  owner: false,

  run: async (conn, msg, {
    chatInfo,
    textMessage,
    prefix,
    commandText,
    args
  }) => {
    const { chatId, senderId, isGroup } = chatInfo;
    if (!(await isOwner(module.exports, conn, msg))) return;

    await conn.sendMessage(chatId, { text: "🔄 Bot akan restart dalam 2 detik..." }, { quoted: msg });

    await new Promise(resolve => setTimeout(resolve, 2000));

    process.exit(1);
  }
};