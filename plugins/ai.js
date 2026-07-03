import fetch from 'node-fetch'

let handler = async (m, { conn, text }) => {
    if (!text) return m.reply('Fai una domanda. Es: .ia scrivi una poesia sul mare')
    
    await conn.sendPresenceUpdate('composing', m.chat)
    
    try {
        let res = await fetch(`https://text.pollinations.ai/${encodeURIComponent(text)}`)
        let risposta = await res.text()
        
        if (!risposta || risposta.length < 2) throw 'Vuota'
        
        await m.reply(risposta)
        
    } catch (e) {
        m.reply('Il servizio IA è offline ora. Riprova tra 1 minuto.')
    }
}

handler.command = /^ia$/i
export default handler