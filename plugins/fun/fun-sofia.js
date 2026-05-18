let handler = async (m, { conn }) => {

  const testo = `*sofia è di riley, è sua moglie ed è una palermitana scafazzata e soprattutto ogni volta che sono assieme in chiamata,riley la fa vomitare per la sua emetofobia. sofia è da 1 anno che sta sotto il cazzo di riley e nessuno lo ha mai capito 🥰*`;

  await conn.sendMessage(
    m.chat,
    {
      text: testo
    },
    { quoted: m }
  );
};

handler.help = ['sofia'];
handler.tags = ['giochi'];
handler.command = ['sofia'];

export default handler;
