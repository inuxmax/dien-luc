import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { ThemeProvider } from "next-themes";
import ThemeToggle from "@/components/ThemeToggle";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Lịch Cúp Điện - Tra cứu thông tin cúp điện mới nhất",
  description: "Tra cứu thông tin cúp điện mới nhất từ các công ty điện lực trên toàn quốc",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentDate = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="min-h-screen bg-white dark:bg-gray-900">
            <header className="bg-blue-600 dark:bg-blue-800 text-white shadow-sm">
              <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold">Lịch Cúp Điện</h1>
                  <p className="text-sm opacity-90">{currentDate}</p>
                </div>
                <ThemeToggle />
              </div>
            </header>
            <main>{children}</main>
            <footer className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
              <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Giới thiệu dịch vụ</h3>
                    <p className="text-sm">
                      Cung cấp thông tin lịch cắt điện từ các công ty điện lực trên toàn quốc. 
                      Dữ liệu được cập nhật liên tục để đảm bảo độ chính xác cao nhất.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Menu truy cập nhanh</h3>
                    <ul className="space-y-2 text-sm">
                      <li><a href="/" className="hover:text-blue-500">Trang chủ</a></li>
                      <li><a href="#" className="hover:text-blue-500">Lịch cắt điện</a></li>
                      <li><a href="#" className="hover:text-blue-500">API</a></li>
                      <li><a href="#" className="hover:text-blue-500">Liên hệ</a></li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Khu vực</h3>
                    <ul className="space-y-2 text-sm">
                      <li><a href="#" className="hover:text-blue-500">Miền Bắc</a></li>
                      <li><a href="#" className="hover:text-blue-500">Miền Trung</a></li>
                      <li><a href="#" className="hover:text-blue-500">Miền Nam</a></li>
                    </ul>
                  </div>
                </div>
                <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-center">
                    <p>&copy; 2025 Lịch Cúp Điện. All rights reserved.</p>
                    <p className="mt-2">Dữ liệu được cung cấp bởi Đạt Pro Max</p>
                  </div>
                </div>
              </div>
              <script data-host="https://1dg.vn" data-dnt="false" src="https://1dg.vn/js/script.js" id="ZwSg9rf6GA" async defer></script>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
