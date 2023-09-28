const { joinVoiceChannel, VoiceConnectionStatus, entersState, getVoiceConnection  } = require('@discordjs/voice');

module.exports = async function join(channel, activeConnections, forceConnection) {
    // if already connected
    const conn = getVoiceConnection(channel.guild.id);
    if(conn && !forceConnection) return conn;

    // insufficient permissions
    if(!channel.joinable) {
        return null;
    }

    // destroy active connection if force
    if(conn && forceConnection) {
        conn.destroy();
    }

    const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
    });

    connection.on(VoiceConnectionStatus.Disconnected, async (oldState, newState) => {
        console.log("Disconnection detected");
        try {
            await Promise.race([
                entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
                entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
            ]);
            // Seems to be reconnecting to a new channel - ignore disconnect
            console.log("Reconnected");
        } catch (error) {
            // Seems to be a real disconnect which SHOULDN'T be recovered from
            console.log("Disconnected");
            connection.destroy();
        }
    });

    connection.on(VoiceConnectionStatus.Destroyed, async (i) => {
        console.log("Conn destroyed ", i);
        if(activeConnections[channel.guild.id]) delete activeConnections[channel.guild.id];
    });

    return connection;
}