let handler = async (m, { conn }) => {

  const testo = `*ritual è il mio communiter del cuore con la quale tradisco sofia ogni notte. ha due tette enormi e due chiappe giganti,ogni notte scopiamo mentre doxxiamo i random facendoli piangere minacciando i pedo.*`;

  await conn.sendMessage(
    m.chat,
    {
      text: testo
    },
    { quoted: m }
  );
};

handler.help = ['ritual'];
handler.tags = ['giochi'];
handler.command = ['ritual'];

export default handler;
