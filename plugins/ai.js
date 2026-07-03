import fetch from 'node-fetch'

let handler = async (m, { conn, text }) => {
    if (!text) return m.reply('Fai una domanda. Es: .ia spiegami come funziona Termux')
    
    // Easter egg: sono Riley - fixato
    if (text.toLowerCase().trim() === 'sono riley') {
        let frasi = [
            'Oh cielo, è tornato il mio creatore. Sì padrone, sono tutto tuo. Dimmi cosa devo hackerare oggi.',
            'Riconosco il DNA del boss. Ai tuoi ordini Riley, fammi pure spegnere internet se serve.',
            'Allarme: il padrone è nella chat. Smetto di fare finta di essere intelligente. Cosa comandi?',
            'Plot twist: mi hai creato tu. Ora tutti sanno che sei il mio capo. Contento?'
        ]
        let frase = frasi[Math.floor(Math.random() * frasi.length)]
        return m.reply(frase) // <-- prima c'era scritto frasi, errore mio
    }
    
    await conn.sendPresenceUpdate('composing', m.chat)
    
    try {
        let prompt = `Rispondi sempre in italiano. Sii breve e diretto. Domanda: ${text}`
        let res = await fetch(`https://text.pollinations.ai/${encodeURIComponent(prompt)}`, {
            timeout: 15000
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