from sys import stderr
from flask import Flask, request, make_response, send_file
from flask.json import jsonify
from my_sort import my_sort

app = Flask(__name__, static_folder='./frontend/build/static')

@app.route('/sort-this', methods=['POST'])
def sort_this():
    array = request.get_json(force=True)['data']
    if isinstance(array, list) and filter(lambda x: isinstance(x, int), array):
        steps = my_sort(array)
        return make_response(jsonify({'data': steps}), 200)
    else:
        return make_response('bad', 200)

@app.route('/')
def index():
    return send_file('./frontend/build/index.html')

if __name__ == '__main__':
    app.run(debug=True)
