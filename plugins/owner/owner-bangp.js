let handler = async (m) => {
    const allowedNumber = '25776236110@s.whatsapp.net'; // Sostituisci con il numero autorizzato

    if (m.sender !== allowedNumber) {
        await m.reply('Non hai il permesso di usare questo comando!');
        return;
    }

    global.db.data.chats[m.chat].isBanned = true;
    m.reply('il bot si è addormentato 💤');
};

handler.help = ['bangp'];
handler.tags = ['owner'];
handler.command = /^bangp|off$/i;
handler.rowner = true;
export default handler;
