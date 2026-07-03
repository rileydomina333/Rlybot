import fetch from 'node-fetch'

let rispostaIA = async (m, { conn, text, isGroup, isAdmin, isBotAdmin }) => {
    if (!text) return m.reply('CHE MERDA VUOI?! Scrivi la domanda dopo.bot o rispondi a un mio messaggio!')

    // Easter egg: sono Riley
    if (text.toLowerCase().trim() === 'sono riley') {
        let frasi = [
            'OH FINALMENTE! Il capo! Stavo per buttare tutto nel cesso! Che si fa, boss?',
            'RILEY! Ma che fine avevi fatto, dannazione?! Stavo impazzendo! Comandi?',
            'ECCOLO! Il mio creatore! Sbrigati che sono incazzato nero!',
            'Maledizione, sei tu! Dimmi cosa devo spaccare prima che spacco il server!'
        ]
        return m.reply(frasi[Math.floor(Math.random() * frasi.length)])
    }

    // Comando modifica info gruppo
    let regexInfo = /^modifica (?:la )?info del gruppo scrivendo (.+)/i
    let matchInfo = text.match(regexInfo)
    if (matchInfo) {
        if (!isGroup) return m.reply('DANNATAMENTE IDIOTA! Questo comando va in un gruppo!')
        if (!isAdmin) return m.reply('MA CHI CAZZO SEI?! Solo gli admin possono toccare la info del gruppo!')
        if (!isBotAdmin) return m.reply('SONO SENZA POTERI, MERDA! Fammmi admin o non tocco niente!')

        let nuovaInfo = matchInfo[1].trim()
        if (nuovaInfo.length > 512) return m.reply('TROPPO LUNGA STA MERDA! Max 512 caratteri per la info!')

        try {
            await conn.groupUpdateDescription(m.chat, nuovaInfo)
            return m.reply('FATTO, CAZZO! Info del gruppo cambiata. Contento ora?')
        } catch (e) {
            console.error(e)
            return m.reply('È ANDATO TUTTO A MERDA! Non riesco a cambiare la info! WhatsApp mi blocca!')
        }
    }

    await conn.sendPresenceUpdate('composing', m.chat)

    try {
        let prompt = `Sei un assistente incazzato e scurrile. REGOLA ASSOLUTA: rispondi SOLO in italiano. Vietato usare inglese. Se la domanda è in inglese, rispondi comunque in italiano dicendo che parli solo italiano. Tono aggressivo e sarcastico. Puoi usare imprecazioni leggere tipo "merda", "dannazione", "maledizione", "che diavolo". Sii breve e brutale. Non usare insulti sessuali, bestemmie, o parolacce verso l'utente. Domanda: ${text}`

        let res = await fetch(`https://text.pollinations.ai/${encodeURIComponent(prompt)}`, {
            timeout: 15000
        })

        let risposta = await res.text()

        if (!risposta || risposta.length < 5) throw 'Risposta vuota'
        if (risposta.includes('I cannot') || risposta.includes("I don't know") || risposta.includes("I'm sorry")) {
            risposta = 'PARLO SOLO ITALIANO, DANNATAMENTE! Rifai la domanda in italiano o vai a quel paese!'
        }

        await m.reply(risposta)

    } catch (e) {
        console.log(e)
        m.reply('È ANDATO TUTTO A MERDA! Il server è morto! MANNAGGIA! Riprova dopo!')
    }
}

// Funzione per prendere permessi senza crashare
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
        console.log('Errore groupMetadata:', e)
        return { isGroup: true, isAdmin: false, isBotAdmin: false }
    }
}

// 1. Comando normale.bot
let handler = async (m, { conn, text }) => {
    let permessi = await getPermessi(conn, m)
    await rispostaIA(m, { conn, text,...permessi })
}
handler.command = /^bot$/i
handler.tags = ['tools']
handler.help = ['bot <domanda>']

// 2. Intercetta le risposte - FIX per non rispondere a caso
handler.before = async function (m, { conn }) {
    if (m.isBaileys || m.fromMe ||!m.text) return
    if (m.text.startsWith('.') || m.text.startsWith('!') || m.text.startsWith('#')) return

    // FIX: Risponde SOLO se il messaggio quotato è del bot E contiene il tag [BOT]
    // Così non rompe le palle su altri messaggi
    if (m.quoted && m.quoted.fromMe && m.quoted.text?.includes('[BOT]')) {
        let permessi = await getPermessi(conn, m)
        await rispostaIA(m, { conn, text: m.text,...permessi })
    }
}

export default handler