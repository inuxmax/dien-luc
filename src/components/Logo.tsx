"use client";
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function Logo() {
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    // Cập nhật ngày tháng khi component mount
    const updateDate = () => {
      setCurrentDate(new Date().toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }));
    };

    // Cập nhật ngay lập tức
    updateDate();

    // Cập nhật mỗi phút
    const interval = setInterval(updateDate, 60000);

    // Cleanup interval khi component unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <Link href="/" className="flex items-center space-x-2">
      <Image
        src="https://i.postimg.cc/Wz3NR3gZ/Mail1s-Net.png"
        alt="Lịch Cúp Điện Logo"
        width={40}
        height={40}
        className="rounded-full"
        unoptimized
      />
      <div>
        <h1 className="text-2xl font-bold">Lịch Cúp Điện</h1>
        <p className="text-sm opacity-90">{currentDate}</p>
      </div>
    </Link>
  );
} 
