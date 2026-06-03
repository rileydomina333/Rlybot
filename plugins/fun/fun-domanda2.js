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

handler.command = /sonoriley^$/
handler.help = [sonoriley]

export default handler;