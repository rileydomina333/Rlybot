import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`*Uso:* ${usedPrefix + command} <email>\n\n*Esempio:* ${usedPrefix + command} test@gmail.com`)
    
    // Validazione email base
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(text.trim())) return m.reply('Email non valida, MANNAGGIA!')
    
    let email = text.trim()
    await m.reply('Controllo nei database dei breach pubblici...')
    
    try {
        // API gratis HaveIBeenPwned - endpoint pubblico senza key per breach singoli
        let res = await fetch(`https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(email)}?truncateResponse=false`, {
            headers: {
                'User-Agent': 'WhatsApp-Bot-OSINT'
            }
        })
        
        if (res.status === 404) {
            return m.reply(`✅ *PULITA*\n\nL'email ${email} non risulta in nessun data breach pubblico noto.\n\n_Non significa che sia al 100% sicura, solo che non è nei database di HaveIBeenPwned._`)
        }
        
        if (res.status === 429) {
            return m.reply('Troppe richieste. L\'API ha il rate limit. Riprova tra 10 secondi.')
        }
        
        if (!res.ok) throw `Errore API: ${res.status}`
        
        let breaches = await res.json()
        let lista = breaches.map((b, i) => {
            let data = new Date(b.BreachDate).toLocaleDateString('it-IT')
            let datiCompromessi = b.DataClasses.join(', ')
            return `*${i + 1}. ${b.Name}* - ${data}\nDati coinvolti: ${datiCompromessi}`
        }).join('\n\n')
        
        let txt = `⚠️ *TROVATA IN ${breaches.length} BREACH*\n\n*Email:* ${email}\n\n${lista}\n\n` +
                  `*Che fare:* Cambia subito password su questi siti se usi ancora la stessa.\n` +
                  `_Fonte: haveibeenpwned.com. Non vengono mostrate password o dati privati._`
        
        m.reply(txt)
        
    } catch (e) {
        console.error(e)
        m.reply(`Errore: ${e}. Se dice 401/403, HaveIBeenPwned ha cambiato API e serve la key a pagamento.`)
    }
}

handler.help = ['emailosint <email>']
handler.tags = ['tools', 'osint']
handler.command = ['emailosint', 'breach', 'hacked']
handler.limit = true
handler.register = true

export default handler