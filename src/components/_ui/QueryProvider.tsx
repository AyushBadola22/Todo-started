'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode, useState } from 'react';
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools'
import { Button } from '../ui/button';

const queryClient = new QueryClient();
export default function QueryProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <QueryClientProvider client={queryClient}>
            <Button className='mt-16'
                onClick={() => setIsOpen(!isOpen)}
            >{`${isOpen ? 'Close' : 'Open'} the devtools panel`}</Button>
            {isOpen && <ReactQueryDevtoolsPanel onClose={() => setIsOpen(false)} />}

            {children}
        </QueryClientProvider>
    )
}