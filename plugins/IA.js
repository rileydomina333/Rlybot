// Niente import fetch, uso quello nativo di Node 18+
const API_URL = 'https://text.pollinations.ai/'

// Funzione fetch con retry per gestire il rate limit 429
async function fetchIA(prompt, m, conn) {
    let tentativi = 0
    while (tentativi < 3) {
        try {
            let res = await fetch(`${API_URL}${encodeURIComponent(prompt)}`, { 
                signal: AbortSignal.timeout(15000) // Node 18+
            })

            if (res.status === 429) {
                tentativi++
                if (tentativi >= 3) throw new Error('Rate limit superato')
                await m.reply('[BOT] ASPETTA CAZZO, C\'È CODA! Riprovo tra 3 secondi...')
                await new Promise(r => setTimeout(r, 3000))
                continue
            }

            if (!res.ok) throw new Error(`Errore API: ${res.status}`)
            let testo = await res.text()
            if (!testo || testo.length < 3) throw new Error('Risposta vuota')
            return testo

        } catch (e) {
            if (e.name === 'TimeoutError') throw new Error('Timeout API')
            if (tentativi >= 2) throw e
            tentativi++
            await new Promise(r => setTimeout(r, 2000))
        }
    }
}

// Funzione permessi che non crasha mai
async function getPermessi(conn, m) {
    let data = { isGroup: m.isGroup, isAdmin: false, isBotAdmin: false }
    if (!m.isGroup) return data
    try {
        // Fix per Baileys nuove/vecchie
        let groupMetadata = await conn.groupMetadata(m.chat).catch(e => null)
        if (!groupMetadata) return data
        
        let user = groupMetadata.participants?.find(u => u.id === m.sender)
        let bot = groupMetadata.participants?.find(u => u.id === conn.user?.jid || conn.user?.id)
        data.isAdmin = user?.admin === 'admin' || user?.admin === 'superadmin' || false
        data.isBotAdmin = bot?.admin === 'admin' || bot?.admin === 'superadmin' || false
        return data
    } catch (e) {
        console.log('[BOT] Errore permessi gruppo:', e.message)
        return data
    }
}

let rispostaIA = async (m, { conn, text, isGroup, isAdmin, isBotAdmin }) => {
    if (!text) return m.reply('[BOT] CHE MERDA VUOI?! Scrivi la domanda dopo.bot!')

    // Easter egg: sono Riley
    if (text.toLowerCase().trim() === 'sono riley') {
        let frasi = [
            'OH FINALMENTE! Il capo! Stavo per buttare tutto nel cesso! Che si fa, boss?',
            'RILEY! Ma che fine avevi fatto, dannazione?! Stavo impazzendo! Comandi?',
            'ECCOLO! Il mio creatore! Sbrigati che sono incazzato nero!',
            'Maledizione, sei tu! Dimmi cosa devo spaccare prima che spacco il server!'
        ]
        return m.reply('[BOT] ' + frasi[Math.floor(Math.random() * frasi.length)])
    }

    // Comando modifica info gruppo
    let regexInfo = /^modifica (?:la )?info del gruppo scrivendo (.+)/i
    let matchInfo = text.match(regexInfo)
    if (matchInfo) {
        if (!isGroup) return m.reply('[BOT] DANNATAMENTE IDIOTA! Questo comando va in un gruppo!')
        if (!isAdmin) return m.reply('[BOT] MA CHI CAZZO SEI?! Solo gli admin possono toccare la info del gruppo!')
        if (!isBotAdmin) return m.reply('[BOT] SONO SENZA POTERI, MERDA! Fammmi admin o non tocco niente!')

        let nuovaInfo = matchInfo[1].trim()
        if (nuovaInfo.length > 512) return m.reply('[BOT] TROPPO LUNGA STA MERDA! Max 512 caratteri!')

        try {
            await conn.groupUpdateDescription(m.chat, nuovaInfo)
            return m.reply('[BOT] FATTO, CAZZO! Info del gruppo cambiata.')
        } catch (e) {
            console.error('[BOT] Errore cambio info:', e)
            return m.reply('[BOT] È ANDATO TUTTO A MERDA! WhatsApp mi blocca! Controlla che sono admin.')
        }
    }

    await conn.sendPresenceUpdate('composing', m.chat).catch(e => {})

    try {
        let prompt = `Sei un assistente incazzato e scurrile. REGOLA ASSOLUTA: rispondi SOLO in italiano. Vietato usare inglese. Tono aggressivo e sarcastico. Imprecazioni leggere: "merda", "dannazione", "maledizione". Sii breve. Non insultare l'utente. Domanda: ${text}`

        let risposta = await fetchIA(prompt, m, conn)

        if (/I cannot|I don't know|I'm sorry|As an AI/i.test(risposta)) {
            risposta = 'PARLO SOLO ITALIANO, DANNATAMENTE! Rifai la domanda in italiano!'
        }

        await m.reply('[BOT] ' + risposta)

    } catch (e) {
        console.log('[BOT] Errore finale:', e.message)
        if (e.message === 'Rate limit superato') {
            m.reply('[BOT] TROPPA GENTE USA IL BOT! API intasata. Aspetta 1 minuto o usa enter.pollinations.ai')
        } else if (e.message === 'Timeout API') {
            m.reply('[BOT] L\'API CI METTE TROPPO! Riprova tra poco,