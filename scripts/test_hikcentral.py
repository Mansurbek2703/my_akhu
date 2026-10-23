import hmac
import hashlib
import base64
import time
import json
import urllib.request
import ssl
import sys

# HikCentral Credentials
HOST = "https://172.20.20.8"
APP_KEY = "35525590"
APP_SECRET = "KkW8WbxTG5X6S9bSN3BU"

def hik_request(path, body=None):
    method = "POST" if body is not None else "GET"
    accept = "application/json"
    content_type = "application/json;charset=UTF-8"
    timestamp = str(int(time.time() * 1000))
    
    # stringToSign: Method\nAccept\nContentType\nx-ca-key:...\nx-ca-timestamp:...\nPath
    headers_to_sign = f"x-ca-key:{APP_KEY}\nx-ca-timestamp:{timestamp}"
    string_to_sign = f"{method}\n{accept}\n{content_type}\n{headers_to_sign}\n{path}"
    
    signature = base64.b64encode(
        hmac.new(APP_SECRET.encode('utf-8'), string_to_sign.encode('utf-8'), hashlib.sha256).digest()
    ).decode('utf-8')
    
    url = f"{HOST}{path}"
    data = json.dumps(body).encode('utf-8') if body is not None else None
    
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header("Accept", accept)
    req.add_header("Content-Type", content_type)
    req.add_header("X-Ca-Key", APP_KEY)
    req.add_header("X-Ca-Timestamp", timestamp)
    req.add_header("X-Ca-Signature", signature)
    req.add_header("X-Ca-Signature-Headers", "x-ca-key,x-ca-timestamp")
    
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    
    print(f"--> Sending {method} to {url}...")
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=10) as resp:
            raw = resp.read().decode('utf-8')
            return json.loads(raw)
    except Exception as e:
        return {"error": str(e)}

if __name__ == '__main__':
    path = sys.argv[1] if len(sys.argv) > 1 else "/artemis/api/resource/v1/person/personList"
    payload = {"pageNo": 1, "pageSize": 10}
    res = hik_request(path, payload)
    print("RESPONSE:")
    print(json.dumps(res, indent=2, ensure_ascii=False))
