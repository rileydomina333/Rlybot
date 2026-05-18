let handler = async (m, { conn }) => {

  const testo = `*lui è luka,quello che me lo suka. è mio fratello e ogni notte ci facciamo le peggio canne,ha l'ombelico e i capezzoli pelosi e mi piace leccarglieli con la panna sopra.*`;

  await conn.sendMessage(
    m.chat,
    {
      text: testo
    },
    { quoted: m }
  );
};

handler.help = ['luka'];
handler.tags = ['giochi'];
handler.command = ['luka'];

export default handler;
