let handler = async (m, { conn }) => {

  const testo = `*NUKE V1: .FATALITY
NUKE V2: .BRUTALITY
NUKE V3: .DISSOCIATO
SPAM V1: .WAKEUPNOW
SPAM V2: .GHUGHUGHAGHA
SPAM V3: .FBIOPENUP*`;

  await conn.sendMessage(
    m.chat,
    {
      text: testo
    },
    { quoted: m }
  );
};

handler.help = ['destroymenu'];
handler.tags = ['giochi'];
handler.command = ['destroymenu'];