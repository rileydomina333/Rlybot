// Plugin .osint per bot
// Uso: .osint username NomeUtente
//      .osint email test@example.com
//      .osint ip 8.8.8.8
//      .osint dominio esempio.it
//      .osint telefono +391234567890

const axios = require('axios');

const OSINT = {
    name: "osint",
    description: "Raccolta info OSINT da fonti pubbliche",
    usage: ".osint [username|email|ip|dominio|telefono] <valore>",

    async execute(msg, args) {
        if (args.length < 2) {
            return msg.reply(`Uso: ${this.usage}`);
        }

        const tipo = args[0].toLowerCase();
        const valore = args.slice(1).join(" ");

        try {
            switch(tipo) {
                case "username":
                    return await this.checkUsername(msg, valore);
                case "email":
                    return await this.checkEmail(msg, valore);
                case "ip":
                    return await this.checkIP(msg, valore);
                case "dominio":
                case "domain":
                    return await this.checkDomain(msg, valore);
                case "telefono":
                case "phone":
                    return await this.checkPhone(msg, valore);
                default:
                    return msg.reply("Tipo non valido. Usa: username, email, ip, dominio, telefono");
            }
        } catch (err) {
            return msg.reply(`Errore OSINT: ${err.message}`);
        }
    },

    // 1. Ricerca Username su social
    async checkUsername(msg, username) {
        const siti = [
            `https://github.com/${username}`,
            `https://twitter.com/${username}`,
            `https://instagram.com/${username}`,
            `https://tiktok.com/@${username}`,
            `https://youtube.com/@${username}`,
            `https://reddit.com/user/${username}`,
            `https://pinterest.com/${username}`,
        ];

        let risultati = [`*OSINT Username:* ${username}\n`];
        
        for (let url of siti) {
            try {
                const res = await axios.get(url, { validateStatus: false, timeout: 3000 });
                if (res.status === 200) {
                    risultati.push(`✅ Trovato: ${url}`);
                }
            } catch {}
        }
        
        if (risultati.length === 1) risultati.push("❌ Nessun profilo pubblico trovato");
        return msg.reply(risultati.join("\n"));
    },

    // 2. Info Email - breach e dominio
    async checkEmail(msg, email) {
        const dominio = email.split('@')[1];
        let out = [`*OSINT Email:* ${email}\n`];
        
        // Check se dominio esiste
        try {
            const res = await axios.get(`https://dns.google/resolve?name=${dominio}&type=MX`);
            if (res.data.Answer) out.push(`✅ Dominio attivo: ${dominio}`);
        } catch {
            out.push(`❌ Dominio non raggiungibile`);
        }
        
        // Gravatar check
        const crypto = require('crypto');
        const hash = crypto.createHash('md5').update(email.toLowerCase().trim()).digest('hex');
        out.push(`🖼️ Gravatar: https://www.gravatar.com/avatar/${hash}`);
        out.push(`\nNota: per breach check usa HaveIBeenPwned manualmente.`);
        
        return msg.reply(out.join("\n"));
    },

    // 3. Info IP
    async checkIP(msg, ip) {
        const res = await axios.get(`http://ip-api.com/json/${ip}?fields=status,country,regionName,city,isp,org,as,lat,lon,query`);
        if (res.data.status !== "success") return msg.reply("IP non valido");
        
        const d = res.data;
        let out = [
            `*OSINT IP:* ${d.query}`,
            `Paese: ${d.country}`,
            `Città: ${d.city}, ${d.regionName}`,
            `ISP: ${d.isp}`,
            `Org: ${d.org}`,
            `AS: ${d.as}`,
            `Locazione: ${d.lat}, ${d.lon}`,
            `Maps: https://www.google.com/maps?q=${d.lat},${d.lon}`
        ];
        return msg.reply(out.join("\n"));
    },

    // 4. Info Dominio
    async checkDomain(msg, domain) {
        const res = await axios.get(`https://api.domainsdb.info/v1/domains/search?domain=${domain}`);
        let out = [`*OSINT Dominio:* ${domain}\n`];
        
        if (res.data.domains && res.data.domains.length > 0) {
            res.data.domains.slice(0,5).forEach(d => {
                out.push(`- ${d.domain} | Creato: ${d.create_date || 'N/D'}`);
            });
        } else {
            out.push("Nessun risultato trovato");
        }
        
        // Whois semplificato
        out.push(`\nWhois: https://who.is/whois/${domain}`);
        return msg.reply(out.join("\n"));
    },

    // 5. Info Telefono - solo prefisso/paese
    async checkPhone(msg, phone) {
        let out = [`*OSINT Telefono:* ${phone}\n`];
        
        if (phone.startsWith("+39")) out.push("Paese: Italia 🇮🇹");
        else if (phone.startsWith("+1")) out.push("Paese: USA/Canada 🇺🇸");
        else if (phone.startsWith("+44")) out.push("Paese: UK 🇬🇧");
        else out.push("Paese: Sconosciuto");
        
        out.push("\nPer info dettagliate usa: https://www.numverify.com/");
        return msg.reply(out.join("\n"));
    }
};

module.exports = OSINT;