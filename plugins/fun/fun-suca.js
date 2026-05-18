import fs from 'fs'
import path from 'path'

const handler = async (m, { conn }) => {
    // Percorso del file audio
    const audioPath = './media/WA_1779117070756.mp4'

    // Controlla se il file esiste per evitare errori nel bot
    if (!fs.existsSync(audioPath)) {
        return m.reply(`❌ Errore: Il file video non è stato trovato in ${audioPath}`)
    }

    // Invia l'audio
    await conn.sendMessage(m.chat, {
        audio: { url: audioPath },
        mimetype: 'video/mpeg',
        ptt: true // Imposta a false se vuoi che appaia come un file video e non come nota vocale
    }, { quoted: m })
}

handler.help = ['suca']
handler.tags = ['fun']
handler.command = /^suca$/i

export default handler
