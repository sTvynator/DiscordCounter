const Discord = require('discord.js');
const config = require('./config.json');
const client = new Discord.Client();





client.on('ready', () => {
    console.log(`Player count bot online. Client ID: ${client.user.id}`);


    setInterval(() => {
        updateCount();
    }, 60000);

    updateCount();
});




async function updateCount() {

    var total = 0;
    for (i = 0; i < config.Servers.length; i++) {
        total += await queryServer(config.Servers[i]);
    }

    client.user.setActivity(config.BotStatusText.replace('{usersOnline}', total), { type: "PLAYING" });
    console.log(`Count updated to ${total}`);
}



function queryServer(server) {

    var p = new Promise(async (resolve, reject) => {


        var onlineN = 0;

        try {
            const SourceRCONClient = require('source-rcon-client').default,
                sourcercon = new SourceRCONClient(server.IP, parseInt(server.RconPort), server.AdminPassword);

            await sourcercon.connect();
            var response = await sourcercon.send('listplayers');
            sourcercon.disconnect();
            response = response.split('\n');

            var players = [];

            response.forEach(ele => {
                var ele = ele.split(', ');
                var sid = ele.pop().replace(/ /g, '');
                if (sid != '' && sid != 'NoPlayersConnected') players.push(sid);
            })

            onlineN = players.length;


        } catch (err) { console.log(err) } finally {
            resolve(onlineN)
        }




    });

    return p;
}


process
    .on('unhandledRejection', (reason, p) => {
        console.error(reason, 'Unhandled Rejection at Promise');
    })
    .on('uncaughtException', err => {
        console.error(err, 'Uncaught Exception thrown');
    });



client.login(config.BotToken);