let handler = async (m, { conn }) => {

  const testo = `🐔*CIAO PLEBEO!*🦃
*SONO IL 🤖BOTTAZZO PAZZO🤖 FATTO DA RILEY,IL MIO PADRONE. SPAMMA DI COMANDI E TI NUKKO ANCHE IL BUCO DEL CULO COL CAZZO DI RILEY.*`;

  await conn.sendMessage(
    m.chat,
    {
      text: testo
    },
    { quoted: m }
  );
};

handler.help = ['bottazzo'];
handler.tags = ['giochi'];
handler.command = ['bottazzo'];

export default handler;
