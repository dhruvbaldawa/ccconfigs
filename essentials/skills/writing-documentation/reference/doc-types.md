# Documentation Type Guidelines

Guidelines for different types of technical documentation. Use these principles to determine what to write and how to structure it based on your project's needs.

## Decision Framework

### Choosing Documentation Type

**What is the reader's primary goal?**
- Quick start / understand what this is → **README**
- Look up API/function signature → **API Reference**
- Learn how to accomplish a task → **Tutorial / Guide**
- Understand system design → **Architecture Documentation**
- Use a command-line tool → **CLI Documentation**

**What is the reader's experience level?**
- Newcomer to the project → README, Tutorial
- Experienced with the project → API Reference, Architecture
- Operator/deployer → Operations Guide

**What is the reader's context?**
- Evaluating whether to use this → README
- Already using, needs details → API Reference, Guide
- Debugging or troubleshooting → API Reference, Troubleshooting Guide
- Extending or modifying → Architecture Documentation

### Combining Documentation Types

**Minimal project** (small library):
- README (with inline API reference if simple)

**Standard project** (library or tool):
- README (overview, quick start)
- API Reference (detailed documentation)
- Guide (common usage patterns)

**Large project** (framework or platform):
- README (overview, links to other docs)
- Getting Started Tutorial
- API Reference (comprehensive)
- Multiple topic-specific Guides
- Architecture Documentation
- Contributing Guide
- Operations Guide

---

## README

### Purpose
Primary entry point answering: What is this? Why should I care? How do I get started?

### Target Audience
Developers evaluating whether to use your project and getting started for the first time.

### Typical Sections

**Title and Description** (required):
- Project name
- One-sentence description
- Who it's for (if not obvious)

**Installation** (required):
- Primary installation method
- Prerequisites (language version, system requirements)
- Verification step

**Quick Start** (required):
- Minimal working example
- Expected output
- Link to full documentation

**Features** (if not obvious from description):
- 3-7 main capabilities
- Distinguishing characteristics
- Key use cases

**Documentation Links** (if docs exist elsewhere):
- Getting Started Guide
- API Reference
- Advanced Usage

**License** (required for open source):
- License type
- Link to full license text

**Optional sections** (include only if they add clear value):
- Badges (build status, version, coverage)
- Contributing (how to report issues, submit changes)
- Prerequisites (if complex setup required)
- Configuration (if essential and complex)
- FAQ (if common questions exist)

### Key Guidelines

- Keep under 300 lines (preferably under 200)
- Focus on getting started quickly
- Link to detailed docs rather than embedding everything
- Use working, tested code examples
- Update as the project evolves

---

## API Reference Documentation

### Purpose
Comprehensive reference for developers using your library or API. Answers: What functions/endpoints are available? What parameters do they accept? What do they return?

### Target Audience
Developers already using your API who need to look up specific details.

### Document for Each API Element

**Signature**:
- Function/method/endpoint name
- Parameters with types
- Return type
- HTTP method and path (for REST APIs)

**Description**:
- One-sentence summary
- Additional context if needed (keep brief)

**Parameters**:
- Name, type, required/optional
- Description
- Default value (if optional)
- Constraints or valid values

**Return Value**:
- Type
- Description
- Structure (if complex)

**Errors/Exceptions**:
- Exception types thrown
- Conditions that trigger each
- HTTP status codes (for REST APIs)

**Example**:
- Minimal working example
- Common usage patterns
- Error handling (if relevant)

### Organization

**For libraries**:
- Group by module or category
- Alphabetical within groups (or by importance)
- Consistent format for each entry

**For REST APIs**:
- Group by resource
- List endpoints per resource
- Show request and response examples

### Key Guidelines

- Document every public function/endpoint
- Specify types precisely
- Include executable examples
- Document all error conditions
- Keep descriptions concise

---

## Tutorials and Guides

### Purpose
Teach readers how to accomplish specific tasks or learn concepts.

### Difference: Tutorial vs Guide

**Tutorial**:
- Step-by-step learning path
- Builds one thing from start to finish
- Assumes minimal knowledge

**Guide**:
- Explains a concept or pattern
- May skip basic steps
- Assumes familiarity with basics

### Typical Structure

**Introduction**:
- What you'll build/learn
- Why it's useful
- Estimated time (for tutorials)
- Prerequisites

**Setup**:
- Required software and versions
- Initial project setup
- Dependencies to install

**Step-by-Step Instructions**:
- What to do
- Why you're doing it (context)
- Code to add
- Expected result
- Verification/testing at each step

**Conclusion**:
- Summary of what was built/learned
- Suggestions for extending or improving
- Links to related documentation

### Key Guidelines

- Build incrementally with verification at each step
- Explain reasoning behind decisions
- Provide working, tested code
- Include troubleshooting for common issues
- Test end-to-end before publishing

---

## Architecture Documentation

### Purpose
Explain how the system is designed and why. Answers: How is the system structured? Why did we make these design decisions? What are the tradeoffs?

### Target Audience
Developers contributing to the project, teams evaluating the system, future maintainers.

### Typical Sections

**Overview**:
- What the system does
- Major components
- How components interact

**Component Details**:
- Responsibility of each component
- Key interfaces
- Dependencies
- Technology choices

**Design Decisions**:
- What decision was made
- Why it was made
- What alternatives were considered
- What tradeoffs were accepted

**Data Flow**:
- How data moves through the system
- Request/response flows
- Data transformations

**Deployment** (if relevant):
- Infrastructure components
- Scaling characteristics
- Failure modes and recovery

### Key Guidelines

- Focus on high-level structure and key decisions
- Explain tradeoffs and alternatives
- Use diagrams for complex flows
- Update as the system evolves

---

## CLI Tool Documentation

### Purpose
Help users operate command-line tools. Answers: What commands are available? What do they do? What options do they accept?

### Target Audience
Users running your command-line tool.

### Typical Sections

**Installation**:
- Installation command
- Prerequisites
- Verification step

**Basic Usage**:
- Simplest useful command
- Common patterns
- Help command

**Commands** (for each command):
- Command name and signature
- Description
- Arguments (name, description)
- Options/flags (name, description, default)
- Examples (2-3 common use cases)

**Configuration** (if applicable):
- Config file location and format
- Available options
- Precedence (env vars, config file, flags)

**Exit Codes** (for scripting):
- Exit code meanings
- When each code is returned

### Key Guidelines

- Show complete, working commands
- Include common use cases
- Document all options and flags
- Keep help text concise but complete

---

## Common Patterns Across All Types

### Progressive Disclosure
- Start with essentials
- Link to detailed information
- Don't embed everything in one document

### Examples First
- Show working example early
- Then explain details
- Examples should be executable

### Consistent Structure
- Use same format for similar elements
- Maintain parallel construction
- Keep terminology consistent

### Scannable Format
- Clear headings
- Bullet points for lists
- Code blocks for commands/examples
- Tables for structured data

### Link Between Docs
- README → Getting Started → Guides → API Reference
- Cross-reference related documentation
- Keep each doc focused on its purpose

---

## Anti-Patterns

**Don't**:
- Mix documentation types (e.g., tutorials in API reference)
- Duplicate content across multiple docs
- Include implementation details in user-facing docs
- Assume knowledge not stated in prerequisites
- Let documentation drift from reality

**Do**:
- Keep each doc type focused on its purpose
- Link to canonical information rather than duplicating
- Focus on interface, not implementation
- State all prerequisites explicitly
- Update docs when code changes
