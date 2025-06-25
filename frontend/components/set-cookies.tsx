'use client';

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { getUserDetail } from '@/actions/settings';

const SetCookies = () => {
    const { user, isLoaded } = useUser();
    useEffect(() => {
        const fetchToken = async () => {
            if (isLoaded && user) {
                try {
                    const userDetail = await getUserDetail();
                    document.cookie =
                        'user=' + JSON.stringify(userDetail) + '; path=/';
                } catch (error) {
                    console.error('Error fetching token:', error);
                }
            }
        };

        fetchToken();
    }, [isLoaded]);
    return null;
};

export default SetCookies;
