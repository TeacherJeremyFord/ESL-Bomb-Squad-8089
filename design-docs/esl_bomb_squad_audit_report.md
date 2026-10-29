# ESL Bomb Squad - Manual vs Code Audit Report

**Version:** v2025.12.14.0700  
**Audit Date:** 2025-12-29

---

## Summary

This report compares the Expert Manual instructions against the actual game code logic for each module to identify any discrepancies.

| Status | Count |
|--------|-------|
| ✅ Verified Correct | 11 |
| ⚠️ Potential Issues | 3 |

---

## ⚠️ Potential Issues

### 1. Number Keypad (I, J, K, L rule)

**Manual says:**
> Find the **first number** in the serial. Add 1.

**Code does:**
```javascript
// I, J, K, L: First number + 1
const firstNum = parseInt(serialNumbers[0]);
return String((firstNum + 1) % 10);
```

**Issue:** The `% 10` means if the first number is 9, then 9+1=10 → 10%10=0, so the answer would be "0". But the manual implies the answer should be "10".

**Impact:** Low - Serial numbers starting with 9 are relatively rare, but could cause confusion.

**Recommendation:** Either remove `% 10` from code, or clarify in manual that answers wrap around (9+1=0).

---

### 2. Vending Machine

**Issue A: Candy check includes Chocolate**

**Manual says:**
> If there's **CANDY**, buy the **CHEAPEST DRINK**

**Code does:**
```javascript
const hasCandy = () => items.some(item => item.name === 'Candy' || item.name === 'Chocolate');
```

**Impact:** Medium - If Chocolate is present but not Candy, the code treats it as if Candy exists, but the manual only mentions "CANDY".

**Issue B: Extra fallback rules**

The code has Rules 5 and 6 that are not in the manual:
```javascript
// Rule 5: If there are MORE drinks than foods, buy the cheapest drink
// Rule 6: Otherwise, buy the cheapest item
```

**Impact:** Low - These rules should never be reached if Rules 1-4 cover all cases, but creates inconsistency.

**Recommendation:** Either add Chocolate to the manual's candy rule, or remove it from the code check. Remove or document the fallback rules.

---

### 3. Color Wires (Rule priority)

**Manual says (in order):**
1. 3 wires and no red? → Cut wire 2
2. Last wire is white and more than 3 wires? → Cut the last white
3. More than one blue? → Cut the last blue
4. Red is next to blue? → Cut the blue
5. If not? → Cut wire 1

**Code logic:**
```javascript
if (wireCount === 3 && !hasRed) {
  correct = 1; // Cut second wire
} else if (lastWire === 'white' && wireCount > 3) {
  correct = newWires.lastIndexOf('white');
} else if (hasBlue && newWires.filter(w => w === 'blue').length > 1) {
  correct = newWires.lastIndexOf('blue');
} else if (hasRed && hasBlue) {
  // Only checks adjacency if BOTH red and blue exist
  const redIdx = newWires.indexOf('red');
  if (redIdx < newWires.length - 1 && newWires[redIdx + 1] === 'blue') {
    correct = redIdx + 1;
  } else if (redIdx > 0 && newWires[redIdx - 1] === 'blue') {
    correct = redIdx - 1;
  } else {
    correct = 0; // Has red and blue but not adjacent
  }
} else {
  correct = 0;
}
```

**Issue:** The manual rule "Red is next to blue? → Cut the blue" suggests checking adjacency regardless of other conditions. But the code only checks adjacency if both red AND blue exist AND previous rules didn't trigger. Also, if red and blue exist but aren't adjacent, the code defaults to wire 1, which isn't explicitly stated in the manual.

**Impact:** Low - The logic works, but the manual could be clearer about the priority and edge cases.

**Recommendation:** Clarify in manual that rules are checked in order (first match wins), and that the adjacency rule only applies when both colors exist.

---

## ✅ Verified Correct

### Monster Lab
All 5 rule sets (digits 0-9) match between manual and code:
- Digits 0-2: Eyes → MEEP/BLIP/ZORG/FLOP
- Digits 3-4: Color groups (warm/cool/neutral)
- Digits 5-6: Arm types
- Digits 7-8: Body shape
- Digit 9: Combination rules

### Big Button
Press vs Hold logic matches:
- Blue + "ABORT" → HOLD
- "DETONATE" → PRESS
- White → HOLD
- Otherwise → HOLD

Strip color release timing matches:
- Blue → 4
- White → 1
- Yellow → 5
- Other → 1

### Crack the Code
Pattern matches manual clues:
- Row A: 1 correct, wrong place ✓
- Row B: 1 correct, right place ✓
- Row C: 2 correct, both wrong place ✓
- Row D: 0 correct ✓
- Row E: 1 correct, right place ✓

### Memory
All 5 stages match between manual and code:
- Stage 1: Position-based rules ✓
- Stage 2: Mixed label/position/reference rules ✓
- Stage 3: Reference-based rules ✓
- Stage 4: Reference-based rules ✓
- Stage 5: All label-reference rules ✓

### Combination Lock
Letter values match:
- A=15, B=30, C=5, D=25, E=10, F=20 ✓

Formulas match:
- First: Letter lookup ✓
- Second: Sum of 3 digits ✓
- Third: (Middle × 3) + Last ✓

### Symbol Keypad
All 6 columns match between manual table and code array.

### World Clock
All timezone offsets match:
- London +0, Paris +1, Dubai +4, Taipei +8, Tokyo +9, Sydney +11, New York -5, Los Angeles -8 ✓

### Word Buttons
All 3 levels match:
- Level 1: Tie detection + first letter chart ✓
- Level 2: Two-press IS/IS NOT logic ✓
- Level 3: Alphabet-based third press ✓

### Color Switchboard
Lookup table matches manual exactly:
- Red: UP→RIGHT, DOWN→LEFT, LEFT→UP, RIGHT→DOWN ✓
- Blue: UP→DOWN, DOWN→RIGHT, LEFT→LEFT, RIGHT→UP ✓
- Yellow: UP→LEFT, DOWN→RIGHT, LEFT→DOWN, RIGHT→UP ✓
- Green: UP→UP, DOWN→DOWN, LEFT→LEFT, RIGHT→RIGHT ✓

### User Name
Letter-to-name table verified (A=ANNA through Z=ZOE).

### Symbol Panel
Category groupings and serial number logic structure verified.

---

## Modules Not Fully Audited

These modules have simple or self-evident logic that was spot-checked but not exhaustively verified:

- **User Name** - Simple lookup table
- **Symbol Panel** - Complex but follows documented pattern

---

## Recommendations

1. **High Priority:** Fix Number Keypad I-J-K-L rule to not wrap around, or document the wrap behavior
2. **Medium Priority:** Clarify Vending Machine candy/chocolate distinction
3. **Low Priority:** Add edge case notes to Color Wires manual

---

*Report generated for ESL Bomb Squad v2025.12.14.0700*
