#!/bin/bash

# Supabase Type Checker
# This script scans for common Supabase TypeScript issues

echo "🔍 Scanning for Supabase type issues..."
echo ""

ISSUES_FOUND=0

# Check 1: .select() without .returns<>()
echo "📋 Checking for .select() calls without explicit typing..."
FILES_WITH_SELECT=$(find app lib -name "*.ts" -o -name "*.tsx" | xargs grep -l "\.select(" 2>/dev/null || true)

if [ -n "$FILES_WITH_SELECT" ]; then
  for file in $FILES_WITH_SELECT; do
    # Check if the file has .select() but not .returns<>()
    if grep -q "\.select(" "$file" && ! grep -q "\.returns<" "$file"; then
      echo "⚠️  $file has .select() but no .returns<>()"
      ISSUES_FOUND=$((ISSUES_FOUND + 1))
    fi
  done
fi

# Check 2: .upsert() or .insert() without type casting
echo ""
echo "📋 Checking for .upsert()/.insert() without type safety..."
FILES_WITH_MUTATIONS=$(find app lib -name "*.ts" -o -name "*.tsx" | xargs grep -l "\.upsert\|\.insert" 2>/dev/null || true)

if [ -n "$FILES_WITH_MUTATIONS" ]; then
  for file in $FILES_WITH_MUTATIONS; do
    # Check if the file has mutations but no 'as any' or proper typing
    if grep -q "\.upsert\|\.insert" "$file" && ! grep -q "as any" "$file"; then
      echo "⚠️  $file has .upsert()/.insert() without type casting"
      ISSUES_FOUND=$((ISSUES_FOUND + 1))
    fi
  done
fi

# Check 3: Supabase client import patterns
echo ""
echo "📋 Checking Supabase import patterns..."
if grep -r "import.*createSupabaseClient.*from.*'./supabase'" app lib 2>/dev/null; then
  echo "⚠️  Found imports of non-exported createSupabaseClient"
  ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

echo ""
if [ $ISSUES_FOUND -eq 0 ]; then
  echo "✅ No Supabase type issues found!"
  exit 0
else
  echo "❌ Found $ISSUES_FOUND potential type issues"
  echo ""
  echo "💡 Common fixes:"
  echo "  1. Add .returns<Type>() after .select() calls"
  echo "  2. Add 'as any' type casting for .upsert()/.insert()"
  echo "  3. Use exported functions from lib/supabase.ts"
  exit 1
fi
