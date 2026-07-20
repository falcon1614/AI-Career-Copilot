export interface Problem {
  id: string;
  title: string;
  slug: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  description: string;
  examples: { input: string; output: string; explanation?: string }[];
  constraints: string[];
  starterCode: Record<string, string>;
  testCases: { input: string; expectedOutput: string; hidden?: boolean }[];
  tags: string[];
}

export const PROBLEMS: Problem[] = [
  {
    id: '1',
    title: 'Two Sum',
    slug: 'two-sum',
    difficulty: 'easy',
    category: 'Arrays',
    description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.`,
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'nums[0] + nums[1] = 2 + 7 = 9' },
      { input: 'nums = [3,2,4], target = 6', output: '[1,2]' },
    ],
    constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9', 'Only one valid answer exists'],
    starterCode: {
      python: `def two_sum(nums, target):
    # Your code here
    pass

nums = list(map(int, input().split()))
target = int(input())
print(two_sum(nums, target))`,
      javascript: `function twoSum(nums, target) {
  // Your code here
}

const lines = require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');
const nums = lines[0].split(' ').map(Number);
const target = Number(lines[1]);
console.log(JSON.stringify(twoSum(nums, target)));`,
      cpp: `#include <bits/stdc++.h>
using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    // Your code here
    unordered_map<int,int> seen;
    for (int i = 0; i < nums.size(); i++) {
        int diff = target - nums[i];
        if (seen.count(diff)) return {seen[diff], i};
        seen[nums[i]] = i;
    }
    return {};
}

int main() {
    int x; vector<int> nums;
    string line; getline(cin, line);
    istringstream ss(line);
    while (ss >> x) nums.push_back(x);
    int target; cin >> target;
    auto res = twoSum(nums, target);
    cout << "[" << res[0] << ", " << res[1] << "]" << endl;
    return 0;
}`,
    },
    testCases: [
      { input: '2 7 11 15\n9', expectedOutput: '[0, 1]' },
      { input: '3 2 4\n6', expectedOutput: '[1, 2]' },
      { input: '3 3\n6', expectedOutput: '[0, 1]', hidden: true },
    ],
    tags: ['array', 'hash-table'],
  },
  {
    id: '2',
    title: 'Reverse a String',
    slug: 'reverse-string',
    difficulty: 'easy',
    category: 'Strings',
    description: `Write a function that reverses a string.\n\nReturn the reversed string.`,
    examples: [
      { input: 's = "hello"', output: '"olleh"' },
      { input: 's = "Hannah"', output: '"hannaH"' },
    ],
    constraints: ['1 <= s.length <= 10^5'],
    starterCode: {
      python: `def reverse_string(s):
    # Your code here
    pass

s = input()
print(reverse_string(s))`,
      javascript: `function reverseString(s) {
  // Your code here
}

const s = require('fs').readFileSync('/dev/stdin','utf8').trim();
console.log(reverseString(s));`,
      cpp: `#include <bits/stdc++.h>
using namespace std;

string reverseString(string s) {
    // Your code here
    reverse(s.begin(), s.end());
    return s;
}

int main() {
    string s; cin >> s;
    cout << reverseString(s) << endl;
    return 0;
}`,
    },
    testCases: [
      { input: 'hello', expectedOutput: 'olleh' },
      { input: 'Hannah', expectedOutput: 'hannaH' },
      { input: 'a', expectedOutput: 'a', hidden: true },
    ],
    tags: ['string', 'two-pointers'],
  },
  {
    id: '3',
    title: 'FizzBuzz',
    slug: 'fizzbuzz',
    difficulty: 'easy',
    category: 'Math',
    description: `Given an integer n, print numbers 1 to n where:\n- Print "FizzBuzz" if divisible by both 3 and 5\n- Print "Fizz" if divisible by 3\n- Print "Buzz" if divisible by 5\n- Otherwise print the number`,
    examples: [
      { input: 'n = 5', output: '1\n2\nFizz\n4\nBuzz' },
    ],
    constraints: ['1 <= n <= 10^4'],
    starterCode: {
      python: `def fizzbuzz(n):
    # Your code here
    pass

n = int(input())
result = fizzbuzz(n)
for r in result:
    print(r)`,
      javascript: `function fizzBuzz(n) {
  // Your code here
}

const n = parseInt(require('fs').readFileSync('/dev/stdin','utf8').trim());
console.log(fizzBuzz(n).join('\\n'));`,
      cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    int n; cin >> n;
    for (int i = 1; i <= n; i++) {
        if (i % 15 == 0) cout << "FizzBuzz";
        else if (i % 3 == 0) cout << "Fizz";
        else if (i % 5 == 0) cout << "Buzz";
        else cout << i;
        cout << "\\n";
    }
    return 0;
}`,
    },
    testCases: [
      { input: '5', expectedOutput: '1\n2\nFizz\n4\nBuzz' },
      { input: '3', expectedOutput: '1\n2\nFizz' },
      { input: '15', expectedOutput: '1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz', hidden: true },
    ],
    tags: ['math', 'string', 'simulation'],
  },
  {
    id: '4',
    title: 'Valid Palindrome',
    slug: 'valid-palindrome',
    difficulty: 'easy',
    category: 'Strings',
    description: `A phrase is a palindrome if, after converting all uppercase letters to lowercase and removing all non-alphanumeric characters, it reads the same forward and backward.\n\nReturn true if palindrome, false otherwise.`,
    examples: [
      { input: 's = "A man, a plan, a canal: Panama"', output: 'True' },
      { input: 's = "race a car"', output: 'False' },
    ],
    constraints: ['1 <= s.length <= 2 * 10^5'],
    starterCode: {
      python: `def is_palindrome(s):
    # Your code here
    pass

s = input()
print(is_palindrome(s))`,
      javascript: `function isPalindrome(s) {
  // Your code here
}

const s = require('fs').readFileSync('/dev/stdin','utf8').trim();
console.log(isPalindrome(s));`,
      cpp: `#include <bits/stdc++.h>
using namespace std;

bool isPalindrome(string s) {
    string clean = "";
    for (char c : s) if (isalnum(c)) clean += tolower(c);
    string rev = clean;
    reverse(rev.begin(), rev.end());
    return clean == rev;
}

int main() {
    string s; getline(cin, s);
    cout << (isPalindrome(s) ? "True" : "False") << endl;
    return 0;
}`,
    },
    testCases: [
      { input: 'A man, a plan, a canal: Panama', expectedOutput: 'True' },
      { input: 'race a car', expectedOutput: 'False' },
      { input: ' ', expectedOutput: 'True', hidden: true },
    ],
    tags: ['string', 'two-pointers'],
  },
  {
    id: '5',
    title: 'Maximum Subarray',
    slug: 'maximum-subarray',
    difficulty: 'medium',
    category: 'Dynamic Programming',
    description: `Given an integer array nums, find the subarray with the largest sum and return its sum.\n\nThis is the classic Kadane's algorithm problem.`,
    examples: [
      { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6', explanation: 'Subarray [4,-1,2,1] has the largest sum 6' },
      { input: 'nums = [1]', output: '1' },
    ],
    constraints: ['1 <= nums.length <= 10^5', '-10^4 <= nums[i] <= 10^4'],
    starterCode: {
      python: `def max_subarray(nums):
    # Your code here
    pass

nums = list(map(int, input().split()))
print(max_subarray(nums))`,
      javascript: `function maxSubArray(nums) {
  // Your code here
}

const nums = require('fs').readFileSync('/dev/stdin','utf8').trim().split(' ').map(Number);
console.log(maxSubArray(nums));`,
      cpp: `#include <bits/stdc++.h>
using namespace std;

int maxSubArray(vector<int>& nums) {
    int maxSum = nums[0], curr = nums[0];
    for (int i = 1; i < nums.size(); i++) {
        curr = max(nums[i], curr + nums[i]);
        maxSum = max(maxSum, curr);
    }
    return maxSum;
}

int main() {
    int x; vector<int> nums;
    string line; getline(cin, line);
    istringstream ss(line);
    while (ss >> x) nums.push_back(x);
    cout << maxSubArray(nums) << endl;
    return 0;
}`,
    },
    testCases: [
      { input: '-2 1 -3 4 -1 2 1 -5 4', expectedOutput: '6' },
      { input: '1', expectedOutput: '1' },
      { input: '5 4 -1 7 8', expectedOutput: '23', hidden: true },
    ],
    tags: ['array', 'dynamic-programming'],
  },
  {
    id: '6',
    title: 'Binary Search',
    slug: 'binary-search',
    difficulty: 'easy',
    category: 'Binary Search',
    description: `Given a sorted array of integers nums and an integer target, return its index if found, else return -1.\n\nYou must write an O(log n) algorithm.`,
    examples: [
      { input: 'nums = [-1,0,3,5,9,12], target = 9', output: '4' },
      { input: 'nums = [-1,0,3,5,9,12], target = 2', output: '-1' },
    ],
    constraints: ['1 <= nums.length <= 10^4', 'All integers are unique', 'nums is sorted ascending'],
    starterCode: {
      python: `def binary_search(nums, target):
    # Your code here
    pass

nums = list(map(int, input().split()))
target = int(input())
print(binary_search(nums, target))`,
      javascript: `function search(nums, target) {
  // Your code here
}

const lines = require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');
const nums = lines[0].split(' ').map(Number);
const target = Number(lines[1]);
console.log(search(nums, target));`,
      cpp: `#include <bits/stdc++.h>
using namespace std;

int search(vector<int>& nums, int target) {
    int l = 0, r = nums.size() - 1;
    while (l <= r) {
        int mid = l + (r - l) / 2;
        if (nums[mid] == target) return mid;
        else if (nums[mid] < target) l = mid + 1;
        else r = mid - 1;
    }
    return -1;
}

int main() {
    int x; vector<int> nums;
    string line; getline(cin, line);
    istringstream ss(line);
    while (ss >> x) nums.push_back(x);
    int target; cin >> target;
    cout << search(nums, target) << endl;
    return 0;
}`,
    },
    testCases: [
      { input: '-1 0 3 5 9 12\n9', expectedOutput: '4' },
      { input: '-1 0 3 5 9 12\n2', expectedOutput: '-1' },
      { input: '5\n5', expectedOutput: '0', hidden: true },
    ],
    tags: ['array', 'binary-search'],
  },
];

export function getProblemById(id: string): Problem | undefined {
  return PROBLEMS.find(p => p.id === id);
}

export function getProblemBySlug(slug: string): Problem | undefined {
  return PROBLEMS.find(p => p.slug === slug);
}
