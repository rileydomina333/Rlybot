let handler = async (m, { conn }) => {

  const testo = `*ksav è il mio doxxerino hackerino bannerino travazzapper del mio cuore. è un cucciolo e ogni volta abusiamo assieme i down e i pedo. è bono ed è siciliano SCAFAZZATO come me,ogni notte ci facciamo una sega a vicenda e ci scambiamo la sborra facendo i sommelier della sborra.*`;

  await conn.sendMessage(
    m.chat,
    {
      text: testo
    },
    { quoted: m }
  );
};

handler.help = ['andrea'];
handler.tags = ['giochi'];
handler.command = ['andrea'];

export default handler;