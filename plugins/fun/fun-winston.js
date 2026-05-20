let handler = async (m, { conn }) => {

  const testo = `*Winston è una puttanaccia economica, è abituata a mangiare sborra e olio con una spruzzata di sale e pepe. Da piccola è caduta dal letto e ha battuto la stesa,poi la notte ha provato una winston e ne ha preso il nome. Però ci vogliamo bene nonostante i suoi ritardi mentali 🥰🥰*`;

  await conn.sendMessage(
    m.chat,
    {
      text: testo
    },
    { quoted: m }
  );
};

handler.help = ['winston'];
handler.tags = ['giochi'];
handler.command = ['winston'];

export default handler;
