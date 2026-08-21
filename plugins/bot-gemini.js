let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return conn.reply(m.chat, `Esempio: ${usedPrefix + command} spiegami le black hole 🤖`, m)
    
    await conn.sendMessage(m.chat, {react: { text: '🧠', key: m.key }})
    
    try {
        // Pollinations API legacy - funziona senza key e senza model
        let prompt = encodeURIComponent(text)
        let url = `https://text.pollinations.ai/${prompt}`
        
        let res = await fetch(url)
        let risposta = await res.text()
        
        // Taglia se è troppo lungo per WA
        if(risposta.length > 4000) risposta = risposta.slice(0, 4000) + '...\n\n[Testo tagliato]'
        
        await conn.reply(m.chat, risposta, m)
        
    } catch (e) {
        await conn.reply(m.chat, 'Pollinations è down. Riprova tra 10 sec', m)
        console.log(e)
    }
}

handler.help = ['bot <domanda>']
handler.tags = ['ai']
handler.command = ['bot', 'ai', 'ask']
handler.register = false // pubblico per tutti

export default handler