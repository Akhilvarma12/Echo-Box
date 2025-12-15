'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Autoplay from 'embla-carousel-autoplay';
import messages from '@/messages.json';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

export default function Home() {
  return (
    <>
      {/* Main content */}
      <main className="grow flex flex-col items-center justify-center px-4 md:px-24 py-12 bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <section className="text-center mb-8 md:mb-12 max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            Dive into the World of{' '}
            <span className="bg-linear-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Anonymous Feedback
            </span>
          </h1>
          <p className="mt-4 md:mt-6 text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
            True Feedback - Where your identity remains a secret.
          </p>
        </section>
        
        <Button
          asChild
          className="mb-12 bg-blue-600 hover:bg-blue-700 px-8 py-6 text-lg rounded-lg shadow-lg hover:shadow-xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105"
        >
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>

        {/* Carousel for Messages */}
        <Carousel
          plugins={[Autoplay({ delay: 3000 })]}
          className="w-full max-w-lg md:max-w-2xl"
        >
          <CarouselContent>
            {messages.map((message, index) => (
              <CarouselItem key={index} className="p-4">
                <Card className="bg-linear-to-br from-gray-800 to-gray-900 border-gray-700 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
                  <CardHeader>
                    <CardTitle className="text-xl md:text-2xl text-white">{message.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col md:flex-row items-start space-y-2 md:space-y-0 md:space-x-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5 md:w-6 md:h-6 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-300 text-base md:text-lg leading-relaxed">{message.content}</p>
                      <p className="text-sm text-gray-500 mt-2">
                        {message.received}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex  bg-blue-600 hover:bg-blue-700" />
          <CarouselNext className="hidden md:flex  bg-blue-600 hover:bg-blue-700" />
        </Carousel>
      </main>

      {/* Footer */}
      <footer className="text-center p-4 md:p-6 bg-gray-900 border-t border-gray-800 text-white">
        © 2025 Echo-Box. All rights reserved.
      </footer>
    </>
  );
}