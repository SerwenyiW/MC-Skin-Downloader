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

async function getURLs(username, server) {
    if(server == undefined) return console.log("Nincs ilyen szerver!"), question();
    let chooseSkins = [];
    
    for(let i = 0; i<server.folders.length; i++) {
        if(server.url.includes(".php?")) {
            try {
                let response = await fetch(server.account + username);
                let data = await response.json();
                let validhash = data.data[server.folders[i]].split("hash=")[1] === "" ? data.data[server.folders[i-1]].split("hash=")[1] : data.data[server.folders[i]].split("hash=")[1];
                let skinFolders = data.data[server.folders[i]].split(server.url).join("").split("&").join("").split("hash=")[0];
                chooseSkins.push([`${i + 1}`, skinFolders === "" ? "skin" : skinFolders]);
                chooseDownload(username, server, chooseSkins, validhash, true, i);
            } catch (error) {
                console.error("Hiba történt a fetch kéréssel:", error);
            }
        } else {
            chooseSkins.push([`${i + 1}`, server.folders[i]]);
            chooseDownload(username, server, chooseSkins, "", false, i);
        }
    }
}

function chooseDownload(username, server, chooseSkins, validhash, php, i) {
    let foldersName = {
        "MinecraftBracelet": "Karkötő",
        "MinecraftTails": "Farok",
        "MinecraftTopHat": "Kalap",
        "MinecraftSkins": "Skin",
        "MinecraftWings": "Szárny",
        "head": "Fej",
        "skin": "Skin",
        "cloakSimple": "Köpeny"
    };

    if (i === server.folders.length - 1) {
        for (let chI = 0; chI < chooseSkins.length; chI++) {
            console.log(`${chooseSkins[chI][0]} -> ${foldersName[chooseSkins[chI][1]]}`);
        }
        rl.question(`Miket szeretnél letölteni? Válassz 1-${chooseSkins.length}, használd így ha többet akarsz letölteni: 12345, 253, 12, 1 stb. `, (wdownload) => {
            if (isNaN(wdownload)) {
                console.log("Nem jó adat!");
                question();
                return;
            }
            for (let sz = 0; sz < chooseSkins.length; sz++) {
                if (wdownload.includes(chooseSkins[sz][0])) {
                    if(php) {
                        let link = `${server.url + chooseSkins[sz][1].split("skin")}&hash=${validhash}`;
                        downloadSkins(link, `${chooseSkins[sz][1]}_${username}.png`);
                    } else {
                        let link = `${server.url+chooseSkins[sz][1]}/${username}.png`;
                        downloadSkins(link, `${chooseSkins[sz][1].split("Minecraft")}_${username}.png`);
                    }
                }
            }
        });
    }
}

function downloadSkins(link, filename) {
    if(link.includes("null")) return console.log("Nincs adat!");
    (link.startsWith("https://") ? https : http).get(link, resp => {
        if (resp.statusCode === 404) {
            console.log(`Következőt nem sikerült letölteni: ${link}`);
            return;
        }
        resp.pipe(fs.createWriteStream(filename));
    });
}
