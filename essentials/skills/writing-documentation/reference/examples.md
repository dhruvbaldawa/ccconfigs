# Documentation Examples: Before and After

Concrete examples of documentation improvements by applying Strunk & White principles. Each example includes annotations explaining key changes.

## Example 1: README - Project Description

### Before (73 words)

```
# MyProject

This is basically a really awesome library that we've built in order to help developers
who are working with data processing tasks. It's something that you might want to
consider using if you happen to be dealing with situations where you need to validate,
transform, or otherwise manipulate data in your applications. We think it's pretty useful
and it has been designed in such a way that it's fairly easy to use.
```

### After (17 words)

```
# MyProject

A TypeScript library for validating and transforming structured data.

Supports JSON, XML, and CSV formats with built-in validation rules.
```

### Key Changes

**Removed needless words**:
- "basically", "really awesome", "we've built", "in order to help"
- "you might want to consider using if you happen to be"
- "pretty useful", "fairly easy", "in such a way that"

**Removed hedging and qualifiers**:
- "basically", "pretty", "fairly", "might", "happen to be"

**Used definite, specific language**:
- "A TypeScript library" instead of vague description
- "Supports JSON, XML, and CSV" instead of "various different types"
- Listed capabilities directly instead of hedging

**Result**: 77% shorter while conveying all essential information.

---

## Example 2: API Documentation - Function Description

### Before (119 words)

```
### validateData()

This function is used for the purpose of validating data that has been provided by the user.
It should be noted that the function will perform various checks on the input data in order
to ensure that it meets the requirements that have been specified in the schema. In the
event that the validation process fails, an error will be returned to the calling code.

You might want to consider using this function whenever you need to make sure that user
input is valid before you process it further.

Parameters:
- data: This is the data that you want to validate
- schema: This represents the validation rules

Returns: A result object will be returned that contains information about whether the
validation succeeded or failed.
```

### After (38 words + example)

**Function signature:**
```
validateData(data, schema, options)
```

**Description:**
Validates data against a schema and returns the result.

**Parameters:**
- `data` (any): Data to validate
- `schema` (Schema): Validation rules
- `options` (ValidationOptions, optional): Configuration

**Returns:**
- `ValidationResult`: { valid: boolean, errors: array }

**Example:**
```javascript
const result = validateData(
  { email: 'user@example.com' },
  { email: 'email' }
);
```

### Key Changes

**Removed weak constructions**:
- "is used for the purpose of" → "Validates"
- "It should be noted that" → removed
- "in order to ensure" → implicit in "validates"
- "in the event that" → shown in example
- "will be returned" → "Returns"

**Removed hedging**:
- "You might want to consider" → removed (focus on what it does)
- "various checks" → removed vague description

**Added specificity**:
- Type information for all parameters
- Exact return structure
- Working code example

**Result**: More information in fewer words, scannable format.

---

## Example 3: Tutorial - Installation Section

### Before (139 words)

```
## Getting Started with Installation

Before you can actually start using MyProject, you're going to need to install it first.
The installation process is actually pretty straightforward and shouldn't take too long.

First of all, you need to make sure that you have Node.js installed on your system. If
you don't already have Node.js, you should probably go ahead and install it. You'll want
to use a relatively recent version - we'd recommend using something like version 14 or
higher, but newer versions should work fine too.

Once you've got Node.js set up and ready to go, you can then proceed to install MyProject
itself. Just open up your terminal and type in the following command:

npm install myproject

After npm finishes downloading and installing all of the necessary dependencies, you
should be all set!
```

### After (28 words)

**Section heading:**
```
## Installation
```

**Content:**

Requires Node.js 14 or later.

Install via npm:
```bash
npm install myproject
```

Verify installation:
```javascript
const myproject = require('myproject');
console.log(myproject.version);
```

### Key Changes

**Eliminated filler**:
- "Before you can actually start using", "pretty straightforward", "shouldn't take too long"
- "First of all", "Once you've got", "all set and ready"
- All explanatory preamble removed

**Removed hedging**:
- "you're going to need to", "you should probably"
- "we'd recommend something like", "should work fine too"
- "Just open up your terminal and type in"

**Made actionable**:
- Direct commands instead of instructions about commands
- Added verification step (concrete action)
- Removed obvious explanations (why you need Node.js)

**Result**: 80% shorter, faster to execute.

---

## Example 4: Architecture Documentation - Design Decision

### Before (172 words)

```
## Why We Decided to Use Message Queues

After quite a bit of discussion and consideration of various different options, we made
the decision to use message queues (specifically RabbitMQ) for communication between our
different services. This was something that we thought about pretty carefully because it's
an important architectural decision.

Basically, the main reason why we went with message queues is because they help to decouple
the services from each other. What this means is that if one service happens to go down or
become unavailable for whatever reason, it won't necessarily cause problems for the other
services. The messages will just queue up and wait.

Another thing that's nice about using message queues is that they make it easier to handle
situations where you might have sudden spikes in traffic. The queue can act as a sort of
buffer.

We did consider some alternative approaches. One option we looked at was just having the
services call each other directly using HTTP APIs, which would have been simpler in some
ways. But we ultimately felt that the benefits outweighed the added complexity.
```

### After (72 words)

**Section heading:**
```
## Design Decision: Message Queue Communication
```

**Decision**: Use RabbitMQ message queues for inter-service communication.

**Rationale**:

Services remain operational when dependencies fail. If the Processing Service crashes,
the Ingest Service continues accepting requests. Processing resumes when the service recovers.

Message queues buffer traffic spikes without overwhelming downstream services.

**Alternatives Considered**:

Direct HTTP calls:
- Simpler infrastructure (no message broker)
- Tight coupling - failures cascade
- No built-in buffering

**Tradeoffs**:

Added operational complexity (RabbitMQ cluster to maintain) and eventual consistency
(messages process asynchronously) for improved resilience.

### Key Changes

**Removed qualifiers and hedging**:
- "quite a bit of discussion", "various different options", "something that we thought about pretty carefully"
- "basically", "what this means is", "might have", "sort of"
- All process description removed

**Used active voice and structure**:
- "we made the decision" → "Decision:" header
- Organized into clear sections: Decision, Rationale, Alternatives, Tradeoffs
- Parallel construction throughout

**Made statements specific**:
- "help to decouple the services" → concrete example of decoupling
- "easier to handle situations where you might have sudden spikes" → "buffer traffic spikes"
- "simpler in some ways" → specific simplicity (infrastructure)
- "benefits outweighed the added complexity" → explicit tradeoffs listed

**Result**: 58% shorter, scannable structure, clear decision record.

---

## Common Patterns Across Examples

### Pattern 1: Remove Hedging
- Before: "You might want to consider possibly using..."
- After: "Use..."

### Pattern 2: Use Active Voice
- Before: "An error will be returned by the function..."
- After: "The function returns an error..."

### Pattern 3: Be Specific
- Before: "Use a recent version of Node.js"
- After: "Use Node.js 14 or later"

### Pattern 4: Remove Needless Words
- Before: "In order to install the package..."
- After: "To install the package..."
- Better: "Install via npm:"

### Pattern 5: Lead with Action
- Before: "If you want to process a file, you would run..."
- After: "Process a file:\n```\ncommand file\n```"

### Pattern 6: Show, Don't Tell
- Before: "The function is easy to use"
- After: [Show a simple example]

---

## Applying These Patterns

**First pass - Remove needless words**:
- Search for "in order to", "for the purpose of", "due to the fact that"
- Eliminate "basically", "actually", "really", "just", "simply"
- Remove qualifiers: "quite", "very", "rather", "somewhat"

**Second pass - Strengthen voice**:
- Convert passive to active
- Replace weak verbs (is, has, can be) with strong verbs
- Remove "there is/are" constructions

**Third pass - Increase specificity**:
- Replace vague terms with specific values
- Replace "various", "several", "some" with actual items
- Add concrete examples

**Fourth pass - Structure**:
- Use parallel construction in lists
- Lead with action
- Break long paragraphs into focused sections
