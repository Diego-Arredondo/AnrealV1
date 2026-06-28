# Self-serve: push a processed trajectory video from the PC to the AnReal app over TCP.
#
# The phone app is the server (it listens). Open the app, tap "Start listening", read the
# IP and port it shows, then run this script. Standard library only (no OpenCV/NumPy needed).
#
# Wire protocol (must match TcpReceiverModule.kt):
#   [8-byte big-endian unsigned size N][N bytes of the .mp4], then close.
#
# Usage:
#   python send_video.py <phone-ip> [port] [video-path]
#   python send_video.py 192.168.100.20 8888 src/media/videos/wena.mp4

import os
import socket
import struct
import sys

DEFAULT_PORT = 8888
DEFAULT_PATH = "src/media/videos/wena.mp4"
CHUNK = 64 * 1024


def send(ip, port, path):
    if not os.path.isfile(path):
        raise FileNotFoundError("Video not found: " + path)

    size = os.path.getsize(path)
    print("Connecting to {}:{} ...".format(ip, port))
    with socket.create_connection((ip, port), timeout=10) as s:
        s.sendall(struct.pack(">Q", size))  # 8-byte big-endian length header
        sent = 0
        with open(path, "rb") as f:
            while True:
                chunk = f.read(CHUNK)
                if not chunk:
                    break
                s.sendall(chunk)
                sent += len(chunk)
                pct = int(sent * 100 / size) if size else 100
                print("\rSending... {}%".format(pct), end="", flush=True)
    print("\nSent {} bytes to {}:{}".format(size, ip, port))


if __name__ == "__main__":
    ip = sys.argv[1] if len(sys.argv) > 1 else input("Phone IP (shown in the app): ").strip()
    port = int(sys.argv[2]) if len(sys.argv) > 2 else DEFAULT_PORT
    path = sys.argv[3] if len(sys.argv) > 3 else DEFAULT_PATH
    try:
        send(ip, port, path)
    except Exception as e:
        print("ERROR:", e)
        sys.exit(1)
