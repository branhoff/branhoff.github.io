#!/bin/bash
case "$1" in
  "serve")
    echo "Starting http-server on port 8000..."
    http-server -p 8000 --host 0.0.0.0
    ;;
  "live")
    echo "Starting live-server with auto-reload..."
    live-server --port=8080 --host=0.0.0.0
    ;;
  "format")
    echo "Formatting HTML, CSS, and JS files..."
    prettier --write "**/*.{html,css,js,json}"
    ;;
  "validate")
    echo "Validating JSON files..."
    find . -name "*.json" -exec jq . {} \;
    ;;
  *)
    echo "Usage: webdev {serve|live|format|validate}"
    echo "  serve    - Start http-server on port 8000"
    echo "  live     - Start live-server with auto-reload on port 8080"
    echo "  format   - Format HTML/CSS/JS files with Prettier"
    echo "  validate - Validate JSON files"
    ;;
esac