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

            const jwtToken = localStorage.getItem('access_token')

            // Create the Echo instance
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
                wsPort: process.env.NEXT_PUBLIC_REVERB_PORT,
                wssPort: process.env.NEXT_PUBLIC_REVERB_PORT,
                forceTLS:
                    (process.env.NEXT_PUBLIC_REVERB_SCHEME ?? 'https') ===
                    'https',
                enabledTransports: ['ws', 'wss'],
            })

            console.log('access_token', jwtToken)

            setEchoInstance(echo)
        }
    }, [])

    return echoInstance
}

export default useEcho
