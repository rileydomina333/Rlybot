let handler = async (m, { conn }) => {

  const testo = `
*🦠 𝗥𝗟𝗬 𝗗𝗘𝗕𝗨𝗚 𝗪𝗛𝗔𝗧𝗦𝗔𝗣𝗣 𝗦𝗜𝗦𝗧𝗘𝗠 𝗗𝗘𝗦𝗧𝗥𝗢𝗬𝗘𝗥 ⚡

𝗡𝗨𝗞𝗘 𝗩𝟭: .𝗙𝗔𝗧𝗔𝗟𝗜𝗧𝗬
𝗡𝗨𝗞𝗘 𝗩𝟮: .𝗕𝗥𝗨𝗧𝗔𝗟𝗜𝗧𝗬
𝗡𝗨𝗞𝗘 𝗩𝟯: .𝗗𝗜𝗦𝗦𝗢𝗖𝗜𝗔𝗧𝗢

𝗦𝗣𝗔𝗠 𝗩𝟭: .𝗪𝗔𝗞𝗘𝗨𝗣𝗡𝗢𝗪
𝗦𝗣𝗔𝗠 𝗩𝟮: . 𝗚𝗛𝗨𝗚𝗛𝗨𝗚𝗛𝗔𝗚𝗛𝗔
𝗦𝗣𝗔𝗠 𝗩𝟯: .𝗙𝗕𝗜𝗢𝗣𝗘𝗡𝗨𝗣

𝗖𝗥𝗔𝗦𝗛 𝗚𝗥𝗢𝗨𝗣 𝗩𝟭: .𝗿𝗹𝘆𝗯𝗼𝘁𝗱𝗼𝗺𝗶𝗻𝗮

𝘱𝘰𝘸𝘦𝘳 𝘣𝘺 𝘙𝘪𝘭𝘦𝘺 𝘥𝘰𝘮𝘪𝘯𝘢 - 𝘨𝘳𝘰𝘶𝘱 𝘥𝘦𝘴𝘵𝘳𝘰𝘺𝘦𝘳
𝘐𝘎: _𝘙𝘺𝘢𝘯.𝘭𝘪𝘦_
𝘵𝘦𝘭𝘦𝘨𝘳𝘢𝘮: @astenuare;`

  await conn.sendMessage(
    m.chat,
    {
      text: testo
    },
    { quoted: m }
  );
};

handler.help = ['destroyer'];
handler.tags = ['owner'];
handler.command = ['destroyer'];