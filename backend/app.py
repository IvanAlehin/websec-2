from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os, time, requests

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

API_KEY = os.getenv('YANDEX_KEY')
BASE_URL = os.getenv('YANDEX_BASE_URL', 'https://api.rasp.yandex.net/v3.0')
cache = {}

@app.after_request
def add_cors_headers(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
    response.headers.add('Access-Control-Allow-Methods', 'GET, OPTIONS')
    return response

@app.route('/api/stations', methods=['GET', 'OPTIONS'])
def stations():
    if request.method == 'OPTIONS':
        return '', 204
    
    if 'stations' in cache and time.time() - cache['stations'][1] < 86400:
        return jsonify(cache['stations'][0])
    
    try:
        resp = requests.get(
            f'{BASE_URL}/stations_list/',
            params={'apikey': API_KEY, 'format': 'json', 'lang': 'ru_RU'},
            timeout=60
        )
        data = resp.json()
        cache['stations'] = (data, time.time())
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/schedule', methods=['GET', 'OPTIONS'])
def schedule():
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        params = {
            'apikey': API_KEY,
            'format': 'json',
            'station': request.args.get('station'),
            'transport_types': 'suburban'
        }
        resp = requests.get(f'{BASE_URL}/schedule/', params=params, timeout=15)
        return jsonify(resp.json())
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/route', methods=['GET', 'OPTIONS'])
def route():
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        params = {
            'apikey': API_KEY,
            'format': 'json',
            'from': request.args.get('from'),
            'to': request.args.get('to')
        }
        resp = requests.get(f'{BASE_URL}/search/', params=params, timeout=15)
        return jsonify(resp.json())
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)