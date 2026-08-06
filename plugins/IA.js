// Memorie per chat
let modalitaIncazzata = {}
let botAttivo = {}
let livelloAffetto = {}

// Database risposte per keyword
const DB_RISPOSTE = {
    saluti: ["Ciao! 👋", "Ehilà! Come va?", "Salve capo!"],
    come_stai: ["Bene grazie! E tu?", "Tutto a posto. Tu come stai?", "Sto alla grande!"],
    aiuto: ["Dimmi pure, con cosa ti aiuto?", "Sono qui per te. Cosa ti serve?", "Chiedi pure!"],
    battuta: [
        "Cosa fa una mucca in discoteca? Il moooove 😂",
        "Perché i programmatori odiano la natura? Troppe bug.",
        "Cosa dice un tetto a un altro? Ti copro!"
    ],
    meteo: ["Non ho i dati meteo ora, ma qui a Palermo oggi fa caldo 🌞"],
    riley: ["Riley è il capo! Rispetto massimo 👑"],
    grazie: ["Di nulla! ❤️", "Figurati!", "Per questo e altro ci sono."]
}

const RISPOSTE_GENERALI = [
    "Interessante... spiegami meglio",
    "Ci sto pensando... secondo me {text}",
    "Ok ho capito. Vuoi che ti aiuti con {text}?",
    "Mmm bella domanda su {text}",
    "Allora, per quanto riguarda {text} ti dico che..."
]

const RISPOSTE_INCAZZATE = [
    "Che palle! Riformula meglio!",
    "Ma non vedi che sono occupato?! {text}",
    "DANNATAMENTE parla chiaro!",
    "Uffa... e mo che vuoi con {text}?",
    "Smettila o mi incazzo davvero!"
]

function trovaRisposta(testo, incazzato) {
    testo = testo.toLowerCase()

    // Controlla keyword
    if(/ciao|salve|hey|yo/.test(testo)) return random(DB_RISPOSTE.saluti)
    if(/come stai|tutto bene/.test(testo)) return random(DB_RISPOSTE.come_stai)
    if(/aiuto|help|aiutami/.test(testo)) return random(DB_RISPOSTE.aiuto)
    if(/battuta|ridere|ridi/.test(testo)) return random(DB_RISPOSTE.battuta)
    if(/meteo|piove|sole/.test(testo)) return random(DB_RISPOSTE.meteo)
    if(/riley|capo/.test(testo)) return random(DB_RISPOSTE.riley)
    if(/grazie|ty/.test(testo)) return random(DB_RISPOSTE.grazie)

    // Risposta generica
    let base = incazzato? RISPOSTE_INCAZZATE : RISPOSTE_GENERALI
    return random(base).replace('{text}', testo.slice(0,20))
}

function random(arr){ return arr[Math.floor(Math.random() * arr.length)] }

let rispostaIA = async (m, { conn, text, fullText }) => {
    const comandoCompleto = fullText.toLowerCase().trim()
    const domanda = text.toLowerCase().trim()
    const chatId = m.chat

    if (botAttivo[chatId] === undefined) botAttivo[chatId] = true
    if (livelloAffetto[chatId] === undefined) livelloAffetto[chatId] = 0

    // Comandi
    if (comandoCompleto === '.bot on') {
        botAttivo[chatId] = true
        return m.reply('RLY BOT attivato ✅')
    }
    if (comandoCompleto === '.bot off') {
        botAttivo[chatId] = false
        return m.reply('RLY BOT disattivato ❌')
    }
    if (!botAttivo[chatId]) return
    if (!text) return m.reply('Dimmi pure!')

    // AFFETTO
    if (['ti voglio bene','ti amo','sei il migliore','grazie'].some(f => domanda.includes(f))) {
        livelloAffetto[chatId] = Math.min(livelloAffetto[chatId] + 1, 5)
        if(modalitaIncazzata[chatId]) return m.reply('Tsk... smettila... mi fai arrossire.')
        return m.reply(random(["Aww 🥺 Ti voglio bene anch'io!", "Grazie di cuore ❤️", "Sei un amore!"]))
    }

    // MODALITA
    if (domanda === 'incazzati') {
        modalitaIncazzata[chatId] = true
        return m.reply('Va bene... ora sono incazzato. Che vuoi?!')
    }
    if (domanda === 'calmati') {
        modalitaIncazzata[chatId] = false
        return m.reply('Ok mi calmo. Dimmi.')
    }

    // CHI SEI
    if (domanda.includes('chi sei')) return m.reply('Sono RLY BOT di Riley!')
    if (domanda === 'sono riley') return m.reply('Capo! Bentornato!')

    // RISPOSTA
    let risposta = trovaRisposta(text, modalitaIncazzata[chatId])
    if(livelloAffetto[chatId] > 2 &&!modalitaIncazzata[chatId]) risposta += " ❤️"

    await m.reply(risposta)
}

let handler = async (m, { conn, text }) => {
    await rispostaIA(m, { conn, text, fullText: m.text })
}
handler.command = /^bot(?:\s+(.+))?$/i
handler.tags = ['tools']
handler.help = ['bot <domanda>', 'bot on', 'bot off']

handler.before = async function (m, { conn }) {
    if (m.isBaileys || m.fromMe) return
    const chatId = m.chat
    if (botAttivo[chatId] === false) return
    if (m.quoted && m.quoted.fromMe && m.text &&!m.text.startsWith('.')) {
        await rispostaIA(m, { conn, text: m.text, fullText: m.text })
    }
}

export default handler