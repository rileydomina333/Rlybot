import axios from 'axios'
let handler = async (m) => {
    let num = m.text.split(' ')[1]
    if(!num) return m.reply('Esempio:.cerca +393331234567')

    let txt = `🔎 *RICERCA NUMERO*\n${num}\n\n`

    // 1. Cerca su opencnam - solo USA
    try {
        let {data} = await axios.get(`https://api.opencnam.com/v3/phone/${num}?account_sid=FREE`)
        if(data.name) txt += `Nome: ${data.name}\n`
    } catch {}

    // 2. Cerca su tellows - spam score
    try {
        let {data} = await axios.get(`https://www.tellows.net/api?apikey=FREE&number=${num}&json=1`)
        if(data.spamscore > 0) txt += `Spam Score: ${data.spamscore}/9 ⚠️\nCommenti: ${data.comments?.[0]?.comment || 'Nessuno'}\n`
    } catch {}

    txt += `\nNota: Per nome reale serve Truecaller API a pagamento`
    m.reply(txt)
}
handler.command = /^cerca$/i
export default handler