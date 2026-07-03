import fetch from 'node-fetch'

export default async function(m, { conn }) {
    // Ignora se non è un messaggio di testo o se è del bot stesso
    if (!m.text || m.key.fromMe) return
    
    const text = m.text.toLowerCase()
    
    // Si attiva solo se scrivi "rileybot" da qualche parte nel messaggio
    if (!text.includes('rileybot')) return
    
    // Easter egg: sono Riley
    if (text.includes('sono riley')) {
        let frasi = [
            'Oh cielo, è tornato il mio creatore. Sì padrone, sono tutto tuo. Dimmi cosa devo hackerare oggi.',
            'Riconosco il DNA del boss. Ai tuoi ordini Riley, fammi pure spegnere internet se serve.',
            'Allarme: il padrone è nella chat. Smetto di fare finta di essere intelligente. Cosa comandi?',
            'Plot twist: mi hai creato tu. Ora tutti sanno che sei il mio capo. Contento?'
        ]
        let frase = frasi[Math.floor(Math.random() * frasi.length)]
        return m.reply(frase)
    }
    
    await conn.sendPresenceUpdate('composing', m.chat)
    
    // Togli "rileybot" dalla domanda prima di mandarla all'IA
    let domanda = m.text.replace(/rileybot/gi, '').trim()
    if (!domanda) return m.reply('Dimmi cosa vuoi, padrone.')
    
    try {
        let prompt = `Rispondi sempre in italiano. Sii breve, diretto e un po' sarcastico. L'utente si chiama Riley. Domanda: ${domanda}`
        let res = await fetch(`https://text.pollinations.ai/${encodeURIComponent(prompt)}`, {
            timeout: 15000
        })
        
        let risposta = await res.text()
        
       