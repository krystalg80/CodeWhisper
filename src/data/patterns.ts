import type { AlgorithmPattern } from "@/types";

export const ALGORITHM_PATTERNS: AlgorithmPattern[] = [
  {
    id: "sliding-window",
    name: "Sliding Window",
    category: "Array / String",
    description:
      "Maintain a window of elements that moves through the array, expanding or contracting based on a condition.",
    when_to_use: [
      "Find max/min subarray of length k",
      "Longest substring with at most k distinct characters",
      "Find all anagrams in a string",
      "Minimum window substring",
    ],
    time_complexity: "O(n)",
    space_complexity: "O(1) or O(k)",
    example_problems: [
      "LeetCode 3 – Longest Substring Without Repeating Characters",
      "LeetCode 76 – Minimum Window Substring",
      "LeetCode 567 – Permutation in String",
      "LeetCode 239 – Sliding Window Maximum",
    ],
    key_signals: [
      "contiguous subarray",
      "substring",
      "window",
      "at most k",
      "consecutive",
    ],
    template_hint: `left = 0
for right in range(len(arr)):
    # expand window: process arr[right]
    while window_invalid:
        # shrink window: process arr[left]
        left += 1
    # update answer`,
  },
  {
    id: "two-pointers",
    name: "Two Pointers",
    category: "Array / String",
    description:
      "Use two indices that move toward each other (or in the same direction) to reduce O(n²) brute force to O(n).",
    when_to_use: [
      "Pair with target sum in sorted array",
      "Three-sum / N-sum problems",
      "Palindrome check",
      "Remove duplicates from sorted array",
      "Container with most water",
    ],
    time_complexity: "O(n)",
    space_complexity: "O(1)",
    example_problems: [
      "LeetCode 1 – Two Sum (sorted variant)",
      "LeetCode 15 – 3Sum",
      "LeetCode 11 – Container With Most Water",
      "LeetCode 125 – Valid Palindrome",
    ],
    key_signals: [
      "sorted array",
      "pair",
      "sum equals target",
      "palindrome",
      "in-place",
    ],
    template_hint: `left, right = 0, len(arr) - 1
while left < right:
    if condition_met:
        # record answer
    elif need_larger:
        left += 1
    else:
        right -= 1`,
  },
  {
    id: "fast-slow-pointers",
    name: "Fast & Slow Pointers",
    category: "Linked List",
    description:
      "Two pointers moving at different speeds through a linked list. The fast pointer moves 2× the slow.",
    when_to_use: [
      "Detect a cycle in a linked list",
      "Find the middle of a linked list",
      "Find the start of a cycle",
    ],
    time_complexity: "O(n)",
    space_complexity: "O(1)",
    example_problems: [
      "LeetCode 141 – Linked List Cycle",
      "LeetCode 142 – Linked List Cycle II",
      "LeetCode 876 – Middle of the Linked List",
    ],
    key_signals: ["cycle", "loop", "linked list", "middle node"],
    template_hint: `slow = fast = head
while fast and fast.next:
    slow = slow.next
    fast = fast.next.next
    if slow == fast:
        # cycle detected`,
  },
  {
    id: "binary-search",
    name: "Binary Search",
    category: "Search",
    description:
      "Halve the search space each iteration by comparing the target to the midpoint. Works on monotonic search spaces, not just sorted arrays.",
    when_to_use: [
      "Search in sorted array",
      "Find first/last occurrence",
      "Minimum in rotated sorted array",
      "Binary search on answer (e.g., minimum capacity to ship packages)",
    ],
    time_complexity: "O(log n)",
    space_complexity: "O(1)",
    example_problems: [
      "LeetCode 704 – Binary Search",
      "LeetCode 33 – Search in Rotated Sorted Array",
      "LeetCode 153 – Find Minimum in Rotated Sorted Array",
      "LeetCode 410 – Split Array Largest Sum",
    ],
    key_signals: [
      "sorted",
      "O(log n)",
      "rotated",
      "find minimum/maximum",
      "feasibility check",
    ],
    template_hint: `lo, hi = 0, len(arr) - 1
while lo <= hi:
    mid = (lo + hi) // 2
    if arr[mid] == target:
        return mid
    elif arr[mid] < target:
        lo = mid + 1
    else:
        hi = mid - 1`,
  },
  {
    id: "bfs",
    name: "Breadth-First Search (BFS)",
    category: "Graph / Tree",
    description:
      "Explore all neighbors at the current depth before moving to the next level. Uses a queue.",
    when_to_use: [
      "Shortest path in unweighted graph",
      "Level-order traversal",
      "Minimum steps / hops",
      "Multi-source BFS (0-1 BFS)",
    ],
    time_complexity: "O(V + E)",
    space_complexity: "O(V)",
    example_problems: [
      "LeetCode 102 – Binary Tree Level Order Traversal",
      "LeetCode 127 – Word Ladder",
      "LeetCode 200 – Number of Islands",
      "LeetCode 994 – Rotting Oranges",
    ],
    key_signals: ["shortest path", "minimum distance", "levels", "unweighted"],
    template_hint: `from collections import deque
queue = deque([start])
visited = {start}
while queue:
    node = queue.popleft()
    for neighbor in graph[node]:
        if neighbor not in visited:
            visited.add(neighbor)
            queue.append(neighbor)`,
  },
  {
    id: "dfs",
    name: "Depth-First Search (DFS)",
    category: "Graph / Tree",
    description:
      "Explore as deep as possible along each branch before backtracking. Uses a stack (explicit or call stack).",
    when_to_use: [
      "Connected components",
      "Cycle detection",
      "Topological sort",
      "All paths from source to target",
      "Tree traversals (in/pre/post-order)",
    ],
    time_complexity: "O(V + E)",
    space_complexity: "O(V) for visited set",
    example_problems: [
      "LeetCode 112 – Path Sum",
      "LeetCode 207 – Course Schedule",
      "LeetCode 417 – Pacific Atlantic Water Flow",
      "LeetCode 130 – Surrounded Regions",
    ],
    key_signals: ["all paths", "connected component", "cycle", "backtrack"],
    template_hint: `def dfs(node, visited):
    visited.add(node)
    for neighbor in graph[node]:
        if neighbor not in visited:
            dfs(neighbor, visited)`,
  },
  {
    id: "dynamic-programming",
    name: "Dynamic Programming",
    category: "Optimization",
    description:
      "Break down a problem into overlapping subproblems. Cache results to avoid recomputation (memoization or tabulation).",
    when_to_use: [
      "Optimal substructure + overlapping subproblems",
      "Count the number of ways",
      "Max/min value across choices",
      "Knapsack-style problems",
    ],
    time_complexity: "O(n²) or O(n·m) typical",
    space_complexity: "O(n) or O(n·m)",
    example_problems: [
      "LeetCode 70 – Climbing Stairs",
      "LeetCode 322 – Coin Change",
      "LeetCode 1143 – Longest Common Subsequence",
      "LeetCode 300 – Longest Increasing Subsequence",
    ],
    key_signals: [
      "minimum cost",
      "maximum profit",
      "number of ways",
      "can you achieve",
      "optimal",
    ],
    template_hint: `# Bottom-up tabulation
dp = [0] * (n + 1)
dp[base_case] = base_value
for i in range(1, n + 1):
    dp[i] = f(dp[i-1], dp[i-2], ...)  # recurrence`,
  },
  {
    id: "backtracking",
    name: "Backtracking",
    category: "Recursion",
    description:
      "Build candidates incrementally, abandoning a candidate (backtrack) as soon as it cannot lead to a valid solution.",
    when_to_use: [
      "Generate all permutations / combinations / subsets",
      "Constraint satisfaction (N-Queens, Sudoku)",
      "Word search in grid",
    ],
    time_complexity: "O(n! or 2ⁿ) worst case",
    space_complexity: "O(n) recursion depth",
    example_problems: [
      "LeetCode 46 – Permutations",
      "LeetCode 78 – Subsets",
      "LeetCode 51 – N-Queens",
      "LeetCode 79 – Word Search",
    ],
    key_signals: ["all combinations", "all permutations", "generate", "enumerate"],
    template_hint: `def backtrack(path, choices):
    if goal_reached(path):
        result.append(path[:])
        return
    for choice in choices:
        if is_valid(choice):
            path.append(choice)
            backtrack(path, remaining_choices)
            path.pop()  # undo`,
  },
  {
    id: "heap",
    name: "Heap / Priority Queue",
    category: "Data Structure",
    description:
      "A complete binary tree maintaining the heap property. Min-heap gives O(1) access to the minimum element.",
    when_to_use: [
      "K largest / K smallest elements",
      "Merge K sorted lists",
      "Find median from data stream",
      "Task scheduling",
    ],
    time_complexity: "O(n log k)",
    space_complexity: "O(k)",
    example_problems: [
      "LeetCode 215 – Kth Largest Element",
      "LeetCode 23 – Merge K Sorted Lists",
      "LeetCode 295 – Find Median from Data Stream",
    ],
    key_signals: ["k largest", "k smallest", "top k", "kth", "streaming"],
    template_hint: `import heapq
heap = []
for num in nums:
    heapq.heappush(heap, num)
    if len(heap) > k:
        heapq.heappop(heap)
# heap[0] is the kth largest`,
  },
  {
    id: "union-find",
    name: "Union-Find (Disjoint Set)",
    category: "Graph",
    description:
      "Track connected components efficiently with path compression and union by rank.",
    when_to_use: [
      "Dynamic connectivity",
      "Number of connected components",
      "Cycle detection in undirected graph",
      "Kruskal's MST",
    ],
    time_complexity: "O(α(n)) ≈ O(1) amortized",
    space_complexity: "O(n)",
    example_problems: [
      "LeetCode 323 – Number of Connected Components",
      "LeetCode 684 – Redundant Connection",
      "LeetCode 547 – Number of Provinces",
    ],
    key_signals: ["connected components", "dynamic edges", "cycle", "union"],
    template_hint: `parent = list(range(n))
def find(x):
    if parent[x] != x:
        parent[x] = find(parent[x])
    return parent[x]
def union(x, y):
    parent[find(x)] = find(y)`,
  },
];

export const getPatternById = (id: string) =>
  ALGORITHM_PATTERNS.find((p) => p.id === id);

export const getPatternByName = (name: string) =>
  ALGORITHM_PATTERNS.find((p) =>
    p.name.toLowerCase().includes(name.toLowerCase())
  );
