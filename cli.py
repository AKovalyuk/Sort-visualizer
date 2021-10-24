"""CLI runner"""

from argparse import ArgumentParser
from my_sort import my_sort

def main():
    parser = ArgumentParser('Sort elements')
    parser.add_argument('--seq', nargs='+', required=False, default=[])
    parser.add_argument('--input', default=None, required=False)
    parser.add_argument('--reverse', action='store_true', required=False)
    parser.add_argument('--integers', action='store_true', required=False)
    parser.add_argument('--output', default=None, required=False)
    args = parser.parse_args()
    sequence = args.seq
    if not args.input is None:
        with open(args.input, 'r', encoding='utf-8') as file:
            sequence = file.read().split()
    if args.integers:
        try:
            sequence = [int(x) for x in sequence]
        except ValueError:
            print("All elements must be integer")
            exit()
    my_sort(sequence, reverse=args.reverse)
    if not args.output is None:
        with open(args.output, 'w') as file:
            print(*sequence, file=file)
    else:
        print(*sequence)

if __name__ == '__main__':
    main()
