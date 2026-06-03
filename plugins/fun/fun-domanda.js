let handler = async (m, { conn }) => {

  const testo = `*🤖:io penso che devi abusarli e farli piangere tutti,altrimenti ti rolli mezza canna e fumi come un jamaicano in pensione proprio come bob marley.*`;

  await conn.sendMessage(
    m.chat,
    {
      text: testo
    },
    { quoted: m }
  );
};

handler.help = ['bot'];
handler.tags = ['giochi'];
handler.command = ['bot'];

export default handler;