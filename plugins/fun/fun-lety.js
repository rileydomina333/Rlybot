let handler = async (m, { conn }) => {

  const testo = `*Lety sta patatina mi odiava e la volevo distruggere però mi ha fatto pena e abbiamo fatto pace,ora è una mia sorellina e ci vogliamo tanto bene,ogni tanto col consenso di luka la stupro,abuso e torturo però mi vuole comunque bene🥰*`;

  await conn.sendMessage(
    m.chat,
    {
      text: testo
    },
    { quoted: m }
  );
};

handler.help = ['lety'];
handler.tags = ['giochi'];
handler.command = ['lety'];

export default handler;
