require("http").createServer((_, res) => res.end('ALL IN ONE')).listen(8080)  

const Discord = require('discord.js')
const { readdirSync } = require('fs');
const { join } = require('path');
const mongoose = require('mongoose');


mongoose.connect(process.env.MONGO_URI, { useUnifiedTopology: true, useNewUrlParser: true });

const client = new Discord.Client({
    intents: ["GUILDS", "GUILD_MESSAGE_REACTIONS", "GUILD_MEMBERS", "GUILD_MESSAGES"],
    partials: ["REACTION", "MESSAGE"]
});
client.owners = ["922120042651451423"]

client.commands = new Discord.Collection();
client.categories = readdirSync(join(__dirname, "./commands"));

readdirSync(join(__dirname, "./events")).forEach(file =>
    client.on(file.split(".")[0], (...args) => require(`./events/${file}`)(client, ...args))
);
for (let i = 0; i < client.categories.length; i++) {
    const commands = readdirSync(join(__dirname, `./commands/${client.categories[i]}`)).filter(file => file.endsWith(".js"));

    for (let j = 0; j < commands.length; j++) {
        const command = require(`./commands/${client.categories[i]}/${commands[j]}`);
        if (!command || !command?.data?.name || typeof (command?.run) !== "function") continue;
        command.category = client.categories[i];
        client.commands.set(command.data.name, command);
    }
    }



client.on('ready',() => {
  console.log(`${client.user.tag}`)
})

client.login(process.env.TOKEN)