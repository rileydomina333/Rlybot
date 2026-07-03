import fetch from 'node-fetch'

let handler = async (m, { conn, text }) => {
    if (!text) return m.reply('Scrivi una domanda dopo .ia')
    
    await conn.sendPresenceUpdate('composing', m.chat)
    
    try {
        let res = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(text)}&format=json&no_html=1&skip_disambig=1`)
        let data = await res.json()
        
        let risposta = data.AbstractText || data.Answer || 'Non ho trovato nulla su questo.'
        if (!risposta.trim()) risposta = 'Prova a riformulare la domanda.'
        
        await m.reply(risposta)
        
    } catch (e) {
        m.reply('DuckDuckGo non risponde. Riprova.')
    }
}

handler.command = /^ia$/i
export default handler