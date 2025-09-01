// Stage data: lessons, quizzes, and basic minigame configs
// Each stage has: id, title, lesson (html string), quiz (question, choices, correct index or string), minigame type/config

const STAGES = [
  {
    id: 1,
    title: "Variables & Data Types",
    lesson: `Variables store data. Python has types: int (integers), float (decimals), str (text), bool (True/False).\n\nExamples:\n\n` +
      `x = 5  # int\n` +
      `pi = 3.14  # float\n` +
      `name = "Alice"  # str\n` +
      `flag = True  # bool\n\n` +
      `print(x, pi, name, flag)`,
    // Beginner-friendly slides
    lessonSlides: [
      `Slide 1 — What is a variable?\n\nA variable is a named box that stores a value. Example: x = 5 means x stores the number 5.`,
      `Slide 2 — Common data types\n\nint (whole numbers): 1, 42\nfloat (decimals): 3.14, 0.5\nstr (text): "hello"\nbool (True/False): True, False`,
      `Slide 3 — Creating variables\n\nx = 5\nname = "Alice"\npi = 3.14\nflag = True\nUse names that describe the value.`,
      `Slide 4 — Printing values\n\nprint(x)\nprint(name)\nprint(x, name, pi)\nYou can print several things at once.`,
      `Slide 5 — Type checking\n\nUse type(value) to see its type:\nprint(type(5))  # <class 'int'>\nprint(type("hi"))  # <class 'str'>`,
      `Slide 6 — Converting types\n\nint("7") -> 7\nfloat(5) -> 5.0\nstr(3.14) -> "3.14"\nOnly convert when it makes sense.`,
      `Slide 7 — Naming rules\n\nUse letters, numbers, and _.\nStart with a letter or _.\nExamples: total_sum, user1, _hidden`,
      `Slide 8 — Quick recap\n\nVariables store values.\ Know the common types.\nPrint to see results.\nConvert types when needed.`
    ],
    minigame: { type: "drag-drop-datatype", items: ["42", '"Hello"', "True"], targets: ["int", "str", "bool"] },
  },
  {
    id: 2,
    title: "Operators & Expressions",
    lesson: `Operators: + - * / % == > compare or compute values.\n` +
      `3 % 2 == 1, 3 + 4 == 7` ,
    // Beginner-friendly slides
    lessonSlides: [
      `Slide 1 — Math operators\n\n+ add, - subtract, * multiply, / divide, % remainder, ** power`,
      `Slide 2 — Examples\n\n3 + 4 -> 7\n10 - 2 -> 8\n3 * 5 -> 15\n8 / 2 -> 4.0 (division is float)`,
      `Slide 3 — Remainder and power\n\n7 % 3 -> 1 (remainder)\n2 ** 3 -> 8 (power)`,
      `Slide 4 — Order of operations\n\nMultiplication/division happen before addition/subtraction.\n3 + 2 * 4 -> 11\n(3 + 2) * 4 -> 20`,
      `Slide 5 — Comparisons\n\n== equal, != not equal, >, <, >=, <=\n5 == 5 -> True\n4 < 3 -> False`,
      `Slide 6 — Boolean logic\n\nand, or, not\n(5 > 3) and (2 < 4) -> True\n(1 == 2) or True -> True\nnot False -> True`,
      `Slide 7 — Expressions\n\nAn expression combines values and operators:\nresult = (3 + 2) * 4\nprint(result)  # 20`,
      `Slide 8 — Quick recap\n\nUse operators to compute or compare.\nRemember operator order.\nBooleans help build conditions.`
    ],
    minigame: { type: "terminal-gates", gates: [{expr: "3 + 4", ans: "7"}, {expr: "9 % 2", ans: "1"}] },
  },
  {
    id: 3,
    title: "Strings",
    lesson: `Strings can be sliced and concatenated.\n` +
      `"Hello"[1:4] == "ell"` ,
    // Beginner-friendly slides
    lessonSlides: [
      `Slide 1 — What is a string?\n\nA string is text in quotes: "hello", 'world'`,
      `Slide 2 — Joining strings\n\n"Py" + "thon" -> "Python"\n"ha" * 3 -> "hahaha"`,
      `Slide 3 — Indexing\n\n"Hello"[0] -> 'H'\n"Hello"[-1] -> 'o' (last char)`,
      `Slide 4 — Slicing\n\n"Hello"[1:4] -> "ell"\nstart is included, end is excluded`,
      `Slide 5 — Useful methods\n\n"hi".upper() -> "HI"\n"HI".lower() -> "hi"\n" hello ".strip() -> "hello"\n"a,b".split(",") -> ["a","b"]`,
      `Slide 6 — f-strings\n\nname = "Ana"\nprint(f"Hello {name}") -> Hello Ana`,
      `Slide 7 — Immutability\n\nYou can’t change characters inside a string.\nMake a new string instead.`,
      `Slide 8 — Recap\n\nStrings are text.\nUse indexing/slicing to get parts.\nUse methods to transform text.`
    ],
    minigame: { type: "reorder-fragments", fragments: ["Py", "tho", "n"], target: "Python" },
  },
  {
    id: 4,
    title: "Lists & Tuples",
    lesson: `Lists are mutable sequences; tuples are immutable.\n` +
      `mylist = [10, 20, 30]; mylist[2] == 30` ,
    // Beginner-friendly slides
    lessonSlides: [
      `Slide 1 — Lists\n\nA list holds many values in order: [1, 2, 3]`,
      `Slide 2 — Access and change\n\nnums = [10, 20, 30]\nnums[1] -> 20\nnums[1] = 99 -> [10, 99, 30]`,
      `Slide 3 — Common list methods\n\nappend(x), pop(), insert(i, x), remove(x), len(list)`,
      `Slide 4 — Slicing lists\n\nnums[:2] -> first two items\nnums[-1] -> last item`,
      `Slide 5 — Tuples\n\nA tuple is like a list but cannot change: (1, 2, 3)\nUse tuples for fixed data.`,
      `Slide 6 — When to use which\n\nUse list when values change.\nUse tuple when values stay the same.`,
      `Slide 7 — Nested lists\n\nmat = [[1,2],[3,4]]\nmat[1][0] -> 3`,
      `Slide 8 — Recap\n\nLists are editable. Tuples are not.\nUse methods and slicing to work with them.`
    ],
    minigame: { type: "index-grab", prompt: "Grab index 2 (third item)!" },
  },
  {
    id: 5,
    title: "Dictionaries & Sets",
    lesson: `Dictionaries map keys to values. Sets hold unique elements.\n` +
      `d = {"a":1, "b":2}; d["b"] == 2` ,
    // Beginner-friendly slides
    lessonSlides: [
      `Slide 1 — Dictionaries\n\nA dict maps keys to values: {"a": 1, "b": 2}`,
      `Slide 2 — Getting and setting\n\nd = {"x":10}\nd["x"] -> 10\nd["y"] = 5 adds a new pair`,
      `Slide 3 — Safer access with get\n\nd.get("z", 0) returns 0 if "z" is missing`,
      `Slide 4 — Keys and values\n\nlist(d.keys()), list(d.values()), list(d.items())`,
      `Slide 5 — Sets\n\nA set stores unique items: {1, 2, 3}\nset([1,1,2]) -> {1, 2}`,
      `Slide 6 — Set operations\n\nUnion: {1,2} | {2,3} -> {1,2,3}\nIntersection: {1,2} & {2,3} -> {2}\nDifference: {1,2,3} - {2} -> {1,3}`,
      `Slide 7 — Membership\n\n"a" in {"a":1} checks keys -> True\n2 in {1,2,3} -> True`,
      `Slide 8 — Recap\n\nUse dicts for key/value lookups.\nUse sets to keep unique items and do math-like operations.`
    ],
    minigame: { type: "chests-keys", keys: ["a","b"], values: ["1","2"] },
  },
  {
    id: 6,
    title: "Conditionals (if/else)",
    lesson: `if/elif/else choose code paths.\n` +
      `x = 5\nif x > 3: print("yes")` ,
    // Beginner-friendly slides
    lessonSlides: [
      `Slide 1 — If statements\n\nif condition: do something\nThe code under if runs only when the condition is True.`,
      `Slide 2 — elif and else\n\nelif checks another condition.\nelse runs when no previous condition was True.`,
      `Slide 3 — Examples\n\nx = 5\nif x > 6: print("big")\nelif x == 5: print("five")\nelse: print("small")`,
      `Slide 4 — Comparisons\n\n==, !=, >, <, >=, <= return True/False.`,
      `Slide 5 — Truthy and falsy\n\nFalse, 0, "", [], None are treated as False.\nMost other values are True.`,
      `Slide 6 — Indentation\n\nIndent (4 spaces is common) for code under if/elif/else.`,
      `Slide 7 — Combining conditions\n\nUse and, or, not to build more complex checks.`,
      `Slide 8 — Recap\n\nUse if/elif/else to choose actions based on conditions.`
    ],
    minigame: { type: "true-false-tunnel", condition: "if x < 3" },
  },
  {
    id: 7,
    title: "Loops (for/while)",
    lesson: `Loops repeat actions.\n` +
      `for i in range(3): print(i)  # 0 1 2` ,
    // Beginner-friendly slides
    lessonSlides: [
      `Slide 1 — Why loops?\n\nLoops repeat code so you don’t copy/paste.`,
      `Slide 2 — for loop\n\nfor i in range(3):\n    print(i)  # prints 0, 1, 2`,
      `Slide 3 — Looping over lists\n\nfor item in ["a","b","c"]:\n    print(item)`,
      `Slide 4 — while loop\n\ni = 0\nwhile i < 3:\n    i += 1\n    print(i)`,
      `Slide 5 — break and continue\n\nbreak stops the loop.\ncontinue skips to the next round.`,
      `Slide 6 — Off-by-one tips\n\nrange(n) gives 0..n-1.\nlen(list) tells how many items.`,
      `Slide 7 — Nested loops (careful)\n\nfor r in rows:\n  for c in cols:\n    ...`,
      `Slide 8 — Recap\n\nUse for for known counts or items.\nUse while when you loop until a condition changes.`
    ],
    minigame: { type: "platforms-loop", count: 5 },
  },
  {
    id: 8,
    title: "Functions",
    lesson: `Define with def and return values.\n` +
      `def f(x):\n    return x+1\nprint(f(2))  # 3` ,
    // Beginner-friendly slides
    lessonSlides: [
      `Slide 1 — What is a function?\n\nA function is a reusable block of code with a name.`,
      `Slide 2 — Defining a function\n\ndef greet(name):\n    print("Hello", name)\ngreet("Ana")`,
      `Slide 3 — Returning values\n\ndef add(a, b):\n    return a + b\nresult = add(2, 3)  # 5`,
      `Slide 4 — Parameters and defaults\n\ndef power(x, p=2):\n    return x ** p\npower(3) -> 9\npower(3, 3) -> 27`,
      `Slide 5 — *args and **kwargs\n\nCollect extra positional and named arguments in a flexible way.`,
      `Slide 6 — Scope\n\nVariables inside a function are local to it.`,
      `Slide 7 — Small and focused\n\nWrite short functions that do one clear thing.`,
      `Slide 8 — Recap\n\nDefine with def, use parameters, return results.`
    ],
    minigame: { type: "bridge-function" },
  },
  {
    id: 9,
    title: "Modules & Imports",
    lesson: `Use import to bring modules.\n` +
      `import math\nprint(math.sqrt(9))  # 3.0` ,
    // Beginner-friendly slides
    lessonSlides: [
      `Slide 1 — What is a module?\n\nA module is a file with Python code you can reuse.`,
      `Slide 2 — Importing a module\n\nimport math\nprint(math.sqrt(9))  # 3.0`,
      `Slide 3 — Import parts\n\nfrom math import sqrt\nprint(sqrt(16))  # 4.0`,
      `Slide 4 — Aliases\n\nimport math as m\nprint(m.floor(3.7))  # 3`,
      `Slide 5 — Random/time examples\n\nrandom.randint(1,3) -> 1..3\ntime.sleep(1) pauses 1 second`,
      `Slide 6 — When to use imports\n\nUse the standard library when possible before writing your own tools.`,
      `Slide 7 — Your own modules\n\nYou can create your own .py files and import them.`,
      `Slide 8 — Recap\n\nImport modules to reuse code and tools.`
    ],
    minigame: { type: "modules-puzzle", modules: ["math","random","time"] },
  },
  {
    id: 10,
    title: "File Handling",
    lesson: `Open/read/write files with open(). Modes: "r" read, "w" write, "a" append.`,
    // Beginner-friendly slides
    lessonSlides: [
      `Slide 1 — Opening a file\n\nwith open("notes.txt", "w") as f:\n    f.write("hello")\n"w" creates/overwrites the file.`,
      `Slide 2 — Reading\n\nwith open("notes.txt", "r") as f:\n    text = f.read()\nprint(text)`,
      `Slide 3 — Append\n\nwith open("notes.txt", "a") as f:\n    f.write("\nmore")\n"a" adds at the end.`,
      `Slide 4 — Why use with\n\nwith closes the file automatically, even on errors.`,
      `Slide 5 — Text vs binary\n\n"t" (default) is text. "b" is binary.\nopen("image.bin","wb") writes bytes.`,
      `Slide 6 — Encodings\n\nUse encoding="utf-8" for most text files.`,
      `Slide 7 — Errors\n\nOpening a missing file with "r" raises an error.\nUse try/except to handle it.`,
      `Slide 8 — Recap\n\nPick the right mode.\nUse with to avoid leaks.\nHandle errors kindly.`
    ],
    minigame: { type: "scrolls-files" },
  },
  {
    id: 11,
    title: "Error Handling",
    lesson: `Use try/except to handle errors.\ntry:\n  x = 1/0\nexcept ZeroDivisionError:\n  print("caught")`,
    // New: detailed, multi-slide lesson content
    lessonSlides: [
      `Slide 1 — Why handle errors?\n\nErrors (exceptions) happen when code encounters unexpected situations (e.g., division by zero, missing file). Handling them prevents crashes and lets programs recover or fail gracefully.`,
      `Slide 2 — Basic try/except\n\ntry:\n    risky()\nexcept SomeError:\n    handle()\n\nThe try block runs normally. If SomeError (or a subclass) occurs, control jumps to except.`,
      `Slide 3 — Exception hierarchy\n\nMost user-level exceptions inherit from Exception.\nBaseException is the root (includes SystemExit, KeyboardInterrupt).\nPrefer catching Exception (or specific subclasses) instead of BaseException.`,
      `Slide 4 — Catching multiple exceptions\n\ntry:\n    op()\nexcept (KeyError, IndexError) as e:\n    print("mapping/sequence problem:", e)\n\nUse a tuple to catch any of those types.`,
      `Slide 5 — Order of except blocks matters\n\ntry:\n    ...\nexcept LookupError:\n    ...\nexcept KeyError:\n    ...\n\nKeyError is a subclass of LookupError. Place specific exceptions BEFORE general ones; otherwise the specific block is never reached.`,
      `Slide 6 — else and finally\n\ntry:\n    work()\nexcept Exception:\n    log_err()\nelse:\n    print("no exceptions in try")\nfinally:\n    cleanup()\n\nelse runs only if try had no exception. finally always runs.`,
      `Slide 7 — Re-raising and preserving context\n\ntry:\n    risky()\nexcept ValueError:\n    # do something, then re-raise the same error\n    raise\n\nUse bare raise inside except to re-raise the current exception and preserve its traceback.`,
      `Slide 8 — Chaining exceptions (raise from)\n\ntry:\n    parse()\nexcept ValueError as e:\n    raise RuntimeError("parse failed") from e\n\nThe new exception keeps a __cause__ pointing to the original error for context.`,
      `Slide 9 — Custom exceptions\n\nclass ConfigError(Exception):\n    pass\n\nRaising domain-specific exceptions improves clarity and error handling granularity.`,
      `Slide 10 — Context managers and exceptions\n\nwith open(path) as f:\n    data = f.read()\n# File is closed even if an exception occurs inside the with block.\n\nUse with to ensure resources are released.`,
      `Slide 11 — Don’t swallow exceptions silently\n\nBad:\nexcept Exception:\n    pass\n\nBetter:\nexcept Exception as e:\n    log(e); raise  # or handle explicitly`,
      `Slide 12 — When NOT to catch\n\nCatching BaseException also traps KeyboardInterrupt/SystemExit.\nAvoid except Exception: pass. Catch only what you can handle meaningfully.`
    ],
    minigame: { type: "error-bombs" },
  },
  {
    id: 12,
    title: "Object-Oriented Programming (OOP)",
    lesson: `Classes define objects.\nclass Dog: pass\nd = Dog()`,
    // Beginner-friendly slides
    lessonSlides: [
      `Slide 1 — What is a class?\n\nA class is a blueprint for creating objects (things with data and behavior).`,
      `Slide 2 — Making a class\n\nclass Dog:\n    pass\nd = Dog()  # make an object (instance)`,
      `Slide 3 — Attributes\n\nclass Dog:\n    def __init__(self, name):\n        self.name = name\nrex = Dog("Rex"); print(rex.name)`,
      `Slide 4 — Methods\n\nclass Dog:\n    def bark(self):\n        print("woof")\nd = Dog(); d.bark()`,
      `Slide 5 — Inheritance\n\nclass Animal: ...\nclass Dog(Animal): ...\nDog gets features from Animal.`,
      `Slide 6 — When to use OOP\n\nUse it to group related data and functions together.`,
      `Slide 7 — Terms\n\nClass, object (instance), attribute (data), method (function in a class).`,
      `Slide 8 — Recap\n\nClasses help model real-world things with data + behavior.`
    ],
    minigame: { type: "oop-clones" },
  },
  {
    id: 13,
    title: "Advanced Topics (Decorators, Generators)",
    lesson: `Generators use yield. Decorators use @name.`,
    // Beginner-friendly slides
    lessonSlides: [
      `Slide 1 — Generators (simple)\n\nA generator produces values over time using yield.`,
      `Slide 2 — Example generator\n\ndef count(n):\n    i = 0\n    while i < n:\n        yield i\n        i += 1\nfor x in count(3): print(x)  # 0 1 2`,
      `Slide 3 — Why generators\n\nThey save memory and compute values only when needed.`,
      `Slide 4 — Decorators (simple)\n\nA decorator wraps a function to add features without changing it.`,
      `Slide 5 — Example decorator\n\nimport time\n\ndef timer(f):\n    def wrapper(*a, **kw):\n        t0 = time.time(); result = f(*a, **kw); dt = time.time()-t0\n        print("took", dt)\n        return result\n    return wrapper\n\n@timer\ndef work():\n    pass`,
      `Slide 6 — Good uses\n\nGenerators: streams, large data.\nDecorators: logging, caching, timing, access checks.`,
      `Slide 7 — Keep it simple\n\nStart with the patterns above; they cover many real needs.`,
      `Slide 8 — Recap\n\nGenerators yield values step by step. Decorators add behavior around a function.`
    ],
    minigame: { type: "decorators-energy" },
  },
  {
    id: 14,
    title: "Final Boss – Project Stage",
    lesson: `Build a tiny project: Password generator or Calculator. Combine concepts!`,
    // Beginner-friendly slides
    lessonSlides: [
      `Slide 1 — Pick a small project\n\nIdeas: password generator, calculator, to-do list.`,
      `Slide 2 — Plan features\n\nList steps. Example (password): ask length, include digits? symbols? then build string.`,
      `Slide 3 — Break into functions\n\nWrite small functions for each step: get_input(), build_password(), main()`,
      `Slide 4 — Use what you learned\n\nVariables, loops, conditionals, functions, dicts/sets, files if needed.`,
      `Slide 5 — Test as you go\n\nRun often, print values, check edge cases.`,
      `Slide 6 — Save and share\n\nKeep your code in files. Show it to a friend to try.`,
      `Slide 7 — Stretch goals\n\nAdd options, nicer messages, or read/write from a file.`,
      `Slide 8 — Recap\n\nPlan, build in small steps, test, and polish.`
    ],
    minigame: { type: "boss-project" },
  },
];

// ------------------ Quiz Banks (20+ questions per topic) ------------------
function qMC(question, choices, correct, code = null, explanation = null){ 
  return { type:'mc', question, choices, correct, code, explanation }; 
}

function makeQ1(){
  const Q=[];
  // Literals and their types
  Q.push(qMC('type(3) is ...', ['int','float','str','bool'], 0, 
  'x = 3\nprint(type(x))\nprint(type(x).__name__)', 
  'The number 3 is an integer literal. Python automatically determines data types.'));
Q.push(qMC('type(3.0) is ...', ['int','float','str','bool'], 1,
  'x = 3.0\nprint(type(x))\nprint(x == 3)  # True, but different types',
  'Adding .0 makes it a float, even though the value equals integer 3.'));
Q.push(qMC('type("3") is ...', ['int','float','str','bool'], 2,
  'x = "3"\nprint(type(x))\nprint(x + x)  # String concatenation, not addition',
  'Quotes make it a string. Notice "3" + "3" = "33", not 6.'));
Q.push(qMC('type(True) is ...', ['int','float','str','bool'], 3,
  'x = True\nprint(type(x))\nprint(x + 1)  # True acts like 1 in math',
  'True is a boolean, but it can behave like the integer 1 in calculations.'));
  // isinstance vs type
  Q.push(qMC('isinstance(True, int)?', ['True','False'], 0));
  Q.push(qMC('type(True) == int?', ['True','False'], 1));
  Q.push(qMC('True + True == ?', ['1','2','True','error'], 1));
  Q.push(qMC('int(True) == ?', ['1','0','True','error'], 0));
  // Division and floor division
  Q.push(qMC('3/2 == ?', ['1','1.5','2','error'], 1,
  'print(3/2)\nprint(type(3/2).__name__)',
  'Single slash is true division: result is float 1.5.'));
Q.push(qMC('3//2 == ?', ['1','1.5','2','error'], 0,
  'print(3//2)\nprint(type(3//2).__name__)',
  'Double slash is floor division: it drops the fractional part.'));
Q.push(qMC('-3//2 == ?', ['-1','-2','1','error'], 1,
  'print(-3//2)\nprint(-3/2)',
  'Floor division floors toward negative infinity, so -1.5 floors to -2.'));
Q.push(qMC('-3 % 2 == ?', ['-1','1','0','2'], 1,
  'print(-3 % 2)\n# In Python, a % b has the sign of b',
  'Modulo keeps the sign of the divisor; remainder is 1 so that (-3)//2 * 2 + 1 == -3.'));
  // Conversions (pitfalls)
  Q.push(qMC('int("03") == ?', ['3','3.0','"03"','error'], 0));
  Q.push(qMC('int("3.0")', ['3','ValueError','3.0','0'], 1));
  Q.push(qMC('float("nan") has type ...', ['int','float','str','bool'], 1));
  // Truthiness
  Q.push(qMC('bool([]) is ...', ['True','False'], 1));
  Q.push(qMC('bool([0]) is ...', ['True','False'], 0));
  Q.push(qMC('bool("") is ...', ['True','False'], 1));
  Q.push(qMC('bool("0") is ...', ['True','False'], 0));
  Q.push(qMC('bool(None) is ...', ['True','False'], 1));
  // Rounding behavior
  Q.push(qMC('round(2.5) == ?', ['2','3','2.0','3.0'], 0));
  Q.push(qMC('round(3.5) == ?', ['3','4','3.0','4.0'], 1));
  while(Q.length<24){ Q.push(qMC('Which is a boolean literal?', ['"True"','True','1','"False"'], 1)); }
  return Q;
}

function makeQ2(){
  const Q=[];
  // Easy arithmetic
  const pairs=[[1,2],[3,4],[7,5],[10,3],[9,2]];
  pairs.forEach(([a,b])=>{
    Q.push(qMC(`What is ${a}+${b}?`, [`${a+b-1}`, `${a+b}`, `${a*b}`], 1));
  });
  // Modulo and multiplication/div
  Q.push(qMC('3 % 2 == ?', ['0','1','2'], 1));
  Q.push(qMC('9 % 2 == ?', ['0','1','2'], 1));
  Q.push(qMC('8 / 2 == ?', ['4','4.0','2'], 1));
  Q.push(qMC('3 * 4 == ?', ['7','12','34'], 1));
  // Comparisons
  Q.push(qMC('5 > 3 is ...', ['True','False'], 0));
  Q.push(qMC('5 == 5 is ...', ['True','False'], 0));
  Q.push(qMC('4 >= 6 is ...', ['True','False'], 1));
  // Mixed expressions
  Q.push(qMC('3 + 2 * 4 == ?', ['20','11','35'], 1));
  Q.push(qMC('(3 + 2) * 4 == ?', ['20','11','14'], 0));
  Q.push(qMC('7 % 3 == ?', ['1','2','3'], 1));
  Q.push(qMC('10 - 3 * 3 == ?', ['1','7','9'], 0));
  Q.push(qMC('2 ** 3 == ?', ['6','8','9'], 1));
  while(Q.length<20){ Q.push(qMC('5 != 3 is ...', ['True','False'], 0)); }
  return Q;
}

function makeQ3(){
  const Q=[];
  Q.push(qMC('"Hello"[1:4] == ?', ['Hel','ell','llo'], 1));
  Q.push(qMC('len("Python") == ?', ['5','6','7'], 1));
  Q.push(qMC('"Py" + "thon" == ?', ['Pyth on','Python','Py-thon'], 1));
  Q.push(qMC('"abc"*3 == ?', ['abcabcabc','abc3','aaabbbccc'], 0,
  's = "abc"\nprint(s * 3)',
  'Strings support repetition with *. For example, "ha" * 3 -> "hahaha".'));
Q.push(qMC('"Hello"[0] == ?', ['H','e','o'], 0,
  's = "Hello"\nprint(s[0])',
  'Indexing starts at 0 in Python.'));
Q.push(qMC('"Hello"[-1] == ?', ['H','o','l'], 1,
  's = "Hello"\nprint(s[-1])',
  'Negative indices count from the end; -1 is the last character.'));
Q.push(qMC('"Hi".upper() == ?', ['HI','hi','Hi '], 0));
Q.push(qMC('"Hi".lower() == ?', ['HI','hi','Hi'], 1));
Q.push(qMC('"a,b,c".split(",")[1] == ?', ['a','b','c'], 1));
Q.push(qMC('"  x ".strip() == ?', ['"  x "','"x"','" x"'], 1,
  's = "  x "\nprint(s.strip())',
  'strip() removes leading and trailing whitespace.'));
Q.push(qMC('"hello".capitalize() == ?', ['Hello','HELLO','hello '], 0));
Q.push(qMC('"he" in "hello" ?', ['True','False'], 0));
Q.push(qMC('"z" in "hello" ?', ['True','False'], 1));
  while(Q.length<20){ Q.push(qMC('"Python"[1] == ?', ['P','y','t'], 1)); }
  return Q;
}

function makeQ4(){
  const Q=[];
  Q.push(qMC('my=[1,2]; my.append(3); my==?', ['[1,2]','[1,2,3]','[3,2,1]'], 1,
  'my=[1,2]\nmy.append(3)\nprint(my)',
  'append adds an item to the end of the list.'));
  Q.push(qMC('t=(1,2); t[0]==?', ['1','2','error'], 0));
  Q.push(qMC('t=(1,2); t[0]=9', ['works','error'], 1,
    't=(1,2)\ntry:\n    t[0]=9\nexcept TypeError as e:\n    print("TypeError:", e)',
    'Tuples are immutable; assigning to an index raises TypeError.'));
  Q.push(qMC('[1,2,3][0:2]==?', ['[1,2]','[2,3]','[1,2,3]'], 0));
  Q.push(qMC('[1,2,3][-1]==?', ['1','2','3'], 2));
  Q.push(qMC('2 in [1,2,3]?', ['True','False'], 0));
  Q.push(qMC('[].append(1); len==?', ['0','1','2'], 1));
  Q.push(qMC('list((1,2))==?', ['(1,2)','[1,2]','error'], 1));
  while(Q.length<20){ Q.push(qMC('len((1,2,3))==?', ['2','3','4'], 1)); }
  return Q;
}

function makeQ5(){
  const Q=[];
  Q.push(qMC('{"a":1,"b":2}["b"]==?', ['1','2','error'], 1));
  Q.push(qMC('d={"x":10}; d.get("y",0)==?', ['10','0','error'], 1));
  Q.push(qMC('set([1,1,2])==?', ['{1,1,2}','{1,2}','[1,2]'], 1));
  Q.push(qMC('"a" in {"a":1}?', ['True','False'], 0));
  Q.push(qMC('len({1,2,2,3})==?', ['3','4','2'], 0));
  Q.push(qMC('d={}; d["k"]=5; d["k"]==?', ['5','0','error'], 0));
  Q.push(qMC('d={"a":1}; d.keys().__contains__("a")?', ['True','False'], 0));
  Q.push(qMC('{1,2}|{2,3}==?', ['{1,2,3}','{2}','{1,3}'], 0));
  Q.push(qMC('{1,2}&{2,3}==?', ['{1,2,3}','{2}','{1,3}'], 1));
  Q.push(qMC('{1,2}-{2}==?', ['{1}','{2}','{1,2}'], 0));
  while(Q.length<20){ Q.push(qMC('d={"a":1}; "b" in d?', ['True','False'], 1)); }
  return Q;
}

function makeQ6(){
  const Q=[];
  Q.push(qMC('x=5; x>3?', ['True','False'], 0));
  Q.push(qMC('x=2; if x<3: runs?', ['True','False'], 0));
  Q.push(qMC('x=3; x==3?', ['True','False'], 0));
  Q.push(qMC('x=4; x!=4?', ['True','False'], 1));
  Q.push(qMC('x=5; x>=5?', ['True','False'], 0));
  Q.push(qMC('x=1; (x<3) and (x>0)?', ['True','False'], 0));
  Q.push(qMC('x=1; (x<0) or (x==1)?', ['True','False'], 0));
  Q.push(qMC('not False is ...', ['True','False'], 0));
  Q.push(qMC('not True is ...', ['True','False'], 1));
  Q.push(qMC('x=None; if x: runs?', ['Yes','No'], 1));
  while(Q.length<20){ Q.push(qMC('x=0; if x: runs?', ['Yes','No'], 1)); }
  return Q;
}

function makeQ7(){
  const Q=[];
  Q.push(qMC('for i in range(3): print(i) prints', ['1 2 3','0 1 2','0 1 2 3'], 1,
  'for i in range(3):\n    print(i, end=" ")',
  'range(3) yields 0, 1, 2 — not including 3.'));
  Q.push(qMC('list(range(2,5))==?', ['[2,3,4]','[2,3,4,5]','[3,4,5]'], 0));
  Q.push(qMC('sum(range(4))==?', ['6','10','4'], 0));
  Q.push(qMC('while i<3: i+=1 runs how many times (i starts 0)?', ['2','3','4'], 1));
  Q.push(qMC('break stops loop?', ['True','False'], 0));
  Q.push(qMC('continue skips to next iteration?', ['True','False'], 0));
  Q.push(qMC('range(1,6,2)==?', ['[1,3,5]','[1,2,3,4,5]','[2,4,6]'], 0));
  Q.push(qMC('len(list(range(5)))==?', ['4','5','6'], 1));
  Q.push(qMC('for s in "hi": prints?', ['h i','hi','i h'], 0));
  Q.push(qMC('for x in []: runs?', ['Yes','No'], 1,
  'for x in []:\n    print("will not run")\nprint("done")',
  'Looping over an empty list executes the body zero times.'));
  while(Q.length<20){ Q.push(qMC('range(0)==?', ['[]','[0]','[1]'], 0)); }
  return Q;
}

function makeQ8(){
  const Q=[];
  Q.push(qMC('def f(x): return x+1; f(2)==?', ['2','3','error'], 1));
  Q.push(qMC('def f(): return 5; f()==?', ['5','None','error'], 0));
  Q.push(qMC('def f(x=3): return x; f()==?', ['3','None','error'], 0,
    'def f(x=3):\n    return x\nprint(f())\nprint(f(5))',
    'Default parameter values are used when an argument is not provided.'));
  Q.push(qMC('def f(a,b): return a*b; f(2,4)==?', ['6','8','24'], 1));
  Q.push(qMC('def f(): pass; f()==?', ['None','0','error'], 0));
  Q.push(qMC('return exits function?', ['True','False'], 0));
  Q.push(qMC('def f(*args): len(args) for f(1,2,3)==?', ['2','3','4'], 1));
  Q.push(qMC('def f(**kw): f(a=1). "a" in kw?', ['True','False'], 0));
  Q.push(qMC('def f(x): print(x) prints type for x="a"?', ['str','int','bool'], 0));
  Q.push(qMC('lambda x: x+1 is a ...', ['function','class','module'], 0));
  while(Q.length<20){ Q.push(qMC('def f(x): return x; type(f) is ...', ['function','class','int'], 0)); }
  return Q;
}

function makeQ9(){
  const Q=[];
  Q.push(qMC('import math; math.sqrt(9)==?', ['3','3.0','9'], 1));
  Q.push(qMC('from math import pi; round(pi,2)==?', ['3.14','3.1','3.15'], 0));
  Q.push(qMC('import random; isinstance(random.randint(1,3), int)?', ['True','False'], 0));
  Q.push(qMC('import time; type(time.time())?', ['int','float','str'], 1));
  Q.push(qMC('import math as m; m.floor(3.7)==?', ['3','4','3.0'], 0));
  Q.push(qMC('Which imports module math?', ['import math','from math import sqrt as math','import sqrt'], 0));
  Q.push(qMC('random.choice([1,2]) returns', ['1 or 2','always 1','always 2'], 0));
  Q.push(qMC('time.sleep(1) does', ['pause','print time','error'], 0));
  Q.push(qMC('import sys; type(sys.path) is', ['list','dict','str'], 0));
  Q.push(qMC('import os; os.getcwd() returns', ['current dir','OS name','file count'], 0));
  while(Q.length<20){ Q.push(qMC('math.pow(2,3)==?', ['6','8','9'], 1)); }
  return Q;
}

function makeQ10(){
  const Q=[];
  Q.push(qMC('open("f.txt","w") mode is', ['read','write','append'], 1));
  Q.push(qMC('open("f.txt","r").read() returns', ['str','bytes','int'], 0));
  Q.push(qMC('Using with open(...) as f:', ['auto closes','leaks file','is error'], 0));
  Q.push(qMC('open("f.txt","a").write("x") does', ['overwrite','append','read'], 1));
  Q.push(qMC('readline() returns', ['one line','all text','bytes'], 0));
  Q.push(qMC('write() returns', ['chars written','None','bytes'], 0));
  Q.push(qMC('open non-existing with "r"', ['ok','FileNotFoundError'], 1));
  Q.push(qMC('encoding utf-8 is for', ['text','binary'], 0));
  Q.push(qMC('f.close() after with:', ['needed','not needed'], 1));
  Q.push(qMC('open("f.bin","wb") is', ['text write','binary write'], 1));
  while(Q.length<20){ Q.push(qMC('read() with empty file returns', ['""','None','error'], 0)); }
  return Q;
}

function makeQ11(){
  const Q=[];
  // Advanced semantics, ordering, chaining, custom exceptions
  Q.push(qMC('Which block runs only if no exception occurred in try?', ['except','else','finally','with'], 1));
  Q.push(qMC('finally executes...', ['only on error','only on success','always','never'], 2));
  Q.push(qMC('Given try: x[0] except Exception: pass, which exceptions are caught?', ['Only KeyError','Only IndexError','Any subclass of Exception','None'], 2));
  Q.push(qMC('Catching BaseException is discouraged because it also catches:', ['SyntaxError','KeyboardInterrupt/SystemExit','OverflowError only','No exceptions'], 1));
  Q.push(qMC('Order matters: try: {}["x"] except LookupError: A except KeyError: B', ['A then B','B (KeyError) because it is specific','Neither','Both'], 0));
  Q.push(qMC('Which statement re-raises the current exception preserving traceback?', ['raise e','raise','raise from e','throw'], 1));
  Q.push(qMC('Chaining: raise ValueError("bad") from TypeError("t") sets:', ['__cause__ to TypeError','__context__ to None','both to None','__cause__ to ValueError'], 0));
  Q.push(qMC('Select the best exception to define a domain-specific error:', ['class E(BaseException): pass','class E(Exception): pass','class E(object): pass','Use ValueError always'], 1));
  Q.push(qMC('Which tuple form is valid?', ['except KeyError, IndexError:','except (KeyError, IndexError):','except [KeyError, IndexError]:','except {KeyError, IndexError}:'], 1));
  Q.push(qMC('What does except Exception as e bind e to?', ['Exception class','traceback object','exception instance','string message'], 2));
  Q.push(qMC('try/except/else/finally: which order always executes when try raises?', ['try -> except -> finally','try -> else -> finally','try -> finally -> except','except -> try -> finally'], 0));
  Q.push(qMC('In except ValueError as e: raise, what is raised?', ['New ValueError','Original ValueError (same traceback continued)','TypeError','Nothing'], 1));
  Q.push(qMC('Which will NOT be caught by except Exception?', ['ZeroDivisionError','KeyError','SystemExit','ValueError'], 2));
  Q.push(qMC('Creating a custom exception correctly:', ['class MyErr: pass','class MyErr(Exception): pass','class MyErr(BaseException): pass','class MyErr(object): pass'], 1));
  Q.push(qMC('try: int("x") except ValueError: pass else: print("OK") What prints?', ['OK','Nothing','ValueError','x'], 1));
  Q.push(qMC('finally with return inside finally does what?', ['Overrides exceptions and returns','Is ignored','Runs after return in try but does not override','Raises SyntaxError'], 0));
  Q.push(qMC('with open(p) as f: f.read() If read() raises, then', ['file may leak open','file still closes','program crashes without exception','finally won\'t run'], 1));
  Q.push(qMC('What is best practice?', ['except Exception: pass','except Exception as e: log and re-raise if unhandled','catch BaseException to be safe','always use bare except'], 1));
  Q.push(qMC('except (IOError, OSError) is often replaced by catching:', ['FileNotFoundError only','EnvironmentError','OSError in modern Python','SystemError'], 2));
  Q.push(qMC('In except KeyError as e: str(e) for {}["x"] is typically', ['"KeyError"','"x"','"{}"','"None"'], 1));
  Q.push(qMC('try:\n    a = 1/0\nexcept ZeroDivisionError:\n    print("Z")\nfinally:\n    print("F")\nOutput?', ['F','Z','Z then F','F then Z'], 2));
  Q.push(qMC('try:\n    pass\nexcept Exception:\n    print("E")\nelse:\n    print("S")\nfinally:\n    print("F")\nOutput?', ['E then F','S then F','F only','S only'], 1));
  Q.push(qMC('try:\n    raise KeyError\nexcept LookupError:\n    print("L")\nexcept KeyError:\n    print("K")\nOutput?', ['K','L','Nothing','Error'], 1));
  while(Q.length<22){ Q.push(qMC('Prefer catching...', ['specific exceptions','BaseException','all exceptions silently','no exceptions ever'], 0)); }
  return Q;
}

function makeQ12(){
  const Q=[];
  Q.push(qMC('class Dog: pass; d=Dog(); type(d) is', ['object','class','function'], 0));
  Q.push(qMC('Methods defined with', ['def inside class','lambda','import'], 0));
  Q.push(qMC('First arg of instance method', ['self','this','cls'], 0));
  Q.push(qMC('class A: def __init__(self): self.x=1; A().x==', ['1','0','error'], 0));
  Q.push(qMC('Inheritance uses', ['class B(A):','class B->A:','class B:A'], 0));
  Q.push(qMC('isinstance(d, Dog) is', ['True','False'], 0));
  Q.push(qMC('Method call d.run() looks up', ['in Dog','in globals'], 0));
  Q.push(qMC('Attribute access d.x uses', ['__getattr__','__call__'], 0));
  Q.push(qMC('staticmethod decorator', ['no self','has self'], 0));
  Q.push(qMC('class attribute shared by', ['instances','one instance'], 0));
  while(Q.length<20){ Q.push(qMC('__init__ is', ['constructor','destructor','operator'], 0)); }
  return Q;
}

function makeQ13(){
  const Q=[];
  Q.push(qMC('Generator uses keyword', ['return','yield','await'], 1));
  Q.push(qMC('yield pauses function execution?', ['True','False'], 0));
  Q.push(qMC('Generator function returns', ['generator object','list','values'], 0));
  Q.push(qMC('next(gen) gets', ['next value','all values','first value'], 0));
  // Generator expressions
  Q.push(qMC('(x*2 for x in range(3)) creates', ['generator','list','tuple'], 0));
  Q.push(qMC('Generator expressions use', ['() parentheses','[] brackets','{} braces'], 0));
  Q.push(qMC('list(x for x in range(3))==?', ['[0,1,2]','generator','(0,1,2)'], 0));
  // Generator methods
  Q.push(qMC('gen.send(value) sends value into', ['generator','caller','nowhere'], 0));
  Q.push(qMC('gen.close() raises', ['StopIteration','GeneratorExit','ValueError'], 1));
  Q.push(qMC('yield from delegates to', ['another generator/iterable','caller','parent function'], 0));
  // Decorator basics
  Q.push(qMC('Decorator syntax starts with', ['@','%','&'], 0));
  Q.push(qMC('@deco def f(): pass equivalent to', ['f = deco(f)','deco(f)','f = deco'], 0));
  Q.push(qMC('Decorator wraps', ['function','class','module'], 0));
  // functools
  Q.push(qMC('functools.wraps preserves', ['function metadata','function speed','function result'], 0));
  Q.push(qMC('@lru_cache decorator provides', ['memoization','logging','timing'], 0));
  Q.push(qMC('functools.partial creates', ['new function with some args fixed','decorator','generator'], 0));
  // Advanced generator concepts
  Q.push(qMC('Generator pipeline chains', ['generators together','functions together','classes together'], 0));
  Q.push(qMC('Infinite generators are', ['memory efficient','memory intensive','impossible'], 0));
  Q.push(qMC('Generator state is', ['maintained between calls','reset each call','global'], 0));
  // Decorator patterns
  Q.push(qMC('Timing decorator typically uses', ['time module','datetime module','clock module'], 0));
  Q.push(qMC('Caching decorator stores', ['function results','function calls','function code'], 0));
  Q.push(qMC('Authentication decorator checks', ['user permissions','function syntax','function speed'], 0));
  Q.push(qMC('Class decorators modify', ['class definition','instance creation','method calls'], 0));
  while(Q.length<24){ Q.push(qMC('Coroutines use', ['async/await','yield','return'], 0)); }
  return Q;
}

function makeQ14(){
  const Q=[];
  // Integrated concepts from all stages
  Q.push(qMC('x=3; type(x).__name__==?', ['"int"','"integer"','"number"'], 0));
  Q.push(qMC('3**2*2+1==?', ['17','19','37'], 1));
  Q.push(qMC('"Hello"[1:4].upper()==?', ['"ELL"','"ell"','"ELLO"'], 0));
  Q.push(qMC('[1,2,3][::-1][0]==?', ['1','2','3'], 2));
  Q.push(qMC('{"a":1,"b":2}.get("c",3)==?', ['1','2','3'], 2));
  Q.push(qMC('x=0; "yes" if x else "no" returns', ['"yes"','"no"','error'], 1));
  Q.push(qMC('sum(range(1,4))==?', ['6','10','3'], 0));
  Q.push(qMC('def f(x=[]): x.append(1); return len(x); f(); f()==?', ['1','2','3'], 1));
  Q.push(qMC('import math; int(math.sqrt(16))==?', ['4','4.0','16'], 0));
  Q.push(qMC('Error handling: except ValueError catches', ['value errors','all errors','type errors'], 0));
  // Advanced integration
  Q.push(qMC('class C: x=1; C.x=2; C().x==?', ['1','2','error'], 1));
  Q.push(qMC('(lambda x: x*2)(5)==?', ['10','7','25'], 0));
  Q.push(qMC('list(enumerate("ab"))==?', ['[(0,"a"),(1,"b")]','"ab"','[0,1]'], 0));
  Q.push(qMC('{x:x*x for x in range(3)}==?', ['{0:0,1:1,2:4}','{0,1,4}','[0,1,4]'], 0));
  Q.push(qMC('set([1,2,2,3]) & set([2,3,4])==?', ['{2,3}','{1,2,3,4}','{1,4}'], 0));
  // Project-level complexity
  Q.push(qMC('Combining file I/O with JSON: json.load(open("f.json"))', ['reads JSON from file','writes JSON to file','error - missing mode'], 0));
  Q.push(qMC('try: int("x") except: "error" returns', ['"error"','ValueError','int'], 0));
  Q.push(qMC('Generator: def countdown(n): while n>0: yield n; n-=1; list(countdown(3))==?', ['[3,2,1]','[1,2,3]','[0,1,2]'], 0));
  Q.push(qMC('Decorator application: @timer def slow(): time.sleep(1); slow() prints', ['timing info','sleep output','nothing'], 0));
  Q.push(qMC('Class inheritance: class Dog(Animal): def speak(self): return "Woof"; Dog().speak()==?', ['"Woof"','"Animal sound"','error'], 0));
  // Real-world scenarios
  Q.push(qMC('Password validation: all(c.isalnum() for c in "abc123")==?', ['True','False','error'], 0));
  Q.push(qMC('Data processing: max([len(word) for word in "hello world".split()])==?', ['5','10','11'], 0));
  Q.push(qMC('Config file: with open("config.json") as f: config=json.load(f) handles', ['JSON parsing','file closing','both'], 2));
  while(Q.length<24){ Q.push(qMC('Full stack concept mastery requires', ['practice','memorization','theory only'], 0)); }
  return Q;
}

function makeQuestionsForStage(id){
  switch(id){
    case 1: return makeQ1();
    case 2: return makeQ2();
    case 3: return makeQ3();
    case 4: return makeQ4();
    case 5: return makeQ5();
    case 6: return makeQ6();
    case 7: return makeQ7();
    case 8: return makeQ8();
    case 9: return makeQ9();
    case 10: return makeQ10();
    case 11: return makeQ11();
    case 12: return makeQ12();
    case 13: return makeQ13();
    case 14: return makeQ14();
    default: return [];
  }
}

// Attach quiz banks with escalating order (already ordered easy to hard in each maker)
STAGES.forEach(s=>{ s.quiz = { type:'bank', questions: makeQuestionsForStage(s.id) }; });

// export global
window.STAGES = STAGES;