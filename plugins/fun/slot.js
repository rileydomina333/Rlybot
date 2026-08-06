import fetch from 'node-fetch'

// MEMORIE GLOBALI
let modalitaIncazzata = {}
let botAttivo = {}
let livelloAffetto = {}
let bancaUtenti = {} // banca unica per roulette e slot

// DATI ROULETTE
const ROSSI = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]
function getColore(num) {
    if(num === 0) return 'verde'
    return ROSSI.includes(num)? 'rosso' : 'nero'
}

// DATI SLOT
const SIMBOLI = ['🍒', '🍋', '🍊', '⭐', '💎', '7️⃣']
const VALORI_SLOT = {'🍒':3, '🍋':4, '🍊':5, '⭐':15, '💎':25, '7️⃣':100}

let handler = async (m, { conn, command, text }) => {
    const chatId = m.chat
    const sender = m.sender
    const nome = m.pushName || 'Giocatore'

    if (botAttivo[chatId] === undefined) botAttivo[chatId] = true
    if (livelloAffetto[chatId] === undefined) livelloAffetto[chatId] = 0
    if (!bancaUtenti[sender]) bancaUtenti[sender] = 1000

    const args = text.trim().split(' ')

    // ==========.ROULETTE ==========
    if(command === 'roulette'){
        if(args[0] === 'saldo'){
            return m.reply(`💰 *${nome}* hai: *${bancaUtenti[sender]}* crediti`)
        }

        const scelta = args[0]?.toLowerCase()
        const puntata = parseInt(args[1])

        if(!scelta ||!puntata){
            return m.reply(`🎰 *RLY ROULETTE*\n\nCrediti: *${bancaUtenti[sender]}* 💰\n\n\`.roulette rosso 50\`\n\`.roulette 17 50\`\n\`.roulette 1-12 50\`\n\`.roulette saldo\`\n\nVincite: Numero x36 | Rosso/Nero x2 | Dozzina x3`)
        }
        if(puntata < 10) return m.reply('Min puntata: 10')
        if(puntata > bancaUtenti[sender]) return m.reply(`Non hai abbastanza crediti. Hai ${bancaUtenti[sender]}`)

        bancaUtenti[sender] -= puntata
        await conn.sendPresenceUpdate('composing', m.chat)
        await m.reply('🎰 La ruota gira...')
        await new Promise(r => setTimeout(r, 2000))

        const numero = Math.floor(Math.random() * 37)
        const colore = getColore(numero)
        let vincita = 0

        if(scelta === colore) vincita = puntata * 2
        if(scelta === 'pari' && numero!==0 && numero%2===0) vincita = puntata * 2
        if(scelta === 'dispari' && numero%2===1) vincita = puntata * 2
        if(scelta === '1-12' && numero>=1 && numero<=12) vincita = puntata * 3
        if(scelta === '13-24' && numero>=13 && numero<=24) vincita = puntata * 3
        if(scelta === '25-36' && numero>=25 && numero<=36) vincita = puntata * 3
        if(parseInt(scelta) === numero) vincita = puntata * 36

        bancaUtenti[sender] += vincita
        const emoji = colore==='rosso'?'🔴':colore==='nero'?'⚫':'🟢'

        let msg = `*RLY ROULETTE*\n\n${emoji} USCITO: *${numero}* ${emoji}\nHai puntato ${puntata} su ${scelta}\n`
        msg += vincita>0? `🎉 VINTO: ${vincita} crediti!\n` : `😢 Perso: ${puntata} crediti\n`
        msg += `Saldo: ${bancaUtenti[sender]} 💰`
        return m.reply(msg)
    }

    // ==========.SLOT ==========
    if(command === 'slot'){
        const puntata = parseInt(args[0])

        if(!puntata){
            return m.reply(`🎰 *RLY SLOT*\n\nCrediti: *${bancaUtenti[sender]}* 💰\n\n\`.slot 50\`\n\nVincite:\n3x 7️⃣ = x100 JACKPOT\n3 uguali = x valore\n2 uguali = x2\nMin: 10 Max: 500`)
        }
        if(puntata < 10) return m.reply('Min puntata: 10')
        if(puntata > 500) return m.reply('Max puntata: 500')
        if(puntata > bancaUtenti[sender]) return m.reply(`Non hai abbastanza crediti. Hai ${bancaUtenti[sender]}`)

        bancaUtenti[sender] -= puntata
        await conn.sendPresenceUpdate('composing', m.chat)
        await m.reply('🎰 Girando...')
        await new Promise(r => setTimeout(r, 1500))

        const rulli = [
            SIMBOLI[Math.floor(Math.random() * 6)],
            SIMBOLI[Math.floor(Math.random() * 6)],
            SIMBOLI[Math.floor(Math.random() * 6)]
        ]
        let vincita = 0

        if(rulli[0]===rulli[1] && rulli[1]===rulli[2]){
            vincita = rulli[0]==='7️⃣'? puntata*100 : puntata*VALORI_SLOT[rulli[0]]
        } else if(rulli[0]===rulli[1] || rulli[1]===rulli[2] || rulli[0]===rulli[2]){
            vincita = puntata * 2
        }

        bancaUtenti[sender] += vincita

        let msg = `🎰 *RLY SLOT*\n\n| ${rulli[0]} | ${rulli[1]} | ${rulli[2]} |\nHai puntato: ${puntata}\n`
        msg += vincita>0? `🎉 VINTO: ${vincita} crediti!\n` : `😢 Perso: ${puntata} crediti\n`
        msg += `Saldo: ${bancaUtenti[sender]} 💰`
        return m.reply(msg)
    }
}

handler.command = /^(roulette|slot)$/i
handler.tags = ['game']
handler.help = ['roulette <scelta> <puntata>', 'slot <puntata>']

export default handler