import fetch from 'node-fetch'

let handler = async (m, { conn, text }) => {
    if (!text) return m.reply('Fai una domanda. Es: .ia spiegami come funziona Termux')
    
    await conn.sendPresenceUpdate('composing', m.chat)
    
    try {
        // Forziamo italiano + togliamo timeout corti
        let prompt = `Rispondi sempre in italiano. Sii breve e diretto. Domanda: ${text}`
        let res = await fetch(`https://text.pollinations.ai/${encodeURIComponent(prompt)}`, {
            timeout: 15000 // 15 secondi di timeout
        })
        
        let risposta = await res.text()
        
        if (!risposta || risposta.length < 5) throw 'Risposta vuota'
        if (risposta.includes('I cannot') || risposta.includes("I don't know")) {
            risposta = 'Non ho dati su questo. Prova a chiedere in modo diverso.'
        }
        
        await m.reply(risposta)
        
    } catch (e) {
        console.log(e)
        m.reply('Servizio lento o offline. Riprova tra poco.')
    }
}

handler.command = /^bot$/i
handler.tags = ['tools']
handler.help = ['bot <domanda>']

export default handler