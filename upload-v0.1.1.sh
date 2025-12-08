#!/bin/bash

# 🚀 @struktos/cli v0.1.1 GitHub 업로드 스크립트

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  @struktos/cli v0.1.1 GitHub 업로드"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 1. 상태 확인
echo "📋 1. Git 상태 확인..."
git status
echo ""

# 2. 변경사항 추가
echo "📦 2. 변경사항 스테이징..."
git add .
echo "✓ 모든 변경사항이 추가되었습니다."
echo ""

# 3. 커밋
echo "💾 3. 커밋 생성..."
git commit -m "feat: add code generator (v0.1.1)

## New Features
- Add 'struktos generate entity' command
- Automatic Hexagonal Architecture scaffolding
- Generate 8 files per entity (Entity, Repository, 5 Use Cases)
- Field-based TypeScript type generation
- Smart validation logic (email, price, required fields)

## New Files
- src/commands/generate.ts - Main generate command
- src/generators/entityGenerator.ts - Entity & Repository generator
- src/generators/useCaseGenerator.ts - Use Case generator (CRUD)
- src/utils/fieldParser.ts - Field definition parser

## Technical Details
- Parse field definitions: 'name:string,price:number'
- Support 6 types: string, number, boolean, Date, any, unknown
- Optional fields with '?' suffix
- Auto ID field generation
- Type-safe code generation

## Examples
struktos generate entity Product --fields=\"name:string,price:number\"
struktos g entity User --fields=\"username:string,email:string,age:number?\"

## Stats
- New commands: 1 (generate)
- New files: 4
- Code added: ~1,000 lines
- Files per entity: 8

## Breaking Changes
None - backward compatible"

echo "✓ 커밋이 생성되었습니다."
echo ""

# 4. 태그 생성
echo "🏷️  4. 태그 생성..."
git tag -a v0.1.1 -m "Release v0.1.1 - Code Generator

Features:
✨ Code Generator for Hexagonal Architecture
✨ Entity Generator with typed fields
✨ CRUD Use Cases auto-generation
✨ Smart validation logic
✨ Full TypeScript support

Usage:
struktos generate entity Product --fields=\"name:string,price:number\"

Generated Files (8 per entity):
- Domain: Entity + Repository Interface
- Application: Create, Get, List, Update, Delete Use Cases
- Infrastructure: Repository Implementation

Benefits:
⚡ Save 2-3 hours per entity
🎯 Consistent architecture
🔒 Type-safe code
✅ Production-ready

Stats:
- Commands: 2 (new, generate)
- New files: 4
- Code added: ~1,000 lines
- Files per entity: 8"

echo "✓ 태그 v0.1.1이 생성되었습니다."
echo ""

# 5. 푸시 확인
echo "🚀 5. GitHub에 푸시..."
read -p "GitHub에 푸시하시겠습니까? (y/n): " confirm

if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
    # main 브랜치 푸시
    echo "   - main 브랜치 푸시 중..."
    git push origin main
    
    # 태그 푸시
    echo "   - 태그 v0.1.1 푸시 중..."
    git push origin v0.1.1
    
    echo ""
    echo "✅ GitHub 업로드 완료!"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  🎉 성공!"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "✓ 커밋: feat: add code generator (v0.1.1)"
    echo "✓ 태그: v0.1.1"
    echo "✓ 브랜치: main"
    echo ""
    echo "📍 확인:"
    echo "   GitHub: https://github.com/struktos/struktos-cli/releases"
    echo ""
    echo "🎯 다음 단계:"
    echo "   1. GitHub에서 Release 생성"
    echo "   2. NPM 발행: npm publish --access public"
    echo ""
else
    echo ""
    echo "⚠️  푸시가 취소되었습니다."
    echo ""
    echo "수동으로 푸시하려면:"
    echo "   git push origin main"
    echo "   git push origin v0.1.1"
    echo ""
fi