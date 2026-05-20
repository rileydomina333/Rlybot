let handler = async (m, { conn }) => {

  const testo = `*killer boy è il fratello scafazzato di Riley, sono due palermitani che fanno sempre bordello nei gruppi e nelle chiamate mettiamo tutte le ragazze a 90. è fresco,bono e dategliela perché appena cambiate idea ve la stricate nel muro.*`;

  await conn.sendMessage(
    m.chat,
    {
      text: testo
    },
    { quoted: m }
  );
};

handler.help = ['killerboy'];
handler.tags = ['giochi'];
handler.command = ['killerboy'];

export default handler;
