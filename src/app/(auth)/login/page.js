'use client'

import Button from '@/components/Button'
import Input from '@/components/Input'
import InputError from '@/components/InputError'
import Label from '@/components/Label'
import Link from 'next/link'
import { useAuth } from '@/hooks/auth'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AuthSessionStatus from '@/app/(auth)/AuthSessionStatus'

const Login = () => {
    const router = useRouter()

    const { login } = useAuth({
        middleware: 'guest',
        redirectIfAuthenticated: '/dashboard',
    })

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [errors, setErrors] = useState({})
    const [status, setStatus] = useState(null)

    useEffect(() => {
        if (router.reset?.length > 0 && Object.keys(errors).length === 0) {
            setStatus(atob(router.reset))
        } else {
            setStatus(null)
        }
    }, [router, errors])

    const submitForm = async event => {
        event.preventDefault()

        // Create a new FormData object
        const formData = new FormData()
        formData.append('username', username)
        formData.append('password', password)

        login({
            formData,
            setErrors,
            setStatus,
        })
    }

    return (
        <>
            <AuthSessionStatus className="mb-4" status={status} />
            <form onSubmit={submitForm}>
                {/* Username */}
                <div>
                    <Label htmlFor="username">Username (Email)</Label>
                    <Input
                        id="username"
                        type="email"
                        value={username}
                        className="mt-1 block w-full"
                        onChange={event => setUsername(event.target.value)}
                        required
                        autoFocus
                    />
                    <InputError messages={errors?.username} className="mt-2" />{' '}
                    {/* Safe access */}
                </div>

                {/* Password */}
                <div className="mt-4">
                    <Label htmlFor="password">Password</Label>
                    <Input
                        id="password"
                        type="password"
                        value={password}
                        className="mt-1 block w-full"
                        onChange={event => setPassword(event.target.value)}
                        required
                        autoComplete="current-password"
                    />
                    <InputError messages={errors?.password} className="mt-2" />{' '}
                    {/* Safe access */}
                </div>

                <div className="mt-4 flex items-center justify-end">
                    <Link
                        href="/forgot-password"
                        className="text-sm text-gray-600 underline hover:text-gray-900"
                    >
                        Forgot your password?
                    </Link>

                    <Button className="ml-3">Login</Button>
                </div>
            </form>
        </>
    )
}

export default Login
