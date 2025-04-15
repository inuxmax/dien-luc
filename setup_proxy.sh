#!/bin/bash
# Script cài đặt proxy IPv6 tự động
# Chạy với quyền root

echo "Starting proxy installation..."

# Cập nhật hệ thống
apt-get update && apt-get upgrade -y

# Cài đặt các gói cần thiết
apt-get install -y build-essential curl wget gcc make nano openssl

# Cài đặt 3proxy
cd /usr/local/src/
wget https://github.com/z3APA3A/3proxy/archive/0.9.3.tar.gz
tar xzf 0.9.3.tar.gz
cd 3proxy-0.9.3
make -f Makefile.Linux
make -f Makefile.Linux install
mkdir -p /usr/local/etc/3proxy

# Tạo thư mục cấu hình
mkdir -p /usr/local/etc/3proxy/bin
mkdir -p /usr/local/etc/3proxy/logs
mkdir -p /usr/local/etc/3proxy/stat

# Tạo file cấu hình 3proxy
cat > /usr/local/etc/3proxy/3proxy.cfg << EOF
nscache 65536
timeouts 1 5 30 60 180 1800 15 60
daemon
log /usr/local/etc/3proxy/logs/3proxy.log D
logformat "- +_L%t.%. %N.%p %E %U %C:%c %R:%r %O %I %h %T"
rotate 30
auth strong
users proxyuser:CL:proxypassword
allow proxyuser
proxy -6 -n -a -p8080
flush
EOF

# Tạo service cho 3proxy
cat > /etc/systemd/system/3proxy.service << EOF
[Unit]
Description=3proxy proxy server
After=network.target

[Service]
Type=simple
ExecStart=/usr/local/bin/3proxy /usr/local/etc/3proxy/3proxy.cfg
ExecStop=/bin/kill -TERM \$MAINPID
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# Bật và khởi động service
systemctl daemon-reload
systemctl enable 3proxy
systemctl start 3proxy

# Tạo script tạo proxy IPv6 tự động
cat > /root/create_ipv6.sh << 'EOF'
#!/bin/bash

# Lấy thông tin interface network chính
INTERFACE=$(ip -6 addr | grep inet6 | grep -v "host lo" | grep -v "fe80" | awk '{print $5}')
IPV6_PREFIX=$(ip -6 addr show dev $INTERFACE | grep inet6 | grep -v "fe80" | awk '{print $2}' | cut -d'/' -f1 | cut -d':' -f1-4)

# Số lượng proxy cần tạo
COUNT=${1:-100}

# File lưu thông tin proxy
PROXY_FILE="/root/proxy_list.txt"

# Xóa file nếu đã tồn tại
rm -f $PROXY_FILE

# Tạo danh sách proxy
for i in $(seq 1 $COUNT); do
  # Tạo phần cuối của IPv6 ngẫu nhiên
  IPV6_END=$(openssl rand -hex 5 | sed 's/\(..\)/:\1/g' | cut -d':' -f2-)
  IPV6="$IPV6_PREFIX:$IPV6_END"
  
  # Thêm địa chỉ IPv6 vào interface
  ip -6 addr add $IPV6/64 dev $INTERFACE
  
  # Cổng proxy ngẫu nhiên trong khoảng 10000-60000
  PORT=$((RANDOM % 50000 + 10000))
  
  # Thêm thông tin proxy vào file
  echo "IPv6: $IPV6, Port: 8080, User: proxyuser, Password: proxypassword" >> $PROXY_FILE
done

echo "Đã tạo $COUNT proxy IPv6. Xem danh sách trong file $PROXY_FILE"
EOF

# Cấp quyền thực thi cho script
chmod +x /root/create_ipv6.sh

# Tạo 20 proxy IPv6 mặc định
/root/create_ipv6.sh 20

echo "Đã hoàn tất cài đặt proxy IPv6!"
echo "Sử dụng file /root/proxy_list.txt để xem danh sách proxy"
echo "Để tạo thêm proxy, chạy lệnh: /root/create_ipv6.sh <số_lượng>"

exit 0 