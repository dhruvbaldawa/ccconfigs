# Documentation Type Guidelines

This document provides guidelines (not rigid templates) for different types of technical documentation. Use these principles to determine what to write and how to structure it based on your specific project's needs.

## Decision Framework

### Choosing Documentation Type

Ask these questions to determine what type of documentation to write:

**What is the reader's primary goal?**
- Quick start / understand what this is → **README**
- Look up API/function signature → **API Reference**
- Learn how to accomplish a task → **Tutorial / Guide**
- Understand system design → **Architecture Documentation**
- Use a command-line tool → **CLI Documentation**
- Contribute to the project → **Contributing Guide**
- Deploy or configure → **Operations / Configuration Guide**

**What is the reader's experience level?**
- Newcomer to the project → README, Tutorial
- Experienced with the project → API Reference, Architecture Documentation
- Operator/deployer → Operations Guide
- Contributor → Contributing Guide

**What is the reader's context?**
- Evaluating whether to use this → README
- Already using, needs details → API Reference, Guide
- Debugging or troubleshooting → Troubleshooting Guide, API Reference
- Extending or modifying → Architecture Documentation, Contributing Guide

### Combining Documentation Types

Most projects need multiple documentation types:

**Minimal project** (small library):
- README (with inline API reference if simple)

**Standard project** (library or tool):
- README (overview, quick start)
- API Reference (detailed function/endpoint documentation)
- Guide (common usage patterns)

**Large project** (framework or platform):
- README (overview, links to other docs)
- Getting Started Tutorial (first-time users)
- API Reference (comprehensive)
- Guides (multiple, topic-specific)
- Architecture Documentation (system design)
- Contributing Guide
- Operations Guide (deployment, configuration)

---

## README

### Purpose

The README serves as the **primary entry point** for anyone encountering your project. It answers:
- What is this?
- Why should I care?
- How do I get started?
- Where do I go for more information?

### Target Audience

- **Primary**: Developers evaluating whether to use your project
- **Secondary**: Developers getting started for the first time

### Essential Sections

Not every README needs all sections, but these are the most common:

#### 1. Project Title and Description

**Purpose**: Immediate clarity about what this project is.

**Include**:
- Project name
- One-sentence description of what it does
- Who it's for (if not obvious)

**Example**:
```markdown
# data-validator

A TypeScript library for validating API request data with built-in sanitization.
```

**Why**: Readers should know within 5 seconds whether this project is relevant to them.

#### 2. Badges (Optional)

**Purpose**: Quick status indicators.

**Include** (if relevant):
- Build status
- Test coverage
- Version/release
- License
- Download count

**Example**:
```markdown
[![Build Status](https://img.shields.io/github/workflow/status/user/repo/CI)](link)
[![npm version](https://img.shields.io/npm/v/package-name)](link)
```

**Why**: Signals project health and maturity. Don't include badges for vanity—only if they provide useful information.

#### 3. Features / Key Capabilities (If Not Obvious)

**Purpose**: Highlight what makes this project valuable.

**Include**:
- Main features (3-7 bullet points)
- Distinguishing characteristics
- Key use cases

**Example**:
```markdown
## Features

- Type-safe validation with TypeScript
- Built-in sanitization (XSS protection, SQL injection prevention)
- Custom validation rules
- Detailed error messages with field-level feedback
```

**Why**: Helps readers quickly assess if this meets their needs. Omit this section if the description already makes capabilities clear.

#### 4. Installation

**Purpose**: Get the project installed as quickly as possible.

**Include**:
- Primary installation method (npm, pip, etc.)
- Prerequisites (language version, system requirements)
- Alternative installation methods (if relevant)

**Example**:
```markdown
## Installation

Requires Node.js 18 or later.

```bash
npm install data-validator
```

**Why**: Installation is the first action step. Make it trivial.

#### 5. Quick Start / Basic Usage

**Purpose**: Get users to a working state immediately.

**Include**:
- Minimal working example
- Expected output (if not obvious)
- Next steps or link to full documentation

**Example**:
```markdown
## Quick Start

```javascript
const { validate } = require('data-validator');

const schema = {
  email: { type: 'email', required: true },
  age: { type: 'number', min: 0, max: 120 }
};

const result = validate(schema, {
  email: 'user@example.com',
  age: 25
});

if (result.valid) {
  console.log('Valid data:', result.data);
} else {
  console.log('Errors:', result.errors);
}
```

For more examples, see [documentation link].
```

**Why**: Readers want to see it work before investing more time. Keep this minimal—detailed examples belong in guides.

#### 6. Documentation / Further Reading

**Purpose**: Point to comprehensive documentation.

**Include**:
- Link to full documentation
- Links to guides or tutorials
- Link to API reference

**Example**:
```markdown
## Documentation

- [Getting Started Guide](link)
- [API Reference](link)
- [Advanced Usage](link)
```

**Why**: READMEs should be concise. Point to detailed docs rather than embedding everything.

#### 7. Contributing (Optional)

**Purpose**: Invite and guide contributions.

**Include**:
- How to report issues
- How to submit changes
- Link to contributing guide (if extensive)

**Example**:
```markdown
## Contributing

Contributions welcome! Please open an issue before submitting large changes.

See [CONTRIBUTING.md](link) for development setup and guidelines.
```

**Why**: Makes the project more welcoming. Omit if not accepting contributions.

#### 8. License

**Purpose**: Clarify usage rights.

**Include**:
- License type
- Link to full license text

**Example**:
```markdown
## License

MIT License - see [LICENSE](LICENSE) for details.
```

**Why**: Legal clarity is essential for open-source projects.

### Optional Sections

Include these only if they add clear value:

- **Prerequisites**: If installation requires specific setup
- **Configuration**: If configuration is essential and complex
- **FAQ**: If common questions exist
- **Examples**: If basic usage doesn't suffice
- **Roadmap**: If communicating future plans
- **Credits**: If acknowledging contributors or dependencies

### README Anti-Patterns

**Don't**:
- ❌ Include detailed API documentation in the README
- ❌ Explain every feature exhaustively
- ❌ Duplicate content from other documentation
- ❌ Include your project's entire history
- ❌ Write an essay about the problem domain
- ❌ Include incomplete or broken examples

**Do**:
- ✅ Keep it scannable and concise
- ✅ Focus on getting started quickly
- ✅ Link to detailed documentation
- ✅ Use working, tested examples
- ✅ Update it as the project evolves

### Quality Criteria

A good README:
- Communicates what the project is within 10 seconds
- Gets users to a working example in under 5 minutes
- Points to comprehensive documentation for deep dives
- Is under 500 lines (preferably under 300)
- Contains working, tested code examples

---

## API Reference Documentation

### Purpose

API documentation serves as a **comprehensive reference** for developers using your library or API. It answers:
- What functions/endpoints are available?
- What parameters do they accept?
- What do they return?
- What errors can occur?

### Target Audience

Developers who are already using your API and need to look up specific details.

### Essential Elements

For each API element (function, method, endpoint), document:

#### 1. Signature

**Purpose**: Show exactly how to call it.

**Include**:
- Function/method/endpoint name
- Parameters with types
- Return type
- HTTP method (for REST APIs)

**Example (Function)**:
```typescript
function validate(schema: Schema, data: unknown): ValidationResult
```

**Example (REST API)**:
```
POST /api/v1/users
```

**Why**: Developers need the exact signature to use the API correctly.

#### 2. Description

**Purpose**: Explain what it does.

**Include**:
- One-sentence summary
- Additional context if needed (but keep brief)

**Example**:
```markdown
Validates data against a schema and returns validation results.

Performs type checking, constraint validation, and sanitization based on schema rules.
```

**Why**: Clarifies purpose and behavior.

#### 3. Parameters

**Purpose**: Document all inputs.

**Include** (for each parameter):
- Name
- Type
- Required or optional
- Default value (if optional)
- Description
- Constraints or valid values

**Example**:
```markdown
Parameters:
- `schema` (Schema, required): Validation schema defining rules for each field
- `data` (unknown, required): Data to validate
- `options` (ValidationOptions, optional): Configuration options
  - `strict` (boolean, default: false): Throw on validation failure instead of returning errors
  - `sanitize` (boolean, default: true): Apply sanitization rules
```

**Why**: Parameters are the primary source of confusion. Be thorough.

#### 4. Return Value

**Purpose**: Document what comes back.

**Include**:
- Type
- Description of what it represents
- Structure (if complex)

**Example**:
```markdown
Returns:
- `ValidationResult`: Object containing validation results
  - `valid` (boolean): True if validation succeeded
  - `data` (unknown): Validated and sanitized data (if valid)
  - `errors` (ValidationError[]): Array of validation errors (if invalid)
```

**Why**: Developers need to know how to use the returned value.

#### 5. Errors / Exceptions

**Purpose**: Document failure modes.

**Include**:
- Exception types thrown
- Conditions that trigger each exception
- HTTP status codes (for REST APIs)

**Example**:
```markdown
Throws:
- `SchemaError`: If the schema is invalid or malformed
- `TypeError`: If data is not an object when schema expects an object

For REST APIs:
- `400 Bad Request`: Validation failed (see response body for details)
- `422 Unprocessable Entity`: Data format is invalid
- `500 Internal Server Error`: Server error during validation
```

**Why**: Error handling is critical. Don't leave developers guessing.

#### 6. Examples

**Purpose**: Show real usage.

**Include**:
- Minimal example showing basic usage
- Example showing common patterns
- Example showing error handling (if relevant)

**Example**:
```markdown
Example:

```javascript
const schema = {
  email: { type: 'email', required: true },
  age: { type: 'number', min: 18 }
};

const result = validate(schema, {
  email: 'user@example.com',
  age: 25
});

if (result.valid) {
  console.log('Valid:', result.data);
} else {
  console.error('Validation failed:', result.errors);
}
```

**Why**: Examples make abstract descriptions concrete.

### Organization

**For libraries** (functions/classes):
- Group by module or category
- Alphabetical within groups (or by importance)
- Consistent format for each entry

**For REST APIs**:
- Group by resource (Users, Posts, Comments)
- List endpoints per resource
- Show request and response examples

### API Documentation Anti-Patterns

**Don't**:
- ❌ Omit parameter types
- ❌ Forget to document errors
- ❌ Show non-executable code examples
- ❌ Describe implementation details (focus on interface)
- ❌ Use vague descriptions ("handles user data")

**Do**:
- ✅ Document every parameter and return value
- ✅ Specify types precisely
- ✅ Show working examples
- ✅ Document error conditions
- ✅ Keep descriptions concise but complete

### Quality Criteria

Good API documentation:
- Documents every public function/endpoint
- Specifies types for all parameters and returns
- Includes executable examples
- Documents all error conditions
- Is organized logically (by module, resource, or alphabetically)
- Is accurate (tested against actual implementation)

---

## Tutorials and Guides

### Purpose

Tutorials and guides **teach** readers how to accomplish specific tasks. They answer:
- How do I build X?
- How do I solve Y problem?
- What's the recommended approach for Z?

### Difference: Tutorial vs Guide

**Tutorial**:
- Step-by-step learning path
- Builds one thing from start to finish
- Assumes minimal knowledge
- Learning-focused

**Guide**:
- Explains a concept or pattern
- May skip basic steps
- Assumes familiarity with basics
- Task-focused

Both follow similar principles but vary in depth and prerequisites.

### Target Audience

Developers learning to use your project effectively.

### Essential Elements

#### 1. Introduction

**Purpose**: Set expectations and motivation.

**Include**:
- What you'll build/learn
- Why it's useful
- Estimated time (for tutorials)
- Prerequisites

**Example**:
```markdown
# Building a REST API with Authentication

This tutorial shows how to build a REST API with user authentication and authorization.
You'll create endpoints for user registration, login, and protected resources.

Time: 30 minutes

Prerequisites:
- Node.js 18+ installed
- Basic understanding of Express.js
- Familiarity with async/await
```

**Why**: Readers need to know if this is what they need and if they're prepared.

#### 2. Prerequisites / Setup

**Purpose**: Get the environment ready.

**Include**:
- Required software and versions
- Initial project setup
- Dependencies to install

**Example**:
```markdown
## Setup

Create a new project:

```bash
mkdir auth-api
cd auth-api
npm init -y
npm install express bcrypt jsonwebtoken
```

Create `index.js`:

```javascript
const express = require('express');
const app = express();
app.use(express.json());
```

**Why**: Everyone starts from the same baseline.

#### 3. Step-by-Step Instructions

**Purpose**: Guide through the task sequentially.

**Include** (for each step):
- What to do
- Why you're doing it (context)
- Code to add
- Expected result

**Example**:
```markdown
## Step 1: Create User Registration Endpoint

First, we'll create an endpoint for users to register with email and password.

Add this route to `index.js`:

```javascript
app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;

  // Hash password before storing
  const hashedPassword = await bcrypt.hash(password, 10);

  // In a real app, store in database
  console.log('User registered:', { email, hashedPassword });

  res.json({ message: 'User registered successfully' });
});
```

Test the endpoint:

```bash
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"secret123"}'
```

Expected response:
```json
{"message": "User registered successfully"}
```

**Why**: Small, verifiable steps build confidence and allow troubleshooting.

#### 4. Explanation / Context

**Purpose**: Explain why, not just what.

**Include**:
- Reasoning behind decisions
- Alternative approaches (when relevant)
- Best practices

**Example**:
```markdown
We use `bcrypt` to hash passwords because storing plain-text passwords is a critical
security vulnerability. The second parameter (10) is the salt rounds—higher values are
more secure but slower. 10 is a good balance for most applications.
```

**Why**: Readers learn principles, not just rote steps.

#### 5. Validation / Testing

**Purpose**: Confirm it works.

**Include**:
- How to test what you just built
- Expected output
- Common issues and solutions

**Example**:
```markdown
## Testing

Start the server:

```bash
node index.js
```

Test registration:

```bash
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

You should see:
```json
{"message": "User registered successfully"}
```

If you get an error, check:
- Server is running on port 3000
- JSON headers are included
- Request body is valid JSON
```

**Why**: Verification points catch problems early.

#### 6. Conclusion / Next Steps

**Purpose**: Wrap up and point forward.

**Include**:
- Summary of what was built/learned
- Suggestions for extending or improving
- Links to related documentation

**Example**:
```markdown
## Conclusion

You've built a basic REST API with user registration and authentication. You learned:
- How to hash passwords with bcrypt
- How to generate and verify JWTs
- How to protect routes with middleware

Next steps:
- Add database persistence (see [Database Guide](link))
- Implement password reset (see [Advanced Auth Guide](link))
- Add rate limiting (see [Security Guide](link))
```

**Why**: Reinforces learning and provides path forward.

### Tutorial/Guide Anti-Patterns

**Don't**:
- ❌ Jump to advanced topics without prerequisites
- ❌ Show code without explaining why
- ❌ Skip verification steps
- ❌ Use non-working examples
- ❌ Assume knowledge not listed in prerequisites

**Do**:
- ✅ Build incrementally with verification at each step
- ✅ Explain reasoning behind decisions
- ✅ Provide working, tested code
- ✅ Include troubleshooting for common issues
- ✅ Link to relevant API docs and guides

### Quality Criteria

Good tutorials/guides:
- Can be completed by someone meeting the prerequisites
- Include working, tested code at every step
- Explain why, not just what
- Provide verification/testing steps
- Are tested end-to-end before publishing
- Link to relevant reference documentation

---

## Architecture Documentation

### Purpose

Architecture documentation explains **how the system is designed and why**. It answers:
- How is the system structured?
- Why did we make these design decisions?
- What are the tradeoffs?
- What alternatives were considered?

### Target Audience

- Developers contributing to the project
- Teams evaluating the system
- Future maintainers

### Essential Elements

#### 1. Overview

**Purpose**: High-level system description.

**Include**:
- What the system does
- Major components
- How components interact

**Example**:
```markdown
# System Architecture

The data processing pipeline consists of three main components:

1. **Ingest Service**: Receives data from external sources via REST API
2. **Processing Engine**: Validates, transforms, and enriches data
3. **Storage Service**: Persists processed data to PostgreSQL

Data flows unidirectionally from Ingest → Processing → Storage, with message queues
(RabbitMQ) between components for resilience.
```

**Why**: Provides mental model before diving into details.

#### 2. Component Details

**Purpose**: Explain each major component.

**Include** (for each component):
- Responsibility
- Key interfaces
- Dependencies
- Technology choices

**Example**:
```markdown
## Processing Engine

Responsible for validating, transforming, and enriching incoming data.

Key operations:
- Schema validation against JSON schemas
- Data transformation using configured rules
- Enrichment via third-party API calls

Technology:
- Node.js (for async I/O performance)
- Bull (job queue for retry logic)
- Joi (schema validation)

Interfaces:
- Consumes from: `ingest.raw` queue
- Publishes to: `storage.processed` queue
- Exposes: Health check endpoint (HTTP)
```

**Why**: Developers need to understand each piece.

#### 3. Design Decisions

**Purpose**: Explain significant choices and tradeoffs.

**Include**:
- What decision was made
- Why it was made
- What alternatives were considered
- What tradeoffs were accepted

**Example**:
```markdown
## Decision: Message Queues Between Components

**Decision**: Use RabbitMQ message queues between components instead of direct HTTP calls.

**Rationale**:
- Decouples components (Processing can be down without affecting Ingest)
- Provides natural retry mechanism for transient failures
- Allows independent scaling of components
- Buffers traffic spikes

**Alternatives considered**:
- Direct HTTP calls: Simpler but couples components tightly
- Kafka: More complex to operate, overkill for our scale

**Tradeoffs**:
- Additional infrastructure to manage (RabbitMQ cluster)
- Eventual consistency instead of immediate processing
- More complex local development setup
```

**Why**: Future maintainers need to understand the reasoning to make informed changes.

#### 4. Data Flow

**Purpose**: Show how data moves through the system.

**Include**:
- Sequence diagrams or flow diagrams
- Request/response flows
- Data transformations

**Example**:
```markdown
## Data Flow

1. External system POSTs data to `/api/ingest`
2. Ingest Service validates request and publishes to `ingest.raw` queue
3. Processing Engine consumes from queue, validates against schema
4. If valid, Processing Engine transforms data and publishes to `storage.processed` queue
5. Storage Service consumes and persists to PostgreSQL
6. Storage Service publishes to `storage.complete` queue
7. Ingest Service consumes completion message and responds to original HTTP request
```

**Why**: Clarifies system behavior and interactions.

#### 5. Deployment Architecture

**Purpose**: Explain how the system runs in production.

**Include**:
- Infrastructure components
- Scaling characteristics
- Failure modes and recovery

**Example**:
```markdown
## Deployment

Each component runs in separate Kubernetes pods:
- Ingest Service: 3 replicas (load balanced)
- Processing Engine: 5 replicas (scales based on queue depth)
- Storage Service: 2 replicas

RabbitMQ runs as a 3-node cluster for high availability.

PostgreSQL runs as a primary with 2 read replicas.
```

**Why**: Developers need to understand production constraints.

### Architecture Documentation Anti-Patterns

**Don't**:
- ❌ Document every implementation detail
- ❌ Create diagrams that require special tools to edit
- ❌ Forget to explain why decisions were made
- ❌ Let documentation drift from reality

**Do**:
- ✅ Focus on high-level structure and key decisions
- ✅ Explain tradeoffs and alternatives
- ✅ Use diagrams for complex flows
- ✅ Update docs when architecture changes

### Quality Criteria

Good architecture documentation:
- Provides high-level system overview
- Explains major components and their interactions
- Documents significant design decisions with rationale
- Includes tradeoffs and alternatives considered
- Uses diagrams where helpful
- Is maintained as the system evolves

---

## CLI Tool Documentation

### Purpose

CLI documentation helps users **operate command-line tools**. It answers:
- What commands are available?
- What do they do?
- What options do they accept?

### Target Audience

Users running your command-line tool.

### Essential Elements

#### 1. Installation

**Purpose**: Get the tool installed.

**Include**:
- Installation command
- Prerequisites
- Verification step

**Example**:
```markdown
## Installation

```bash
npm install -g my-cli-tool
```

Verify installation:

```bash
my-cli-tool --version
```

**Why**: Users need to install before they can use.

#### 2. Basic Usage

**Purpose**: Show common invocations.

**Include**:
- Simplest useful command
- Common patterns
- Help command

**Example**:
```markdown
## Usage

```bash
# Basic usage
my-cli-tool process input.json

# Get help
my-cli-tool --help

# Get help for specific command
my-cli-tool process --help
```

**Why**: Users want to accomplish basic tasks quickly.

#### 3. Commands

**Purpose**: Document each command.

**Include** (for each command):
- Command name
- Description
- Arguments
- Options/flags
- Examples

**Example**:
```markdown
## Commands

### `process <file>`

Processes a data file and outputs results.

Arguments:
- `file`: Path to input file (JSON or CSV)

Options:
- `-o, --output <file>`: Write results to file (default: stdout)
- `-f, --format <type>`: Output format: json, csv, table (default: json)
- `-v, --verbose`: Show detailed progress
- `--dry-run`: Validate without processing

Examples:

```bash
# Process file and output to console
my-cli-tool process data.json

# Process and save to file
my-cli-tool process data.json -o results.json

# Process with table output
my-cli-tool process data.csv -f table
```

**Why**: Users need to know exactly how to invoke each command.

#### 4. Configuration

**Purpose**: Document configuration options.

**Include**:
- Config file location
- Config file format
- Available options
- Precedence (env vars, config file, flags)

**Example**:
```markdown
## Configuration

Config file: `~/.my-cli-tool/config.json`

Example config:

```json
{
  "defaultFormat": "table",
  "apiKey": "your-api-key-here",
  "verbose": false
}
```

Configuration precedence (highest to lowest):
1. Command-line flags
2. Environment variables
3. Config file
4. Defaults
```

**Why**: Users need to know how to configure the tool.

#### 5. Exit Codes

**Purpose**: Document return codes for scripting.

**Include**:
- Exit code meanings
- When each code is returned

**Example**:
```markdown
## Exit Codes

- `0`: Success
- `1`: General error
- `2`: Invalid arguments
- `3`: File not found
- `4`: Processing failed
```

**Why**: Enables scripting and automation.

### CLI Documentation Anti-Patterns

**Don't**:
- ❌ Forget to show complete commands
- ❌ Omit common use cases
- ❌ Document only the code, not the user experience

**Do**:
- ✅ Show real, working commands
- ✅ Include common examples
- ✅ Document all options and flags
- ✅ Keep help text concise but complete

### Quality Criteria

Good CLI documentation:
- Documents every command with examples
- Shows complete, working commands
- Documents all options and flags
- Includes common use cases
- Documents exit codes for scripting
- Has up-to-date `--help` output

---

## Summary

**Choose documentation type based on reader's goal**:
- Quick start → README
- Look up details → API Reference
- Learn a task → Tutorial/Guide
- Understand design → Architecture Documentation
- Use a CLI tool → CLI Documentation

**Key principles across all types**:
- Know your audience and their goals
- Structure logically for that goal
- Apply Strunk & White principles (active voice, concise, specific)
- Include working, tested examples
- Link between related documentation

**Guidelines, not templates**:
- Adapt sections to your project's needs
- Omit sections that don't add value
- Add sections for project-specific needs
- Maintain consistency within each document type
