import Link from 'next/link';
import Image from 'next/image';

export default function Logo() {
  return (
    <Link href="/" className="flex items-center space-x-2">
      <Image
        src="https://i.ibb.co/Y4QJRMj2/Mail1s-Net.png"
        alt="Lịch Cúp Điện Logo"
        width={40}
        height={40}
        className="rounded-full"
        unoptimized
      />
      <div>
        <h1 className="text-2xl font-bold">Lịch Cúp Điện</h1>
        <p className="text-sm opacity-90">{new Date().toLocaleDateString('vi-VN', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}</p>
      </div>
    </Link>
  );
} 
