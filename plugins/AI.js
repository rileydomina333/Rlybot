import axios from 'axios'

let handler = async (m) => {
    let text = m.text.slice(4)
    if(!text) return m.reply('Esempio:.ai raccontami una barzelletta')

    m.reply('_RLY AI sta pensando..._')

    // PROVIAMO 3 API FREE IN ORDINE
    let apis = [
        // 1. Pollinations AI - Mistral, gratis e veloce
        async () => {
            let url = `https://text.pollinations.ai/${encodeURIComponent(text)}?model=mistral`
            let {data} = await axios.get(url)
            return data
        },
        // 2. Together AI free tier
        async () => {
            let {data} = await axios.post('https://api.together.xyz/v1/chat/completions', {
                model: "mistralai/Mistral-7B-Instruct-v0.2",
                messages: [{role: "user", content: text}]
            }, {headers: {'Authorization': 'Bearer tk-free'}})
            return data.choices[0].message.content
        },
        // 3. Groq free - Llama3 velocissimo
        async () => {
            let {data} = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
                model: "llama3-8b-8192",
                messages: [{role: "user", content: text}]
            }, {headers: {'Authorization': 'Bearer gsk_free'}})
            return data.choices[0].message.content
        }
    ]

    for(let api of apis){
        try {
            let res = await api()
            if(res && res.length > 3){
                return m.reply(`🤖 *RLY AI*\n\n${res}\n\n_ powered by Mistral/Llama free _`)
            }
        } catch (e) {}
    }
    
    m.reply('Tutte le IA free sono piene ora. Riprova tra 1 minuto')
}

handler.command = /^ai$/i
export default handler