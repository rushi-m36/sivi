import React from 'react';
import VideoCard from './VideoCard';

// Temporary mock data for UI visualization of search results
const MOCK_VIDEOS = [
  {
    id: 'dQw4w9WgXcQ',
    title: 'Rick Astley - Never Gonna Give You Up (Official Music Video)',
    thumbnail: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&auto=format&fit=crop&q=60',
    channelTitle: 'Rick Astley',
    views: '1.4B views',
    publishedAt: '14 years ago',
    duration: '3:32',
  },
  {
    id: '9bZkp7q19f0',
    title: 'PSY - GANGNAM STYLE(강남스타일) M/V',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60',
    channelTitle: 'officialpsy',
    views: '5.1B views',
    publishedAt: '11 years ago',
    duration: '4:13',
  },
  {
    id: 'jNQXAC9IVRw',
    title: 'Me at the zoo - The first video on YouTube',
    thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=60',
    channelTitle: 'jawed',
    views: '310M views',
    publishedAt: '19 years ago',
    duration: '0:19',
  },
];

export default function VideoGrid() {
  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {MOCK_VIDEOS.map((video) => (
        <VideoCard key={video.id} video={video} />
      ))}
    </div>
  );
}
