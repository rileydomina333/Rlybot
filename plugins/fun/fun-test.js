let handler = async (m, { conn }) => {
  const message = `qualcuno ha nominato il mio padrone Riley!.`;

  await conn.sendMessage(m.chat, { text: message }, { quoted: m });
};

handler.help = ['riley'];
handler.tags = ['giochi'];

// Questa regex rileva "riley" ovunque nel messaggio, ignorando maiuscole/minuscole
handler.customPrefix = /riley/i; 
handler.command = new RegExp; // Sovrascrive il comando standard per usare il prefisso personalizzato

export default handler;