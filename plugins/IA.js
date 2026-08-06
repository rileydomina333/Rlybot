// Memorie per chat
let modalitaIncazzata = {}
let botAttivo = {}
let livelloAffetto = {}

// Database di risposte per sembrare "intelligente"
const risposteNormali = [
    "Interessante quello che dici. Dimmi di più 👀",
    "Ci ho pensato e secondo me hai ragione. Cosa ne pensi di...?",
    "Ok, ti spiego: {text} dipende da tanti fattori. Vuoi che approfondisca?",
    "Mmm bella domanda. Da quello che so {text} è così. Ti serve altro?",
    "Capito! Allora ti consiglio di provare con {text}. Funziona sempre."
]

const risposteIncazzate = [
    "Ma che cavolo vuoi?! Spiegati meglio dannazione!",
    "Uffa... non ho voglia. Riformula.",
    "Senti, {text} non è così difficile da capire, merda!",
    "Oh ma la smetti? Chiedi qualcosa di sensato!",
    "Maledizione, sto cercando di aiutarti e tu fai {text}"
]

const risposteDolci = [
    "Aww 🥺 Grazie, mi fai commuovere!",
    "Anche io ti voglio bene ❤️ Cosa posso fare per te?",
    "Sei un tesoro! Dimmi pure, sono qui per te.",
    "Mi hai fatto sorridere! Raccontami altro."
]

let rispostaIA = async (m, { conn, text, fullText }) => {
    const comandoCompleto = fullText.toLowerCase().trim()
    const domanda = text.toLowerCase().trim()
    const chatId = m.chat

    // 0. Default
    if (botAttivo[chatId] === undefined) botAttivo[chatId] = true
    if (livelloAffetto[chatId] === undefined) livelloAffetto[chatId] = 0

    // Comandi on/off
    if (comandoCompleto === '.bot on') {
        botAttivo[chatId] = true
        return m.reply('RLY BOT attivato ✅ Ora rispondo a tutto!')
    }
    if (comandoCompleto === '.bot off') {
        botAttivo[chatId] = false
        return m.reply('RLY BOT disattivato ❌')
    }
    if (!botAttivo[chatId]) return
    if (!text) return m.reply('Dimmi pure, sono qui per aiutarti!')

    // 1. AFFETTO
    const triggerAffetto = ['ti voglio bene', 'ti amo', 'sei il migliore', 'sei un tesoro', 'ti adoro', 'grazie', 'sei carino', 'mi piaci', 'sei dolce']
    if (triggerAffetto.some(frase => domanda.includes(frase))) {
        livelloAffetto[chatId] = Math.min(livelloAffetto[chatId] + 1, 5)
        const risp = modalitaIncazzata[chatId]
           ? ['Tsk... smettila... mi fai arrossire, dannazione.', 'Oh. Ehm. Grazie.']
            : risposteDolci
        return m.reply(risp[Math.floor(Math.random() * risp.length)])
    }

    // 2. Modalità
    if (domanda === 'incazzati' || domanda === 'modalità incazzata') {
        modalitaIncazzata[chatId] = true
        return m.reply('Va bene... ora sono incazzato. Che diavolo vuoi?!')
    }
    if (domanda === 'calmati' || domanda === 'modalità gentile') {
        modalitaIncazzata[chatId] = false
        return m.reply('Ok, mi calmo. Come posso aiutarti?')
    }

    // 3. Chi sei
    if (['chi sei', 'chi sei?'].includes(domanda)) {
        return m.reply('Sono RLY BOT, il bot di Riley. Sono qui per aiutarti!')
    }
    if (domanda === 'sono riley') {
        return m.reply('Riley! Capo, bentornato! Dimmi tutto.')
    }

    // 4. RISPOSTA "IA" OFFLINE
    let base = modalitaIncazzata[chatId]? risposteIncazzate : risposteNormali
    let risposta = base[Math.floor(Math.random() * base.length)]

    // Inserisce la domanda nella risposta per sembrare più reale
    risposta = risposta.replace('{text}', text.substring(0, 30))

    // Se ha ricevuto affetto, aggiunge tono dolce
    if(livelloAffetto[chatId] > 2 &&!modalitaIncazzata[chatId]){
        risposta += " ❤️"
    }

    await m.reply(risposta)
}

let handler = async (m, { conn, text }) => {
    await rispostaIA(m, { conn, text, fullText: m.text })
}
handler.command = /^bot(?:\s+(.+))?$/i
handler.tags = ['tools']
handler.help = ['bot <domanda>', 'bot on', 'bot off']

handler.before = async function (m, { conn }) {
    if (m.isBaileys) return
    if (m.fromMe) return
    const chatId = m.chat
    if (botAttivo[chatId] === false) return
    if (m.quoted && m.quoted.fromMe && m.text &&!m.text.startsWith('.')) {
        await rispostaIA(m, { conn, text: m.text, fullText: m.text })
    }
}

export default handler