let handler = async (m, { conn }) => {

  const testo = `*negro è il negro di Riley,gli fa da spacciatore e gli dà la roba buona,ogni sera fanno cosa a 3 negro,Riley e blud,Riley lo mette dietro,mentre negro sta davanti a succhiargli i capezzoli.*`;

  await conn.sendMessage(
    m.chat,
    {
      text: testo
    },
    { quoted: m }
  );
};

handler.help = ['negro'];
handler.tags = ['giochi'];
handler.command = ['negro'];
