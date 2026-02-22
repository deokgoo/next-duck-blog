#!/bin/sh
# Windows 호환 파일명 검사 (pre-commit hook에서 호출)
# 커밋에 추가되는 파일 중 Windows에서 문제가 될 수 있는 파일명을 검사합니다.

ERRORS=0

# git에 staged된 파일 목록
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACR)

if [ -z "$STAGED_FILES" ]; then
  exit 0
fi

for FILE in $STAGED_FILES; do
  BASENAME=$(basename "$FILE")

  # 1. 제어 문자 포함 여부 (ASCII 0-31: \b, \t, \n 등)
  if echo "$BASENAME" | grep -qP '[\x00-\x1f]' 2>/dev/null || \
     printf '%s' "$BASENAME" | LC_ALL=C grep -q $'\001\002\003\004\005\006\007\010\013\014\015\016\017\020\021\022\023\024\025\026\027\030\031\032\033\034\035\036\037'; then
    echo "❌ [파일명 오류] 제어 문자 포함: $FILE"
    ERRORS=$((ERRORS + 1))
  fi

  # 2. Windows 금지 문자 포함 여부 (< > : " | ? *)
  if echo "$BASENAME" | grep -q '[<>:"|?*]'; then
    echo "❌ [파일명 오류] Windows 금지 문자 포함 (<>:\"|?*): $FILE"
    ERRORS=$((ERRORS + 1))
  fi

  # 3. Windows 예약어 (CON, PRN, AUX, NUL, COM1-9, LPT1-9)
  NAME_WITHOUT_EXT=$(echo "$BASENAME" | sed 's/\..*//')
  if echo "$NAME_WITHOUT_EXT" | grep -qiE '^(CON|PRN|AUX|NUL|COM[0-9]|LPT[0-9])$'; then
    echo "❌ [파일명 오류] Windows 예약어: $FILE"
    ERRORS=$((ERRORS + 1))
  fi

  # 4. 파일명 끝 공백 또는 점
  if echo "$BASENAME" | grep -qE '[ .]$'; then
    echo "❌ [파일명 오류] 파일명이 공백이나 점으로 끝남: $FILE"
    ERRORS=$((ERRORS + 1))
  fi
done

if [ $ERRORS -gt 0 ]; then
  echo ""
  echo "⚠️  Windows 호환성 문제가 있는 파일이 $ERRORS개 있습니다."
  echo "   파일명을 수정 후 다시 커밋해주세요."
  exit 1
fi

exit 0
