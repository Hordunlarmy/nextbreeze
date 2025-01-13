import { useEffect, useState } from 'react'
import { axios } from '@/lib/axios'
import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

const useEcho = () => {
    const [echoInstance, setEchoInstance] = useState(null)

    useEffect(() => {
        if (typeof window !== 'undefined') {
            // Ensure code runs only on client side
            window.Pusher = Pusher

            // Create the Echo instance
            const echo = new Echo({
                broadcaster: 'reverb',
                key: process.env.NEXT_PUBLIC_REVERB_APP_KEY,
                authorizer: channel => ({
                    authorize: (socketId, callback) => {
                        axios
                            .post('/chats/broadcasting/auth', {
                                socket_id: socketId,
                                channel_name: channel.name,
                            })
                            .then(response => {
                                console.log('Broadcasting Auth Response Data:', response.data)
                                callback(false, response.data)
                            })
                            .catch(error => {
                                console.error('Broadcasting Auth Error:', error.response ? error.response.data : error.message)
                                callback(true, error)
                            })
                    },
                }),
                wsHost: process.env.NEXT_PUBLIC_REVERB_HOST,
                wsPort: process.env.NEXT_PUBLIC_REVERB_PORT,
                wssPort: process.env.NEXT_PUBLIC_REVERB_PORT,
                forceTLS:
                    (process.env.NEXT_PUBLIC_REVERB_SCHEME ?? 'https') ===
                    'https',
                enabledTransports: ['ws', 'wss'],
            })

            setEchoInstance(echo)
        }
    }, [])

    return echoInstance
}

export default useEcho

