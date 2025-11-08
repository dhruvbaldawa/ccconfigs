#!/usr/bin/env bash
# ABOUTME: Idempotent script to create symlinks from ~/.claude/ to ccconfigs
# ABOUTME: Run this script after cloning the repository to set up your global Claude Code configuration

set -euo pipefail

# Get the absolute path to the directory containing this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_DIR="${SCRIPT_DIR}/config"
CLAUDE_DIR="${HOME}/.claude"
STATUSLINE_DIR="${HOME}/.config/ccstatusline"

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Setting up Claude Code configuration symlinks...${NC}\n"

# Ensure ~/.claude directory exists
mkdir -p "${CLAUDE_DIR}"
mkdir -p "${STATUSLINE_DIR}"

# Function to create symlink idempotently
create_symlink() {
    local source_file="$1"
    local target_link="$2"
    local source_name="$(basename "$source_file")"

    # Check if target exists and is already the correct symlink
    if [[ -L "${target_link}" ]]; then
        local current_target="$(readlink "${target_link}")"
        if [[ "${current_target}" == "${source_file}" ]]; then
            echo -e "${GREEN}✓${NC} ${source_name}: Symlink already correct"
            return 0
        else
            echo -e "${YELLOW}⚠${NC} ${source_name}: Symlink points to wrong location: ${current_target}"
            echo -e "  Removing and recreating..."
            rm "${target_link}"
        fi
    elif [[ -e "${target_link}" ]]; then
        # File exists but is not a symlink - back it up
        local backup="${target_link}.backup.$(date +%Y%m%d_%H%M%S)"
        echo -e "${YELLOW}⚠${NC} ${source_name}: File exists, backing up to $(basename "${backup}")"
        mv "${target_link}" "${backup}"
    fi

    # Create the symlink
    ln -s "${source_file}" "${target_link}"
    echo -e "${GREEN}✓${NC} ${source_name}: Created symlink"
}

# Create symlinks
create_symlink "${CONFIG_DIR}/CLAUDE.md" "${CLAUDE_DIR}/CLAUDE.md"
create_symlink "${CONFIG_DIR}/settings.json" "${CLAUDE_DIR}/settings.json"
create_symlink "${CONFIG_DIR}/statusline.json" "${STATUSLINE_DIR}/settings.json"

echo -e "\n${BLUE}Done! Your global Claude Code configuration is now managed from:${NC}"
echo -e "  ${CONFIG_DIR}"
echo -e "\n${BLUE}Edit files in config/ and changes will be reflected globally.${NC}"
