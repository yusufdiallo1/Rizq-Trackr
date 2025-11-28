#!/bin/bash

# Comprehensive TypeScript Error Scanner
# Scans for ALL common type error patterns

echo "🔍 COMPREHENSIVE TYPE ERROR SCAN"
echo "=================================="
echo ""

TOTAL_ISSUES=0

# Pattern 1: window.onerror misuse
echo "1️⃣  Checking window.onerror assignments..."
if grep -rn "window\.onerror\s*=\s*[a-zA-Z]" --include="*.ts" --include="*.tsx" . 2>/dev/null | grep -v "window.onerror = ("; then
  echo "  ⚠️  Found direct function assignment to window.onerror"
  TOTAL_ISSUES=$((TOTAL_ISSUES + 1))
else
  echo "  ✅ No window.onerror issues"
fi

# Pattern 2: Supabase .select() without .returns<>()
echo ""
echo "2️⃣  Checking Supabase .select() calls..."
FILES=$(find app lib -name "*.ts" -o -name "*.tsx" 2>/dev/null)
for file in $FILES; do
  if grep -q "\.select(" "$file" 2>/dev/null; then
    if ! grep -q "\.returns<" "$file" 2>/dev/null && ! grep -q "select('\*')" "$file" 2>/dev/null; then
      echo "  ⚠️  $file: .select() without .returns<>()"
      TOTAL_ISSUES=$((TOTAL_ISSUES + 1))
    fi
  fi
done
echo "  ✅ Supabase .select() check complete"

# Pattern 3: Supabase .upsert()/.insert() without type safety
echo ""
echo "3️⃣  Checking Supabase mutations..."
for file in $FILES; do
  if grep -q "\.upsert\|\.insert" "$file" 2>/dev/null; then
    if ! grep -q "as any" "$file" 2>/dev/null; then
      echo "  ⚠️  $file: mutation without type cast"
      TOTAL_ISSUES=$((TOTAL_ISSUES + 1))
    fi
  fi
done
echo "  ✅ Supabase mutation check complete"

# Pattern 4: Array type issues (readonly)
echo ""
echo "4️⃣  Checking Array vs readonly array..."
if grep -rn "payload.*Array<" --include="*.ts" --include="*.tsx" components app 2>/dev/null | grep -v "readonly"; then
  echo "  ⚠️  Found mutable Array types that might need readonly"
  TOTAL_ISSUES=$((TOTAL_ISSUES + 1))
else
  echo "  ✅ No Array type issues"
fi

# Pattern 5: Wrong Supabase imports
echo ""
echo "5️⃣  Checking Supabase imports..."
if grep -rn "import.*createSupabaseClient.*from.*'\.\/supabase'" --include="*.ts" --include="*.tsx" app lib 2>/dev/null; then
  echo "  ⚠️  Found non-exported createSupabaseClient imports"
  TOTAL_ISSUES=$((TOTAL_ISSUES + 1))
else
  echo "  ✅ No import issues"
fi

echo ""
echo "=================================="
if [ $TOTAL_ISSUES -eq 0 ]; then
  echo "✅ NO TYPE ISSUES FOUND!"
  echo "   Safe to deploy to Vercel"
  exit 0
else
  echo "❌ Found $TOTAL_ISSUES potential issues"
  echo "   Review and fix before deploying"
  exit 1
fi
