# Elements of Style - Principles for Technical Documentation

Core writing principles from Strunk & White's *Elements of Style*, adapted for technical documentation. Load this file before writing or improving any documentation.

## Summary: The 10 Core Principles

1. **Use active voice** - "The function returns X" not "X is returned"
2. **Put statements in positive form** - "Do X" not "Don't avoid X"
3. **Use definite, specific, concrete language** - Numbers, versions, exact behavior
4. **Omit needless words** - Every word must tell
5. **Express coordinate ideas in similar form** - Parallel construction
6. **Keep related words together** - Subject near verb, verb near object
7. **Choose a suitable design and hold to it** - Consistent structure
8. **Make the paragraph the unit of composition** - One topic per paragraph
9. **Avoid a succession of loose sentences** - Vary sentence structure
10. **Place emphatic words at the end** - End strong, not with qualifications

## Table of Contents

### I. Elementary Principles of Composition
- [Use the Active Voice](#use-the-active-voice)
- [Put Statements in Positive Form](#put-statements-in-positive-form)
- [Use Definite, Specific, Concrete Language](#use-definite-specific-concrete-language)
- [Omit Needless Words](#omit-needless-words)
- [Express Coordinate Ideas in Similar Form](#express-coordinate-ideas-in-similar-form)
- [Keep Related Words Together](#keep-related-words-together)
- [Choose a Suitable Design and Hold to It](#choose-a-suitable-design-and-hold-to-it)
- [Make the Paragraph the Unit of Composition](#make-the-paragraph-the-unit-of-composition)
- [Avoid a Succession of Loose Sentences](#avoid-a-succession-of-loose-sentences)
- [Place Emphatic Words at the End](#place-emphatic-words-at-the-end)

### II. Approach to Style
- [Place Yourself in the Background](#place-yourself-in-the-background)
- [Write in a Way That Comes Naturally](#write-in-a-way-that-comes-naturally)
- [Work from a Suitable Design](#work-from-a-suitable-design)
- [Write with Nouns and Verbs](#write-with-nouns-and-verbs)
- [Revise and Rewrite](#revise-and-rewrite)
- [Do Not Overwrite](#do-not-overwrite)
- [Do Not Overstate](#do-not-overstate)
- [Avoid Fancy Words](#avoid-fancy-words)
- [Be Clear](#be-clear)
- [Do Not Inject Opinion](#do-not-inject-opinion)
- [Use Figures of Speech Sparingly](#use-figures-of-speech-sparingly)
- [Avoid Foreign Languages](#avoid-foreign-languages)
- [Prefer the Standard to the Offbeat](#prefer-the-standard-to-the-offbeat)

### III. Common Patterns in Technical Writing
- [Weak Constructions to Replace](#weak-constructions-to-replace)
- [Common Qualifiers to Avoid](#common-qualifiers-to-avoid)
- [Passive Voice Patterns](#passive-voice-patterns)
- [Vague Technical Phrases](#vague-technical-phrases)

### IV. Technical Documentation Specifics
- [Code Examples](#code-examples)
- [Command Documentation](#command-documentation)
- [API Documentation](#api-documentation)
- [Error Messages](#error-messages)

---

## I. Elementary Principles of Composition

### Use the Active Voice

Active voice is direct and vigorous. Passive voice is indirect and weak.

**Pattern**: Subject performs action (active) vs subject receives action (passive)

**Bad** (passive):
```
The file is opened by the function.
An error will be returned if validation fails.
```

**Good** (active):
```
The function opens the file.
The function returns an error if validation fails.
```

**Acceptable passive** (when actor is unknown or irrelevant):
```
The data is encrypted before transmission.
The file was created in 2023.
```

---

### Put Statements in Positive Form

Make definite assertions. Avoid tame, hesitating language.

**Bad** (negative/hesitant):
```
Do not forget to set the API key.
You might want to consider using the --verbose flag.
It's not uncommon for users to encounter this error.
```

**Good** (positive/definite):
```
Set the API key before making requests.
Use the --verbose flag for detailed output.
Users commonly encounter this error.
```

---

### Use Definite, Specific, Concrete Language

Prefer the specific to the general, the definite to the vague, the concrete to the abstract.

**Bad** (vague):
```
The function runs pretty fast.
Use a recent version of Node.js.
It supports various databases.
```

**Good** (specific):
```
The function processes 10,000 records per second.
Use Node.js 18.0 or later.
It supports PostgreSQL 12+, MySQL 8+, and SQLite 3.35+.
```

---

### Omit Needless Words

Vigorous writing is concise. Every word should tell.

**Common needless phrases**:

| Wordy | Concise |
|-------|---------|
| in order to | to |
| for the purpose of | for |
| due to the fact that | because |
| at this point in time | now |
| has the ability to | can |
| make a determination | determine |
| give consideration to | consider |
| in the event that | if |
| there is/are | [restructure] |
| it is [adjective] that | [restructure] |

**Bad**:
```
In order to install the package, you will need to run the following command.
It should be noted that this function has the ability to process large files.
```

**Good**:
```
To install the package, run this command.
This function can process large files.
```

**Remove these qualifiers**: very, really, quite, rather, somewhat, fairly, pretty, basically, essentially, actually, just, simply, merely

---

### Express Coordinate Ideas in Similar Form

Parallel construction makes related ideas easier to recognize.

**Bad** (not parallel):
```
The library provides:
- Data validation
- Transforming data
- To sanitize inputs
```

**Good** (parallel):
```
The library provides:
- Data validation
- Data transformation
- Input sanitization
```

---

### Keep Related Words Together

Words that form a unit should not be separated. Keep subject near verb, verb near object.

**Bad** (separated):
```
The function, when called with invalid input, returns an error.
The user must, before sending any requests, configure the API key.
```

**Good** (together):
```
The function returns an error when called with invalid input.
The user must configure the API key before sending requests.
```

---

### Choose a Suitable Design and Hold to It

A document's organization should match its purpose. Maintain structure consistently.

**For technical documentation**:
- READMEs: Overview → Installation → Usage → Configuration
- API docs: Endpoints grouped by resource, consistent format
- Tutorials: Sequential steps, each building on previous
- Architecture docs: Context → Decision → Consequences

---

### Make the Paragraph the Unit of Composition

Each paragraph addresses a single topic. Begin with a topic sentence.

**Bad** (multiple topics):
```
This function processes user input. It also validates the data and stores it in the database.
Error handling is important because invalid data can cause crashes.
```

**Good** (one topic per paragraph):
```
This function processes user input and returns a boolean indicating success.

The function validates input before processing. Invalid data returns false immediately.

On successful validation, the function stores the data in the database.
```

---

### Avoid a Succession of Loose Sentences

Vary sentence structure. Mix short and long sentences. Use subordination to show relationships.

**Bad** (all loose):
```
Create a file. Name it config.json. Open it. Add content. Save it. Run the app.
```

**Good** (varied):
```
Create a file named config.json and add the following content. When you run the
application, it reads this config file and applies your settings.
```

---

### Place Emphatic Words at the End

The end of a sentence is the most emphatic position.

**Bad** (weak endings):
```
Run the tests before deploying, if possible.
Configure the database connection string first, typically.
```

**Good** (emphatic endings):
```
Before deploying, run the tests.
First, configure the database connection string.
```

---

## II. Approach to Style

### Place Yourself in the Background

Write in a way that draws attention to the subject matter, not the writer.

**Bad** (writer-focused):
```
I think you should use the --verbose flag.
We believe this is the right solution.
```

**Good** (subject-focused):
```
Use the --verbose flag for detailed output.
This solution addresses the core requirements.
```

---

### Write in a Way That Comes Naturally

Avoid forced or artificial language.

**Bad** (forced):
```
One must ensure that the configuration file is properly instantiated prior to
executing the application binary.
```

**Good** (natural):
```
Create and configure the config file before running the application.
```

---

### Work from a Suitable Design

Plan the structure before writing. Outline major sections to ensure logical flow.

---

### Write with Nouns and Verbs

Strong nouns and verbs carry meaning. Minimize adjectives and adverbs.

**Bad** (weak):
```
The function does validation of the input very quickly.
```

**Good** (strong):
```
The function validates the input in 10ms.
```

---

### Revise and Rewrite

First drafts are rarely optimal. Edit ruthlessly.

**Editing checklist**:
- Remove needless words
- Convert passive to active voice
- Replace vague words with specific ones
- Eliminate qualifiers
- Verify examples are executable

---

### Do Not Overwrite

Don't use ten words when five will do.

**Bad**:
```
First and foremost, it is absolutely essential to validate user input before processing.
```

**Good**:
```
Validate user input before processing.
```

---

### Do Not Overstate

Avoid hyperbole and exaggeration.

**Bad**:
```
This revolutionary approach completely solves all performance problems.
```

**Good**:
```
This approach reduces response time by 40%.
```

---

### Avoid Fancy Words

Use simple, direct language.

| Fancy | Simple |
|-------|--------|
| utilize | use |
| implement | use, add, create |
| leverage | use |
| facilitate | help, enable |
| commence | begin, start |
| terminate | end, stop |

---

### Be Clear

Clarity is the primary goal. Sacrifice everything else for clarity.

**Unclear**:
```
The function may return null if the parameter is invalid or the operation fails
depending on the configuration.
```

**Clear**:
```
The function returns null in two cases:
- The parameter is invalid
- The operation fails and config.failSafe is true
```

---

### Do Not Inject Opinion

State facts, not judgments.

**Bad** (opinion):
```
The old API was terrible and poorly designed.
```

**Good** (fact):
```
The old API required three requests to accomplish this task. The new API requires one.
```

---

### Use Figures of Speech Sparingly

Metaphors can clarify, but technical accuracy matters more.

**Appropriate**:
```
The service acts as a gatekeeper, allowing only authenticated requests.
```

**Unnecessary**:
```
The function dances through the data, gracefully extracting information.
```

---

### Avoid Foreign Languages

Use English terms when they exist.

**Appropriate** (established terms):
```
ad hoc query
de facto standard
```

**Inappropriate**:
```
Use the library vis-à-vis data processing.
```

---

### Prefer the Standard to the Offbeat

Use conventional language and structure. Avoid clever or quirky language.

---

## III. Common Patterns in Technical Writing

### Weak Constructions to Replace

**"There is/are"**:
- Bad: There are three methods available.
- Good: Three methods are available.
- Better: Use any of three methods.

**"It is"**:
- Bad: It is important to note that validation is required.
- Good: Validation is required.

**"In order to"**:
- Bad: In order to install, run npm install.
- Good: To install, run npm install.

**"Has the ability to"**:
- Bad: The function has the ability to process large files.
- Good: The function processes large files.

---

### Common Qualifiers to Avoid

Eliminate or justify each instance:

very, really, quite, rather, somewhat, fairly, pretty (as in "pretty fast"), relatively, comparatively, possibly, probably, perhaps, maybe, might, arguably, seemingly, apparently, generally, usually (unless specifying frequency), typically, basically, essentially, actually, just, simply, merely

**Bad**:
```
This is a fairly simple process.
Just run this command.
```

**Good**:
```
This is a simple process.
Run this command.
```

---

### Passive Voice Patterns

Recognize and replace:

**"Is/are/was/were [verb]ed by"**:
- Bad: The file is opened by the function.
- Good: The function opens the file.

**"Should be [verb]ed"**:
- Bad: The API key should be configured before use.
- Good: Configure the API key before use.

**"Will be [verb]ed"**:
- Bad: An error will be returned if validation fails.
- Good: The function returns an error if validation fails.

---

### Vague Technical Phrases

Replace with specific information:

**"Various", "several"**:
- Bad: Supports various databases.
- Good: Supports PostgreSQL, MySQL, and SQLite.

**"Some", "certain"**:
- Bad: Some configurations require additional setup.
- Good: Configurations with authentication require additional setup.

**"May", "might"** (when certainty exists):
- Bad: This may cause errors.
- Good: This causes 'Invalid Input' errors.

**"Appropriate", "proper"** (without defining):
- Bad: Configure the settings appropriately.
- Good: Set timeout to 30 seconds and max_retries to 3.

**"Recent", "latest"** (without version):
- Bad: Use a recent version of Node.js.
- Good: Use Node.js 18.0 or later.

**"Fast", "slow"** (without measurement):
- Bad: The function is fast.
- Good: The function processes 10,000 records per second.

---

## IV. Technical Documentation Specifics

### Code Examples

**Principles**:
- All code examples must be executable
- Show complete, working code
- Include necessary imports and setup
- Specify language for syntax highlighting

**Bad** (incomplete):
```
user = authenticate(username, password)
```

**Good** (complete):
```javascript
const { authenticate } = require('./auth');

const user = await authenticate(username, password);
if (user) {
  console.log('Authentication successful');
}
```

---

### Command Documentation

**Principles**:
- Show complete commands with all flags
- Include working directory context when relevant
- Show expected output

**Bad**:
```
Run the tests.
```

**Good**:
```bash
# Run all tests
npm test

# Run specific test file
npm test -- auth.test.js
```

---

### API Documentation

**Document for each function/endpoint**:
- Signature with types
- Description (one sentence + context if needed)
- Parameters (name, type, required/optional, description)
- Return value (type, description)
- Errors/exceptions
- Example usage

**Example**:
```
validate(schema: Schema, data: unknown): ValidationResult

Validates data against a schema.

Parameters:
- schema (Schema, required): Validation rules
- data (unknown, required): Data to validate

Returns:
- ValidationResult: { valid: boolean, errors: ValidationError[] }

Throws:
- SchemaError: If schema is invalid

Example:
const result = validate(schema, { email: 'user@example.com' });
```

---

### Error Messages

**Document common errors**:
- Show actual error message
- Explain cause
- Provide concrete solution

**Example**:
```
Error: "ECONNREFUSED"
Cause: Cannot connect to database.
Solution: Verify database is running: systemctl status postgresql
```

---

## Quick Reference: Editing Passes

**First pass - Remove needless words**:
- Search for "in order to", "for the purpose of", "due to the fact that"
- Eliminate qualifiers: "quite", "very", "rather", "somewhat"
- Remove "basically", "actually", "really", "just", "simply"

**Second pass - Strengthen voice**:
- Convert passive to active
- Remove "there is/are" constructions
- Replace weak verbs (is, has, can be) with strong verbs

**Third pass - Increase specificity**:
- Replace vague terms with specific values
- Replace "various", "several" with actual items
- Add concrete examples

**Fourth pass - Structure**:
- Use parallel construction in lists
- Break long paragraphs into focused sections
- Place emphatic words at the end
