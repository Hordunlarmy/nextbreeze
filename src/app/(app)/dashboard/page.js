'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/auth'
import { axios } from '@/lib/axios'
import {
    Button,
    Image,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure,
} from '@nextui-org/react'
import Header from '@/app/(app)/Header'
import ChatIcon from '@/components/ChatIcon'
import useEcho from '@/hooks/echo'

const Dashboard = () => {
    const { user } = useAuth({ middleware: 'auth' })
    const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure()

    const [receiver, setReceiver] = useState(null)
    const [messageTo, setMessageTo] = useState(null)
    const [message, setMessage] = useState('')
    const [isSending, setIsSending] = useState(false)
    const [team, setTeam] = useState([])
    const [messages, setMessages] = useState([]) // Add state to store messages

    const echo = useEcho()

    useEffect(() => {
        if (user?.email_verified === true)
            axios.get('/users').then(res => {
                setTeam(res.data)
            })
    }, [user])

    const composeMessage = member => {
        setMessageTo(member.name)
        setReceiver(member.id)
        subscribeToChannel(user.id, member.id)
        onOpen()
    }

    const subscribeToChannel = (senderId, receiverId) => {
        if (echo) {
            const ids = JSON.stringify([senderId, receiverId].sort())
            const chatId = btoa(ids) // Encode the JSON string to base64

            console.log('Here is the echoInstance: ', echo)
            console.log('Subscribing to chat:', chatId)

            echo.private(`chat.${chatId}`).listen('NewMessage', data => {
                console.log('Message received:', data)
                setMessages(prevMessages => [...prevMessages, data.message]) // Add new message to state
            })
        }
    }

    const sendMessage = receiver => {
        setIsSending(true)

        axios
            .post('/chats/send', {
                receiver_id: receiver,
                message: message,
            })
            .then(res => {
                if (res.status === 200 || res.statusText === 'No Content') {
                    // Reset state after a successful message send
                    setIsSending(false)
                    onClose()
                    setMessage('') // Clear the message input
                } else {
                    // Handle unexpected response
                    console.error('Unexpected response:', res)
                    setIsSending(false)
                }
            })
            .catch(error => {
                // Log error and reset the loading state
                console.error('Error sending message:', error)
                setIsSending(false)
            })
    }

    return (
        <>
            <Header title={`Trend Users! 😎`} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div>
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                            {team.map(member => (
                                <div
                                    key={member.id}
                                    className={`relative flex rounded-lg border-2 border-gray-300 bg-white p-4 shadow-md shadow-gray-300/20 transition duration-700 ease-in-out`}
                                >
                                    <div className="flex w-full flex-col gap-5">
                                        <div className="flex h-full flex-col gap-4">
                                            <Image
                                                alt="Profile picture"
                                                className="w-full object-cover"
                                                height={64}
                                                src={
                                                    `https://ui-avatars.com/api/?size=256&name=` +
                                                    member.full_name
                                                }
                                                width={64}
                                                radius="full"
                                            />

                                            <div className="flex h-full flex-col">
                                                <h3 className="text-lg font-bold">
                                                    {member?.full_name}
                                                </h3>
                                                <h4 className="text-sm text-gray-500">
                                                    {member?.id}
                                                </h4>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between text-sm">
                                            <span className="font-medium text-blue-400">
                                                Tasks Completed
                                            </span>
                                            <span className="font-medium">
                                                <span className="text-xl">
                                                    8
                                                </span>
                                                <span className="text-gray-500">
                                                    /
                                                </span>
                                                <span className="text-gray-500">
                                                    12
                                                </span>
                                            </span>
                                        </div>

                                        <div className="flex w-full">
                                            <Button
                                                className="w-full bg-black py-6 text-white"
                                                size="md"
                                                radius="md"
                                                onClick={() =>
                                                    composeMessage(member)
                                                }
                                            >
                                                <ChatIcon />
                                                Send message
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <Modal
                backdrop="blur"
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                classNames={{
                    body: 'py-6',

                    base: 'border-[#292f46] bg-[#19172c] dark:bg-[#19172c] text-white',
                    header: 'border-b-[1px] border-[#292f46]',
                    footer: 'border-t-[1px] border-[#292f46]',
                    closeButton: 'hover:bg-white/5 active:bg-white/10',
                }}
            >
                <ModalContent>
                    {onClose => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                Send Message
                            </ModalHeader>
                            <ModalBody>
                                <p className="">Send to {messageTo}</p>
                                <textarea
                                    className="rounded-xl bg-gray-800 p-3 outline-none"
                                    rows="5"
                                    placeholder="Compose your message"
                                    onChange={event =>
                                        setMessage(event.target.value)
                                    }
                                />
                                {/* Display the sent message */}
                                {messages.length > 0 && (
                                    <div className="mt-4">
                                        <h4 className="text-sm font-bold">
                                            Sent Messages:
                                        </h4>
                                        <div className="text-gray-400">
                                            {messages.map((msg, index) => (
                                                <p key={index}>{msg}</p>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </ModalBody>
                            <ModalFooter>
                                <Button
                                    color="danger"
                                    variant="light"
                                    onPress={onClose}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    color="primary"
                                    isLoading={isSending ? true : false}
                                    onPress={() => sendMessage(receiver)}
                                >
                                    {isSending ? 'Sending...' : 'Send'}
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    )
}

export default Dashboard
