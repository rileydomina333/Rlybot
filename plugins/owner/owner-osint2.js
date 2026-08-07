import axios from 'axios'

// DATABASE SPAM ITALIANO BASE - puoi aggiungere numeri tu
const SPAM_DB = [
    "+390212345678", "+390698765432", "+39055123456" // esempi call center
]

let handler = async (m) => {
    let num = m.text.split(' ')[1]
    if(!num) return m.reply('Esempio:.lookup +393331234567\nDevi mettere +39 davanti')
    if(!num.startsWith('+')) return m.reply('Metti il +39 davanti al numero')

    await m.reply('🔎 Cerco...')

    let txt = `🔎 *RICERCA NUMERO*\n${num}\n\n`
    let trovato = false

    // 1. CHECK DATABASE LOCALE SPAM
    if(SPAM_DB.includes(num)){
        txt += `🚨 *SEGNALATO COME SPAM*\nFonte: Database Locale\n\n`
        trovato = true
    }

    // 2. INFO BASE GRATIS - paese/operatore
    try {
        let {data} = await axios.get(`https://api.apilayer.com/number_verification/validate?number=${num}`, {
            headers: {'apikey': 'demo'} // demo key funziona 100 volte
        })
        if(data.valid){
            txt += `📞 *INFO BASE*\nPaese: ${data.country_name} ${data.country_code}\nOperatore: ${data.carrier || 'Sconosciuto'}\nTipo: ${data.line_type}\nValido: ✅\n\n`
            trovato = true
        }
    } catch {}

    // 3. CHECK SPAM SCORE TELLOWS FREE
    try {
        let {data} = await axios.get(`https://www.tellows.net/api?apikey=FREE&number=${num}&json=1`)
        if(data.spamscore > 0){
            let livello = data.spamscore > 7? 'ALTO RISCHIO' : data.spamscore > 3? 'SOSPESO' : 'BASSO'
            txt += `⚠️ *SPAM SCORE*: ${data.spamscore}/9 - ${livello}\nTipo: ${data.type || 'Sconosciuto'}\n`
            if(data.comments?.[0]) txt += `Commento: ${data.comments[0].comment}\n`
            trovato = true
        }
    } catch {}

    if(!trovato) txt += `Nessuna info trovata. Numero pulito o non presente nei database free`

    txt += `\n\nNota: Per nome/cognome reale serve API a pagamento`
    m.reply(txt)
}

handler.command = /^lookup$/i
export default handler