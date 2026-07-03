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
        let frase = frasi[Math.floor(Math.random() * frasi.length)]
        return m.reply(frase)
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

// Funzione per prendere admin sicura
async function getAdminStatus(conn, m) {
    if (!m.isGroup) return { isAdmin: false, isBotAdmin: false }
    try {
        const groupMetadata = await conn.groupMetadata(m.chat)
        const participants = groupMetadata.participants || []
        const user = participants.find(u => u.id === m.sender)
        const bot = participants.find(u => u.id === conn.user.jid)
        const isAdmin = user?.admin === 'admin' || user?.admin === 'superadmin'
        const isBotAdmin = bot?.admin === 'admin' || bot?.admin === 'superadmin'
        return { isAdmin, isBotAdmin }
    } catch (e) {
        console.error('Errore metadata gruppo:', e)
        return { isAdmin: false, isBotAdmin: false }
    }
}

// 1. Comando normale.bot
let handler = async (m, { conn, text }) => {
    const { isAdmin, isBotAdmin } = await getAdminStatus(conn, m)
    await rispostaIA(m, { conn, text, isGroup: m.isGroup, isAdmin, isBotAdmin })
}
handler.command = /^bot$/i
handler.tags = ['tools']
handler.help = ['bot <domanda>']

// 2. Intercetta SOLO se risponde al bot e il messaggio quotato contiene una domanda
handler.before = async function (m, { conn }) {
    if (m.isBaileys || m.fromMe) return
    if (!m.quoted ||!m.quoted.fromMe) return // Risponde al bot?
    if (!m.text || m.text.startsWith('.')) return // Ignora comandi
    if (m.text.length < 2) return // Ignora messaggi troppo corti tipo "ok"

    // FIX: Controlla che il messaggio quotato sia davvero del bot IA e non un altro comando
    if (!m.quoted.text) return
    const botMessages = ['CHE MERDA VUOI', 'FATTO, CAZZO',