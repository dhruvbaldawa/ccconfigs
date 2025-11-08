# Documentation Examples: Before and After

This document shows concrete examples of documentation improvements by applying Strunk & White principles. Each example includes annotations explaining what changed and why.

## Example 1: README - Project Description

### Before

```markdown
# MyProject

This is basically a really awesome library that we've built in order to help developers
who are working with data processing tasks. It's something that you might want to
consider using if you happen to be dealing with situations where you need to validate,
transform, or otherwise manipulate data in your applications. We think it's pretty useful
and it has been designed in such a way that it's fairly easy to use.

The library is able to handle various different types of data formats including JSON, XML,
and CSV files. There are several different validation rules that can be applied depending
on what your specific use case happens to be. It also has the capability to perform
transformations on your data.
```

### After

```markdown
# MyProject

A TypeScript library for validating and transforming structured data.

Supports JSON, XML, and CSV formats with built-in validation rules and custom
transformations.
```

### What Changed

**Removed needless words**:
- "basically", "really awesome", "we've built" → Focus on what it is, not opinions
- "in order to help" → Just state what it does
- "you might want to consider using if you happen to be" → Removed hedging
- "various different types" → "Supports"
- "has the capability to perform" → Direct verb

**Used active voice**:
- "It has been designed" → Removed entirely (passive construction)
- "can be applied" → Implicit in "with built-in validation rules"

**Made statements definite**:
- "pretty useful", "fairly easy" → Removed subjective qualifiers
- "several different validation rules" → "built-in validation rules"

**Result**: Clear, concise description that tells readers exactly what the library does.

---

## Example 2: API Documentation - Function Description

### Before

```markdown
### validateData()

This function is used for the purpose of validating data that has been provided by the user.
It should be noted that the function will perform various checks on the input data in order
to ensure that it meets the requirements that have been specified in the schema. In the
event that the validation process fails, an error will be returned to the calling code.

You might want to consider using this function whenever you need to make sure that user
input is valid before you process it further. It's generally recommended that validation
should be performed as early as possible in your data processing pipeline.

Parameters:
- data: This is the data that you want to validate
- schema: This represents the validation rules
- options: These are optional configuration settings

Returns: A result object will be returned that contains information about whether the
validation succeeded or failed.
```

### After

```markdown
### validateData(data, schema, options)

Validates data against a schema and returns the result.

**Parameters:**
- `data` (any): Data to validate
- `schema` (Schema): Validation rules
- `options` (ValidationOptions, optional): Configuration options

**Returns:**
- `ValidationResult`: Object with `valid` (boolean) and `errors` (array)

**Example:**

```javascript
const result = validateData(
  { email: 'user@example.com', age: 25 },
  { email: 'email', age: { type: 'number', min: 18 } }
);

if (result.valid) {
  console.log('Valid data');
} else {
  console.error('Errors:', result.errors);
}
```
```

### What Changed

**Removed weak constructions**:
- "is used for the purpose of" → Direct verb "Validates"
- "It should be noted that" → Removed entirely
- "in order to ensure" → "and returns"
- "in the event that" → Removed (shown in example)
- "will be returned" → Direct "Returns"

**Removed qualifiers and hedging**:
- "You might want to consider" → Removed
- "generally recommended" → Removed (focus on what the function does, not advice)

**Used specific, concrete language**:
- "various checks" → Removed vague description
- "contains information about whether" → "with `valid` (boolean)"
- Added type information for all parameters
- Added concrete example

**Made it scannable**:
- Structured parameters clearly with types
- Explicit return type
- Working code example

**Result**: Developers can quickly understand exactly how to use the function.

---

## Example 3: Tutorial - Installation Section

### Before

```markdown
## Getting Started with Installation

Before you can actually start using MyProject, you're going to need to install it first.
The installation process is actually pretty straightforward and shouldn't take too long.

First of all, you need to make sure that you have Node.js installed on your system. If
you don't already have Node.js, you should probably go ahead and install it. You'll want
to use a relatively recent version - we'd recommend using something like version 14 or
higher, but newer versions should work fine too.

Once you've got Node.js set up and ready to go, you can then proceed to install MyProject
itself. There are actually a couple of different ways you could do this, but the easiest
and most common approach is probably to use npm. Just open up your terminal or command
prompt and type in the following command:

```
npm install myproject
```

After npm finishes downloading and installing all of the necessary dependencies and files,
you should be all set and ready to start using MyProject in your own projects!
```

### After

```markdown
## Installation

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
```

### What Changed

**Eliminated filler and needless words**:
- "Before you can actually start using" → Prerequisites stated directly
- "The installation process is actually pretty straightforward" → Removed self-description
- "First of all", "Once you've got", "After npm finishes" → Direct instructions
- "shouldn't take too long", "all set and ready" → Removed fluff

**Removed hedging**:
- "you're going to need to", "you should probably" → Direct requirement
- "we'd recommend using something like" → Specific version requirement
- "should work fine too" → Removed qualification
- "easiest and most common approach is probably" → Shown as default

**Made it actionable**:
- Removed explanation of why you need Node.js (obvious)
- Direct commands instead of "type in the following"
- Added verification step (concrete)

**Result**: Users can install in under 1 minute without reading unnecessary explanation.

---

## Example 4: Architecture Documentation - Design Decision

### Before

```markdown
## Why We Decided to Use Message Queues

After quite a bit of discussion and consideration of various different options, we made
the decision to use message queues (specifically RabbitMQ) for communication between our
different services. This was something that we thought about pretty carefully because it's
an important architectural decision that would have significant implications.

Basically, the main reason why we went with message queues is because they help to decouple
the services from each other. What this means is that if one service happens to go down or
become unavailable for whatever reason, it won't necessarily cause problems for the other
services. The messages will just queue up and wait until the service comes back online.

Another thing that's nice about using message queues is that they make it easier to handle
situations where you might have sudden spikes in traffic. The queue can act as a sort of
buffer that absorbs the extra load.

We did consider some alternative approaches. One option we looked at was just having the
services call each other directly using HTTP APIs, which would have been simpler in some
ways. But we ultimately felt that the benefits of using message queues outweighed the added
complexity of having to run and maintain RabbitMQ.
```

### After

```markdown
## Design Decision: Message Queue Communication

**Decision**: Use RabbitMQ message queues for inter-service communication.

**Rationale**:

Services remain operational when dependencies fail. If the Processing Service crashes,
the Ingest Service continues accepting requests and queuing messages. Processing resumes
when the service recovers.

Message queues buffer traffic spikes. During high load, messages queue without overwhelming
downstream services.

**Alternatives Considered**:

Direct HTTP calls between services:
- Simpler infrastructure (no message broker)
- Tight coupling - failures cascade
- No built-in buffering for traffic spikes

**Tradeoffs**:

Added operational complexity:
- RabbitMQ cluster to maintain
- Additional infrastructure costs
- More complex local development setup

Eventual consistency:
- Messages process asynchronously
- Requests complete before processing finishes
- Suitable for our use case (batch processing)
```

### What Changed

**Removed qualifiers and hedging**:
- "quite a bit of discussion", "various different options" → Removed process description
- "something that we thought about pretty carefully" → Focus on decision
- "basically", "what this means is" → Direct explanation
- "might have", "sort of" → Definite statements

**Used active voice**:
- "we made the decision" → "Decision:" header
- "they help to decouple" → "Services remain operational"
- "one option we looked at was" → "Direct HTTP calls"

**Made statements specific**:
- "help to decouple the services" → Concrete example of decoupling benefit
- "easier to handle situations where you might have sudden spikes" → "buffer traffic spikes"
- "simpler in some ways" → Specific simplicity (infrastructure)
- "benefits outweighed the added complexity" → Explicit tradeoffs

**Improved structure**:
- Clear sections: Decision, Rationale, Alternatives, Tradeoffs
- Scannable format
- Parallel construction

**Result**: Future maintainers understand the decision and can reevaluate when context changes.

---

## Example 5: CLI Documentation - Command Usage

### Before

```markdown
## The Process Command

This command is used when you want to process your data files. Basically what it does is
it takes a file that you specify as input, and then it will go ahead and process that file
according to whatever rules you've set up in your configuration.

To use this command, you would typically run something like this:

```
myapp process yourfile.json
```

There are also a number of different options and flags that you can use if you want to
customize how the processing works:

- If you want the output to go to a file instead of just printing to the console, you can
  use the -o flag followed by the filename where you want the output to be saved
- There's a -v flag that you can use if you want to see more detailed information about
  what's happening during the processing
- You can also use the --format flag to specify what format you want the output in, like
  for example json or csv or table format
```

### After

```markdown
## `process <file>`

Processes a data file and outputs results.

**Usage:**

```bash
myapp process <file> [options]
```

**Arguments:**
- `<file>`: Input file path (JSON or CSV)

**Options:**
- `-o, --output <file>`: Write output to file (default: stdout)
- `-v, --verbose`: Show detailed progress
- `-f, --format <type>`: Output format: json, csv, table (default: json)

**Examples:**

```bash
# Process and output to console
myapp process data.json

# Save results to file
myapp process data.json -o results.json

# Table format with verbose output
myapp process data.csv -f table -v
```
```

### What Changed

**Removed explanation of the obvious**:
- "This command is used when you want to" → Direct description
- "Basically what it does is it takes a file" → Usage pattern
- "according to whatever rules you've set up" → Implicit

**Used definite language**:
- "you would typically run something like" → "Usage:" with actual syntax
- "a number of different options" → Explicit list
- "if you want to customize" → Options shown directly

**Improved formatting**:
- Code syntax in command name
- Structured sections
- Parallel option descriptions
- Working examples instead of descriptions

**Removed qualifiers**:
- "typically", "basically", "also" → Removed
- "like for example" → Direct list

**Result**: Users can quickly scan options and copy working commands.

---

## Example 6: Error Documentation

### Before

```markdown
## Errors You Might Encounter

Sometimes when you're using the API, you might run into some errors. There are various
different types of errors that could potentially occur, depending on what's going wrong.

If you get an error message that says something about invalid credentials or authentication
failed, this usually means that there's probably something wrong with your API key. You
should check to make sure you've set it correctly and that it hasn't expired or anything
like that.

Another common error that people sometimes see is when the API returns a message about
rate limiting. Basically what this means is that you've been making too many requests too
quickly. If you encounter this, you'll need to slow down your requests a bit or wait for
a while before trying again.
```

### After

```markdown
## Common Errors

### Authentication Errors

**Error:** `401 Unauthorized: Invalid API key`

**Cause:** API key is missing, incorrect, or expired.

**Solution:**

1. Verify API key is set:
   ```bash
   echo $API_KEY
   ```

2. Check key is valid in dashboard: https://dashboard.example.com/keys

3. Regenerate key if expired

### Rate Limit Errors

**Error:** `429 Too Many Requests: Rate limit exceeded`

**Cause:** Too many requests in a short time period. Limit: 100 requests per minute.

**Solution:**

Wait 60 seconds before retrying, or implement exponential backoff:

```javascript
async function retryWithBackoff(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (err.status === 429 && i < maxRetries - 1) {
        await sleep(Math.pow(2, i) * 1000);
      } else {
        throw err;
      }
    }
  }
}
```
```

### What Changed

**Made errors specific**:
- "an error message that says something about" → Exact error message
- "various different types of errors that could potentially occur" → Specific error sections
- "usually means that there's probably" → Direct cause

**Removed hedging**:
- "you might run into", "might encounter", "sometimes" → Direct presentation
- "usually", "probably", "or anything like that" → Specific causes
- "need to slow down a bit or wait for a while" → Specific solution

**Added concrete solutions**:
- Vague advice → Step-by-step resolution
- "check to make sure" → Actual commands to run
- "wait for a while" → Specific duration (60 seconds)

**Used active voice**:
- "could potentially occur" → Organized by error type
- "this means is that" → Direct explanation

**Result**: Users can diagnose and fix errors without guessing.

---

## Example 7: Configuration Documentation

### Before

```markdown
## How to Configure the Application

The application can be configured in various different ways depending on your needs and
preferences. Generally speaking, you'll probably want to set up a configuration file where
you can specify the different settings that you want to use.

The configuration file should be placed in your home directory, and it should be named
something like `.myapp/config.json` or similar. In this file, you can put various settings
in JSON format. For example, you might want to set things like the API key, or maybe
configure timeout values, or specify what log level you prefer.

Here's a basic example of what a configuration file might look like:

```
{
  "apiKey": "put-your-key-here",
  "timeout": 30,
  "logLevel": "info"
}
```

You can also override these settings using environment variables if you want, which can be
useful in certain situations.
```

### After

```markdown
## Configuration

Create `~/.myapp/config.json`:

```json
{
  "apiKey": "your-api-key",
  "timeout": 30,
  "logLevel": "info"
}
```

**Available Options:**

- `apiKey` (string, required): API key from https://dashboard.example.com
- `timeout` (number, default: 30): Request timeout in seconds
- `logLevel` (string, default: "info"): Log level - debug, info, warn, error

**Configuration Precedence:**

1. Environment variables (`MYAPP_API_KEY`, `MYAPP_TIMEOUT`)
2. Config file (`~/.myapp/config.json`)
3. Defaults

**Example:**

```bash
# Override config with environment variable
MYAPP_TIMEOUT=60 myapp process data.json
```
```

### What Changed

**Removed needless words**:
- "The application can be configured in various different ways" → Direct instruction
- "Generally speaking, you'll probably want" → Direct guidance
- "should be named something like" → Exact path
- "you can put various settings" → Direct example
- "might want to set things like" → Structured list

**Made information specific**:
- "or similar", "or maybe" → Exact options
- "put-your-key-here" → Clear placeholder
- "can be useful in certain situations" → Precedence order shown

**Improved structure**:
- Lead with example
- Then explain options
- Then show precedence
- Use consistent formatting

**Removed hedging**:
- "might look like", "if you want" → Direct examples
- "various", "different" → Specific options

**Result**: Users know exactly where to put configuration and what options are available.

---

## Key Patterns Across Examples

### Pattern 1: Remove Hedging

**Before:** "You might want to consider possibly using..."
**After:** "Use..."

**Before:** "This is generally recommended in most cases..."
**After:** "Use X for Y."

### Pattern 2: Use Active Voice

**Before:** "An error will be returned by the function..."
**After:** "The function returns an error..."

**Before:** "The file should be created in..."
**After:** "Create the file in..."

### Pattern 3: Be Specific

**Before:** "Use a recent version of Node.js"
**After:** "Use Node.js 14 or later"

**Before:** "The API is fast"
**After:** "The API responds in under 100ms"

### Pattern 4: Remove Needless Words

**Before:** "In order to install the package..."
**After:** "To install the package..."

**Before:** "For the purpose of testing..."
**After:** "For testing..." or "To test..."

### Pattern 5: Lead with Action

**Before:** "If you want to process a file, you would run..."
**After:** "Process a file:\n```\ncommand file\n```"

**Before:** "The next step is to configure..."
**After:** "Configure..."

### Pattern 6: Show, Don't Tell

**Before:** "The function is easy to use"
**After:** [Show a simple example]

**Before:** "Installation is straightforward"
**After:** [Show the one-line install command]

---

## Applying These Patterns

When improving documentation:

1. **First pass - Remove needless words**
   - Search for "in order to", "for the purpose of", "due to the fact that"
   - Eliminate "basically", "actually", "really", "just", "simply"
   - Remove qualifiers: "quite", "very", "rather", "somewhat"

2. **Second pass - Strengthen voice**
   - Convert passive to active
   - Replace weak verbs (is, has, can be) with strong verbs
   - Remove "there is/are" constructions

3. **Third pass - Increase specificity**
   - Replace vague terms with specific values
   - Replace "various", "several", "some" with actual items
   - Add concrete examples

4. **Fourth pass - Structure**
   - Use parallel construction in lists
   - Lead with action
   - Break long paragraphs into focused sections

The result: Documentation that's clearer, shorter, and more useful to readers.
