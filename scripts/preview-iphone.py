#!/usr/bin/env python3
"""Private-LAN HTTPS preview. No public tunnel, uploads, system trust changes or third-party packages."""
import argparse
import ipaddress
import json
import mimetypes
import os
from pathlib import Path
import re
import ssl
import subprocess
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import unquote, urlsplit

REPO = Path(__file__).resolve().parent.parent
STATE = Path.home() / 'Library' / 'Application Support' / 'Body Dashboard Preview'
ROOT_FILES = {'index.html', 'sw.js', 'manifest.webmanifest'}
SAMPLE = {
    'app': 'body-dashboard', 'type': 'fitness',
    'workouts': [{
        'id': 'bd-preview-import-1', 'name': 'Preview import test',
        'start': '2026-11-01T12:00:00Z', 'end': '2026-11-01T12:30:00Z',
        'notes': 'Synthetic preview record. Delete after testing.',
        'exercises': [{'name': 'Squat (Barbell)', 'notes': '', 'ss': False,
                       'sets': [{'type': 'normal', 'weight': 40, 'reps': 5, 'rpe': None}]}]
    }], 'routines': [], 'programs': {}, 'exMeta': {}
}


def run(*args):
    return subprocess.run(args, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE).stdout.decode().strip()


def lan_identity():
    hostname = run('scutil', '--get', 'LocalHostName').lower() + '.local'
    if not re.fullmatch(r'[a-z0-9-]+\.local', hostname):
        raise RuntimeError('Unexpected local hostname; cannot create a preview certificate.')
    for interface in ('en0', 'en1'):
        try:
            address = run('ipconfig', 'getifaddr', interface)
            parsed = ipaddress.ip_address(address)
            if parsed.is_private and not parsed.is_loopback and not parsed.is_link_local:
                return hostname, address
        except (subprocess.CalledProcessError, ValueError):
            pass
    raise RuntimeError('Connect this Mac to your private Wi-Fi first. No private LAN address was found.')


def prepare(hostname, address):
    os.umask(0o077)
    STATE.mkdir(parents=True, exist_ok=True)
    STATE.chmod(0o700)
    ca, ca_key = STATE / 'ca.pem', STATE / 'ca-key.pem'
    if ca.exists() != ca_key.exists():
        raise RuntimeError('Incomplete preview CA. Preserve the existing files and repair the setup before continuing.')
    config = STATE / 'openssl.cnf'
    config.write_text('''[req]
distinguished_name=dn
[dn]
[ca_extensions]
basicConstraints=critical,CA:TRUE,pathlen:0
keyUsage=critical,keyCertSign,cRLSign
subjectKeyIdentifier=hash
authorityKeyIdentifier=keyid:always
[server_extensions]
basicConstraints=critical,CA:FALSE
keyUsage=critical,digitalSignature,keyEncipherment
extendedKeyUsage=serverAuth
subjectAltName=@names
[names]
DNS.1=localhost
DNS.2=''' + hostname + '\nIP.1=127.0.0.1\nIP.2=' + address + '\n')
    if not ca.exists():
        run('openssl', 'req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-keyout', str(ca_key),
            '-out', str(ca), '-days', '30', '-sha256', '-subj', '/CN=Body Dashboard Local Preview CA',
            '-config', str(config), '-extensions', 'ca_extensions')
    run('openssl', 'x509', '-checkend', '86400', '-noout', '-in', str(ca))
    cert, key, request = STATE / 'server.pem', STATE / 'server-key.pem', STATE / 'server.csr'
    if not key.exists():
        run('openssl', 'req', '-newkey', 'rsa:2048', '-nodes', '-keyout', str(key),
            '-out', str(request), '-subj', '/CN=Body Dashboard Local Preview', '-config', str(config))
    else:
        run('openssl', 'req', '-new', '-key', str(key), '-out', str(request),
            '-subj', '/CN=Body Dashboard Local Preview', '-config', str(config))
    run('openssl', 'x509', '-req', '-in', str(request), '-CA', str(ca), '-CAkey', str(ca_key),
        '-CAcreateserial', '-out', str(cert), '-days', '14', '-sha256', '-extfile', str(config),
        '-extensions', 'server_extensions')
    public = STATE / 'Body-Dashboard-Preview-CA.cer'
    run('openssl', 'x509', '-in', str(ca), '-outform', 'DER', '-out', str(public))
    return cert, key, public


class PreviewHandler(BaseHTTPRequestHandler):
    def log_message(self, *_):
        pass  # Do not log request URLs or personal data.

    def do_GET(self):
        try:
            self.reply(False)
        except (BrokenPipeError, ConnectionResetError):
            pass

    def do_HEAD(self):
        try:
            self.reply(True)
        except (BrokenPipeError, ConnectionResetError):
            pass

    def reply(self, head):
        path = unquote(urlsplit(self.path).path)
        if path == '/':
            path = '/index.html'
        if path == '/preview-history.json':
            body = json.dumps(SAMPLE, indent=2).encode()
            mime = 'application/json'
        else:
            relative = Path(path.lstrip('/'))
            try:
                candidate = (REPO / relative).resolve()
            except (ValueError, OSError):
                self.send_error(404)
                return
            allowed = str(relative) in ROOT_FILES
            for directory in ('assets', 'vendor'):
                try:
                    candidate.relative_to((REPO / directory).resolve())
                    allowed = True
                except ValueError:
                    pass
            if not allowed or not candidate.is_file() or candidate.suffix.lower() not in {'.html', '.js', '.css', '.json', '.webmanifest', '.png', '.svg', '.jpg', '.jpeg', '.webp', '.woff', '.woff2'}:
                self.send_error(404)
                return
            body = candidate.read_bytes()
            mime = 'application/manifest+json' if candidate.suffix == '.webmanifest' else mimetypes.guess_type(str(candidate))[0] or 'application/octet-stream'
        self.send_response(200)
        self.send_header('Content-Type', mime)
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Cache-Control', 'no-cache')
        self.send_header('X-Content-Type-Options', 'nosniff')
        if path == '/preview-history.json':
            self.send_header('Content-Disposition', 'attachment; filename="preview-history.json"')
        self.end_headers()
        if not head:
            self.wfile.write(body)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--prepare', action='store_true', help='Create local certificates and print instructions without listening.')
    parser.add_argument('--port', type=int, default=8443)
    args = parser.parse_args()
    if not 1024 <= args.port <= 65535:
        parser.error('Choose an unprivileged port from 1024 to 65535.')
    hostname, address = lan_identity()
    cert, key, public = prepare(hostname, address)
    print('AirDrop only this public certificate to your iPhone:', public, flush=True)
    print('Never share the private .pem keys. No system trust was changed.', flush=True)
    print('Preferred URL (keep using this hostname): https://' + hostname + ':' + str(args.port) + '/index.html', flush=True)
    print('IP fallback (separate browser storage): https://' + address + ':' + str(args.port) + '/index.html', flush=True)
    print('Synthetic history: https://' + hostname + ':' + str(args.port) + '/preview-history.json', flush=True)
    if args.prepare:
        return
    server = ThreadingHTTPServer((address, args.port), PreviewHandler)
    context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    context.minimum_version = ssl.TLSVersion.TLSv1_2
    context.load_cert_chain(cert, key)
    server.socket = context.wrap_socket(server.socket, server_side=True)
    print('Serving app assets only on your LAN. Keep this Terminal open; Ctrl-C stops the preview.', flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == '__main__':
    try:
        main()
    except (RuntimeError, subprocess.CalledProcessError, OSError) as error:
        raise SystemExit('Preview setup failed: ' + str(error))
