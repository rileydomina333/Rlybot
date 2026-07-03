import gTTS from 'gtts'

let handler = async (m, { conn, text }) => {
    if (!text) return m.reply('Scrivi: .audio test')
    
    try {
        const gtts = new gTTS(text, 'it')
        const stream = gtts.stream()
        
        let buffers = []
        stream.on('data', (chunk) => buffers.push(chunk))
        stream.on('end', async () => {
            await conn.sendMessage(m.chat, { 
                audio: Buffer.concat(buffers), 
                ptt: true 
            }, { quoted: m })
        })
        stream.on('error', (err) => {
            m.reply(`ERRORE FILE: ${err.code}\n${err.message}`)
            console.log('ERRORE COMPLETO:', err)
        })
    } catch (e) {
        m.reply(`CRASH: ${e.code}\n${e.message}`)
        console.log('CRASH COMPLETO:', e)
    }
}

handler.command = /^vocebot$/i
export default handler