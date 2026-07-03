import gTTS from 'gtts'

let handler = async (m, { conn, text, usedPrefix }) => {
    if (!text) return m.reply(`Esempio: ${usedPrefix}audio come va`)
    if (text.length > 200) return m.reply('Max 200 caratteri')

    await conn.sendPresenceUpdate('recording', m.chat)

    try {
        const gtts = new gTTS(text, 'it')
        
        // Invece di salvare su file, usiamo lo stream
        let stream = gtts.stream()
        let chunks = []
        
        stream.on('data', (chunk) => chunks.push(chunk))
        
        stream.on('end', async () => {
            let buffer = Buffer.concat(chunks)
            await conn.sendMessage(m.chat, { 
                audio: buffer, 
                mimetype: 'audio/mpeg',
                ptt: true 
            }, { quoted: m })
        })

        stream.on('error', (err) => {
            console.log('ERRORE STREAM GTTS:', err)
            m.reply(`Errore audio: ${err.message}`)
        })

    } catch (e) {
        console.log('ERRORE GENERALE:', e)
        m.reply(`Crash: ${e.message}\nHai fatto npm install gtts?`)
    }
}

handler.command = /^vocebot$/i
export default handler