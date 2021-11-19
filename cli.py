"""CLI runner"""

from argparse import ArgumentParser
from my_sort import SortAlghoritms

my_sort = SortAlghoritms()

def main():
    parser = ArgumentParser(description='Sort elements')
    parser.add_argument('--seq', required=True, help="Objects to sort")
    parser.add_argument('--input', default=None, required=False, help="Filename if input from file")
    parser.add_argument('--reverse', action='store_true', required=False, help="Reverse result")
    parser.add_argument('--integers', action='store_true', required=False, help="Interpret as integers")
    parser.add_argument('--output', default=None, required=False, help="Output file")
    args = parser.parse_args()
    sequence = args.seq.split(',')
    if not args.input is None:
        with open(args.input, 'r', encoding='utf-8') as file:
            sequence = file.read().split()
    if args.integers:
        try:
            sequence = [int(x) for x in sequence]
        except ValueError:
            print("All elements must be integer")
            exit()
    sequence = my_sort.my_sort(sequence, reverse=args.reverse)
    if not args.output is None:
        with open(args.output, 'w') as file:
            print(*sequence, file=file)
    else:
        print(*sequence)

if __name__ == '__main__':
    main()
