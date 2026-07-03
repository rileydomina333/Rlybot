import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`Fai una domanda. Es: ${usedPrefix}ia chi ha inventato Linux`)
    
    await conn.sendPresenceUpdate('composing', m.chat)
    
    try {
        // Uso l'API gratuita di g4f - gira su server pubblici, no key
        let res = await fetch(`https://api.brainshop.ai/get?bid=175685&key=5J1tK8j5q5e5t5x5&uid=${m.sender}&msg=${encodeURIComponent(text)}`)
        
        if (!res.ok) throw 'API down'
        
        let data = await res.json()
        let risposta = data.cnt
        
        if (!risposta || risposta.includes('I am unable')) risposta = 'Non ho capito la domanda.'
        
        await m.reply(risposta)
        
    } catch (e) {
        console.log(e)
        await m.reply('Servizio IA offline ora. Riprova tra poco.')
    }
}

handler.command = /^ia$/i
handler.tags = ['tools']
handler.help = ['ia <domanda>']
handler.limit = true

export default handler