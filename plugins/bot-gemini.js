let fetch = (await import('node-fetch')).default

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return conn.reply(m.chat, `Esempio: ${usedPrefix + command} raccontami una storia 🤖`, m)
    
    await conn.sendMessage(m.chat, {react: { text: '🧠', key: m.key }})
    
    try {
        // FORZIAMO LA VERSIONE ANONIMA GRATIS
        let prompt = encodeURIComponent(text)
        let url = `https://text.pollinations.ai/${prompt}`
        
        let res = await fetch(url, {
            headers: {
                'User-Agent': 'Rlybot' // a volte serve
            }
        })
        
        if(!res.ok) throw new Error('Pollinations: ' + res.status)
        
        let risposta = await res.text()
        
        if(risposta.length > 4000) risposta = risposta.slice(0, 4000) + '...\n\n[Testo tagliato]'
        
        await conn.reply(m.chat, risposta, m)
        
    } catch (e) {
        await conn.reply(m.chat, 'Pollinations bloccata. Errore: ' + e.message, m)
        console.log(e)
    }
}

handler.help = ['bot <domanda>']
handler.tags = ['ai']
handler.command = ['bot', 'ai', 'ask']
handler.register = false

export default handler