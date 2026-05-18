let handler = async (m, { conn }) => {

  const testo = `*Venom, è il padre demone fondatore di riley,lo ha creato aprendo una ferita al petto con una lama bollente,iniettando il suo sangue a riley,ricucendo la ferita con miscele dolorose,creando riley,lo stesso riley che adesso lui teme possa superarlo 💙👑*`;

  await conn.sendMessage(
    m.chat,
    {
      text: testo
    },
    { quoted: m }
  );
};

handler.help = ['venom'];
handler.tags = ['giochi'];
handler.command = ['venom'];

export default handler;
