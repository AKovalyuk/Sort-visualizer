from flask import Flask, request, make_response
from flask.json import jsonify
from my_sort import my_sort

app = Flask(__name__)

@app.route('/sort-this', methods=['POST'])
def sort_this():
    array = request.get_json(force=True)['data']
    if isinstance(array, list) and filter(lambda x: isinstance(x, int)):
        my_sort(array)
        return make_response(jsonify({'data': array}), 200)
    else:
        return make_response('bad', 400)

if __name__ == '__main__':
    app.run(debug=True)
