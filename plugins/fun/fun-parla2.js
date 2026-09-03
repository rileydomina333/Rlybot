const { getAudioUrl } = require('google-tts-api');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
ffmpeg.setFfmpegPath(ffmpegPath);

let handler = async (m, { conn, args, usedPrefix, command }) => {
    let text = args.join(' ');
    if (!text) return m.reply(`*Esempio:* ${usedPrefix + command} ciao bro`);
    if (text.length > 200) return m.reply('Max 200 caratteri');

    const tmp = path.join(__dirname, '../tmp');
    if (!fs.existsSync(tmp)) fs.mkdirSync(tmp);
    
    const mp3Path = path.join(tmp, Date.now() + '.mp3');
    const oggPath = path.join(tmp, Date.now() + '.ogg');

    try {
        // 1. prendi url google
        const url = getAudioUrl(text, {
            lang: 'it',
            slow: false,
            host: 'https://translate.google.com',
        });

        // 2. scarica mp3
        const res = await axios({ url, responseType: 'stream' });
        await new Promise((resolve, reject) => {
            const writer = fs.createWriteStream(mp3Path);
            res.data.pipe(writer);
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        // 3. converti mp3 -> ogg opus (obbligatorio per PTT)
        await new Promise((resolve, reject) => {
            ffmpeg(mp3Path)
                .audioCodec('libopus')
                .format('ogg')
                .on('end', resolve)
                .on('error', reject)
                .save(oggPath);
        });

        // 4. manda come vocale
        await conn.sendFile(m.chat, oggPath, 'parla.ogg', '', m, true, {
            mimetype: 'audio/ogg; codecs=opus',
            ptt: true
        });

        fs.unlinkSync(mp3Path);
        fs.unlinkSync(oggPath);

    } catch (e) {
        console.log(e);
        m.reply('Errore audio: ' + e.message);
        if (fs.existsSync(mp3Path)) fs.unlinkSync(mp3Path);
        if (fs.existsSync(oggPath)) fs.unlinkSync(oggPath);
    }
}

handler.help = ['parla <testo>'];
handler.tags = ['audio'];
handler.command = /^parla$/i;

module.exports = handler;