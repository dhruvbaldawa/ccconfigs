# Elements of Style - Principles for Technical Documentation

This document distills core writing principles from Strunk & White's *Elements of Style*, adapted specifically for technical documentation. Load this file before writing or improving any documentation to produce clearer, more concise output.

## Table of Contents

### I. Elementary Principles of Composition
- [Choose a Suitable Design and Hold to It](#choose-a-suitable-design-and-hold-to-it)
- [Make the Paragraph the Unit of Composition](#make-the-paragraph-the-unit-of-composition)
- [Use the Active Voice](#use-the-active-voice)
- [Put Statements in Positive Form](#put-statements-in-positive-form)
- [Use Definite, Specific, Concrete Language](#use-definite-specific-concrete-language)
- [Omit Needless Words](#omit-needless-words)
- [Avoid a Succession of Loose Sentences](#avoid-a-succession-of-loose-sentences)
- [Express Coordinate Ideas in Similar Form](#express-coordinate-ideas-in-similar-form)
- [Keep Related Words Together](#keep-related-words-together)
- [Place Emphatic Words at the End](#place-emphatic-words-at-the-end)

### II. Elementary Rules of Usage
- [Form the Possessive Singular with 's](#form-the-possessive-singular-with-s)
- [Use Proper Punctuation](#use-proper-punctuation)
- [Enclose Parenthetic Expressions Between Commas](#enclose-parenthetic-expressions-between-commas)
- [Place a Comma Before a Conjunction in a Series](#place-a-comma-before-a-conjunction-in-a-series)
- [Do Not Join Independent Clauses with a Comma](#do-not-join-independent-clauses-with-a-comma)
- [Do Not Break Sentences in Two](#do-not-break-sentences-in-two)
- [Use a Dash to Set Off an Abrupt Break](#use-a-dash-to-set-off-an-abrupt-break)

### III. Approach to Style
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

### IV. Words and Expressions Commonly Misused in Technical Writing
- [Common Qualifiers to Avoid](#common-qualifiers-to-avoid)
- [Weak Constructions to Replace](#weak-constructions-to-replace)
- [Passive Voice Patterns](#passive-voice-patterns)
- [Vague Technical Phrases](#vague-technical-phrases)

### V. Technical Documentation Specifics
- [Code Examples](#code-examples)
- [Command Documentation](#command-documentation)
- [API Documentation](#api-documentation)
- [Error Messages and Troubleshooting](#error-messages-and-troubleshooting)

---

## I. Elementary Principles of Composition

### Choose a Suitable Design and Hold to It

**Principle**: A document's organization should match its purpose. Once you've chosen a structure, maintain it consistently.

**For technical documentation**:
- READMEs: Overview → Installation → Usage → Configuration → Contributing
- API docs: Endpoints grouped by resource, consistent format per endpoint
- Tutorials: Sequential steps, each building on the previous
- Architecture docs: Context → Decision → Consequences

**Bad example** (inconsistent structure):
```
# My Project

Here's how to install it.

## What is it?

It's a tool for processing data.

## Using the tool

First, install it...
```

**Good example** (consistent structure):
```
# My Project

A tool for processing data.

## Installation

Install via npm:
```

**Why it matters**: Readers build mental models from structure. Inconsistent organization breaks these models and forces re-reading.

---

### Make the Paragraph the Unit of Composition

**Principle**: Each paragraph should address a single topic or aspect. Begin with a topic sentence that states the main point.

**For technical documentation**:
- One concept per paragraph
- Topic sentence reveals what the paragraph covers
- Supporting sentences provide details, examples, or qualifications
- Keep paragraphs focused and relatively short

**Bad example** (multiple topics in one paragraph):
```
This function processes user input. It also validates the data and stores it in the database.
Error handling is important because invalid data can cause crashes. The function returns a boolean
indicating success. We use this pattern throughout the codebase for consistency.
```

**Good example** (one topic per paragraph):
```
This function processes user input. It accepts a string parameter and returns a boolean indicating
whether processing succeeded.

The function validates input before processing. Invalid data returns false immediately without
side effects.

On successful validation, the function stores the data in the database and returns true.
```

**Why it matters**: Single-topic paragraphs are scannable. Readers can find information quickly without reading everything.

---

### Use the Active Voice

**Principle**: Active voice is direct and vigorous. Passive voice is indirect and weak.

**Active voice pattern**: Subject performs action
**Passive voice pattern**: Subject receives action

**For technical documentation**:
- Active voice clarifies who/what performs each action
- Especially important for commands, APIs, and procedures
- Passive voice acceptable when actor is unknown or irrelevant

**Bad examples** (passive voice):
```
The file is opened by the function.
The request should be sent to the server.
It is recommended that validation be performed first.
An error will be returned if the input is invalid.
```

**Good examples** (active voice):
```
The function opens the file.
Send the request to the server.
Validate the input first.
The function returns an error if the input is invalid.
```

**When passive voice is acceptable**:
```
The file was created in 2023.  // Creator unknown or irrelevant
The data is encrypted before transmission.  // Focus on data, not actor
```

**Why it matters**: Active voice is shorter, clearer, and more direct. It eliminates ambiguity about who does what.

---

### Put Statements in Positive Form

**Principle**: Make definite assertions. Avoid tame, colorless, hesitating language.

**For technical documentation**:
- State what to do, not what not to do (when possible)
- Assert capabilities directly
- Remove hedging and qualifiers

**Bad examples** (negative or hesitant):
```
Do not forget to set the API key.
This method is not dissimilar to the previous approach.
You might want to consider possibly using the --verbose flag.
It's not uncommon for users to encounter this error.
```

**Good examples** (positive and definite):
```
Set the API key before making requests.
This method resembles the previous approach.
Use the --verbose flag for detailed output.
Users commonly encounter this error.
```

**Exceptions** (when negative form is clearer):
```
Do not use this method in production.  // Warning is clearer as prohibition
Not all features are available in the free tier.  // Limitation stated clearly
```

**Why it matters**: Positive statements are more direct and easier to understand. They tell readers what to do rather than what to avoid.

---

### Use Definite, Specific, Concrete Language

**Principle**: Prefer the specific to the general, the definite to the vague, the concrete to the abstract.

**For technical documentation**:
- Use precise nouns and verbs
- Specify quantities, versions, and limits
- Give concrete examples rather than abstract descriptions

**Bad examples** (vague):
```
The function runs pretty fast.
Configure the settings appropriately.
This may cause issues in some situations.
Use a recent version of Node.js.
```

**Good examples** (specific):
```
The function processes 10,000 records per second.
Set the timeout to 30 seconds and max_retries to 3.
This causes connection failures when the server is behind a firewall.
Use Node.js version 18.0 or later.
```

**More examples**:

Vague: "It supports various databases."
Specific: "It supports PostgreSQL 12+, MySQL 8+, and SQLite 3.35+."

Vague: "The response includes user information."
Specific: "The response includes the user's ID, email, and creation timestamp."

Vague: "Error handling is robust."
Specific: "The library retries failed requests up to 3 times with exponential backoff."

**Why it matters**: Specific language eliminates ambiguity and gives readers actionable information.

---

### Omit Needless Words

**Principle**: Vigorous writing is concise. Every word should tell.

**For technical documentation**:
- Remove words that add no meaning
- Eliminate redundant phrases
- Cut filler and qualifiers
- Aim for 30% reduction when editing

**Common needless phrases**:

| Wordy | Concise |
|-------|---------|
| the question as to whether | whether |
| there is no doubt but that | doubtless |
| used for fuel purposes | used for fuel |
| he is a man who | he |
| in a hasty manner | hastily |
| this is a subject that | this subject |
| the reason why is that | because |
| owing to the fact that | since |
| in spite of the fact that | though |
| call your attention to the fact that | remind you |
| I would appreciate it if | please |
| at this point in time | now |
| in order to | to |
| due to the fact that | because |
| for the purpose of | for |
| in the event that | if |

**Bad examples** (needless words):
```
In order to install the package, you will need to run the following command.

It should be noted that this function has the capability to process large files.

At this point in time, we would like to call your attention to the fact that the API
is currently in beta.

There are several different methods that can be used for the purpose of authentication.

The function makes a determination as to whether the input is valid.
```

**Good examples** (concise):
```
To install the package, run this command.

This function can process large files.

The API is currently in beta.

Several methods provide authentication.

The function determines whether the input is valid.
```

**More patterns to eliminate**:

Remove "very", "really", "quite", "actually", "basically":
- Bad: "This is actually quite useful."
- Good: "This is useful."

Remove "that" when possible:
- Bad: "Note that the function returns that value."
- Good: "Note the function returns that value."
- Better: "The function returns that value."

Remove "just", "simply", "merely":
- Bad: "Simply run the command."
- Good: "Run the command."

Remove expletive constructions (it is, there are):
- Bad: "There are three methods available."
- Good: "Three methods are available."
- Better: "Use any of three methods."

**Why it matters**: Concise writing respects readers' time and improves comprehension. Every eliminated word makes the remaining words more powerful.

---

### Avoid a Succession of Loose Sentences

**Principle**: Vary sentence structure. Mix short and long sentences. Use subordination to show relationships between ideas.

**For technical documentation**:
- Don't write everything as simple sentences
- Combine related ideas using subordination
- Create rhythm with varied sentence length

**Bad example** (all loose sentences):
```
Create a new file. Name it config.json. Open the file in your editor. Add the following content.
Save the file. Close the editor. Run the application. The application will read the config file.
It will use the settings you specified.
```

**Good example** (varied structure):
```
Create a new file named config.json and open it in your editor. Add the following content, then
save and close the file. When you run the application, it reads this config file and applies your
settings.
```

**Another example**:

Bad (choppy):
```
The function accepts two parameters. The first parameter is the username. The second parameter is
the password. It returns a boolean. The boolean indicates success or failure.
```

Good (subordinated):
```
The function accepts two parameters—username and password—and returns a boolean indicating success
or failure.
```

**Why it matters**: Varied sentence structure makes documentation more readable and shows logical relationships between ideas.

---

### Express Coordinate Ideas in Similar Form

**Principle**: Parallel construction makes related ideas easier to recognize and understand.

**For technical documentation**:
- Use parallel structure for lists
- Match grammatical forms in series
- Maintain consistency in similar elements

**Bad examples** (not parallel):
```
The library provides:
- Data validation
- Transforming data
- To sanitize inputs
- Error handling

The function:
- Accepts a string parameter
- Validation is performed
- Returns the result
```

**Good examples** (parallel):
```
The library provides:
- Data validation
- Data transformation
- Input sanitization
- Error handling

The function:
- Accepts a string parameter
- Validates the input
- Returns the result
```

**More examples**:

Bad: "The tool is fast, reliable, and has good documentation."
Good: "The tool is fast, reliable, and well-documented."

Bad: "Configure the API key, setting the timeout, and ensure rate limits are enabled."
Good: "Configure the API key, set the timeout, and enable rate limits."

**Why it matters**: Parallel structure makes lists scannable and reduces cognitive load.

---

### Keep Related Words Together

**Principle**: Words that form a unit should not be separated. Avoid interposing modifiers between subject and verb, or verb and object.

**For technical documentation**:
- Keep subject near verb
- Keep verb near object
- Place modifiers near what they modify

**Bad examples** (separated):
```
The function, when called with invalid input, which can happen if the user provides malformed data
or skips validation, returns an error.

The API, in most cases, unless the server is overloaded or the request times out, responds within
100ms.
```

**Good examples** (together):
```
The function returns an error when called with invalid input, which can happen if the user provides
malformed data or skips validation.

The API usually responds within 100ms, unless the server is overloaded or the request times out.
```

**More examples**:

Bad: "The user must, before sending any requests, configure the API key."
Good: "The user must configure the API key before sending requests."

Bad: "The database will, if the connection is stable, automatically sync."
Good: "The database automatically syncs if the connection is stable."

**Why it matters**: Keeping related words together improves clarity and reduces re-reading.

---

### Place Emphatic Words at the End

**Principle**: The end of a sentence is the most emphatic position. Place the important point there.

**For technical documentation**:
- End with the key information
- Place calls to action at sentence end
- Avoid trailing off with qualifications

**Bad examples** (weak endings):
```
Run the tests before deploying, if possible.
The function returns an error, in most cases.
Configure the database connection string first, typically.
```

**Good examples** (emphatic endings):
```
Before deploying, run the tests.
In most cases, the function returns an error.
First, configure the database connection string.
```

**More examples**:

Bad: "Validation happens automatically, which is convenient."
Good: "Validation happens automatically."
Better: "The library validates input automatically."

Bad: "This approach is recommended by most experts."
Good: "Most experts recommend this approach."

**Why it matters**: Strong endings make documentation more forceful and memorable.

---

## II. Elementary Rules of Usage

### Form the Possessive Singular with 's

**Principle**: Add 's to form the possessive singular, even if the word ends in s.

**For technical documentation**:
```
Charles's implementation
the class's methods
the process's output
JavaScript's async features
Redis's persistence options
```

**Exception**: Ancient proper names and some established phrases:
```
Jesus' teachings
for goodness' sake
```

---

### Use Proper Punctuation

**For technical documentation**:

**Period**: End declarative sentences.
```
Install the package with npm.
The function returns a promise.
```

**Comma**: Separate elements in series, set off clauses, enclose parenthetic expressions.
```
The library supports JSON, XML, and YAML.
When validation fails, the function returns null.
```

**Semicolon**: Join closely related independent clauses.
```
The request succeeded; the server returned 200 OK.
Use --verbose for detailed output; use --quiet to suppress all output.
```

**Colon**: Introduce lists, examples, or explanations.
```
The function accepts three parameters: username, password, and options.
Configure the following settings: timeout, retries, and backoff.
```

**Parentheses**: Enclose supplementary or explanatory material.
```
Install Node.js (version 18 or later) before proceeding.
The function returns a boolean (true for success, false for failure).
```

**Dash**: Set off abrupt breaks or emphasize material.
```
The API supports three formats—JSON, XML, and YAML.
Install the dependencies—this may take several minutes—and run the tests.
```

---

### Enclose Parenthetic Expressions Between Commas

**Principle**: Expressions that interrupt the flow of a sentence should be set off by commas.

**For technical documentation**:
```
The function, when called without arguments, uses default values.
This approach, however, has limitations.
The API, as mentioned earlier, requires authentication.
```

**Note**: If the interruption is abrupt or long, use dashes or parentheses instead.

---

### Place a Comma Before a Conjunction in a Series

**Principle**: Use the serial comma (Oxford comma) for clarity.

**For technical documentation**:
```
The library supports authentication, validation, and error handling.
Configure the API key, set the timeout, and enable retries.
```

**Why it matters**: The serial comma eliminates ambiguity.

Ambiguous: "The function accepts username, password and options or config."
Clear: "The function accepts username, password, and options or config."

---

### Do Not Join Independent Clauses with a Comma

**Principle**: Comma splices are errors. Use a period, semicolon, or conjunction.

**Bad examples**:
```
The function succeeds, it returns true.
Install the package, then run the tests.
```

**Good examples**:
```
The function succeeds. It returns true.
The function succeeds; it returns true.
The function succeeds, and it returns true.
Install the package. Then run the tests.
Install the package, then run the tests.  // "then" is not a conjunction here
Install the package and run the tests.
```

---

### Do Not Break Sentences in Two

**Principle**: Don't create sentence fragments unintentionally.

**Bad example**:
```
The function validates input. And returns an error if validation fails.
```

**Good example**:
```
The function validates input and returns an error if validation fails.
```

**Exception**: Intentional fragments for emphasis (use sparingly):
```
Does the API require authentication? Yes.
```

---

### Use a Dash to Set Off an Abrupt Break

**Principle**: Use an em dash (—) for abrupt breaks or to emphasize material.

**For technical documentation**:
```
The API supports three formats—JSON, XML, and YAML—with JSON as the default.
Install all dependencies—this is critical—before running the application.
```

**Note**: Don't overuse dashes. Reserve them for material that truly interrupts or deserves emphasis.

---

## III. Approach to Style

### Place Yourself in the Background

**Principle**: Write in a way that draws attention to the subject matter, not to the writer.

**For technical documentation**:
- Focus on the technology, not your opinions
- Avoid first person when possible
- Let the facts speak

**Bad examples** (writer-focused):
```
I think you should use the --verbose flag.
In my experience, this approach works best.
I've found that users prefer JSON format.
We believe this is the right solution.
```

**Good examples** (subject-focused):
```
Use the --verbose flag for detailed output.
This approach handles edge cases effectively.
Most users prefer JSON format.
This solution addresses the core requirements.
```

**When first person is appropriate**:
- Tutorials: "We'll build a REST API."
- Guides: "Let's explore how authentication works."
- Notes: "I recommend reading the security guide first."

**Why it matters**: Technical documentation serves the reader's need for information, not the writer's need for expression.

---

### Write in a Way That Comes Naturally

**Principle**: Avoid forced or artificial language.

**For technical documentation**:
- Use terminology natural to the domain
- Don't force overly formal language
- Write as you would explain to a colleague

**Bad examples** (forced):
```
One must ensure that the configuration file is properly instantiated prior to executing the
application binary.

It is of utmost importance to ascertain that all dependencies are correctly installed.
```

**Good examples** (natural):
```
Create and configure the config file before running the application.

Verify all dependencies are installed.
```

**Why it matters**: Natural language is clearer and more approachable.

---

### Work from a Suitable Design

**Principle**: Plan the structure before writing.

**For technical documentation**:
- Outline major sections before writing
- Ensure logical flow
- Adapt structure to document type

**Common structures**:
- README: Overview → Installation → Usage → Configuration → Contributing
- Tutorial: Introduction → Prerequisites → Steps → Conclusion
- API docs: Group by resource, consistent format per endpoint
- Architecture: Context → Decision → Consequences → Implications

---

### Write with Nouns and Verbs

**Principle**: Strong nouns and verbs carry meaning. Adjectives and adverbs are often weak.

**For technical documentation**:
- Choose precise verbs
- Use concrete nouns
- Minimize adjectives and adverbs

**Bad examples** (weak verbs and nouns):
```
The function does validation of the input very quickly.
The system makes a determination about which approach to use.
```

**Good examples** (strong verbs and nouns):
```
The function validates the input in 10ms.
The system selects the optimal approach.
```

**More examples**:

Bad: "The API gives back a response with data."
Good: "The API returns data."

Bad: "The library does caching of results."
Good: "The library caches results."

---

### Revise and Rewrite

**Principle**: First drafts are rarely optimal. Edit ruthlessly.

**For technical documentation**:
- Write a complete draft first
- Then cut 30% of the words
- Strengthen weak constructions
- Verify all code examples work

**Editing checklist**:
- [ ] Remove needless words
- [ ] Convert passive to active voice
- [ ] Replace vague words with specific ones
- [ ] Eliminate qualifiers
- [ ] Fix parallel structure
- [ ] Verify examples are executable
- [ ] Check for consistency

---

### Do Not Overwrite

**Principle**: Don't use ten words when five will do.

**For technical documentation**:
- Avoid flowery language
- Don't explain the obvious
- Cut redundancy

**Bad examples** (overwriting):
```
First and foremost, it is absolutely essential and critically important to note that you should
always make sure to validate user input before processing it in order to prevent security
vulnerabilities.

The function, which is designed to handle user authentication, will carefully and thoroughly
examine the credentials that have been provided by the user.
```

**Good examples** (appropriate):
```
Validate user input before processing to prevent security vulnerabilities.

The function examines the provided credentials.
```

---

### Do Not Overstate

**Principle**: Avoid hyperbole and exaggeration.

**For technical documentation**:
- State facts accurately
- Avoid marketing language
- Don't promise what you can't deliver

**Bad examples** (overstatement):
```
This revolutionary approach completely solves all performance problems.
Our amazing API is the fastest in the world.
This library makes development incredibly easy and fun.
```

**Good examples** (accurate):
```
This approach reduces response time by 40%.
The API processes 100,000 requests per second.
This library simplifies common development tasks.
```

---

### Avoid Fancy Words

**Principle**: Use simple, direct language.

**For technical documentation**:

| Fancy | Simple |
|-------|--------|
| utilize | use |
| implement | use, add, create |
| leverage | use |
| facilitate | help, enable |
| endeavor | try |
| commence | begin, start |
| terminate | end, stop |
| ascertain | determine, verify |
| instantiate | create |
| promulgate | publish, announce |

**Bad examples**:
```
Utilize the API to facilitate data transformation.
Commence the deployment process.
```

**Good examples**:
```
Use the API to transform data.
Start the deployment.
```

---

### Be Clear

**Principle**: Clarity is the primary goal. Sacrifice everything else for clarity.

**For technical documentation**:
- If a sentence is unclear, rewrite it
- If a word is ambiguous, choose a better word
- If structure is confusing, restructure
- Test understanding with naive readers

**Unclear**:
```
The function may return null if the parameter is invalid or the operation fails depending on the
configuration.
```

**Clear**:
```
The function returns null in two cases:
- The parameter is invalid
- The operation fails and config.failSafe is true
```

---

### Do Not Inject Opinion

**Principle**: State facts, not judgments.

**For technical documentation**:
- Describe what is, not what you think about it
- Provide objective comparisons
- Let readers form their own opinions

**Bad examples** (opinion):
```
The old API was terrible and poorly designed.
This new approach is obviously better.
Any reasonable developer would choose option A.
```

**Good examples** (fact):
```
The old API required three requests to accomplish this task. The new API requires one.
Option A provides built-in caching. Option B requires manual cache management.
Most projects in our survey use option A.
```

---

### Use Figures of Speech Sparingly

**Principle**: Metaphors and analogies can clarify, but technical accuracy matters more.

**For technical documentation**:
- Use metaphors only when they truly clarify
- Ensure metaphors are accurate
- Don't force creative language

**Appropriate metaphor**:
```
The service acts as a gatekeeper, allowing only authenticated requests to proceed.
```

**Unnecessary metaphor**:
```
The function dances through the data, gracefully extracting the information you need.
```

---

### Avoid Foreign Languages

**Principle**: Use English terms when they exist.

**For technical documentation**:
- Use established technical terms (even if originally foreign)
- Avoid unnecessary foreign phrases

**Appropriate** (established terms):
```
ad hoc query
de facto standard
via the API
```

**Inappropriate** (unnecessary):
```
Use the library vis-à-vis data processing.
Configure the settings per se.
```

---

### Prefer the Standard to the Offbeat

**Principle**: Use conventional language and structure.

**For technical documentation**:
- Follow established documentation conventions
- Use standard terminology
- Avoid clever or quirky language

**Standard**:
```
## Installation

Install via npm:

\`\`\`bash
npm install my-package
\`\`\`
```

**Offbeat** (avoid):
```
## Let's Get This Party Started!

Pop open your terminal and type this bad boy:

\`\`\`bash
npm install my-package
\`\`\`
```

---

## IV. Words and Expressions Commonly Misused in Technical Writing

### Common Qualifiers to Avoid

These words weaken statements without adding meaning:

**Eliminate or justify each instance**:
- very
- really
- quite
- rather
- somewhat
- fairly
- pretty (as in "pretty fast")
- relatively
- comparatively
- possibly
- probably
- perhaps
- maybe
- might
- arguably
- seemingly
- apparently
- generally
- usually (unless specifying frequency)
- typically (unless specifying frequency)
- basically
- essentially
- actually
- just
- simply
- merely
- only (often)

**Bad examples**:
```
This is a fairly simple process.
The API is quite fast.
This approach is arguably better.
Just run this command.
The function is basically a wrapper.
```

**Good examples**:
```
This is a simple process.
The API processes 10,000 requests per second.
This approach reduces latency by 30%.
Run this command.
The function wraps the underlying API.
```

---

### Weak Constructions to Replace

**"There is/are" constructions**:

Bad: "There are three methods available."
Good: "Three methods are available."
Better: "Use any of three methods."

Bad: "There is a function that handles authentication."
Good: "The authenticate() function handles authentication."

**"It is" constructions**:

Bad: "It is important to note that validation is required."
Good: "Validation is required."

Bad: "It is recommended that you use HTTPS."
Good: "Use HTTPS."
Better: "We recommend HTTPS."

**"In order to"**:

Bad: "In order to install the package, run npm install."
Good: "To install the package, run npm install."

**"Due to the fact that"**:

Bad: "Due to the fact that the API requires authentication, you must provide credentials."
Good: "Because the API requires authentication, provide credentials."
Better: "The API requires authentication. Provide credentials."

**"For the purpose of"**:

Bad: "For the purpose of testing, use the staging environment."
Good: "For testing, use the staging environment."
Better: "Test in the staging environment."

**"In the event that"**:

Bad: "In the event that the request fails, retry automatically."
Good: "If the request fails, retry automatically."

**"At this point in time"**:

Bad: "At this point in time, the feature is in beta."
Good: "The feature is currently in beta."
Better: "The feature is in beta."

**"Has the ability to"**:

Bad: "The function has the ability to process large files."
Good: "The function can process large files."
Better: "The function processes large files."

**"Is able to"**:

Bad: "The library is able to handle multiple formats."
Good: "The library handles multiple formats."

**"Make a determination"**:

Bad: "The function makes a determination about validity."
Good: "The function determines validity."

**"Give consideration to"**:

Bad: "Give consideration to using caching."
Good: "Consider using caching."
Better: "Use caching to improve performance."

---

### Passive Voice Patterns

Recognize and replace these patterns:

**"Is/are/was/were [verb]ed by"**:

Bad: "The file is opened by the function."
Good: "The function opens the file."

Bad: "The request was sent by the client."
Good: "The client sent the request."

**"Can be [verb]ed"**:

Bad: "The data can be validated using this function."
Good: "Use this function to validate the data."
Better: "This function validates the data."

**"Should be [verb]ed"**:

Bad: "The API key should be configured before use."
Good: "Configure the API key before use."

**"Will be [verb]ed"**:

Bad: "An error will be returned if validation fails."
Good: "The function returns an error if validation fails."

---

### Vague Technical Phrases

Replace vague phrases with specific information:

**"And so on", "etc."**:

Bad: "Supports JSON, XML, etc."
Good: "Supports JSON, XML, and YAML."

**"Various", "several", "a number of"**:

Bad: "Supports various databases."
Good: "Supports PostgreSQL, MySQL, and SQLite."

**"Some", "certain"**:

Bad: "Some configurations require additional setup."
Good: "Configurations with authentication require additional setup."

**"May", "might", "could"** (when certainty exists):

Bad: "This may cause errors."
Good: "This causes 'Invalid Input' errors."

**"Generally", "usually", "typically"** (without specifics):

Bad: "The API usually responds quickly."
Good: "The API responds in under 100ms for 95% of requests."

**"Appropriate", "proper", "correct"** (without defining):

Bad: "Configure the settings appropriately."
Good: "Set timeout to 30 seconds and max_retries to 3."

**"Recent", "latest", "current"** (without version):

Bad: "Use a recent version of Node.js."
Good: "Use Node.js 18.0 or later."

**"Large", "small", "fast", "slow"** (without measurement):

Bad: "The function is fast."
Good: "The function processes 10,000 records per second."

**"Easy", "simple", "straightforward"** (subjective):

Bad: "Installation is simple."
Good: "Installation requires one command: npm install package-name."

---

## V. Technical Documentation Specifics

### Code Examples

**Principles**:
- All code examples must be executable
- Show complete, working code, not fragments
- Include necessary imports and setup
- Specify language for syntax highlighting

**Bad example** (incomplete):
```
user = authenticate(username, password)
```

**Good example** (complete):
```javascript
const { authenticate } = require('./auth');

const user = await authenticate(username, password);
if (user) {
  console.log('Authentication successful');
} else {
  console.log('Authentication failed');
}
```

**For code blocks**:
- Always specify the language
- Use real, tested code
- Show expected output when helpful
- Include error handling when relevant

**Example with output**:
```bash
$ npm install my-package

added 1 package in 2s
```

---

### Command Documentation

**Principles**:
- Show complete commands with all flags
- Include working directory context when relevant
- Show expected output
- Document common errors

**Bad example** (incomplete):
```
Run the tests.
```

**Good example** (complete):
```bash
# Run all tests
npm test

# Run specific test file
npm test -- auth.test.js

# Run tests with coverage
npm test -- --coverage
```

**For command-line tools**:
- Show the actual command prompt when helpful: `$ command`
- Use real paths, not placeholders (or clearly mark placeholders: `<filename>`)
- Show output for successful execution
- Document return codes when relevant

---

### API Documentation

**Principles**:
- Document all parameters with types
- Specify return types
- Include example requests and responses
- Document error conditions

**Bad example** (incomplete):
```
authenticate(username, password)

Authenticates a user.
```

**Good example** (complete):
```
authenticate(username: string, password: string): Promise<User | null>

Authenticates a user with the provided credentials.

Parameters:
- username: The user's username (email format)
- password: The user's password (minimum 8 characters)

Returns:
- Promise<User>: User object if authentication succeeds
- Promise<null>: null if authentication fails

Throws:
- ValidationError: If username or password is malformed
- NetworkError: If the authentication service is unreachable

Example:
const user = await authenticate('user@example.com', 'password123');
if (user) {
  console.log(`Authenticated as ${user.name}`);
} else {
  console.log('Invalid credentials');
}
```

**For REST APIs**:
- Show HTTP method and path
- Document request headers
- Show request body format
- Show response status codes
- Show response body format
- Document authentication requirements

**Example**:
```
POST /api/v1/auth

Authenticates a user and returns an access token.

Headers:
- Content-Type: application/json

Request body:
{
  "username": "user@example.com",
  "password": "password123"
}

Response (200 OK):
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expires_at": "2024-01-15T10:30:00Z"
}

Response (401 Unauthorized):
{
  "error": "Invalid credentials"
}

Response (422 Unprocessable Entity):
{
  "error": "Validation failed",
  "details": {
    "username": "Must be a valid email address"
  }
}
```

---

### Error Messages and Troubleshooting

**Principles**:
- Document common errors
- Provide specific solutions
- Include error codes when relevant
- Show actual error messages

**Bad example** (vague):
```
If you get errors, check your configuration.
```

**Good example** (specific):
```
Common Errors

Error: "ECONNREFUSED"
Cause: Cannot connect to the database server.
Solution: Verify the database is running and the connection string is correct.

Error: "Invalid API key"
Cause: The API key is missing or incorrect.
Solution: Set the API_KEY environment variable with your key from the dashboard.

Error: "Rate limit exceeded"
Cause: Too many requests in a short time.
Solution: Wait 60 seconds before retrying, or upgrade your plan for higher limits.
```

**For troubleshooting sections**:
- Show the actual error message
- Explain the cause
- Provide concrete solution steps
- Link to relevant documentation

---

## Summary

The core principles for technical documentation:

1. **Use active voice**: Make clear who/what performs each action
2. **Use definite, specific, concrete language**: Eliminate vagueness
3. **Omit needless words**: Cut 30% when editing
4. **Put statements in positive form**: Say what to do, not what not to do
5. **Be clear above all**: Sacrifice everything else for clarity
6. **Write with nouns and verbs**: Minimize adjectives and adverbs
7. **Use parallel construction**: Make lists and series consistent
8. **Avoid qualifiers**: Remove "very", "quite", "somewhat", etc.
9. **Choose simple words**: "use" not "utilize"
10. **Revise and rewrite**: First drafts are never optimal

**Apply these principles consistently and your documentation will be clearer, shorter, and more effective.**
