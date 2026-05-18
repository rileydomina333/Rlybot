let handler = async (m, { conn }) => {

  const testo = `*andrea sta catanese di merda è una killer di bambini,in videochiamata prende i bambini e li mette sottosopra facendogli arrivare il sangue al cervello per poi prenderglirlo a colpi di martello. ma alla fine è comuqnue sorella di riley anche se lei lo odia🥰🤎*`;

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
