const { getAudioUrl } = require('google-tts-api');

let handler = async (m, { conn, args }) => {
    let text = args.join(' ').trim();
    if (!text) return m.reply('Scrivi qualcosa\nEs: .parla ciao bro');

    try {
        // genera link diretto di Google
        const url = getAudioUrl(text, {
            lang: 'it',
            slow: false,
            host: 'https://translate.google.com',
        });

        // manda direttamente il link, senza scaricare nulla
        await conn.sendFile(m.chat, url, 'parla.mp3', '', m, true, {
            mimetype: 'audio/mpeg',
            ptt: false
        });

    } catch (e) {
        console.log(e);
        m.reply('Errore: ' + e.message);
    }
}

handler.help = ['parla'];
handler.tags = ['audio'];
handler.command = /^parla$/i;
module.exports = handler;