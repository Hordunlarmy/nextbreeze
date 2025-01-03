'use client'

import useSWR from 'swr'
import { axios, setBearerToken } from '@/lib/axios'
import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

export const useAuth = ({ middleware, redirectIfAuthenticated } = {}) => {
    const router = useRouter()
    const params = useParams()

    // Ensure axios always has the token set
    const initializeToken = () => {
        const token = localStorage.getItem('access_token')
        if (token) setBearerToken(token)
    }

    // Function to fetch user data
    const fetchUser = async () => {
        initializeToken()
        const res = await axios.get('/api/v1/users/profile')
        return res.data
    }

    const {
        data: user,
        error,
        mutate,
    } = useSWR(
        () =>
            localStorage.getItem('access_token')
                ? '/api/v1/users/profile'
                : null,
        fetchUser,
        {
            onError: error => {
                if (error.response && error.response.status === 401) {
                    router.push('/login')
                }
            },
        },
    )

    const register = async ({ setErrors, ...props }) => {
        setErrors([])

        try {
            await axios.post('/api/v1/auth/register', props)
            mutate()
        } catch (error) {
            if (error.response.status !== 422) throw error
            setErrors(error.response.data.errors)
        }
    }

    const login = async ({ formData, setErrors, setStatus }) => {
        setErrors([])
        setStatus(null)

        try {
            const res = await axios.post('/api/v1/auth/signin', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
            localStorage.setItem('access_token', res.data.access_token)
            setBearerToken(res.data.access_token)
            mutate()
            router.push('/dashboard')
        } catch (error) {
            if (error.response.status !== 422) throw error
            setErrors(error.response.data.errors)
        }
    }
    const forgotPassword = async ({ setErrors, setStatus, email }) => {
        setErrors([])
        setStatus(null)

        try {
            const response = await axios.post('/api/v1/auth/forgot-password', {
                email,
            })
            setStatus(response.data.status)
        } catch (error) {
            if (error.response.status !== 422) throw error
            setErrors(error.response.data.errors)
        }
    }

    const resetPassword = async ({ setErrors, setStatus, ...props }) => {
        setErrors([])
        setStatus(null)

        try {
            const response = await axios.post('/api/v1/auth/reset-password', {
                token: params.token,
                ...props,
            })
            router.push('/login?reset=' + btoa(response.data.status))
        } catch (error) {
            if (error.response.status !== 422) throw error
            setErrors(error.response.data.errors)
        }
    }

    const resendEmailVerification = async ({ setStatus }) => {
        const response = await axios.post(
            '/api/v1/auth/email/verification-notification',
        )
        setStatus(response.data.status)
    }

    const logout = async () => {
        if (!error) {
            localStorage.removeItem('access_token')
            await axios.post('/api/v1/auth/logout')
            mutate()
        }

        window.location.pathname = '/login'
    }

    useEffect(() => {
        initializeToken()

        if (middleware === 'guest' && redirectIfAuthenticated && user) {
            router.push(redirectIfAuthenticated)
        }
        if (
            window.location.pathname === '/verify-email' &&
            user?.email_verified
        ) {
            router.push(redirectIfAuthenticated)
        }
        if (middleware === 'auth' && error) logout()
    }, [user, error])

    return {
        user,
        register,
        login,
        forgotPassword,
        resetPassword,
        resendEmailVerification,
        logout,
    }
}
