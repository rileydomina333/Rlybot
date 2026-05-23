let handler = async (m, { conn }) => {

  const testo = `*Immortal è l'immortale. colui che ha affrontato il peggio assieme a Riley. marito di melissa. è il leone imbattibile che per anni è stato tenuto con le catene e il guinzaglio,poi si è rotto i coglioni e ha iniziato a dominare, espandendo il suo impero.*`;

  await conn.sendMessage(
    m.chat,
    {
      text: testo
    },
    { quoted: m }
  );
};

handler.help = ['immortal'];
handler.tags = ['giochi'];
handler.command = ['immortal'];

export default handler;