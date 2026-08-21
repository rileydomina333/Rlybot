let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return conn.reply(m.chat, `Esempio: ${usedPrefix + command} cos'è l'universo? 🤖`, m)
    
    await conn.sendMessage(m.chat, {text: 'Sto pensando con Pollinations... 🧠'}, {quoted: m})
    
    try {
        // Pollinations gratis senza API
        let prompt = encodeURIComponent(text)
        let url = `https://text.pollinations.ai/${prompt}?model=llama3.3&referrer=rlybot`
        
        let res = await fetch(url)
        let risposta = await res.text()
        
        await conn.reply(m.chat, risposta, m)
        
    } catch (e) {
        await conn.reply(m.chat, 'Errore. Pollinations è occupata, riprova tra 5 sec', m)
        console.log(e)
    }
}

handler.help = ['bot <domanda>']
handler.tags = ['ai']
handler.command = ['bot', 'ai', 'ask']
handler.register = false // chiunque può usarlo

export default handler