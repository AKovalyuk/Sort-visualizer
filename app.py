"""Server application"""

from flask import Flask, request, make_response, send_file
from flask.json import jsonify
from my_sort import SortAlghoritms

app = Flask(__name__, static_folder='./frontend/build/static')
my_sort = SortAlghoritms()

@app.route('/sort-this', methods=['POST'])
def sort_this():
    array = request.get_json(force=True)['data']
    if isinstance(array, list) and filter(lambda x: isinstance(x, int), array):
        my_sort.my_sort(array)
        steps = my_sort.log
        return make_response(jsonify({'data': steps}), 200)
    return make_response('bad', 200)

@app.route('/')
def index():
    return send_file('./frontend/build/index.html')

if __name__ == '__main__':
    app.run(debug=True)
