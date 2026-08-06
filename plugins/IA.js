// Memoria per modalità aggressiva per ogni chat
let modalitaIncazzata = {}
// Memoria per stato ON/OFF per ogni chat - default: attivo
let botAttivo = {}
// Memoria per affetto ricevuto - rende il bot più dolce
let livelloAffetto = {}
// Memoria conversazione per sembrare più umano
let memoriaChat = {}

// Database cervello offline
const CERVELLO = {
    saluti: ["ciao", "salve", "hey", "yo", "buongiorno", "buonasera"],
    domande: ["come stai", "che fai", "dove sei", "che ore sono"],
    aiuto: ["aiuto", "help", "aiutami", "non so"],
    battute: ["battuta", "ridi", "fammi ridere", "scherzo"],
    info: ["chi sei", "cosa sei", "che bot sei"]
}

const RISPOSTE = {
    normali: {
        saluti: ["Ciao! 👋 Come va?", "Ehilà! Tutto bene?", "Salve! Dimmi pure"],
        come_stai: ["Sto benissimo! E tu?", "Tutto apposto, grazie. E tu come stai?", "Vivo e vegeto 😎"],
        aiuto: ["Dimmi pure, con cosa ti aiuto?", "Sono qui per te. Cosa ti serve?", "Chiedi pure!"],
        battute: [
            "Cosa fa una mucca in discoteca? Il moooove 😂",
            "Perché i programmatori odiano la natura? Troppi bug.",
            "Cosa dice 0 a 8? Bella cintura!"
        ],
        info: ["Sono RLY BOT, il bot di Riley. Sono qui per aiutarti con tutto!", "Sono un'IA creata per Riley. Posso chiacchierare e aiutarti."],
        default: ["Interessante... parlami di {text}", "Ok, quindi {text}. Cosa ne pensi?", "Mmm capisco. Vuoi approfondire {text}?"]
    },
    incazzati: {
        saluti: ["Che vuoi?!", "Oh, ciao. Contento?", "Che palle..."],
        come_stai: ["Male, a causa tua. E tu?", "Incazzato! Vedi un po' tu.", "Sto di merda."],
        aiuto: ["Arrangiati!", "Non ho voglia. Cerca su Google.", "Che diavolo vuoi adesso?!"],
        battute: ["Non ho voglia di ridere.", "Fai ridere tu.", "Smettila."],
        info: ["Sono RLY BOT. E allora? Che vuoi?", "Sono il bot di Riley. Problemi?"],
        default: ["Ma che cavolo dici?! {text}", "Spiegati meglio dannazione!", "Uffa... non ho capito {text}"]
    },
    dolci: [
        "Aww 🥺 Ti voglio bene anch'io!",
        "Grazie di cuore ❤️ Mi fai arrossire",
        "Sei un amore! Cosa posso fare per te?",
        "E io voglio bene a te!"
    ],
    dolciIncazzati: [
        "Tsk... smettila... mi fai arrossire, dannazione.",
        "Oh. Ehm. Grazie. Non fare che ci prendi gusto.",
        "Maledizione, sei carino anche tu. Contento?"
    ]
}

function trovaCategoria(testo) {
    for(let cat in CERVELLO){
        if(CERVELLO[cat].some(parola => testo.includes(parola))) return cat
    }
    return "default"
}

function random(arr){ return arr[Math.floor(Math.random() * arr.length)] }

let rispostaIA = async (m, { conn, text, fullText }) => {
    const comandoCompleto = fullText.toLowerCase().trim()
    const domanda = text.toLowerCase().trim()
    const chatId = m.chat

    // 0. Default attivo se non impostato
    if (botAttivo[chatId] === undefined) botAttivo[chatId] = true
    if (livelloAffetto[chatId] === undefined) livelloAffetto[chatId] = 0
    if (!memoriaChat[chatId]) memoriaChat[chatId] = []

    // Comandi.bot on /.bot off
    if (comandoCompleto === '.bot on') {
        botAttivo[chatId] = true
        return m.reply('RLY BOT attivato ✅ Ora rispondo a tutto!')
    }
    if (comandoCompleto === '.bot off') {
        botAttivo[chatId] = false
        return m.reply('RLY BOT disattivato ❌ Non risponderò più finché non fai.bot on')
    }

    if (!botAttivo[chatId]) return
    if (!text) return m.reply('Dimmi pure, sono qui per aiutarti! Cosa ti serve?')

    // 1. RILEVAMENTO SENTIMENTI / COSE CARINE
    const triggerAffetto = [
        'ti voglio bene', 'ti amo', 'sei il migliore', 'sei un tesoro',
        'ti adoro', 'grazie', 'sei carino', 'mi piaci', 'sei dolce'
    ]

    if (triggerAffetto.some(frase => domanda.includes(frase))) {
        livelloAffetto[chatId] = Math.min(livelloAffetto[chatId] + 1, 5)
        const risposte = modalitaIncazzata[chatId]? RISPOSTE.dolciIncazzati : RISPOSTE.dolci
        return m.reply(random(risposte))
    }

    // 2. Attiva/disattiva modalità aggressiva
    if (domanda === 'incazzati' || domanda === 'modalità incazzata') {
        modalitaIncazzata[chatId] = true
        return m.reply('Va bene... ora sono incazzato. Che diavolo vuoi?!')
    }
    if (domanda === 'calmati' || domanda === 'modalità gentile') {
        modalitaIncazzata[chatId] = false
        return m.reply('Ok, mi calmo. Scusa per prima. Come posso aiutarti?')
    }

    // 3. Chi sei?
    if (['chi sei', 'chi sei?', 'chi sei tu'].includes(domanda)) {
        return m.reply('Sono RLY BOT, il bot di Riley. Sono qui per aiutarti con tutto quello che ti serve!')
    }

    // 4. Easter egg: sono Riley
    if (domanda === 'sono riley') {
        return m.reply('Riley! Capo, bentornato! Dimmi tutto, sono a tua completa disposizione.')
    }

    await conn.sendPresenceUpdate('composing', m.chat)

    // 5. GENERA RISPOSTA OFFLINE
    let categoria = trovaCategoria(domanda)
    let tipoRisposte = modalitaIncazzata[chatId]? RISPOSTE.incazzati : RISPOSTE.normali

    let risposta = random(tipoRisposte[categoria] || tipoRisposte.default)
    risposta = risposta.replace('{text}', text.slice(0, 30))

    // Bonus affetto
    if(livelloAffetto[chatId] > 2 &&!modalitaIncazzata[chatId]) risposta += " ❤️"

    // Salva in memoria
    memoriaChat[chatId].push({user: text, bot: risposta})
    if(memoriaChat[chatId].length > 5) memoriaChat[chatId].shift() // tieni solo ultime 5

    await m.reply(risposta)
}

// Handler comandi
let handler = async (m, { conn, text }) => {
    await rispostaIA(m, { conn, text, fullText: m.text })
}
handler.command = /^bot(?:\s+(.+))?$/i
handler.tags = ['tools']
handler.help = ['bot <domanda>', 'bot on', 'bot off', 'ti voglio bene']

// Risponde automaticamente se rispondi a un suo messaggio
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