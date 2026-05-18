let handler = async (m, { conn }) => {

  const testo = `*dark e deadly,sti due negri froci,girano in coppia irl, drogandosi e bevendo come pazzi senza invitare riley. in comm si conoscono da tanto con riley,nonostante le tante discussioni e i tanti momenti di odio adesso sono i miei fratelli,e un giorno domineremo irl tutti 3 assieme morendo in una vasca piena dk whiskey con le canne accanto.*`;

  await conn.sendMessage(
    m.chat,
    {
      text: testo
    },
    { quoted: m }
  );
};

handler.help = ['dark'|'deadly'];
handler.tags = ['giochi'];
handler.command = ['dark'|'deadly'];

export default handler;
