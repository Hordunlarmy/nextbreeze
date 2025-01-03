import { axios } from '@/lib/axios'
import Echo from 'laravel-echo'

import Pusher from 'pusher-js'
window.Pusher = Pusher

const jwtToken = localStorage.getItem('access_token')
const echo = new Echo({
    broadcaster: 'reverb',
    key: process.env.NEXT_PUBLIC_REVERB_APP_KEY,
    authorizer: channel => {
        return {
            authorize: (socketId, callback) => {
                const headers = {
                    Authorization: `Bearer ${jwtToken}`,
                }

                callback(false, {
                    socket_id: socketId,
                    channel_name: channel.name,
                    headers: headers,
                })
            },
        }
    },
    wsHost: process.env.NEXT_PUBLIC_REVERB_HOST,
    wsPort: process.env.NEXT_PUBLIC_REVERB_PORT ?? 80,
    wssPort: process.env.NEXT_PUBLIC_REVERB_PORT ?? 443,
    forceTLS: (process.env.NEXT_PUBLIC_REVERB_SCHEME ?? 'https') === 'https',
    enabledTransports: ['ws', 'wss'],
})

export default echo
