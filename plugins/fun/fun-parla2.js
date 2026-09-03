const gtts = require('node-gtts');
const fs = require('fs');
const path = require('path');

let handler = async (m, { conn, args, usedPrefix, command }) => {
    let text = args.join(' ');
    if (!text) return m.reply(`*Esempio:* ${usedPrefix + command} ciao come va`);

    if (text.length > 200) return m.reply('Testo troppo lungo, max 200 caratteri.');

    const gTTS = gtts('it'); // lingua italiana, cambia in 'en' per inglese
    const filePath = path.join(__dirname, '../tmp/' + Date.now() + '.mp3');

    try {
        // genera mp3
        await new Promise((resolve, reject) => {
            gTTS.save(filePath, text, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        // manda come audio
        await conn.sendFile(m.chat, filePath, 'parla.mp3', '', m, true, {
            mimetype: 'audio/mpeg',
            ptt: false // metti true se lo vuoi come vocale
        });

        fs.unlinkSync(filePath);
    } catch (e) {
        console.log(e);
        m.reply('Errore nel generare l\'audio.');
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
}

handler.help = ['parla <testo>'];
handler.tags = ['audio'];
handler.command = /^parla$/i;

module.exports = handler;