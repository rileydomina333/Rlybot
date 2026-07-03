import fetch from 'node-fetch'

const API_URL = 'https://text.pollinations.ai/'

// Funzione fetch con retry per gestire il rate limit 429
async function fetchIA(prompt, m) {
    let tentativi = 0
    while (tentativi < 3) {
        try {
            let res = await fetch(`${API_URL}${encodeURIComponent(prompt)}`, { 
                timeout: 15000 
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
            if (tentativi >= 2) throw e
            tentativi++
            await new Promise(r => setTimeout(r, 2000))
        }
    }
}

// Funzione per prendere permessi gruppo senza crashare
async function getPermessi(conn, m) {
    if (!m.isGroup) return { isGroup: false, isAdmin: false, isBotAdmin: false }
    try {
        const groupMetadata = await conn.groupMetadata(m.chat)
        const user = groupMetadata.participants.find(u => u.id === m.sender)
        const bot = groupMetadata.participants.find(u => u.id === conn.user.jid)
        const isAdmin = user?.admin === 'admin' || user?.admin === 'superadmin'
        const isBotAdmin = bot?.admin === 'admin' || bot?.admin === 'superadmin'
        return { isGroup: true, isAdmin, isBotAdmin }
    } catch (e) {
        console.log('Errore permessi gruppo:', e)
        return { isGroup: true, isAdmin: false, isBotAdmin: false }
    }
}

let rispostaIA = async (m, { conn, text, isGroup, isAdmin, isBotAdmin }) => {
    if (!text) return m.reply('[BOT] CHE MERDA VUOI?! Scrivi la domanda dopo.bot o rispondi a un mio messaggio!')

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
        if (nuovaInfo.length > 512) return m.reply('[BOT] TROPPO LUNGA STA MERDA! Max 512 caratteri per la info!')

        try {
            await conn.groupUpdateDescription(m.chat, nuovaInfo)
            return m.reply('[BOT] FATTO, CAZZO! Info del gruppo cambiata. Contento ora?')
        } catch (e) {
            console.error(e)
            return m.reply('[BOT] È ANDATO TUTTO A MERDA! Non riesco a cambiare la info! WhatsApp mi blocca!')
        }
    }

    await conn.sendPresenceUpdate('composing', m.chat)

    try {
        let prompt = `Sei un assistente incazzato e scurrile. REGOLA ASSOLUTA: rispondi SOLO in italiano. Vietato usare inglese. Se la domanda è in inglese, rispondi comunque in italiano dicendo che parli solo italiano. Tono aggressivo e sarcastico. Puoi usare imprecazioni leggere tipo "merda", "dannazione", "maledizione", "che diavolo". Sii breve e brutale. Non usare insulti sessuali, bestemmie, o parolacce verso l'utente. Domanda: ${text}`

        let risposta = await fetchIA(prompt, m)

        // Filtro anti-inglese
        if (/I cannot|I don't know|I'm sorry|As an AI/i.test(risposta)) {
            risposta = 'PARLO SOLO ITALIANO, DANNATAMENTE! Rifai la domanda in italiano o vai a quel paese!'
        }

        await m.reply('[BOT] ' + risposta)

    } catch (e) {
        console.log('Errore bot:', e.message)
        if (e.message === 'Rate limit superato') {
            m.reply('[BOT] TROPPA GENTE USA IL BOT, MANNAGGIA! API intasata. Riprova tra 1 minuto o fatti la key su enter.pollinations.ai')
        } else {
            m.reply('[BOT] È ANDATO TUTTO A MERDA! Il server è morto! MANNAGGIA! Riprova dopo!')
        }
    }
}

// Comando.bot
let handler = async (m, { conn, text }) => {
    let permessi = await getPermessi(conn, m)
    await rispostaIA(m, { conn, text, ...permessi })
}
handler.command = /^bot$/i
handler.tags = ['tools']
handler.help = ['bot <domanda>']

// FIX: Risponde solo ai messaggi quotati che iniziano con [BOT]
handler.before = async function (m, { conn }) {
    if (m.isBaileys || m.fromMe || !m.text) return
    if (m.text.startsWith('.') || m.text.startsWith('!') || m.text.startsWith('#')) return
    
    // Risponde SOLO se quoti un messaggio del bot che ha il tag [BOT]
    if (m.quoted && m.quoted.fromMe && m.quoted.text?.startsWith('[BOT]')) {
        let permessi = await getPermessi(conn, m)
        await rispostaIA(m, { conn, text: m.text, ...permessi })
    }
}

export default handler