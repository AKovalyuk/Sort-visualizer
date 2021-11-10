"""Module with sorting function"""

from typing import List, Optional, Callable

def my_sort(array: List, reverse: bool=False,
            key: Optional[Callable]=None, cmp: Optional[Callable]=None) -> List:
    """
    Sort function
    :param array: input array
    :param reverse: flag, is result must be reversed
    :param key: function acsessor for array elements
    :param cmp: comparator
    """

    # array for logging actions inside alghoritm
    log = []
    # standart key
    if key is None:
        key = lambda x: x
    # standart cmp
    if cmp is None:
        cmp = lambda x, y: x < y
    # reverse compare function if it needed
    if reverse:
        old_cmp = cmp
        cmp = lambda x, y: not old_cmp(x, y) and not x == y

    def partition(array: List, left: int, right: int) -> None:
        """
        Function for division array segment for quicksort
        All elements in left part < then all elements in right part
        Return value - index between two parts
        """
        middle = array[(left + right) // 2]
        i = left
        j = right
        log.extend([('j', j), ('i', i)])
        while i <= j :
            while cmp(key(array[i]), key(middle)):
                i += 1
                log.append(('i', i))
            while not cmp(key(array[j]), key(middle)) and not key(array[j]) == key(middle):
                j -= 1
                log.append(('j', j))
            if i >= j:
                break
            array[i], array[j] = array[j], array[i]
            log.append(('s', i, j))
            i += 1
            j -= 1
        return j

    def quick_sort(array: List, left: int, right: int) -> None:
        """Quicksort recursive alghoritm"""
        if left < right:
            log.append(('q', left, right))
            part = partition(array, left, right)
            quick_sort(array, left, part)
            quick_sort(array, part + 1, right)

    quick_sort(array, 0, len(array) - 1)
    log.append(('c', ))
    return log
