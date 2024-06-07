const readline = require('readline');
const { stdin: input, stdout: output } = require('process');
const rl = readline.createInterface({ input, output });
const https = require('https');
const http = require('http');
const fs = require('fs');

function question() {
    rl.question("Melyik szerver? (MesterMC, FyreMC)", (server)=>{
        rl.question("Felhasználónév?", (username)=>{
            getURLs(username, getServer(server.toLowerCase()));
        });
    });
    
}
question();

function getServer(server) {
    if(server == "mestermc") {
        return {
            folders: ["MinecraftBracelet", "MinecraftTails", "MinecraftTopHat", "MinecraftSkins", "MinecraftWings"],
            url: "http://kinezet.mestermc.hu/",
            account: ""
        }   
    } else if(server == "fyremc") {
        return {
            folders: ["head", "skin", "cloak"],
            url: "https://account.fyremc.hu/skinprev.php?",
            account: "https://account.fyremc.hu/api/player/"
        }
    }
}

function getURLs(username, server) {
    let link = "";
    if(server == undefined) return console.log("Nincs ilyen szerver!"), question();
    for(let i = 0; i<server.folders.length; i++) {
        if(server.url.includes(".php?")) {
            fetch(server.account+username, {method: "GET"})
            .then(response => response.json())
            .then(data => {
                link = data.data[server.folders[i]].includes(toString(data.data[server.folders[i-1]]).split("hash=")[1]) ? data.data[server.folders[i]] : null;
                downloadSkins(link, `${server.folders[i]}_${username}.png`)
            });
        } else {
            link = `${server.url+server.folders[i]}/${username}.png`;
            downloadSkins(link, `${server.folders[i]}_${username}.png`);
        }
    }
}

function downloadSkins(link, filename) {
    if(link == null) return;
    link.startsWith("https://") ? https.get(link, resp =>{
        if(resp.statusMessage == "Not Found") return console.log(`Következőt nem sikerült letölteni: ${link}`);
        resp.pipe(fs.createWriteStream(filename));}) : "";
    link.startsWith("http://") ? http.get(link, resp =>{
        if(resp.statusMessage == "Not Found") return console.log(`Következőt nem sikerült letölteni: ${link}`);
        resp.pipe(fs.createWriteStream(filename));}) : "";
}