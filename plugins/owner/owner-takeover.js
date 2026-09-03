const message = `TAKEOVER DELAY ⚡
ཱཱཱཱཱཱཱཱཱཱཱཱཱཱཱཱཱཱཱཱཱཱཱཱཱཱཱཱཱཱཱཱཱཱཱཱཱུུུུུུུུུུུུུུུུུུུུུུུུུུུུུུུུུུུུུུ`;

module.exports = {
  name: "takeover",
  description: "Invia il messaggio TAKEOVER DELAY",

  async execute(client, message) {
    await message.channel.send(message);
  }
};