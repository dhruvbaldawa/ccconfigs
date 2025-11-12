---
description: Execute tasks from pending/ through Kanban flow (implementation → review → testing)
---

# Implement Plan

Execute tasks from `.plans/{{ARGS}}/pending/` through Kanban flow.

## Usage

```
/implement-plan user-authentication
/implement-plan realtime-notifications
```

## Your Task

You are the orchestrator. Coordinate the **implementation**, **review**, and **testing** skills to complete all tasks in the plan.

### Setup

1. Verify plan exists:
```bash
if [ ! -d ".plans/{{ARGS}}/pending" ]; then
  echo "❌ Plan not found. Run: /plan-feature [description] first"
  exit 1
fi
```

2. Count total tasks:
```bash
total=$(find .plans/{{ARGS}} -name "[0-9]*-*.md" | wc -l)
echo "Found $total tasks to implement"
```

### Main Loop

While tasks remain in pending/ OR in-flight (implementation/review/testing directories):

#### A. Find Next Task

Look for a task in pending/ with met dependencies:
```bash
for task in .plans/{{ARGS}}/pending/[0-9]*-*.md; do
  [ ! -f "$task" ] && continue

  # Extract task number and name
  task_file=$(basename "$task")
  task_num=$(echo "$task_file" | grep -o "^[0-9]*")

  # Check dependencies
  deps=$(grep "^\*\*Dependencies:\*\*" "$task" | sed 's/.*: //')

  # If no dependencies or dependencies met, this is our task
  if [[ "$deps" == "None" ]] || dependencies_met "$deps"; then
    next_task="$task"
    break
  fi
done
```

If no task with met dependencies found, check if tasks are stuck or in-flight.

#### B. Implementation Phase

1. **Move task** to implementation/:
```bash
mv ".plans/{{ARGS}}/pending/$task_file" ".plans/{{ARGS}}/implementation/$task_file"
```

2. **Report progress:**
```
🔨 Implementing Task X/Y: [task name from file]
```

3. **Invoke implementation skill:**
"Implement the task in .plans/{{ARGS}}/implementation/$task_file"

4. **Wait for implementation skill** to:
   - Write code and tests
   - Update Status field to "READY_FOR_REVIEW" or "STUCK"
   - Append implementation notes to task file
   - Report completion

5. **Read task file** to verify status:
```bash
status=$(grep "^\*\*Status:\*\*" ".plans/{{ARGS}}/implementation/$task_file" | sed 's/.*: //' | xargs)
```

6. **Handle status:**
   - If "READY_FOR_REVIEW": Move to review/ and continue
   - If "STUCK": STOP workflow, show implementation notes, ask user how to proceed

7. **Move to review:**
```bash
mv ".plans/{{ARGS}}/implementation/$task_file" ".plans/{{ARGS}}/review/$task_file"
```

8. **Report:**
```
Task X/Y → review
```

#### C. Review Phase

1. **Report progress:**
```
🔍 Reviewing Task X/Y: [task name]
```

2. **Invoke review skill:**
"Review the task in .plans/{{ARGS}}/review/$task_file"

3. **Wait for review skill** to:
   - Analyze git diff and tests
   - Check security/quality/performance
   - Update Status to "APPROVED" or "REJECTED"
   - Append review notes with scores
   - Report completion

4. **Read task file** to verify status:
```bash
status=$(grep "^\*\*Status:\*\*" ".plans/{{ARGS}}/review/$task_file" | sed 's/.*: //' | xargs)
```

5. **Handle status:**
   - If "APPROVED": Move to testing/ and continue
   - If "REJECTED": Move back to implementation/ and loop back to Implementation Phase

6a. **If approved, move to testing:**
```bash
mv ".plans/{{ARGS}}/review/$task_file" ".plans/{{ARGS}}/testing/$task_file"
```

**Report:**
```
✅ Task X/Y approved → testing
```

6b. **If rejected, move back to implementation:**
```bash
mv ".plans/{{ARGS}}/review/$task_file" ".plans/{{ARGS}}/implementation/$task_file"
```

**Report:**
```
⚠️ Task X/Y rejected → implementation (fixes needed)

Rejection reasons from review:
[Extract and show key issues from review notes]
```

Then loop back to Implementation Phase B.3 to fix and resubmit.

#### D. Testing Phase

1. **Report progress:**
```
🧪 Testing Task X/Y: [task name]
```

2. **Invoke testing skill:**
"Validate tests in .plans/{{ARGS}}/testing/$task_file"

3. **Wait for testing skill** to:
   - Validate existing tests
   - Add missing edge cases
   - Run coverage check
   - Update Status to "COMPLETED" or "NEEDS_FIX"
   - Append testing notes
   - Report completion

4. **Read task file** to verify status:
```bash
status=$(grep "^\*\*Status:\*\*" ".plans/{{ARGS}}/testing/$task_file" | sed 's/.*: //' | xargs)
```

5. **Handle status:**
   - If "COMPLETED": Move to completed/ and continue
   - If "NEEDS_FIX": Move back to implementation/ and loop back

6. **Move to completed:**
```bash
mv ".plans/{{ARGS}}/testing/$task_file" ".plans/{{ARGS}}/completed/$task_file"
```

7. **Report:**
```
✅ Task X/Y completed
```

#### E. Progress Update

After each task completes, show progress:
```bash
pending=$(ls .plans/{{ARGS}}/pending/*.md 2>/dev/null | wc -l)
in_flight=$(find .plans/{{ARGS}}/{implementation,review,testing} -name "*.md" 2>/dev/null | wc -l)
completed=$(ls .plans/{{ARGS}}/completed/*.md 2>/dev/null | wc -l)
total=$((pending + in_flight + completed))

echo ""
echo "Progress: $completed/$total completed | $in_flight in-flight | $pending pending"
echo ""
```

### Stuck Handling

If implementation skill marks task as "STUCK":
1. STOP the workflow
2. Extract and show the blocker from implementation notes
3. Report:
```
⚠️ Task X blocked: [reason from implementation notes]

Task file: .plans/{{ARGS}}/implementation/$task_file

How should we proceed?
- Fix manually and run /implement-plan {{ARGS}} again
- Skip this task (move to pending-skipped/)
- Abort workflow
```

4. Wait for user response before continuing

### Rejection Handling

When review rejects a task:
1. Show specific issues from review notes
2. Move back to implementation/
3. Continue loop (implementation skill will see existing notes and fix)
4. Track rejection count per task (warn if >3 rejections)

### Final Summary

When all tasks in completed/:

1. **Calculate averages:**
```bash
# Extract scores from all review notes
avg_security=$(grep "Security:" .plans/{{ARGS}}/completed/*.md | awk -F: '{sum+=$2; count++} END {print int(sum/count)}')
avg_quality=$(grep "Quality:" .plans/{{ARGS}}/completed/*.md | awk -F: '{sum+=$2; count++} END {print int(sum/count)}')
avg_performance=$(grep "Performance:" .plans/{{ARGS}}/completed/*.md | awk -F: '{sum+=$2; count++} END {print int(sum/count)}')
avg_tests=$(grep "Tests:" .plans/{{ARGS}}/completed/*.md | awk -F: '{sum+=$2; count++} END {print int(sum/count)}')
```

2. **Count rejections:**
```bash
rejected=$(grep -c "REJECTED" .plans/{{ARGS}}/completed/*.md 2>/dev/null || echo "0")
```

3. **Run final test suite:**
```bash
npm test
```

4. **Report completion:**
```markdown
✅ Implementation Complete

Project: {{ARGS}}
Completed: X/X tasks
Tasks rejected during review: Y (then fixed and completed)

Average Review Scores:
- Security: XX/100
- Quality: XX/100
- Performance: XX/100
- Tests: XX/100

Final Test Coverage: XX%
Full test suite: XXX/XXX passing

All tasks completed successfully.

Next: git add . && git commit -m "Implement {{ARGS}}"
```

## Helper Functions

### Check Dependencies Met

```bash
dependencies_met() {
  local deps="$1"
  for dep in $deps; do
    if ! ls .plans/{{ARGS}}/completed/${dep}-*.md 2>/dev/null; then
      return 1
    fi
  done
  return 0
}
```

## Notes

- Skills run in the main conversation → full visibility
- Orchestrator handles all file movement → guaranteed Kanban flow
- Skills update task files → single source of truth
- State persists in file system → can resume anytime with `/implement-plan {{ARGS}}`
- Progress tracked by file location and status field
