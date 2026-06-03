let handler = async (m, { conn }) => {

  const testo = `*minchia scusa!!! dimmi di cosa hai bisogno che ti aiuto compà*`;

  await conn.sendMessage(
    m.chat,
    {
      text: testo
    },
    { quoted: m }
  );
};

handler.help = ['bot sono riley'];
handler.tags = ['giochi'];
handler.command = ['bot sono riley'];

export default handler;