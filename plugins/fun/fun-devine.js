let handler = async (m, { conn }) => {

  const testo = `*devine sto negro è il re dei larper,ogni notte scopiamo hard mentre mi mostra tool di github dicendomi "ti doxxo" e nel mentre si lascia sfondare da me da dietro. è fin👁️ ma lo voglio bene e lo scopo tutti i giorni*`;

  await conn.sendMessage(
    m.chat,
    {
      text: testo
    },
    { quoted: m }
  );
};

handler.help = ['devine'];
handler.tags = ['giochi'];
handler.command = ['devine'];

export default handler;
