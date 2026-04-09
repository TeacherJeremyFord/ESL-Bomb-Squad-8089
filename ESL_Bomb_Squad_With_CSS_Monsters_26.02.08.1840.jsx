import React, { useState, useEffect, useCallback, useRef } from 'react';

// Utility functions
const generateSerialNumber = () => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const digits = '0123456789';
  const randomLetter = () => letters[Math.floor(Math.random() * letters.length)];
  const randomDigit = () => digits[Math.floor(Math.random() * digits.length)];
  return `${randomLetter()}${randomLetter()}${randomDigit()}${randomDigit()}${randomDigit()}-${randomLetter()}${randomDigit()}${randomLetter()}${randomDigit()}${randomDigit()}`;
};

const shuffleArray = (arr) => {
  const newArr = [...arr];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

// Color-coded serial number display
const ColorCodedSerial = ({ serial }) => {
  return (
    <>
      {serial.split('').map((char, idx) => {
        const isLetter = /[A-Z]/.test(char);
        const isNumber = /[0-9]/.test(char);
        const className = isLetter ? 'letter' : isNumber ? 'number' : 'separator';
        return <span key={idx} className={className}>{char}</span>;
      })}
    </>
  );
};

// ===== COLOR WIRES MODULE =====
const ColorWiresModule = ({ serialNumber, onSuccess, onStrike, difficulty = 'A1' }) => {
  const colors = ['red', 'blue', 'yellow', 'green', 'white', 'black'];
  const colorDisplay = {
    red: '#e53935', blue: '#1e88e5', yellow: '#fdd835', 
    green: '#43a047', white: '#f5f5f5', black: '#212121'
  };
  
  const [wires, setWires] = useState([]);
  const [cutWires, setCutWires] = useState([]);
  const [correctWire, setCorrectWire] = useState(null);
  
  useEffect(() => {
    const wireCount = difficulty === 'A1' ? 3 : difficulty === 'A2' ? 4 : 5;
    const newWires = Array.from({ length: wireCount }, () => 
      colors[Math.floor(Math.random() * colors.length)]
    );
    setWires(newWires);
    
    // Determine correct wire based on rules
    const hasRed = newWires.includes('red');
    const hasBlue = newWires.includes('blue');
    const lastWire = newWires[newWires.length - 1];
    
    let correct;
    if (wireCount === 3 && !hasRed) {
      correct = 1; // Cut second wire
    } else if (lastWire === 'white' && wireCount > 3) {
      correct = newWires.lastIndexOf('white');
    } else if (hasBlue && newWires.filter(w => w === 'blue').length > 1) {
      correct = newWires.lastIndexOf('blue');
    } else if (hasRed && hasBlue) {
      const redIdx = newWires.indexOf('red');
      if (redIdx < newWires.length - 1 && newWires[redIdx + 1] === 'blue') {
        correct = redIdx + 1;
      } else if (redIdx > 0 && newWires[redIdx - 1] === 'blue') {
        correct = redIdx - 1;
      } else {
        correct = 0;
      }
    } else {
      correct = 0;
    }
    setCorrectWire(correct);
    setCutWires([]);
  }, [difficulty]);

  const cutWire = (index) => {
    if (cutWires.includes(index)) return;
    setCutWires([...cutWires, index]);
    if (index === correctWire) {
      onSuccess();
    } else {
      onStrike();
    }
  };

  return (
    <div className="module-content wires-module">
      <h3>🔌 COLOR WIRES</h3>
      <p className="module-hint">Cut the correct wire based on the rules!</p>
      <div className="wires-container">
        {wires.map((color, idx) => (
          <div key={idx} className="wire-row">
            <span className="wire-label">Wire {idx + 1}</span>
            <div className="wire-wrapper">
              <div 
                className={`wire wire-left ${cutWires.includes(idx) ? 'cut' : ''}`}
                style={{ 
                  backgroundColor: colorDisplay[color],
                  boxShadow: cutWires.includes(idx) ? 'none' : `0 2px 8px ${colorDisplay[color]}50`
                }}
              />
              {cutWires.includes(idx) && (
                <div 
                  className="wire wire-right cut"
                  style={{ 
                    backgroundColor: colorDisplay[color]
                  }}
                />
              )}
            </div>
            <button 
              className="cut-button"
              onClick={() => cutWire(idx)}
              disabled={cutWires.includes(idx)}
            >
              CUT
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// ===== USER NAME MODULE =====
const UserNameModule = ({ serialNumber, onSuccess, onStrike }) => {
  const nameTable = {
    A: 'ANNA', B: 'BEN', C: 'CARL', D: 'DIANA', E: 'EMMA', F: 'FRANK',
    G: 'GEORGE', H: 'HELEN', I: 'IAN', J: 'JANE', K: 'KATE', L: 'LUCY',
    M: 'MIKE', N: 'NOAH', O: 'OLIVIA', P: 'PETER', Q: 'QUINN', R: 'ROSE',
    S: 'SAM', T: 'TOM', U: 'UMA', V: 'VERA', W: 'WILL', X: 'XENA',
    Y: 'YARA', Z: 'ZOE'
  };
  
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState(null);
  
  const lastLetter = serialNumber.replace(/[^A-Z]/g, '').slice(-1);
  const correctName = nameTable[lastLetter] || 'ANNA';
  
  const handleSubmit = () => {
    if (input.toUpperCase() === correctName) {
      setFeedback('correct');
      setTimeout(onSuccess, 500);
    } else {
      setFeedback('wrong');
      onStrike();
      setTimeout(() => setFeedback(null), 1000);
    }
  };

  return (
    <div className="module-content username-module">
      <h3>👤 ENTER USER NAME</h3>
      <p className="module-hint">Check the manual for the correct name!</p>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value.replace(/[^a-zA-Z]/g, ''))}
        placeholder="Type name here..."
        className={`name-input ${feedback || ''}`}
        maxLength={10}
      />
      <button className="submit-btn" onClick={handleSubmit}>
        SUBMIT
      </button>
    </div>
  );
};

// ===== NUMBER KEYPAD MODULE =====
const NumberKeypadModule = ({ serialNumber, onSuccess, onStrike }) => {
  const [display, setDisplay] = useState('');
  const [keys] = useState(() => shuffleArray([0,1,2,3,4,5,6,7,8,9]));
  
  const firstLetter = serialNumber.replace(/[^A-Z]/g, '')[0];
  const allLetters = serialNumber.replace(/[^A-Z]/g, '');
  const serialNumbers = serialNumber.replace(/[^0-9]/g, '');
  
  // Convert letter to number (A=1, B=2, ... Z=26)
  const letterToNumber = (letter) => letter.charCodeAt(0) - 64;
  
  const getCorrectAnswer = () => {
    const letterGroup = 'ABCD'.includes(firstLetter) ? 0 :
                       'EFGH'.includes(firstLetter) ? 1 :
                       'IJKL'.includes(firstLetter) ? 2 :
                       'MNOP'.includes(firstLetter) ? 3 :
                       'QRST'.includes(firstLetter) ? 4 :
                       'UVW'.includes(firstLetter) ? 5 : 6;
    
    switch(letterGroup) {
      case 0: {
        // A, B, C, D: Convert all letters to numbers
        return allLetters.split('').map(letterToNumber).join('');
      }
      case 1: {
        // E, F, G, H: First letter (as number) + first number
        const firstLetterValue = letterToNumber(allLetters[0]);
        const firstNum = parseInt(serialNumbers[0]) || 0;
        return String(firstLetterValue + firstNum);
      }
      case 2: {
        // I, J, K, L: First number + 1
        const firstNum = parseInt(serialNumbers[0]);
        return String(firstNum + 1);
      }
      case 3: {
        // M, N, O, P: Last letter (as number) + last number
        const lastLetter = allLetters[allLetters.length - 1];
        const lastLetterValue = letterToNumber(lastLetter);
        const lastNum = parseInt(serialNumbers[serialNumbers.length - 1]) || 0;
        return String(lastLetterValue + lastNum);
      }
      case 4: {
        // Q, R, S, T: First number + last number
        const first = parseInt(serialNumbers[0]) || 0;
        const last = parseInt(serialNumbers[serialNumbers.length - 1]) || 0;
        return String(first + last);
      }
      case 5: 
        // U, V, W: All numbers in order
        return serialNumbers;
      default: 
        // X, Y, Z: All numbers backwards
        return serialNumbers.split('').reverse().join('');
    }
  };
  
  const correctAnswer = getCorrectAnswer();
  
  const pressKey = (num) => {
    const newDisplay = display + num;
    setDisplay(newDisplay);
  };
  
  const clear = () => setDisplay('');
  
  const submit = () => {
    if (display === correctAnswer) {
      onSuccess();
    } else {
      onStrike();
      setDisplay('');
    }
  };

  return (
    <div className="module-content keypad-module">
      <h3>🔢 NUMBER KEYPAD</h3>
      <div className="keypad-display">{display || '___'}</div>
      <div className="keypad-grid">
        {keys.map((num) => (
          <button key={num} className="key-btn" onClick={() => pressKey(num)}>
            {num}
          </button>
        ))}
      </div>
      <div className="keypad-actions">
        <button className="action-btn clear" onClick={clear}>CLEAR</button>
        <button className="action-btn submit" onClick={submit}>SUBMIT</button>
      </div>
    </div>
  );
};

// ===== WORD BUTTONS MODULE (with levels) =====
const WordButtonsModule = ({ serialNumber, onSuccess, onStrike, level = 1 }) => {
  // Word sets - now flexible! Can have any lengths
  const wordSets = [
    ['CAT', 'DOG', 'BIRD', 'FISH'],           // 3,3,4,4 - ties!
    ['GO', 'RUN', 'HAPPY', 'WONDERFUL'],      // 2,3,5,9 - all different
    ['BIG', 'SAD', 'HOT', 'RED'],             // 3,3,3,3 - all same!
    ['EAT', 'PLAY', 'SLEEP', 'DRINK'],        // 3,4,5,5 - some ties
    ['UP', 'CAT', 'TIRED', 'BEAUTIFUL'],      // 2,3,5,9 - all different
    ['SIT', 'RUN', 'JOG', 'EAT'],             // 3,3,3,3 - all same!
    ['COLD', 'WARM', 'COOL', 'NICE'],         // 4,4,4,4 - all same!
    ['I', 'WE', 'THEY', 'EVERYONE'],          // 1,2,4,8 - all different
    ['FAST', 'SLOW', 'QUICK', 'SPEED'],       // 4,4,5,5 - pairs
    ['GOOD', 'BAD', 'NICE', 'MEAN'],          // 4,3,4,4 - one short
  ];
  
  // Pick a random word set and shuffle positions
  const [wordData] = useState(() => {
    const set = wordSets[Math.floor(Math.random() * wordSets.length)];
    const shuffled = shuffleArray([...set]);
    return {
      words: shuffled,
      positions: shuffled.map((word, idx) => ({
        word,
        position: idx, // 0=top-left, 1=top-right, 2=bottom-left, 3=bottom-right
        row: idx < 2 ? 'top' : 'bottom',
        col: idx % 2 === 0 ? 'left' : 'right',
        positionName: ['top-left', 'top-right', 'bottom-left', 'bottom-right'][idx]
      }))
    };
  });
  
  const { words, positions } = wordData;
  
  // Helper functions
  const getByPosition = (posName) => positions.find(p => p.positionName === posName);
  const getByRowCol = (row, col) => positions.find(p => p.row === row && p.col === col);
  
  // Find shortest/longest with tie information
  const getLengthInfo = () => {
    const lengths = positions.map(p => p.word.length);
    const minLen = Math.min(...lengths);
    const maxLen = Math.max(...lengths);
    const shortestWords = positions.filter(p => p.word.length === minLen);
    const longestWords = positions.filter(p => p.word.length === maxLen);
    const allSameLength = minLen === maxLen;
    
    return { minLen, maxLen, shortestWords, longestWords, allSameLength };
  };
  
  // Get alphabetically first/last
  const getAlphaFirst = () => positions.reduce((a, b) => a.word[0] < b.word[0] ? a : b);
  const getAlphaLast = () => positions.reduce((a, b) => a.word[0] > b.word[0] ? a : b);
  
  // Level 1 chart lookup: first letter -> position to press
  const firstLetterChart = (letter) => {
    if ('ABCDE'.includes(letter)) return 'longest';
    if ('FGHIJ'.includes(letter)) return 'top-left';
    if ('KLMNO'.includes(letter)) return 'bottom-right';
    if ('PQRST'.includes(letter)) return 'shortest';
    return 'top-right'; // U-Z
  };
  
  // Level 2 chart: last letter -> position to press  
  const lastLetterChart = (letter) => {
    if ('ABCDE'.includes(letter)) return 'bottom-left';
    if ('FGHIJ'.includes(letter)) return 'shortest';
    if ('KLMNO'.includes(letter)) return 'top-left';
    if ('PQRST'.includes(letter)) return 'longest';
    return 'bottom-right'; // U-Z
  };
  
  // Resolve a target to an actual word
  const resolveTarget = (target, lengthInfo) => {
    const { shortestWords, longestWords, allSameLength } = lengthInfo;
    
    switch(target) {
      case 'longest':
        // If tie for longest, use first in position order (top-left first)
        if (longestWords.length > 1) {
          return longestWords.sort((a,b) => a.position - b.position)[0].word;
        }
        return longestWords[0].word;
      case 'shortest':
        if (shortestWords.length > 1) {
          return shortestWords.sort((a,b) => a.position - b.position)[0].word;
        }
        return shortestWords[0].word;
      case 'top-left': return getByPosition('top-left').word;
      case 'top-right': return getByPosition('top-right').word;
      case 'bottom-left': return getByPosition('bottom-left').word;
      case 'bottom-right': return getByPosition('bottom-right').word;
      case 'alpha-first': return getAlphaFirst().word;
      case 'alpha-last': return getAlphaLast().word;
      default: return words[0];
    }
  };
  
  // Calculate the correct sequence based on level
  const getCorrectSequence = () => {
    const lengthInfo = getLengthInfo();
    const { shortestWords, longestWords, allSameLength } = lengthInfo;
    
    if (level === 1) {
      // Level 1: Check for ties first, then use chart
      
      // All same length? → BOTTOM RIGHT
      if (allSameLength) {
        return [getByPosition('bottom-right').word];
      }
      
      // Two (exactly) shortest? → TOP RIGHT
      if (shortestWords.length === 2) {
        return [getByPosition('top-right').word];
      }
      
      // Two (exactly) longest? → BOTTOM LEFT
      if (longestWords.length === 2) {
        return [getByPosition('bottom-left').word];
      }
      
      // Three same length? → closest to A (alphabetically first among them)
      const lengthCounts = {};
      positions.forEach(p => {
        lengthCounts[p.word.length] = (lengthCounts[p.word.length] || 0) + 1;
      });
      const threeOfSameLength = Object.values(lengthCounts).includes(3);
      if (threeOfSameLength) {
        // Find which length has 3, get those words, pick alpha first
        const tripleLength = Object.keys(lengthCounts).find(k => lengthCounts[k] === 3);
        const tripleWords = positions.filter(p => p.word.length === parseInt(tripleLength));
        const alphaFirst = tripleWords.reduce((a, b) => a.word[0] < b.word[0] ? a : b);
        return [alphaFirst.word];
      }
      
      // No ties - use the chart!
      const shortestWord = shortestWords[0];
      const firstLetter = shortestWord.word[0];
      const target = firstLetterChart(firstLetter);
      return [resolveTarget(target, lengthInfo)];
      
    } else if (level === 2) {
      // Level 2: Two presses with IS/IS NOT logic
      const sequence = [];
      
      // FIRST PRESS: Decision tree based on positions
      const topLeft = getByPosition('top-left');
      const topLeftIsShortest = shortestWords.some(w => w.position === 0);
      
      if (allSameLength) {
        // All same → TOP LEFT first
        sequence.push(topLeft.word);
      } else if (topLeftIsShortest) {
        // Top left IS the shortest → press LONGEST
        sequence.push(resolveTarget('longest', lengthInfo));
      } else {
        // Top left is NOT the shortest → press BOTTOM RIGHT
        sequence.push(getByPosition('bottom-right').word);
      }
      
      // SECOND PRESS: Based on bottom right
      const bottomRight = getByPosition('bottom-right');
      const bottomRightIsLongest = longestWords.some(w => w.position === 3);
      
      if (allSameLength) {
        // All same → BOTTOM RIGHT second
        sequence.push(bottomRight.word);
      } else if (bottomRightIsLongest) {
        // Bottom right IS the longest → press SHORTEST
        sequence.push(resolveTarget('shortest', lengthInfo));
      } else {
        // Bottom right is NOT the longest → press TOP LEFT
        sequence.push(topLeft.word);
      }
      
      return sequence;
      
    } else {
      // Level 3: Three presses with alphabet logic
      const sequence = [];
      
      // First two presses same as Level 2
      const topLeft = getByPosition('top-left');
      const topLeftIsShortest = shortestWords.some(w => w.position === 0);
      const bottomRight = getByPosition('bottom-right');
      const bottomRightIsLongest = longestWords.some(w => w.position === 3);
      
      // FIRST PRESS
      if (allSameLength) {
        sequence.push(topLeft.word);
      } else if (topLeftIsShortest) {
        sequence.push(resolveTarget('longest', lengthInfo));
      } else {
        sequence.push(bottomRight.word);
      }
      
      // SECOND PRESS
      if (allSameLength) {
        sequence.push(bottomRight.word);
      } else if (bottomRightIsLongest) {
        sequence.push(resolveTarget('shortest', lengthInfo));
      } else {
        sequence.push(topLeft.word);
      }
      
      // THIRD PRESS: Alphabet logic
      const alphaFirst = getAlphaFirst();
      const alphaLast = getAlphaLast();
      
      if (alphaFirst.row === 'top') {
        // Closest to A is in top row → press closest to Z
        sequence.push(alphaLast.word);
      } else {
        // Closest to A is in bottom row → press TOP RIGHT
        sequence.push(getByPosition('top-right').word);
      }
      
      return sequence;
    }
  };
  
  const [correctSequence] = useState(getCorrectSequence);
  const [pressedSequence, setPressedSequence] = useState([]);
  const [feedback, setFeedback] = useState(null);
  
  const handleClick = (word) => {
    const nextIndex = pressedSequence.length;
    const expectedWord = correctSequence[nextIndex];
    
    if (word === expectedWord) {
      const newSequence = [...pressedSequence, word];
      setPressedSequence(newSequence);
      
      if (newSequence.length === correctSequence.length) {
        setFeedback('correct');
        setTimeout(() => onSuccess(), 500);
      } else {
        setFeedback('correct');
        setTimeout(() => setFeedback(null), 300);
      }
    } else {
      setFeedback('wrong');
      setTimeout(() => {
        setFeedback(null);
        setPressedSequence([]);
      }, 500);
      onStrike();
    }
  };
  
  const levelLabels = { 1: '⭐', 2: '⭐⭐', 3: '⭐⭐⭐' };

  return (
    <div className="module-content word-buttons-module">
      <h3>📝 WORD BUTTONS {levelLabels[level]}</h3>
      <p className="module-hint">
        Press {correctSequence.length} word{correctSequence.length > 1 ? 's' : ''} in order! 
        ({pressedSequence.length}/{correctSequence.length})
      </p>
      <div className={`word-buttons-grid ${feedback || ''}`}>
        {words.map((word, idx) => (
          <button 
            key={idx} 
            className={`word-btn ${pressedSequence.includes(word) ? 'pressed' : ''}`}
            onClick={() => handleClick(word)}
            disabled={pressedSequence.includes(word)}
          >
            {word}
          </button>
        ))}
      </div>
    </div>
  );
};

// ===== SYMBOL PANEL MODULE =====
const SymbolPanelModule = ({ serialNumber, onSuccess, onStrike }) => {
  const symbols = [
    { emoji: '🐱', name: 'cat', categories: ['animal', 'pet', 'living'] },
    { emoji: '🐕', name: 'dog', categories: ['animal', 'pet', 'living'] },
    { emoji: '🍎', name: 'apple', categories: ['food', 'fruit', 'plant'] },
    { emoji: '🚗', name: 'car', categories: ['vehicle', 'ride'] },
    { emoji: '📚', name: 'book', categories: ['object', 'school'] },
    { emoji: '🌳', name: 'tree', categories: ['plant', 'living', 'big'] },
    { emoji: '🚌', name: 'bus', categories: ['vehicle', 'ride', 'big'] },
    { emoji: '🐘', name: 'elephant', categories: ['animal', 'living', 'big'] },
    { emoji: '🍌', name: 'banana', categories: ['food', 'fruit', 'plant'] },
  ];
  
  const [grid] = useState(() => shuffleArray(symbols).slice(0, 6));
  
  const firstDigit = parseInt(serialNumber.replace(/[^0-9]/g, '')[0]) || 0;
  
  const getCorrectIndex = () => {
    switch(firstDigit) {
      case 0: return 2; // Position 3
      case 1: return grid.findIndex(s => s.categories.includes('food'));
      case 2: return grid.findIndex(s => s.categories.includes('animal'));
      case 3: return grid.findIndex(s => s.categories.includes('vehicle'));
      case 4: return grid.findIndex(s => s.categories.includes('plant'));
      case 5: return grid.findIndex(s => s.categories.includes('plant'));
      case 6: return 5; // Position 6
      case 7: return grid.findIndex((s, i) => s.categories.includes('animal') && i % 2 === 0);
      case 8: return 2; // Top right (position 3 in 2x3)
      case 9: return grid.findIndex(s => s.categories.includes('big'));
      default: return 0;
    }
  };
  
  const correctIdx = getCorrectIndex();
  
  const handleClick = (idx) => {
    if (idx === correctIdx || (correctIdx === -1 && idx === 0)) {
      onSuccess();
    } else {
      onStrike();
    }
  };

  return (
    <div className="module-content symbol-module">
      <h3>🎨 SYMBOL PANEL</h3>
      <p className="module-hint">Press the correct symbol!</p>
      <div className="symbol-grid">
        {grid.map((item, idx) => (
          <button 
            key={idx}
            className="symbol-btn"
            onClick={() => handleClick(idx)}
          >
            <span className="symbol-emoji">{item.emoji}</span>
            <span className="symbol-pos">{idx + 1}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

// ===== COLOR SWITCHBOARD MODULE =====
const ColorSwitchboardModule = ({ onSuccess, onStrike }) => {
  const colors = ['red', 'blue', 'yellow', 'green'];
  const directions = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
  const colorHex = { red: '#e53935', blue: '#1e88e5', yellow: '#fdd835', green: '#43a047' };
  
  const lookupTable = {
    red: { UP: 'RIGHT', DOWN: 'LEFT', LEFT: 'UP', RIGHT: 'DOWN' },
    blue: { UP: 'DOWN', DOWN: 'RIGHT', LEFT: 'LEFT', RIGHT: 'UP' },
    yellow: { UP: 'LEFT', DOWN: 'RIGHT', LEFT: 'DOWN', RIGHT: 'UP' },
    green: { UP: 'UP', DOWN: 'DOWN', LEFT: 'LEFT', RIGHT: 'RIGHT' },
  };
  
  // Get a random color that's different from the current one
  const getNewColor = (currentColor) => {
    const otherColors = colors.filter(c => c !== currentColor);
    return otherColors[Math.floor(Math.random() * otherColors.length)];
  };
  
  const [switches, setSwitches] = useState(() => 
    Array.from({ length: 4 }, () => {
      const color = colors[Math.floor(Math.random() * colors.length)];
      const startDir = directions[Math.floor(Math.random() * directions.length)];
      return {
        color,
        startDirection: startDir,
        current: startDir,
      };
    })
  );
  
  const cycleDirection = (idx) => {
    setSwitches(prev => {
      const newSwitches = [...prev];
      const sw = newSwitches[idx];
      const currentIdx = directions.indexOf(sw.current);
      const newDir = directions[(currentIdx + 1) % 4];
      
      newSwitches[idx] = {
        ...sw,
        current: newDir,
      };
      
      return newSwitches;
    });
  };
  
  const handleSubmit = () => {
    // Check if ALL switches are in the correct position
    const allCorrect = switches.every(sw => {
      const correctDir = lookupTable[sw.color][sw.startDirection];
      return sw.current === correctDir;
    });
    
    if (allCorrect) {
      onSuccess();
    } else {
      onStrike();
      // Randomize colors but keep current directions
      setSwitches(prev => prev.map(sw => ({
        color: getNewColor(sw.color),
        startDirection: sw.current,  // Current direction becomes the new starting point
        current: sw.current,         // Direction stays the same
      })));
    }
  };
  
  // Check if a switch is currently correct (for visual feedback)
  const isCorrect = (sw) => {
    const correctDir = lookupTable[sw.color][sw.startDirection];
    return sw.current === correctDir;
  };
  
  const dirArrows = { UP: '↑', DOWN: '↓', LEFT: '←', RIGHT: '→' };

  return (
    <div className="module-content switchboard-module">
      <h3>🎛️ COLOR SWITCHBOARD</h3>
      <p className="module-hint">Set each switch to the correct direction!</p>
      <div className="switch-grid">
        {switches.map((sw, idx) => (
          <button
            key={idx}
            className={`switch-btn ${isCorrect(sw) ? 'solved' : ''}`}
            style={{ 
              backgroundColor: colorHex[sw.color],
              borderColor: isCorrect(sw) ? '#4caf50' : 'transparent'
            }}
            onClick={() => cycleDirection(idx)}
          >
            <span className="switch-arrow">{dirArrows[sw.current]}</span>
            <span className="switch-label">{sw.current}</span>
          </button>
        ))}
      </div>
      <button className="submit-btn switchboard-submit" onClick={handleSubmit}>
        SUBMIT
      </button>
    </div>
  );
};

// ===== MONSTER LAB MODULE (CSS-based) =====
const MonsterLabModule = ({ serialNumber, onSuccess, onStrike }) => {
  const eyeCounts = [1, 2, 3, 4];
  const armTypes = ['tentacles', 'robot', 'hairy'];
  const bodyShapes = ['tall', 'short', 'fat', 'thin', 'normal'];
  const skinColors = ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'white', 'black', 'brown'];
  const monsterNames = ['ZORG', 'BLIP', 'FLOP', 'MEEP'];
  
  const armNames = {
    tentacles: 'TENTACLE',
    robot: 'ROBOT',
    hairy: 'HAIRY'
  };
  
  const shapeNames = {
    tall: 'TALL',
    short: 'SHORT',
    fat: 'FAT',
    thin: 'THIN',
    normal: 'NORMAL'
  };
  
  const shapeTransforms = {
    tall: 'scaleY(1.25)',
    short: 'scaleY(0.75)',
    fat: 'scaleX(1.3)',
    thin: 'scaleX(0.7)',
    normal: 'scale(1)'
  };
  
  const [monster] = useState(() => ({
    eyes: eyeCounts[Math.floor(Math.random() * eyeCounts.length)],
    arms: armTypes[Math.floor(Math.random() * armTypes.length)],
    color: skinColors[Math.floor(Math.random() * skinColors.length)],
    shape: bodyShapes[Math.floor(Math.random() * bodyShapes.length)]
  }));
  
  const getCorrectName = () => {
    const { eyes, arms, color, shape } = monster;
    const lastDigit = parseInt(serialNumber.replace(/[^0-9]/g, '').slice(-1)) || 0;
    
    if (lastDigit <= 2) {
      if (eyes === 1) return 'MEEP';
      if (eyes === 2) return 'BLIP';
      if (eyes === 3) return 'ZORG';
      return 'FLOP';
    } else if (lastDigit <= 4) {
      if (['red', 'orange', 'yellow'].includes(color)) return 'FLOP';
      if (['green', 'blue', 'purple'].includes(color)) return 'ZORG';
      if (['white', 'black', 'brown'].includes(color)) return 'BLIP';
      return 'MEEP';
    } else if (lastDigit <= 6) {
      if (arms === 'tentacles') return 'BLIP';
      if (arms === 'robot') return 'MEEP';
      if (arms === 'hairy') return 'FLOP';
      return 'ZORG';
    } else if (lastDigit <= 8) {
      if (shape === 'tall') return 'ZORG';
      if (shape === 'short') return 'MEEP';
      if (shape === 'fat') return 'FLOP';
      if (shape === 'thin') return 'BLIP';
      if (eyes <= 2) return 'MEEP';
      return 'ZORG';
    } else {
      if (eyes === 3 && ['green', 'blue', 'purple'].includes(color)) return 'ZORG';
      if (eyes === 1 && arms === 'robot') return 'MEEP';
      if (['red', 'orange'].includes(color) && arms === 'tentacles') return 'BLIP';
      if (eyes === 4 && shape === 'fat') return 'FLOP';
      if (eyes <= 2) return 'MEEP';
      return 'ZORG';
    }
  };
  
  const correctName = getCorrectName();
  const [shuffledNames] = useState(() => shuffleArray([...monsterNames]));
  
  const handleNameClick = (name) => {
    if (name === correctName) {
      onSuccess();
    } else {
      onStrike();
    }
  };
  
  const colorHex = {
    red: '#e53935', orange: '#ff9800', yellow: '#ffeb3b', green: '#4caf50',
    blue: '#2196f3', purple: '#9c27b0', white: '#f5f5f5', black: '#424242', brown: '#795548'
  };
  
  // CSS-based monster rendering
  const renderEyes = () => {
    const eyeStyle = {
      width: '40px',
      height: '40px',
      background: 'white',
      borderRadius: '50%',
      border: '3px solid black',
      display: 'inline-block',
      position: 'relative',
      margin: '0 5px'
    };
    
    const pupilStyle = {
      width: '20px',
      height: '20px',
      background: 'black',
      borderRadius: '50%',
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)'
    };
    
    return (
      <div style={{ display: 'flex', justifyContent: 'center', gap: '5px' }}>
        {Array(monster.eyes).fill(null).map((_, i) => (
          <div key={i} style={eyeStyle}>
            <div style={pupilStyle}></div>
          </div>
        ))}
      </div>
    );
  };
  
  const renderArms = () => {
    const armStyles = {
      tentacles: {
        width: '60px',
        height: '120px',
        background: 'currentColor',
        borderRadius: '30px 30px 60px 60px',
        position: 'absolute',
        top: '40%'
      },
      robot: {
        width: '50px',
        height: '100px',
        background: 'linear-gradient(135deg, currentColor 0%, rgba(0,0,0,0.3) 100%)',
        borderRadius: '10px',
        position: 'absolute',
        top: '40%',
        border: '3px solid rgba(0,0,0,0.3)'
      },
      hairy: {
        width: '70px',
        height: '110px',
        background: 'currentColor',
        borderRadius: '40%',
        position: 'absolute',
        top: '40%',
        boxShadow: 'inset 0 0 20px rgba(0,0,0,0.3)'
      }
    };
    
    const baseStyle = armStyles[monster.arms];
    
    return (
      <>
        <div style={{ ...baseStyle, left: '-30px', transform: 'rotate(-15deg)' }} />
        <div style={{ ...baseStyle, right: '-30px', transform: 'rotate(15deg)' }} />
      </>
    );
  };

  return (
    <div className="module-content monster-lab-module">
      <h3>👾 MONSTER LAB</h3>
      <p className="module-hint">What is this monster's name?</p>
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        margin: '30px 0',
        perspective: '1000px'
      }}>
        <div style={{
          position: 'relative',
          width: '200px',
          height: '280px',
          transform: shapeTransforms[monster.shape],
          color: colorHex[monster.color]
        }}>
          {/* Legs */}
          <div style={{
            position: 'absolute',
            bottom: '0',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '20px'
          }}>
            <div style={{
              width: '40px',
              height: '60px',
              background: 'currentColor',
              borderRadius: '0 0 20px 20px'
            }} />
            <div style={{
              width: '40px',
              height: '60px',
              background: 'currentColor',
              borderRadius: '0 0 20px 20px'
            }} />
          </div>
          
          {/* Arms */}
          {renderArms()}
          
          {/* Body */}
          <div style={{
            position: 'absolute',
            width: '140px',
            height: '160px',
            background: colorHex[monster.color],
            borderRadius: '50%',
            top: '60px',
            left: '50%',
            transform: 'translateX(-50%)',
            border: '4px solid rgba(0,0,0,0.2)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            zIndex: 10
          }}>
            {renderEyes()}
            <div style={{
              width: '60px',
              height: '20px',
              background: 'rgba(0,0,0,0.3)',
              borderRadius: '0 0 30px 30px'
            }} />
          </div>
        </div>
      </div>
      
      <div style={{
        textAlign: 'center',
        fontSize: '14px',
        fontWeight: 'bold',
        color: '#333',
        margin: '10px 0',
        padding: '8px',
        background: 'rgba(255,255,255,0.8)',
        borderRadius: '8px'
      }}>
        {shapeNames[monster.shape]} • {monster.color.toUpperCase()} • {monster.eyes} eye{monster.eyes > 1 ? 's' : ''} • {armNames[monster.arms]} arms
      </div>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '10px',
        marginTop: '20px'
      }}>
        {shuffledNames.map((name, idx) => (
          <button
            key={idx}
            onClick={() => handleNameClick(name)}
            style={{
              padding: '15px',
              fontSize: '18px',
              fontWeight: 'bold',
              border: '3px solid #333',
              background: '#fff',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            {name}
          </button>
        ))}
      </div>
    </div>
  );
};

// ===== GUESS WHO MODULE =====
const GuessWhoModule = ({ serialNumber, onSuccess, onStrike }) => {
  // Eye colors
  const eyeColors = ['brown', 'blue', 'green'];
  
  // Hair colors
  const hairColors = ['black', 'brown', 'blonde', 'red', 'gray'];
  
  // Agent names with emoji and Chinese
  const agents = [
    { name: 'RAT', emoji: '🐀', chinese: '鼠' },
    { name: 'OX', emoji: '🐂', chinese: '牛' },
    { name: 'TIGER', emoji: '🐅', chinese: '虎' },
    { name: 'RABBIT', emoji: '🐇', chinese: '兔' },
    { name: 'DRAGON', emoji: '🐉', chinese: '龍' },
    { name: 'SNAKE', emoji: '🐍', chinese: '蛇' },
    { name: 'HORSE', emoji: '🐎', chinese: '馬' },
    { name: 'GOAT', emoji: '🐐', chinese: '羊' },
    { name: 'MONKEY', emoji: '🐵', chinese: '猴' },
    { name: 'ROOSTER', emoji: '🐓', chinese: '雞' },
    { name: 'DOG', emoji: '🐕', chinese: '狗' },
    { name: 'PIG', emoji: '🐷', chinese: '豬' },
    { name: 'PANDA', emoji: '🐼', chinese: '熊貓' },
    { name: 'HIPPO', emoji: '🦛', chinese: '河馬' },
    { name: 'GIRAFFE', emoji: '🦒', chinese: '長頸鹿' },
  ];
  
  // Lookup table: [eyeColor][hairColor] -> agent index
  // Brown eyes: Rat, Ox, Tiger, Rabbit, Dragon
  // Blue eyes: Snake, Horse, Goat, Monkey, Rooster
  // Green eyes: Dog, Pig, Panda, Hippo, Giraffe
  const agentLookup = {
    brown: { black: 'RAT', brown: 'OX', blonde: 'TIGER', red: 'RABBIT', gray: 'DRAGON' },
    blue: { black: 'SNAKE', brown: 'HORSE', blonde: 'GOAT', red: 'MONKEY', gray: 'ROOSTER' },
    green: { black: 'DOG', brown: 'PIG', blonde: 'PANDA', red: 'HIPPO', gray: 'GIRAFFE' },
  };
  
  // Eye color display
  const eyeColorHex = {
    brown: '#8B4513',
    blue: '#4169E1',
    green: '#228B22'
  };
  
  // Hair color display
  const hairColorHex = {
    black: '#1a1a1a',
    brown: '#8B4513',
    blonde: '#F4D03F',
    red: '#C0392B',
    gray: '#808080'
  };
  
  // Generate random person
  const [person] = useState(() => ({
    eyeColor: eyeColors[Math.floor(Math.random() * eyeColors.length)],
    hairColor: hairColors[Math.floor(Math.random() * hairColors.length)]
  }));
  
  // Get correct agent name
  const correctAgent = agentLookup[person.eyeColor][person.hairColor];
  
  // Get 4 random agents including the correct one
  const [displayAgents] = useState(() => {
    const correct = agents.find(a => a.name === correctAgent);
    const others = agents.filter(a => a.name !== correctAgent);
    const randomOthers = shuffleArray([...others]).slice(0, 3);
    return shuffleArray([correct, ...randomOthers]);
  });
  
  const handleAgentClick = (agentName) => {
    if (agentName === correctAgent) {
      onSuccess();
    } else {
      onStrike();
    }
  };

  return (
    <div className="module-content guess-who-module">
      <h3>🕵️ GUESS WHO</h3>
      <p className="module-hint">Who is this agent?</p>
      
      <div className="person-display">
        {/* Hair */}
        <div 
          className="person-hair"
          style={{ backgroundColor: hairColorHex[person.hairColor] }}
        />
        
        {/* Face */}
        <div className="person-face">
          {/* Eyes */}
          <div className="person-eyes">
            <div 
              className="person-eye"
              style={{ backgroundColor: eyeColorHex[person.eyeColor] }}
            />
            <div 
              className="person-eye"
              style={{ backgroundColor: eyeColorHex[person.eyeColor] }}
            />
          </div>
          
          {/* Nose and mouth */}
          <div className="person-nose">👃</div>
          <div className="person-mouth">👄</div>
        </div>
      </div>
      
      <div className="person-traits">
        <span className="trait">
          <span className="trait-dot" style={{ backgroundColor: eyeColorHex[person.eyeColor] }}></span>
          {person.eyeColor.charAt(0).toUpperCase() + person.eyeColor.slice(1)} eyes
        </span>
        <span className="trait">
          <span className="trait-dot" style={{ backgroundColor: hairColorHex[person.hairColor] }}></span>
          {person.hairColor.charAt(0).toUpperCase() + person.hairColor.slice(1)} hair
        </span>
      </div>
      
      <div className="agent-buttons">
        {displayAgents.map((agent, idx) => (
          <button
            key={idx}
            className="agent-btn"
            onClick={() => handleAgentClick(agent.name)}
          >
            <span className="agent-emoji">{agent.emoji}</span>
            <span className="agent-name">AGENT {agent.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

// ===== WORLD CLOCK MODULE =====
const WorldClockModule = ({ serialNumber, onSuccess, onStrike }) => {
  // Default timezone configuration
  // In production, this would be loaded from a file
  const timezoneConfig = {
    homeCity: { name: 'Taipei', offset: 8 },
    otherCities: [
      { name: 'London', offset: 0 },
      { name: 'Paris', offset: 1 },
      { name: 'New York', offset: -5 },
      { name: 'Tokyo', offset: 9 },
      { name: 'Sydney', offset: 11 },
      { name: 'Dubai', offset: 4 },
      { name: 'Los Angeles', offset: -8 },
    ],
    minTotalClicks: 14,
    maxTotalClicks: 16,
    minPerClock: 3,
    maxPerClock: 8,
  };

  // Generate random home time (quarter hours only for Level 1)
  const possibleMinutes = [0, 15, 30, 45];
  
  const [gameState] = useState(() => {
    // Random home time (use 24-hour for internal, display will show AM/PM)
    const homeHour = Math.floor(Math.random() * 24);
    const homeMinute = possibleMinutes[Math.floor(Math.random() * 4)];
    
    // Pick 3 random cities from otherCities
    const shuffledCities = shuffleArray([...timezoneConfig.otherCities]);
    const selectedCities = shuffledCities.slice(0, 3);
    
    // Calculate correct times for each city using GMT
    // Home time to GMT: subtract home offset
    const homeOffset = timezoneConfig.homeCity.offset;
    let gmtHour = homeHour - homeOffset;
    const gmtMinute = homeMinute;
    
    // Normalize GMT hour
    while (gmtHour < 0) gmtHour += 24;
    while (gmtHour >= 24) gmtHour -= 24;
    
    // Calculate correct time for each selected city
    const clocksData = selectedCities.map(city => {
      let cityHour = gmtHour + city.offset;
      while (cityHour < 0) cityHour += 24;
      while (cityHour >= 24) cityHour -= 24;
      
      return {
        city: city.name,
        offset: city.offset,
        correctHour: cityHour,
        correctMinute: gmtMinute,
      };
    });
    
    // Distribute clicks across clocks
    const { minTotalClicks, maxTotalClicks, minPerClock, maxPerClock } = timezoneConfig;
    const totalClicks = Math.floor(Math.random() * (maxTotalClicks - minTotalClicks + 1)) + minTotalClicks;
    
    // Generate valid click distribution
    let clicks = [];
    let remaining = totalClicks;
    
    for (let i = 0; i < 2; i++) {
      const maxForThis = Math.min(maxPerClock, remaining - (2 - i) * minPerClock);
      const minForThis = Math.max(minPerClock, remaining - (2 - i) * maxPerClock);
      const clicksForThis = Math.floor(Math.random() * (maxForThis - minForThis + 1)) + minForThis;
      clicks.push(clicksForThis);
      remaining -= clicksForThis;
    }
    clicks.push(remaining);
    
    // Shuffle click distribution
    clicks = shuffleArray(clicks);
    
    // Set starting positions (clicks BEHIND the correct time)
    const clocksWithStart = clocksData.map((clock, idx) => {
      // Each click is 15 minutes, so subtract clicks * 15 minutes from correct time
      let startMinutes = clock.correctHour * 60 + clock.correctMinute;
      startMinutes -= clicks[idx] * 15;
      
      // Normalize to positive
      while (startMinutes < 0) startMinutes += 24 * 60;
      startMinutes = startMinutes % (24 * 60);
      
      const startHour = Math.floor(startMinutes / 60);
      const startMinute = startMinutes % 60;
      
      return {
        ...clock,
        currentHour: startHour,
        currentMinute: startMinute,
        clicksNeeded: clicks[idx],
      };
    });
    
    return {
      homeCity: timezoneConfig.homeCity.name,
      homeHour,
      homeMinute,
      clocks: clocksWithStart,
    };
  });

  const [clocks, setClocks] = useState(gameState.clocks);
  const [feedback, setFeedback] = useState(null);

  // Handle submit button
  const handleSubmit = () => {
    const allCorrect = clocks.every(clock => 
      clock.currentHour === clock.correctHour && 
      clock.currentMinute === clock.correctMinute
    );
    
    if (allCorrect) {
      setFeedback('correct');
      setTimeout(() => onSuccess(), 500);
    } else {
      setFeedback('wrong');
      setTimeout(() => setFeedback(null), 500);
      onStrike();
    }
  };

  // Handle clock click (left = +15min, right = -15min)
  const handleClockClick = (index, event) => {
    event.preventDefault();
    
    const isRightClick = event.type === 'contextmenu';
    const delta = isRightClick ? -15 : 15;
    
    setClocks(prevClocks => {
      const newClocks = [...prevClocks];
      let totalMinutes = newClocks[index].currentHour * 60 + newClocks[index].currentMinute;
      totalMinutes += delta;
      
      // Normalize
      while (totalMinutes < 0) totalMinutes += 24 * 60;
      totalMinutes = totalMinutes % (24 * 60);
      
      newClocks[index] = {
        ...newClocks[index],
        currentHour: Math.floor(totalMinutes / 60),
        currentMinute: totalMinutes % 60,
      };
      
      return newClocks;
    });
  };

  // Format hour for 12-hour display
  const formatHour12 = (hour24) => {
    if (hour24 === 0) return 12;
    if (hour24 > 12) return hour24 - 12;
    return hour24;
  };

  const getAmPm = (hour24) => {
    return hour24 < 12 ? 'AM' : 'PM';
  };

  // Analog clock component
  const AnalogClock = ({ hour, minute, cityName }) => {
    // Convert 24h to 12h for display
    const hour12 = hour % 12 || 12;
    
    // Calculate hand angles
    const minuteAngle = (minute / 60) * 360;
    const hourAngle = (hour12 / 12) * 360 + (minute / 60) * 30;
    
    return (
      <div className="analog-clock world-clock">
        <div className="clock-label">{cityName}</div>
        <div className="clock-face">
          {/* Hour markers */}
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="hour-marker"
              style={{ transform: `rotate(${i * 30}deg)` }}
            >
              <div className="marker-dot"></div>
            </div>
          ))}
          {/* Hour hand */}
          <div
            className="clock-hand hour-hand"
            style={{ transform: `rotate(${hourAngle}deg)` }}
          ></div>
          {/* Minute hand */}
          <div
            className="clock-hand minute-hand"
            style={{ transform: `rotate(${minuteAngle}deg)` }}
          ></div>
          {/* Center dot */}
          <div className="clock-center"></div>
        </div>
        <div className="clock-time-display">
          {formatHour12(hour)}:{minute.toString().padStart(2, '0')} {getAmPm(hour)}
        </div>
      </div>
    );
  };

  return (
    <div className="module-content world-clock-module">
      <h3>🌍 WORLD CLOCK</h3>
      <p className="module-hint">Set each city to the correct time!</p>
      <p className="module-hint-small">Left-click: +15 min | Right-click: -15 min</p>
      
      <div className="home-clock-display">
        <div className="home-city-name">{gameState.homeCity}</div>
        <div className="home-time">
          {formatHour12(gameState.homeHour)}:{gameState.homeMinute.toString().padStart(2, '0')} {getAmPm(gameState.homeHour)}
        </div>
      </div>
      
      <div className={`clocks-row ${feedback || ''}`}>
        {clocks.map((clock, idx) => (
          <div
            key={idx}
            className="clock-container"
            onClick={(e) => handleClockClick(idx, e)}
            onContextMenu={(e) => handleClockClick(idx, e)}
          >
            <AnalogClock
              hour={clock.currentHour}
              minute={clock.currentMinute}
              cityName={clock.city}
            />
          </div>
        ))}
      </div>
      
      <button className="submit-btn world-clock-submit" onClick={handleSubmit}>
        SUBMIT
      </button>
    </div>
  );
};

// ===== VENDING MACHINE MODULE =====
const VendingMachineModule = ({ serialNumber, onSuccess, onStrike }) => {
  // Food items with categories
  const allItems = [
    // Fruits
    { name: 'Apple', emoji: '🍎', category: 'fruit' },
    { name: 'Orange', emoji: '🍊', category: 'fruit' },
    { name: 'Banana', emoji: '🍌', category: 'fruit' },
    // Vegetables
    { name: 'Carrot', emoji: '🥕', category: 'vegetable' },
    { name: 'Broccoli', emoji: '🥦', category: 'vegetable' },
    // Candy/Snacks
    { name: 'Chocolate', emoji: '🍫', category: 'snack' },
    { name: 'Candy', emoji: '🍬', category: 'snack' },
    { name: 'Chips', emoji: '🍟', category: 'snack' },
    { name: 'Cookie', emoji: '🍪', category: 'snack' },
    // Drinks
    { name: 'Soda', emoji: '🥤', category: 'drink' },
    { name: 'Water', emoji: '💧', category: 'drink' },
    { name: 'Juice', emoji: '🧃', category: 'drink' },
    { name: 'Coffee', emoji: '☕', category: 'drink' },
    { name: 'Milk', emoji: '🥛', category: 'drink' },
  ];
  
  // Possible prices (in cents to avoid floating point issues)
  const possiblePrices = [50, 75, 100, 125, 150, 175, 200, 250, 300];
  
  // Generate 4 random items with random prices
  const [items] = useState(() => {
    const shuffled = shuffleArray([...allItems]);
    const selected = shuffled.slice(0, 4);
    
    // Assign random prices, ensuring variety
    const shuffledPrices = shuffleArray([...possiblePrices]);
    
    return selected.map((item, idx) => ({
      ...item,
      price: shuffledPrices[idx],
    }));
  });
  
  // Format price for display
  const formatPrice = (cents) => {
    const dollars = Math.floor(cents / 100);
    const remainingCents = cents % 100;
    if (remainingCents === 0) {
      return `$${dollars}.00`;
    }
    return `$${dollars}.${remainingCents.toString().padStart(2, '0')}`;
  };
  
  // Helper functions
  const hasFruit = () => items.some(item => item.category === 'fruit');
  const hasVegetable = () => items.some(item => item.category === 'vegetable');
  const hasSnack = () => items.some(item => item.category === 'snack');
  const hasDrink = () => items.some(item => item.category === 'drink');
  const hasCandy = () => items.some(item => item.name === 'Candy');
  const hasApple = () => items.some(item => item.name === 'Apple');
  
  const getFruits = () => items.filter(item => item.category === 'fruit');
  const getVegetables = () => items.filter(item => item.category === 'vegetable');
  const getDrinks = () => items.filter(item => item.category === 'drink');
  const getFoods = () => items.filter(item => item.category !== 'drink');
  
  const getCheapest = (list) => list.reduce((min, item) => item.price < min.price ? item : min);
  const getMostExpensive = (list) => list.reduce((max, item) => item.price > max.price ? item : max);
  
  // Determine correct item based on category rules (check in order)
  const getCorrectItem = () => {
    const fruits = getFruits();
    const vegetables = getVegetables();
    const drinks = getDrinks();
    const foods = getFoods();
    
    // Rule 1: If there is a FRUIT and a VEGETABLE, buy the cheaper one
    if (hasFruit() && hasVegetable()) {
      const fruitAndVeg = [...fruits, ...vegetables];
      return getCheapest(fruitAndVeg);
    }
    
    // Rule 2: If there is a FRUIT but NO vegetable
    if (hasFruit() && !hasVegetable()) {
      // If the fruit is an APPLE, buy the most expensive item
      if (hasApple()) {
        return getMostExpensive(items);
      }
      // If the fruit is NOT an apple, buy the fruit
      return fruits[0];
    }
    
    // Rule 3: If there is NO fruit but there IS a vegetable, buy the vegetable
    if (!hasFruit() && hasVegetable()) {
      return vegetables[0];
    }
    
    // Rule 4: If there are NO fruits and NO vegetables
    if (!hasFruit() && !hasVegetable()) {
      // If there is CANDY, buy the cheapest DRINK
      if (hasCandy() && hasDrink()) {
        return getCheapest(drinks);
      }
      // If there is NO candy (or no drinks), buy the most expensive item
      return getMostExpensive(items);
    }
    
    // Fallback (should never reach here with rules 1-4 covering all cases)
    return getMostExpensive(items);
  };
  
  const correctItem = getCorrectItem();
  
  const handleItemClick = (item) => {
    if (item.name === correctItem.name) {
      onSuccess();
    } else {
      onStrike();
    }
  };

  return (
    <div className="module-content vending-machine-module">
      <h3>🏭 VENDING MACHINE</h3>
      <p className="module-hint">Buy the correct item!</p>
      
      <div className="vending-display">
        <div className="vending-items">
          {items.map((item, idx) => (
            <button
              key={idx}
              className="vending-item"
              onClick={() => handleItemClick(item)}
            >
              <span className="item-emoji">{item.emoji}</span>
              <span className="item-name">{item.name}</span>
              <span className="item-price">{formatPrice(item.price)}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ===== COMBINATION LOCK MODULE =====
const CombinationLockModule = ({ serialNumber, onSuccess, onStrike }) => {
  const maxNumber = 39; // 0-39 for Level 1
  
  // Letters for locker number - A, B, C, D each have different formulas
  const lockerLetters = ['A', 'B', 'C', 'D'];
  
  // Generate combination for a given letter and digits
  const calculateCombination = (letter, d1, d2, d3) => {
    let first, second, third;
    
    if (letter === 'A') {
      first = d1 + d2;
      second = d2 * 3 + d3;
      third = d1 + d2 + d3;
    } else if (letter === 'B') {
      first = d1 + d3;
      second = (d2 + d3) * 2;
      third = d1 * 4;
    } else if (letter === 'C') {
      first = d1 * 10 + d2;
      second = d2 * 10 + d3;
      third = d1 * 10 + d3;
    } else {
      first = (d1 + d2) * 2;
      second = d3 * 4;
      third = d1 + d2 + d3 + 10;
    }
    
    return [first, second, third];
  };
  
  // Validate combination is in range
  const isValidCombination = (combo) => {
    return combo.every(n => n >= 0 && n <= maxNumber);
  };
  
  // Generate locker number and derive combination from it
  const [gameState] = useState(() => {
    let attempts = 0;
    const maxAttempts = 20;
    
    while (attempts < maxAttempts) {
      attempts++;
      
      // Pick a random letter (determines formula set)
      const letter = lockerLetters[Math.floor(Math.random() * lockerLetters.length)];
      
      // For letter C, digits must be 0-3 (for concatenation formula)
      // For others, digits can be 0-9
      let d1, d2, d3;
      if (letter === 'C') {
        d1 = Math.floor(Math.random() * 4); // 0-3
        d2 = Math.floor(Math.random() * 4);
        d3 = Math.floor(Math.random() * 4);
      } else {
        d1 = Math.floor(Math.random() * 10); // 0-9
        d2 = Math.floor(Math.random() * 10);
        d3 = Math.floor(Math.random() * 10);
      }
      
      const combination = calculateCombination(letter, d1, d2, d3);
      
      // Validate combination
      if (isValidCombination(combination)) {
        const digits = `${d1}${d2}${d3}`;
        const lockerNumber = letter + digits;
        
        return {
          lockerNumber,
          letter,
          combination,
        };
      } else {
        // Log error for debugging
        console.error(`[CombinationLock] Invalid combination generated: ${letter}${d1}${d2}${d3} -> [${combination.join(', ')}] (out of range 0-${maxNumber})`);
      }
    }
    
    // Fallback: use a known-safe combination (should never reach here)
    console.error(`[CombinationLock] Failed to generate valid combination after ${maxAttempts} attempts. Using fallback.`);
    return {
      lockerNumber: 'A111',
      letter: 'A',
      combination: [2, 4, 3], // A111: 1+1=2, 1*3+1=4, 1+1+1=3
    };
  });
  
  const { lockerNumber, combination } = gameState;
  
  const [currentNumber, setCurrentNumber] = useState(0);
  const [dialRotation, setDialRotation] = useState(0); // Track actual rotation degrees
  const [stage, setStage] = useState(0); // 0=waiting, 1=got first, 2=got second, 3=success
  const [isOpen, setIsOpen] = useState(false);
  const [turningDirection, setTurningDirection] = useState(null); // For visual feedback
  const [hasInitialized, setHasInitialized] = useState(false);
  
  // Use refs to track current values for the stop check
  const currentNumberRef = useRef(0);
  const lastDirectionRef = useRef(null);
  
  // Initial spin animation on mount
  useEffect(() => {
    if (!hasInitialized) {
      setDialRotation(-360); // Spin once clockwise on load
      setTimeout(() => setHasInitialized(true), 600);
    }
  }, [hasInitialized]);
  
  // Degrees per number on the dial
  const degreesPerNumber = 360 / (maxNumber + 1);
  
  // Handle turning the dial
  const turn = (direction) => {
    if (isOpen || !hasInitialized) return;
    
    const previousDirection = lastDirectionRef.current;
    
    // Check for direction change - this is when we "lock in" numbers for stages 0 and 1
    if (previousDirection && previousDirection !== direction) {
      const numAtChange = currentNumberRef.current;
      
      if (stage === 0 && previousDirection === 'right' && numAtChange === combination[0]) {
        // Was turning clockwise, stopped on N1, now turning counter-clockwise
        setStage(1);
      } else if (stage === 1 && previousDirection === 'left' && numAtChange === combination[1]) {
        // Was turning counter-clockwise, stopped on N2, now turning clockwise
        setStage(2);
      } else if (stage === 0 && previousDirection === 'left') {
        // Started with wrong direction, reset
        setStage(0);
      } else if (stage === 1 && previousDirection === 'right') {
        // Turned wrong direction in stage 1, reset
        setStage(0);
      } else if (stage === 2 && previousDirection === 'left') {
        // Turned wrong direction in stage 2, reset
        setStage(0);
      }
    }
    
    // Update the current number and rotation
    // RIGHT (clockwise visual) = rotation decreases (because we use -dialRotation in transform)
    // LEFT (counter-clockwise visual) = rotation increases
    let newNumber;
    if (direction === 'right') {
      newNumber = (currentNumberRef.current - 1 + maxNumber + 1) % (maxNumber + 1);
      setDialRotation(prev => prev - degreesPerNumber);
    } else {
      newNumber = (currentNumberRef.current + 1) % (maxNumber + 1);
      setDialRotation(prev => prev + degreesPerNumber);
    }
    
    currentNumberRef.current = newNumber;
    lastDirectionRef.current = direction;
    setCurrentNumber(newNumber);
    setTurningDirection(direction);
  };
  
  // Reset the lock
  const resetLock = () => {
    if (isOpen) return;
    // Spin animation (clockwise, so decrease)
    setDialRotation(prev => prev - 720);
    setTimeout(() => {
      currentNumberRef.current = 0;
      setCurrentNumber(0);
      setStage(0);
      lastDirectionRef.current = null;
      // Reset rotation to a clean value that shows 0
      setDialRotation(-720);
    }, 500);
  };
  
  // Handle stopping (releasing the turn)
  const stopTurning = () => {
    setTurningDirection(null);
  };
  
  // Track unlock button error state
  const [unlockError, setUnlockError] = useState(false);
  
  // Handle unlock button press
  const handleUnlock = () => {
    if (isOpen || unlockError) return;
    
    // Check if all three numbers are correct
    // Stage 2 means we have first two correct, now check third
    if (stage === 2 && currentNumberRef.current === combination[2] && lastDirectionRef.current === 'right') {
      setStage(3);
      setIsOpen(true);
      setTimeout(() => onSuccess(), 1000);
    } else {
      // Wrong combination - flash red and give strike
      setUnlockError(true);
      onStrike();
      setTimeout(() => setUnlockError(false), 500);
    }
  };
  
  // For continuous turning while holding
  const [turnInterval, setTurnInterval] = useState(null);
  
  const startTurning = (direction, e) => {
    // Prevent mouse events from firing on touch devices
    if (e) e.preventDefault();
    turn(direction);
    const interval = setInterval(() => turn(direction), 150);
    setTurnInterval(interval);
  };
  
  const stopTurningInterval = (e) => {
    if (e) e.preventDefault();
    if (turnInterval) {
      clearInterval(turnInterval);
      setTurnInterval(null);
    }
    stopTurning();
  };
  
  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (turnInterval) clearInterval(turnInterval);
    };
  }, [turnInterval]);
  
  // Shackle position based on stage (for A1 visual feedback)
  const shackleOffset = stage === 0 ? 0 : stage === 1 ? 8 : stage === 2 ? 16 : 30;

  return (
    <div className="module-content combination-lock-module">
      <h3>🔒 COMBINATION LOCK</h3>
      <p className="module-hint">Turn the dial to unlock!</p>
      
      <div className="locker-number">
        LOCKER <span className="locker-id">{lockerNumber}</span>
      </div>
      
      <div className={`lock-body ${isOpen ? 'open' : ''}`}>
        {/* Shackle */}
        <div 
          className={`shackle ${isOpen ? 'open' : ''}`}
          style={{ transform: `translateY(-${shackleOffset}px)` }}
        >
          <div className="shackle-top"></div>
          <div className="shackle-left"></div>
          <div className="shackle-right"></div>
        </div>
        
        {/* Lock face */}
        <div className="lock-face">
          {/* Dial */}
          <div 
            className="dial"
            style={{ transform: `rotate(${-dialRotation}deg)` }}
          >
            {/* Number markers */}
            {[...Array(maxNumber + 1)].map((_, i) => {
              const angle = (i / (maxNumber + 1)) * 360;
              const showNumber = i % 5 === 0;
              return (
                <div
                  key={i}
                  className="dial-mark"
                  style={{ transform: `rotate(${angle}deg)` }}
                >
                  <div className={`mark-line ${showNumber ? 'major' : ''}`}></div>
                  {showNumber && (
                    <span 
                      className="mark-number"
                      style={{ transform: `rotate(${-angle + dialRotation}deg)` }}
                    >
                      {i}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Center indicator */}
          <div className="dial-center">
            <div className="current-number">{currentNumber}</div>
          </div>
          
          {/* Top indicator arrow */}
          <div className="dial-indicator">▼</div>
        </div>
        
        {/* Stage indicators */}
        <div className="stage-indicators">
          <span className={`stage-dot ${stage >= 1 ? 'active' : ''}`}>●</span>
          <span className={`stage-dot ${stage >= 2 ? 'active' : ''}`}>●</span>
          <span className={`stage-dot ${stage >= 3 ? 'active' : ''}`}>●</span>
        </div>
      </div>
      
      {/* Unlock button */}
      <button
        className={`unlock-btn ${isOpen ? 'open' : ''} ${unlockError ? 'error' : ''}`}
        onClick={handleUnlock}
        disabled={isOpen}
      >
        {isOpen ? '🔓 UNLOCKED' : '🔒 UNLOCK'}
      </button>
      
      {/* Turn buttons */}
      <div className="turn-controls">
        <button
          className={`turn-btn left ${turningDirection === 'left' ? 'active' : ''}`}
          onMouseDown={(e) => startTurning('left', e)}
          onMouseUp={stopTurningInterval}
          onMouseLeave={stopTurningInterval}
          onTouchStart={(e) => { e.preventDefault(); startTurning('left', e); }}
          onTouchEnd={(e) => { e.preventDefault(); stopTurningInterval(e); }}
          disabled={isOpen || !hasInitialized}
        >
          ◀ COUNTER<br/>CLOCKWISE
        </button>
        <button
          className="turn-btn reset"
          onClick={resetLock}
          disabled={isOpen || !hasInitialized}
        >
          ↺
        </button>
        <button
          className={`turn-btn right ${turningDirection === 'right' ? 'active' : ''}`}
          onMouseDown={(e) => startTurning('right', e)}
          onMouseUp={stopTurningInterval}
          onMouseLeave={stopTurningInterval}
          onTouchStart={(e) => { e.preventDefault(); startTurning('right', e); }}
          onTouchEnd={(e) => { e.preventDefault(); stopTurningInterval(e); }}
          disabled={isOpen || !hasInitialized}
        >
          CLOCKWISE ▶
        </button>
      </div>
      
      {/* Debug removed for production */}
    </div>
  );
};

// ===== SYMBOL KEYPAD MODULE =====
const SymbolKeypadModule = ({ serialNumber, onSuccess, onStrike }) => {
  // Level 1 & 2 symbols
  const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
  const shapes = ['●', '■', '▲', '★', '◆', '♥'];
  
  // Level 1 & 2 column chart (7 rows x 6 columns)
  // Each column contains a unique set - defuser's 4 symbols will be in exactly one column
  const columnChart = [
    ['A', '■', '5', '▲', 'C', '9', '●'],
    ['3', 'B', '★', 'D', '■', '▲', '7'],
    ['●', '2', 'G', '8', '★', 'B', '■'],
    ['F', '▲', '1', '●', '9', '★', 'C'],
    ['★', 'D', '■', '4', 'A', '6', '▲'],
    ['7', '●', 'C', '★', '▲', '2', 'D'],
  ];
  
  // For Level 1, only use letters and numbers
  const level1Symbols = [...letters, ...numbers];
  // For Level 2, add shapes
  const level2Symbols = [...letters, ...numbers, ...shapes];
  
  // Current level (hardcoded to 1 for now, can be passed as prop later)
  const level = 1;
  const availableSymbols = level === 1 ? level1Symbols : level2Symbols;
  
  // Generate 4 symbols that all appear in one column
  const [gameState] = useState(() => {
    // Pick a random column
    const colIndex = Math.floor(Math.random() * columnChart.length);
    const column = columnChart[colIndex];
    
    // Filter to only available symbols for this level
    const availableInColumn = column.filter(s => availableSymbols.includes(s));
    
    // Pick 4 random symbols from this column
    const shuffledColumn = shuffleArray([...availableInColumn]);
    const selectedSymbols = shuffledColumn.slice(0, 4);
    
    // Determine correct order (order they appear in the column, top to bottom)
    const correctOrder = column.filter(s => selectedSymbols.includes(s));
    
    // Shuffle for display
    const displayOrder = shuffleArray([...selectedSymbols]);
    
    return {
      symbols: displayOrder,
      correctOrder: correctOrder,
      columnIndex: colIndex,
    };
  });
  
  const [pressedSymbols, setPressedSymbols] = useState([]);
  const [buttonStates, setButtonStates] = useState({}); // Track pressed state per symbol
  
  const handleSymbolPress = (symbol) => {
    if (buttonStates[symbol]) return; // Already pressed
    
    const newPressed = [...pressedSymbols, symbol];
    setPressedSymbols(newPressed);
    setButtonStates(prev => ({ ...prev, [symbol]: true }));
    
    // Check if this press is correct so far
    const expectedSymbol = gameState.correctOrder[newPressed.length - 1];
    
    if (symbol !== expectedSymbol) {
      // Wrong order - strike and reset
      setTimeout(() => {
        setPressedSymbols([]);
        setButtonStates({});
        onStrike();
      }, 300);
      return;
    }
    
    // Check if complete
    if (newPressed.length === 4) {
      // Success!
      setTimeout(() => onSuccess(), 500);
    }
  };
  
  // Get display name for symbol (for screen readers / accessibility)
  const getSymbolName = (symbol) => {
    if (letters.includes(symbol)) return `letter ${symbol}`;
    if (numbers.includes(symbol)) return `number ${symbol}`;
    const shapeNames = { '●': 'circle', '■': 'square', '▲': 'triangle', '★': 'star', '◆': 'diamond', '♥': 'heart' };
    return shapeNames[symbol] || symbol;
  };

  return (
    <div className="module-content symbol-keypad-module">
      <h3>🔣 SYMBOL KEYPAD</h3>
      <p className="module-hint">Press symbols in the correct order!</p>
      
      <div className="symbol-grid">
        {gameState.symbols.map((symbol, idx) => (
          <button
            key={idx}
            className={`symbol-btn ${buttonStates[symbol] ? 'pressed' : ''}`}
            onClick={() => handleSymbolPress(symbol)}
            disabled={buttonStates[symbol]}
            aria-label={getSymbolName(symbol)}
          >
            {symbol}
          </button>
        ))}
      </div>
      
      <div className="press-order">
        {[0, 1, 2, 3].map(i => (
          <span key={i} className={`order-dot ${pressedSymbols[i] ? 'filled' : ''}`}>
            {pressedSymbols[i] || '○'}
          </span>
        ))}
      </div>
    </div>
  );
};

// ===== BIG BUTTON MODULE =====
const BigButtonModule = ({ serialNumber, onSuccess, onStrike, bombTimer }) => {
  // Button colors (ROYGBP)
  const buttonColors = ['red', 'orange', 'yellow', 'green', 'blue', 'purple'];
  // Button words
  const buttonWords = ['HOLD', 'PRESS', "DON'T TOUCH"];
  // Strip colors (ROYGBP)
  const stripColors = ['red', 'orange', 'yellow', 'green', 'blue', 'purple'];
  
  // Stage 1 Chart: [buttonColor][buttonWord] -> 'tap' or 'hold'
  const stage1Chart = {
    red:    { 'HOLD': 'hold', 'PRESS': 'tap', "DON'T TOUCH": 'tap' },
    orange: { 'HOLD': 'tap', 'PRESS': 'hold', "DON'T TOUCH": 'hold' },
    yellow: { 'HOLD': 'hold', 'PRESS': 'hold', "DON'T TOUCH": 'tap' },
    green:  { 'HOLD': 'tap', 'PRESS': 'tap', "DON'T TOUCH": 'hold' },
    blue:   { 'HOLD': 'hold', 'PRESS': 'tap', "DON'T TOUCH": 'hold' },
    purple: { 'HOLD': 'tap', 'PRESS': 'hold', "DON'T TOUCH": 'tap' },
  };
  
  // Stage 2: Strip color -> digit to wait for
  const stripDigits = {
    red: '4',
    orange: '6',
    yellow: '1',
    green: '5',
    blue: '2',
    purple: '3',
  };
  
  // Generate random button config
  const [gameState] = useState(() => {
    const buttonColor = buttonColors[Math.floor(Math.random() * buttonColors.length)];
    const buttonWord = buttonWords[Math.floor(Math.random() * buttonWords.length)];
    const stripColor = stripColors[Math.floor(Math.random() * stripColors.length)];
    
    const correctAction = stage1Chart[buttonColor][buttonWord];
    
    return {
      buttonColor,
      buttonWord,
      stripColor,
      correctAction, // 'tap' or 'hold'
    };
  });
  
  const { buttonColor, buttonWord, stripColor, correctAction } = gameState;
  
  const [isHolding, setIsHolding] = useState(false);
  const [showStrip, setShowStrip] = useState(false);
  const [holdStartTime, setHoldStartTime] = useState(null);
  
  // Format bomb timer for display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleTap = () => {
    if (correctAction === 'tap') {
      onSuccess();
    } else {
      // Should have held - strike!
      onStrike();
    }
  };
  
  const handleHoldStart = (e) => {
    if (e) e.preventDefault();
    setIsHolding(true);
    setShowStrip(true);
    setHoldStartTime(Date.now());
  };
  
  const handleHoldEnd = (e) => {
    if (e) e.preventDefault();
    if (!isHolding) return;
    
    setIsHolding(false);
    
    if (correctAction === 'tap') {
      // Should have just tapped, not held - strike!
      onStrike();
      setShowStrip(false);
      return;
    }
    
    // Stage 2: Check if released when timer shows correct digit
    const correctDigit = stripDigits[stripColor];
    const timerDisplay = formatTime(bombTimer);
    
    if (timerDisplay.includes(correctDigit)) {
      onSuccess();
    } else {
      onStrike();
    }
    setShowStrip(false);
  };
  
  const getColorStyle = (color) => {
    switch (color) {
      case 'red': return '#f44336';
      case 'orange': return '#FF9800';
      case 'yellow': return '#FFEB3B';
      case 'green': return '#4CAF50';
      case 'blue': return '#2196F3';
      case 'purple': return '#9C27B0';
      default: return '#888';
    }
  };
  
  const getTextColor = (color) => {
    return (color === 'yellow') ? '#333' : '#fff';
  };

  return (
    <div className="module-content big-button-module">
      <h3>🔘 THE BUTTON</h3>
      
      <div className="button-container">
        <button
          className={`big-button ${isHolding ? 'holding' : ''}`}
          style={{ 
            backgroundColor: getColorStyle(buttonColor),
            color: getTextColor(buttonColor)
          }}
          onMouseDown={(e) => handleHoldStart(e)}
          onMouseUp={(e) => handleHoldEnd(e)}
          onMouseLeave={(e) => isHolding && handleHoldEnd(e)}
          onTouchStart={(e) => { e.preventDefault(); handleHoldStart(e); }}
          onTouchEnd={(e) => { e.preventDefault(); handleHoldEnd(e); }}
          onClick={(e) => {
            // Quick click (not a hold)
            if (!showStrip) {
              handleTap();
            }
          }}
        >
          {buttonWord}
        </button>
        
        {showStrip && (
          <div 
            className="color-strip"
            style={{ backgroundColor: getColorStyle(stripColor) }}
          >
            <span className="strip-timer" style={{ color: getTextColor(stripColor) }}>{formatTime(bombTimer)}</span>
          </div>
        )}
      </div>
      
      <p className="module-hint">
        {isHolding ? `Strip: ${stripColor.toUpperCase()} - Release at the right time!` : 'Tap or hold?'}
      </p>
    </div>
  );
};

// ===== CRACK THE CODE MODULE =====
const CrackTheCodeModule = ({ serialNumber, onSuccess, onStrike }) => {
  // Generate puzzle using the fixed pattern
  const [gameState] = useState(() => {
    // Pick unique digits for different purposes
    const allDigits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    const shuffled = [...allDigits].sort(() => Math.random() - 0.5);
    
    // Assign digits to different pools (no overlap!)
    const answer = [shuffled[0], shuffled[1], shuffled[2]]; // The 3-digit code
    const unused = [shuffled[3], shuffled[4], shuffled[5]]; // Row D (0 correct)
    const filler = [shuffled[6], shuffled[7], shuffled[8], shuffled[9]]; // Filler for other rows
    
    // Build the rows based on our pattern:
    // Row A: filler filler answer[0]  → 1 correct, wrong place
    // Row B: filler answer[1] filler  → 1 correct, right place  
    // Row C: answer[0] answer[2] filler → 2 correct, both wrong place
    // Row D: unused[0] unused[1] unused[2] → 0 correct
    // Row E: unused[1] unused[2] answer[2] → 1 correct, right place
    
    const rows = [
      [filler[0], filler[1], answer[0]],      // Row A: 1 correct (answer[0]), wrong place
      [filler[2], answer[1], filler[3]],      // Row B: 1 correct (answer[1]), right place
      [answer[0], answer[2], filler[0]],      // Row C: 2 correct (answer[0], answer[2]), both wrong place
      [unused[0], unused[1], unused[2]],      // Row D: 0 correct
      [unused[1], unused[2], answer[2]],      // Row E: 1 correct (answer[2]), right place
    ];
    
    return { answer, rows };
  });
  
  const { answer, rows } = gameState;
  
  // Current drum values (what the player has set)
  const [drums, setDrums] = useState([0, 0, 0]);
  const [solved, setSolved] = useState(false);
  
  const adjustDrum = (index, direction) => {
    if (solved) return;
    setDrums(prev => {
      const newDrums = [...prev];
      if (direction === 'up') {
        newDrums[index] = (newDrums[index] + 1) % 10;
      } else {
        newDrums[index] = (newDrums[index] - 1 + 10) % 10;
      }
      return newDrums;
    });
  };
  
  const handleSubmit = () => {
    if (solved) return;
    
    const correct = drums[0] === answer[0] && 
                    drums[1] === answer[1] && 
                    drums[2] === answer[2];
    
    if (correct) {
      setSolved(true);
      onSuccess();
    } else {
      onStrike();
    }
  };
  
  const rowLabels = ['A', 'B', 'C', 'D', 'E'];
  
  return (
    <div className="module-content crack-code-module">
      <h3>🔐 CRACK THE CODE</h3>
      
      <div className="code-clues">
        {rows.map((row, idx) => (
          <div key={idx} className="clue-row">
            <span className="row-label">{rowLabels[idx]}</span>
            <span className="row-digits">
              {row.map((digit, dIdx) => (
                <span key={dIdx} className="clue-digit">{digit}</span>
              ))}
            </span>
          </div>
        ))}
      </div>
      
      <div className="drum-container">
        {[0, 1, 2].map(idx => (
          <div key={idx} className="drum">
            <button 
              className="drum-btn up" 
              onClick={() => adjustDrum(idx, 'up')}
              disabled={solved}
            >
              ▲
            </button>
            <div className="drum-display">{drums[idx]}</div>
            <button 
              className="drum-btn down" 
              onClick={() => adjustDrum(idx, 'down')}
              disabled={solved}
            >
              ▼
            </button>
          </div>
        ))}
      </div>
      
      <button 
        className="submit-btn" 
        onClick={handleSubmit}
        disabled={solved}
      >
        {solved ? '✓ UNLOCKED!' : 'SUBMIT'}
      </button>
    </div>
  );
};

// ===== MEMORY MODULE =====
const MemoryModule = ({ serialNumber, onSuccess, onStrike }) => {
  // Rules for each stage
  // 'pos1', 'pos2', 'pos3', 'pos4' = press position X
  // 'label1', 'label2', 'label3', 'label4' = press button labeled X
  // 'samePos1', 'samePos2', etc. = same position as stage X
  // 'sameLabel1', 'sameLabel2', etc. = same label as stage X
  
  const rules = {
    1: { 1: 'pos1', 2: 'pos3', 3: 'pos4', 4: 'pos2' },
    2: { 1: 'label3', 2: 'pos1', 3: 'samePos1', 4: 'sameLabel1' },
    3: { 1: 'sameLabel2', 2: 'pos2', 3: 'samePos2', 4: 'label1' },
    4: { 1: 'samePos1', 2: 'sameLabel2', 3: 'sameLabel1', 4: 'pos4' },
    5: { 1: 'sameLabel3', 2: 'sameLabel4', 3: 'sameLabel2', 4: 'sameLabel1' },
  };
  
  const [stage, setStage] = useState(1);
  const [display, setDisplay] = useState(0);
  const [buttons, setButtons] = useState([]);
  const [history, setHistory] = useState([]); // { position, label } for each stage
  
  // Initialize stage
  useEffect(() => {
    const newDisplay = Math.floor(Math.random() * 4) + 1; // 1-4
    const shuffled = [1, 2, 3, 4].sort(() => Math.random() - 0.5);
    setDisplay(newDisplay);
    setButtons(shuffled);
  }, [stage]);
  
  const getCorrectButton = () => {
    const rule = rules[stage][display];
    
    if (rule.startsWith('pos')) {
      const pos = parseInt(rule.slice(3)) - 1;
      return { position: pos, label: buttons[pos] };
    }
    
    if (rule.startsWith('label')) {
      const label = parseInt(rule.slice(5));
      const pos = buttons.indexOf(label);
      return { position: pos, label };
    }
    
    if (rule.startsWith('samePos')) {
      const refStage = parseInt(rule.slice(7)) - 1;
      if (refStage < history.length) {
        const pos = history[refStage].position;
        return { position: pos, label: buttons[pos] };
      }
    }
    
    if (rule.startsWith('sameLabel')) {
      const refStage = parseInt(rule.slice(9)) - 1;
      if (refStage < history.length) {
        const label = history[refStage].label;
        const pos = buttons.indexOf(label);
        return { position: pos, label };
      }
    }
    
    return { position: 0, label: buttons[0] };
  };
  
  const handleButtonPress = (position) => {
    const correct = getCorrectButton();
    const pressedLabel = buttons[position];
    
    if (position === correct.position) {
      // Correct!
      const newHistory = [...history, { position, label: pressedLabel }];
      setHistory(newHistory);
      
      if (stage === 5) {
        onSuccess();
      } else {
        setStage(stage + 1);
      }
    } else {
      // Wrong - strike and reset
      onStrike();
      setStage(1);
      setHistory([]);
    }
  };
  
  return (
    <div className="module-content memory-module">
      <h3>🧠 MEMORY</h3>
      
      <div className="memory-display">
        <div className="stage-indicator">Stage {stage} of 5</div>
        <div className="display-number">{display}</div>
      </div>
      
      <div className="memory-buttons">
        {buttons.map((label, pos) => (
          <button
            key={pos}
            className="memory-btn"
            onClick={() => handleButtonPress(pos)}
          >
            {label}
          </button>
        ))}
      </div>
      
      <div className="position-labels">
        <span>Place 1</span>
        <span>Place 2</span>
        <span>Place 3</span>
        <span>Place 4</span>
      </div>
      
      <div className="stage-dots">
        {[1, 2, 3, 4, 5].map(s => (
          <span key={s} className={`stage-dot ${s < stage ? 'complete' : s === stage ? 'active' : ''}`}>
            {s < stage ? '✓' : '○'}
          </span>
        ))}
      </div>
    </div>
  );
};

// ===== MODULE WRAPPER =====
const ModuleWrapper = ({ module, serialNumber, onComplete, onStrike, onReady, bombTimer }) => {
  const [status, setStatus] = useState('active'); // active, success, failed
  
  // Signal ready after initial render
  useEffect(() => {
    onReady?.();
  }, []);
  
  const handleSuccess = () => {
    setStatus('success');
    setTimeout(() => onComplete(module.id), 800);
  };
  
  const handleStrike = () => {
    onStrike(module.id);
  };
  
  const moduleComponents = {
    colorWires: ColorWiresModule,
    userName: UserNameModule,
    numberKeypad: NumberKeypadModule,
    wordButtons: WordButtonsModule,
    symbolPanel: SymbolPanelModule,
    colorSwitchboard: ColorSwitchboardModule,
    monsterLab: MonsterLabModule,
    worldClock: WorldClockModule,
    vendingMachine: VendingMachineModule,
    combinationLock: CombinationLockModule,
    symbolKeypad: SymbolKeypadModule,
    bigButton: BigButtonModule,
    crackTheCode: CrackTheCodeModule,
    memory: MemoryModule,
    guessWho: GuessWhoModule,
  };
  
  const ModuleComponent = moduleComponents[module.type];

  return (
    <div className={`module-wrapper ${status}`}>
      <div className="module-status-indicator">
        {status === 'success' && <span className="status-icon">✓</span>}
        {status === 'active' && <span className="status-dot"></span>}
      </div>
      {status !== 'success' && ModuleComponent && (
        <ModuleComponent 
          serialNumber={serialNumber}
          onSuccess={handleSuccess}
          onStrike={handleStrike}
          difficulty={module.difficulty}
          level={module.level || 1}
          bombTimer={bombTimer}
        />
      )}
      {status === 'success' && (
        <div className="module-complete">
          <span className="complete-icon">✓</span>
          <span>MODULE DEFUSED</span>
        </div>
      )}
    </div>
  );
};

// ===== BOMB COMPONENT =====
const Bomb = ({ config, onGameEnd, onAbort }) => {
  const [timeLeft, setTimeLeft] = useState(config.timer);
  const [strikes, setStrikes] = useState(0);
  const [completedModules, setCompletedModules] = useState([]);
  const [moduleStrikes, setModuleStrikes] = useState({});
  const [serialNumber] = useState(generateSerialNumber);
  const [gameStatus, setGameStatus] = useState('countdown'); // countdown, playing, paused, won, lost
  const [shake, setShake] = useState(false);
  
  // Countdown and ready tracking
  const [countdownNumber, setCountdownNumber] = useState(3);
  const [readyModules, setReadyModules] = useState(0);
  const [showAbortConfirm, setShowAbortConfirm] = useState(false);
  
  const modules = config.modules;
  const allModulesReady = readyModules >= modules.length;
  
  // Handle module ready callback
  const handleModuleReady = useCallback(() => {
    setReadyModules(prev => prev + 1);
  }, []);
  
  // Countdown timer (3, 2, 1, then wait for ready, then GO)
  useEffect(() => {
    if (gameStatus !== 'countdown') return;
    
    if (countdownNumber > 1) {
      // Count down 3, 2, 1
      const timer = setTimeout(() => {
        setCountdownNumber(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdownNumber === 1 && allModulesReady) {
      // At 1 and modules ready - brief pause then GO
      const timer = setTimeout(() => {
        setCountdownNumber(0); // 0 = "GO!"
      }, 500);
      return () => clearTimeout(timer);
    } else if (countdownNumber === 0) {
      // GO! - start the game
      const timer = setTimeout(() => {
        setGameStatus('playing');
      }, 500);
      return () => clearTimeout(timer);
    }
    // If countdownNumber === 1 and not ready, we just wait
  }, [gameStatus, countdownNumber, allModulesReady]);
  
  // Scroll to top when game starts
  useEffect(() => {
    if (gameStatus === 'playing') {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [gameStatus]);
  
  // Build module results for reporting
  const getModuleResults = () => {
    return modules.map(mod => ({
      name: mod.name,
      solved: completedModules.includes(mod.id),
      strikes: moduleStrikes[mod.id] || 0
    }));
  };
  
  // Game Timer (only runs when playing)
  useEffect(() => {
    if (gameStatus !== 'playing') return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameStatus('lost');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [gameStatus]);
  
  // Handle game over states
  useEffect(() => {
    if (gameStatus === 'lost') {
      const reason = timeLeft <= 0 ? 'time' : 'strikes';
      onGameEnd('lose', timeLeft, strikes, getModuleResults(), reason);
    }
  }, [gameStatus, timeLeft, strikes]);
  
  // Check win condition
  useEffect(() => {
    if (completedModules.length === modules.length && gameStatus === 'playing') {
      setGameStatus('won');
      onGameEnd('win', timeLeft, strikes, getModuleResults());
    }
  }, [completedModules, modules.length, gameStatus, timeLeft, strikes]);
  
  const handleStrike = (moduleId) => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
    
    // Track per-module strikes
    setModuleStrikes(prev => ({
      ...prev,
      [moduleId]: (prev[moduleId] || 0) + 1
    }));
    
    const newStrikes = strikes + 1;
    setStrikes(newStrikes);
    
    if (newStrikes >= 3) {
      setGameStatus('lost');
    }
  };
  
  const handleModuleComplete = (moduleId) => {
    setCompletedModules(prev => [...prev, moduleId]);
  };
  
  // Pause/Abort handlers
  const handleAbortClick = () => {
    if (gameStatus === 'playing') {
      setGameStatus('paused');
    }
    setShowAbortConfirm(true);
  };
  
  const handleAbortConfirm = () => {
    onAbort();
  };
  
  const handleAbortCancel = () => {
    setShowAbortConfirm(false);
    if (gameStatus === 'paused') {
      setGameStatus('playing');
    }
  };
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const timerColor = timeLeft > 60 ? '#4caf50' : timeLeft > 30 ? '#ff9800' : '#f44336';

  return (
    <div className={`bomb-container ${shake ? 'shake' : ''} ${gameStatus}`}>
      {/* Countdown Overlay */}
      {gameStatus === 'countdown' && (
        <div className="countdown-overlay">
          <div className="countdown-content">
            <div className="countdown-number">
              {countdownNumber > 0 ? countdownNumber : 'GO!'}
            </div>
            {countdownNumber === 1 && !allModulesReady && (
              <div className="countdown-loading">Loading...</div>
            )}
            <button className="abort-btn countdown-abort" onClick={handleAbortClick}>
              <span className="abort-text">✕ ABORT</span>
              <span className="abort-chinese">取消</span>
            </button>
          </div>
        </div>
      )}
      
      {/* Abort Confirmation Overlay */}
      {showAbortConfirm && (
        <div className="abort-confirm-overlay">
          <div className="abort-confirm-content">
            <h2>Abort Mission?</h2>
            <p className="abort-confirm-chinese">取消任務？</p>
            <div className="abort-confirm-buttons">
              <button className="abort-confirm-btn abort-yes" onClick={handleAbortConfirm}>
                <span>ABORT</span>
                <span className="btn-chinese">取消</span>
              </button>
              <button className="abort-confirm-btn abort-no" onClick={handleAbortCancel}>
                <span>DO NOT ABORT</span>
                <span className="btn-chinese">繼續</span>
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Bomb Header */}
      <div className="bomb-header">
        <div className="timer-display" style={{ color: timerColor }}>
          <span className="timer-icon">⏱️</span>
          <span className="timer-value">{formatTime(timeLeft)}</span>
        </div>
        
        <div className="serial-display">
          <span className="serial-label">SERIAL:</span>
          <span className="serial-value"><ColorCodedSerial serial={serialNumber} /></span>
        </div>
        
        <div className="strikes-display">
          {[0, 1, 2].map(i => (
            <span key={i} className={`strike-indicator ${i < strikes ? 'active' : ''}`}>
              {i < strikes ? '❌' : '⭕'}
            </span>
          ))}
        </div>
      </div>
      
      {/* Modules Grid */}
      <div className="modules-grid">
        {modules.map(module => (
          <ModuleWrapper
            key={module.id}
            module={module}
            serialNumber={serialNumber}
            onComplete={handleModuleComplete}
            onStrike={handleStrike}
            onReady={handleModuleReady}
            bombTimer={timeLeft}
          />
        ))}
      </div>
      
      {/* Progress */}
      <div className="progress-bar">
        <div 
          className="progress-fill"
          style={{ width: `${(completedModules.length / modules.length) * 100}%` }}
        />
        <span className="progress-text">
          {completedModules.length} / {modules.length} Modules
        </span>
      </div>
    </div>
  );
};

// ===== EXPERT MANUAL =====
const ExpertManual = ({ serialNumber }) => {
  const [activeSection, setActiveSection] = useState('wires');
  
  const sections = [
    { id: 'wires', name: '🔌 Wires', icon: '🔌' },
    { id: 'username', name: '👤 User Name', icon: '👤' },
    { id: 'monster', name: '👾 Monster', icon: '👾' },
    { id: 'guesswho', name: '🕵️ Guess Who', icon: '🕵️' },
    { id: 'worldclock', name: '🌍 World Clock', icon: '🌍' },
    { id: 'vending', name: '🏭 Vending', icon: '🏭' },
    { id: 'combolock', name: '🔒 Lock', icon: '🔒' },
    { id: 'symbolkeypad', name: '🔣 Symbols', icon: '🔣' },
    { id: 'bigbutton', name: '🔘 Button', icon: '🔘' },
    { id: 'keypad', name: '🔢 Keypad', icon: '🔢' },
    { id: 'crackcode', name: '🔐 Code', icon: '🔐' },
    { id: 'words', name: '📝 Words', icon: '📝' },
    { id: 'memory', name: '🧠 Memory', icon: '🧠' },
    { id: 'symbols', name: '🎨 Panel', icon: '🎨' },
    { id: 'switches', name: '🎛️ Switches', icon: '🎛️' },
  ];

  return (
    <div className="manual-container">
      <div className="manual-header">
        <h2>📖 EXPERT MANUAL</h2>
        <p className="manual-subtitle">TOP SECRET - DO NOT SHOW TO DEFUSER</p>
        <div className="serial-legend">
          <span><span className="legend-letter">ABC</span> = Letters (purple)</span>
          <span><span className="legend-number">123</span> = Numbers (orange)</span>
        </div>
      </div>
      
      <div className="manual-tabs">
        {sections.map(section => (
          <button
            key={section.id}
            className={`manual-tab ${activeSection === section.id ? 'active' : ''}`}
            onClick={() => setActiveSection(section.id)}
          >
            {section.icon}
          </button>
        ))}
      </div>
      
      <div className="manual-content">
        {activeSection === 'wires' && (
          <div className="manual-section">
            <h3>COLOR WIRES</h3>
            <p className="difficulty-tag">⭐ A1 - Beginner</p>
            <p className="manual-intro">Ask: "How many wires?" and "What colors?"</p>
            <p className="manual-intro" style={{color: '#ff9800', fontSize: '0.85rem'}}>Check rules in order. Stop at the FIRST rule that is true!</p>
            <ul className="rules-list">
              <li>1. <strong>3 wires</strong> and <strong>no red</strong>? → Cut wire <strong>2</strong></li>
              <li>2. <strong>Last wire is white</strong> and <strong>more than 3 wires</strong>? → Cut the <strong>last white</strong></li>
              <li>3. <strong>More than one blue</strong>? → Cut the <strong>last blue</strong></li>
              <li>4. <strong>Red AND blue</strong> both exist, and <strong>red is next to blue</strong>? → Cut the <strong>blue next to red</strong></li>
              <li>5. <strong>If none of these</strong>? → Cut wire <strong>1</strong></li>
            </ul>
          </div>
        )}
        
        {activeSection === 'username' && (
          <div className="manual-section">
            <h3>USER NAME</h3>
            <p className="difficulty-tag">⭐ A1 - Beginner</p>
            <p className="manual-intro">Ask: "What is the last letter in the serial number?"</p>
            <p>Find the letter. Type the name.</p>
            <div className="name-table">
              {['ABCDEF', 'GHIJKL', 'MNOPQR', 'STUVWX', 'YZ'].map((row, i) => (
                <div key={i} className="name-row">
                  {row.split('').map(letter => (
                    <span key={letter} className="name-cell">
                      <strong>{letter}</strong>: {
                        {A:'ANNA',B:'BEN',C:'CARL',D:'DIANA',E:'EMMA',F:'FRANK',
                         G:'GEORGE',H:'HELEN',I:'IAN',J:'JANE',K:'KATE',L:'LUCY',
                         M:'MIKE',N:'NOAH',O:'OLIVIA',P:'PETER',Q:'QUINN',R:'ROSE',
                         S:'SAM',T:'TOM',U:'UMA',V:'VERA',W:'WILL',X:'XENA',
                         Y:'YARA',Z:'ZOE'}[letter]
                      }
                    </span>
                  ))}
                </div>
              ))}
            </div>
            <p className="manual-example">Example: Serial is AB123-X4Y<strong>Z</strong>5 → Last letter is <strong>Z</strong> → Type <strong>ZOE</strong></p>
          </div>
        )}
        
        {activeSection === 'monster' && (
          <div className="manual-section">
            <h3>MONSTER LAB</h3>
            <p className="difficulty-tag">⭐ A1 - Beginner</p>
            <p className="manual-intro">Ask: "How many eyes does the monster have?"</p>
            <p className="manual-intro">Ask: "What color is the monster?"</p>
            <p className="manual-intro">Ask: "What kind of arms does it have?" (tentacles, robot, or hairy)</p>
            <p className="manual-intro">Ask: "Is it tall, short, fat, thin, or normal?"</p>
            
            <p><strong>Check the LAST NUMBER in the serial number:</strong></p>
            
            <div className="level-section">
              <h4>If last number is 0, 1, or 2 — Use EYES:</h4>
              <table className="rules-table">
                <tbody>
                  <tr><td><strong>1 eye</strong></td><td>→ MEEP</td></tr>
                  <tr><td><strong>2 eyes</strong></td><td>→ BLIP</td></tr>
                  <tr><td><strong>3 eyes</strong></td><td>→ ZORG</td></tr>
                  <tr><td><strong>4 eyes</strong></td><td>→ FLOP</td></tr>
                </tbody>
              </table>
            </div>
            
            <div className="level-section">
              <h4>If last number is 3 or 4 — Use COLOR:</h4>
              <table className="rules-table">
                <tbody>
                  <tr><td><strong>Red, Orange, Yellow</strong> (warm)</td><td>→ FLOP</td></tr>
                  <tr><td><strong>Green, Blue, Purple</strong> (cool)</td><td>→ ZORG</td></tr>
                  <tr><td><strong>White, Black, Brown</strong></td><td>→ BLIP</td></tr>
                </tbody>
              </table>
            </div>
            
            <div className="level-section">
              <h4>If last number is 5 or 6 — Use ARMS:</h4>
              <table className="rules-table">
                <tbody>
                  <tr><td><strong>Tentacles</strong></td><td>→ BLIP</td></tr>
                  <tr><td><strong>Robot arms</strong></td><td>→ MEEP</td></tr>
                  <tr><td><strong>Hairy arms</strong></td><td>→ FLOP</td></tr>
                </tbody>
              </table>
            </div>
            
            <div className="level-section">
              <h4>If last number is 7 or 8 — Use BODY SHAPE:</h4>
              <table className="rules-table">
                <tbody>
                  <tr><td><strong>Tall</strong></td><td>→ ZORG</td></tr>
                  <tr><td><strong>Short</strong></td><td>→ MEEP</td></tr>
                  <tr><td><strong>Fat</strong></td><td>→ FLOP</td></tr>
                  <tr><td><strong>Thin</strong></td><td>→ BLIP</td></tr>
                  <tr><td><strong>Normal</strong> (1-2 eyes)</td><td>→ MEEP</td></tr>
                  <tr><td><strong>Normal</strong> (3-4 eyes)</td><td>→ ZORG</td></tr>
                </tbody>
              </table>
            </div>
            
            <div className="level-section">
              <h4>If last number is 9 — Use COMBINATIONS:</h4>
              <table className="rules-table">
                <tbody>
                  <tr><td>3 eyes <strong>AND</strong> cool color</td><td>→ ZORG</td></tr>
                  <tr><td>1 eye <strong>AND</strong> robot arms</td><td>→ MEEP</td></tr>
                  <tr><td>Red/Orange <strong>AND</strong> tentacles</td><td>→ BLIP</td></tr>
                  <tr><td>4 eyes <strong>AND</strong> fat</td><td>→ FLOP</td></tr>
                  <tr><td>Other (1-2 eyes)</td><td>→ MEEP</td></tr>
                  <tr><td>Other (3-4 eyes)</td><td>→ ZORG</td></tr>
                </tbody>
              </table>
            </div>
            
            <p className="manual-example">Example: Serial ends in <strong>7</strong> → Use BODY SHAPE. Monster is <strong>tall</strong> → Press <strong>ZORG</strong></p>
          </div>
        )}
        
        {activeSection === 'guesswho' && (
          <div className="manual-section">
            <h3>GUESS WHO</h3>
            <p className="difficulty-tag">⭐ A1 - Beginner</p>
            <p className="manual-intro">Ask: "What color are the person's eyes?"</p>
            <p className="manual-intro">Ask: "What color is the person's hair?"</p>
            
            <p><strong>Find the row (eyes) and column (hair) to get the agent name:</strong></p>
            
            <div className="level-section">
              <table className="rules-table guess-who-table">
                <thead>
                  <tr>
                    <th></th>
                    <th>Black Hair</th>
                    <th>Brown Hair</th>
                    <th>Blonde Hair</th>
                    <th>Red Hair</th>
                    <th>Gray Hair</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Brown Eyes</strong></td>
                    <td>🐀 RAT</td>
                    <td>🐂 OX</td>
                    <td>🐅 TIGER</td>
                    <td>🐇 RABBIT</td>
                    <td>🐉 DRAGON</td>
                  </tr>
                  <tr>
                    <td><strong>Blue Eyes</strong></td>
                    <td>🐍 SNAKE</td>
                    <td>🐎 HORSE</td>
                    <td>🐐 GOAT</td>
                    <td>🐵 MONKEY</td>
                    <td>🐓 ROOSTER</td>
                  </tr>
                  <tr>
                    <td><strong>Green Eyes</strong></td>
                    <td>🐕 DOG</td>
                    <td>🐷 PIG</td>
                    <td>🐼 PANDA</td>
                    <td>🦛 HIPPO</td>
                    <td>🦒 GIRAFFE</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <p className="manual-example">Example: "Blue eyes and blonde hair" → Row 2, Column 3 → Press <strong>AGENT GOAT</strong> 🐐</p>
          </div>
        )}
        
        {activeSection === 'worldclock' && (
          <div className="manual-section">
            <h3>WORLD CLOCK</h3>
            <p className="difficulty-tag">⭐ A1 - Beginner</p>
            <p className="manual-intro">Ask: "What city is shown on the digital clock? What time?"</p>
            <p className="manual-intro">Ask: "What cities are on the analog clocks? What times do they show?"</p>
            
            <div className="level-section">
              <h4>GMT Time Zone Offsets</h4>
              <p>Each city has a time difference from GMT:</p>
              <table className="rules-table">
                <tbody>
                  <tr><td><strong>London</strong></td><td>GMT +0</td></tr>
                  <tr><td><strong>Paris</strong></td><td>GMT +1</td></tr>
                  <tr><td><strong>Dubai</strong></td><td>GMT +4</td></tr>
                  <tr><td><strong>Taipei</strong></td><td>GMT +8</td></tr>
                  <tr><td><strong>Tokyo</strong></td><td>GMT +9</td></tr>
                  <tr><td><strong>Sydney</strong></td><td>GMT +11</td></tr>
                  <tr><td><strong>New York</strong></td><td>GMT -5</td></tr>
                  <tr><td><strong>Los Angeles</strong></td><td>GMT -8</td></tr>
                </tbody>
              </table>
            </div>
            
            <div className="level-section">
              <h4>How to Find the Time</h4>
              <p>1. Find how many hours between two cities</p>
              <p>2. <strong>Add hours</strong> if going to a bigger number</p>
              <p>3. <strong>Take away hours</strong> if going to a smaller number</p>
              <table className="rules-table">
                <tbody>
                  <tr><td>Taipei (+8) to Tokyo (+9)</td><td>→ Add 1 hour</td></tr>
                  <tr><td>Taipei (+8) to London (0)</td><td>→ Take away 8 hours</td></tr>
                  <tr><td>Taipei (+8) to New York (-5)</td><td>→ Take away 13 hours</td></tr>
                </tbody>
              </table>
            </div>
            
            <div className="level-section">
              <h4>Example</h4>
              <p>Digital clock shows: <strong>Taipei 3:00 PM</strong></p>
              <p>Analog clocks show: London, Tokyo, New York</p>
              <p><strong>London:</strong> 3:00 PM - 8 hours = <strong>7:00 AM</strong></p>
              <p><strong>Tokyo:</strong> 3:00 PM + 1 hour = <strong>4:00 PM</strong></p>
              <p><strong>New York:</strong> 3:00 PM - 13 hours = <strong>2:00 AM</strong></p>
            </div>
            
            <p className="manual-example">Tell the Defuser: "Set London to 7 AM. Set Tokyo to 4 PM. Set New York to 2 AM."</p>
          </div>
        )}
        
        {activeSection === 'vending' && (
          <div className="manual-section">
            <h3>VENDING MACHINE</h3>
            <p className="difficulty-tag">⭐ A1 - Beginner</p>
            <p className="manual-intro">Ask: "Is there a fruit? Is there a vegetable? Do you see candy?"</p>
            
            <div className="level-section">
              <h4>Item Categories</h4>
              <table className="rules-table">
                <tbody>
                  <tr><td><strong>Fruit:</strong></td><td>Apple 🍎, Orange 🍊, Banana 🍌</td></tr>
                  <tr><td><strong>Vegetable:</strong></td><td>Carrot 🥕, Broccoli 🥦</td></tr>
                  <tr><td><strong>Snack:</strong></td><td>Chocolate 🍫, Candy 🍬, Chips 🍟, Cookie 🍪</td></tr>
                  <tr><td><strong>Drink:</strong></td><td>Soda 🥤, Water 💧, Juice 🧃, Coffee ☕, Milk 🥛</td></tr>
                </tbody>
              </table>
            </div>
            
            <div className="level-section">
              <h4>Rules (check in order)</h4>
              <table className="rules-table">
                <tbody>
                  <tr><td>1.</td><td>Fruit <strong>AND</strong> Vegetable?</td><td>→ Buy the <strong>CHEAPER</strong> one</td></tr>
                  <tr><td>2.</td><td>Fruit but <strong>NO</strong> vegetable?</td><td>→ If it's an <strong>APPLE</strong>, buy the <strong>MOST EXPENSIVE</strong> item.<br/>If not, buy the <strong>FRUIT</strong></td></tr>
                  <tr><td>3.</td><td><strong>NO</strong> fruit but has vegetable?</td><td>→ Buy the <strong>VEGETABLE</strong></td></tr>
                  <tr><td>4.</td><td><strong>NO</strong> fruit and <strong>NO</strong> vegetable?</td><td>→ If there's <strong>CANDY</strong>, buy the <strong>CHEAPEST DRINK</strong>.<br/>If not, buy the <strong>MOST EXPENSIVE</strong> item</td></tr>
                </tbody>
              </table>
            </div>
            
            <p className="manual-example">Example: "Is there a fruit?" → "Yes, a banana." → "Is there a vegetable?" → "No." → "Buy the banana!"</p>
          </div>
        )}
        
        {activeSection === 'combolock' && (
          <div className="manual-section">
            <h3>COMBINATION LOCK</h3>
            <p className="difficulty-tag">⭐⭐ A2 - Elementary</p>
            <p className="manual-intro">Ask: "What is the locker number?" (Letter + 3 digits)</p>
            <p className="manual-intro">The <strong>LETTER</strong> tells you which formula to use!</p>
            
            <div className="level-section">
              <h4>Letter A: (Example: A527)</h4>
              <table className="rules-table">
                <tbody>
                  <tr><td>1st number:</td><td>First + Second</td><td>5+2 = <strong>7</strong></td></tr>
                  <tr><td>2nd number:</td><td>(Second × 3) + Third</td><td>(2×3)+7 = <strong>13</strong></td></tr>
                  <tr><td>3rd number:</td><td>First + Second + Third</td><td>5+2+7 = <strong>14</strong></td></tr>
                </tbody>
              </table>
            </div>
            
            <div className="level-section">
              <h4>Letter B: (Example: B483)</h4>
              <table className="rules-table">
                <tbody>
                  <tr><td>1st number:</td><td>First + Third</td><td>4+3 = <strong>7</strong></td></tr>
                  <tr><td>2nd number:</td><td>(Second + Third) × 2</td><td>(8+3)×2 = <strong>22</strong></td></tr>
                  <tr><td>3rd number:</td><td>First × 4</td><td>4×4 = <strong>16</strong></td></tr>
                </tbody>
              </table>
            </div>
            
            <div className="level-section">
              <h4>Letter C: (Example: C321) — Digits are 0-3 only!</h4>
              <table className="rules-table">
                <tbody>
                  <tr><td>1st number:</td><td>First & Second together</td><td>3 & 2 = <strong>32</strong></td></tr>
                  <tr><td>2nd number:</td><td>Second & Third together</td><td>2 & 1 = <strong>21</strong></td></tr>
                  <tr><td>3rd number:</td><td>First & Third together</td><td>3 & 1 = <strong>31</strong></td></tr>
                </tbody>
              </table>
            </div>
            
            <div className="level-section">
              <h4>Letter D: (Example: D615)</h4>
              <table className="rules-table">
                <tbody>
                  <tr><td>1st number:</td><td>(First + Second) × 2</td><td>(6+1)×2 = <strong>14</strong></td></tr>
                  <tr><td>2nd number:</td><td>Third × 4</td><td>5×4 = <strong>20</strong></td></tr>
                  <tr><td>3rd number:</td><td>First + Second + Third + 10</td><td>6+1+5+10 = <strong>22</strong></td></tr>
                </tbody>
              </table>
            </div>
            
            <div className="level-section">
              <h4>How to Open</h4>
              <p>Pattern: <strong>CLOCKWISE → COUNTER → CLOCKWISE</strong></p>
              <p>Then press <strong>UNLOCK</strong>!</p>
            </div>
          </div>
        )}
        
        {activeSection === 'symbolkeypad' && (
          <div className="manual-section">
            <h3>SYMBOL KEYPAD</h3>
            <p className="difficulty-tag">⭐ A1 - Beginner</p>
            <p className="manual-intro">Ask: "What symbols do you see?" Then find the column and tell them the order!</p>
            
            <div className="level-section">
              <h4>The Column Chart</h4>
              <p>Find the ONE column that contains ALL 4 symbols. Press in column order (top to bottom).</p>
              <div className="column-chart">
                <table className="rules-table">
                  <thead>
                    <tr><th>Col 1</th><th>Col 2</th><th>Col 3</th><th>Col 4</th><th>Col 5</th><th>Col 6</th></tr>
                  </thead>
                  <tbody>
                    <tr><td>A</td><td>3</td><td>●</td><td>F</td><td>★</td><td>7</td></tr>
                    <tr><td>■</td><td>B</td><td>2</td><td>▲</td><td>D</td><td>●</td></tr>
                    <tr><td>5</td><td>★</td><td>G</td><td>1</td><td>■</td><td>C</td></tr>
                    <tr><td>▲</td><td>D</td><td>8</td><td>●</td><td>4</td><td>★</td></tr>
                    <tr><td>C</td><td>■</td><td>★</td><td>9</td><td>A</td><td>▲</td></tr>
                    <tr><td>9</td><td>▲</td><td>B</td><td>★</td><td>6</td><td>2</td></tr>
                    <tr><td>●</td><td>7</td><td>■</td><td>C</td><td>▲</td><td>D</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="level-section">
              <h4>Symbol Names</h4>
              <table className="rules-table">
                <tbody>
                  <tr><td>●</td><td>Circle</td><td>■</td><td>Square</td></tr>
                  <tr><td>▲</td><td>Triangle</td><td>★</td><td>Star</td></tr>
                  <tr><td>◆</td><td>Diamond</td><td>♥</td><td>Heart</td></tr>
                </tbody>
              </table>
            </div>
            
            <p className="manual-example">Example: "I see B, 7, D, and a star." → Find column with all four → Column 2! Order: 3, B, ★, D, ▲, 7. So press: B, ★, D, 7</p>
          </div>
        )}
        
        {activeSection === 'bigbutton' && (
          <div className="manual-section">
            <h3>THE BUTTON</h3>
            <p className="difficulty-tag">⭐⭐ A2 - Elementary</p>
            <p className="manual-intro">Ask: "What color is the button?" and "What does it say?"</p>
            
            <div className="level-section">
              <h4>Step 1: TAP or HOLD?</h4>
              <p>Find the button color (row) and word (column):</p>
              <table className="rules-table">
                <thead>
                  <tr><th>Button</th><th>HOLD</th><th>PRESS</th><th>DON'T TOUCH</th></tr>
                </thead>
                <tbody>
                  <tr><td><strong>Red</strong></td><td>HOLD</td><td>TAP</td><td>TAP</td></tr>
                  <tr><td><strong>Orange</strong></td><td>TAP</td><td>HOLD</td><td>HOLD</td></tr>
                  <tr><td><strong>Yellow</strong></td><td>HOLD</td><td>HOLD</td><td>TAP</td></tr>
                  <tr><td><strong>Green</strong></td><td>TAP</td><td>TAP</td><td>HOLD</td></tr>
                  <tr><td><strong>Blue</strong></td><td>HOLD</td><td>TAP</td><td>HOLD</td></tr>
                  <tr><td><strong>Purple</strong></td><td>TAP</td><td>HOLD</td><td>TAP</td></tr>
                </tbody>
              </table>
            </div>
            
            <div className="level-section">
              <h4>Step 2: If HOLD</h4>
              <p>A colored strip appears. Ask what color, then tell them when to release:</p>
              <table className="rules-table">
                <tbody>
                  <tr><td><strong>Red</strong> strip</td><td>Release when timer shows a <strong>4</strong></td></tr>
                  <tr><td><strong>Orange</strong> strip</td><td>Release when timer shows a <strong>6</strong></td></tr>
                  <tr><td><strong>Yellow</strong> strip</td><td>Release when timer shows a <strong>1</strong></td></tr>
                  <tr><td><strong>Green</strong> strip</td><td>Release when timer shows a <strong>5</strong></td></tr>
                  <tr><td><strong>Blue</strong> strip</td><td>Release when timer shows a <strong>2</strong></td></tr>
                  <tr><td><strong>Purple</strong> strip</td><td>Release when timer shows a <strong>3</strong></td></tr>
                </tbody>
              </table>
            </div>
            
            <p className="manual-example">Example: "Orange button, says PRESS" → "HOLD it! What color strip?" → "Green" → "Release when timer shows a 5!"</p>
          </div>
        )}
        
        {activeSection === 'keypad' && (
          <div className="manual-section">
            <h3>NUMBER KEYPAD</h3>
            <p className="difficulty-tag">⭐⭐ A2 - Elementary</p>
            <p className="manual-intro">Ask: "What is the first letter in the serial number?"</p>
            
            <div className="keypad-layout">
              <div className="cipher-chart">
                <div className="cipher-column">
                  <div>A=1</div><div>B=2</div><div>C=3</div><div>D=4</div>
                  <div>E=5</div><div>F=6</div><div>G=7</div><div>H=8</div>
                  <div>I=9</div><div>J=10</div><div>K=11</div><div>L=12</div><div>M=13</div>
                </div>
                <div className="cipher-column">
                  <div>N=14</div><div>O=15</div><div>P=16</div><div>Q=17</div>
                  <div>R=18</div><div>S=19</div><div>T=20</div><div>U=21</div>
                  <div>V=22</div><div>W=23</div><div>X=24</div><div>Y=25</div><div>Z=26</div>
                </div>
              </div>
              
              <div className="keypad-rules">
                <table className="rules-table">
                  <tbody>
                    <tr>
                      <td><strong>A, B, C, D</strong></td>
                      <td>Look at the chart in the box on the left of this page.<br/>Find each <strong>letter</strong>. Enter the numbers.<br/>
                        <span className="example-small">Example: <span className="legend-letter">Y</span><span className="legend-letter">I</span><span className="legend-number">520</span>-<span className="legend-letter">Q</span><span className="legend-number">2</span><span className="legend-letter">N</span><span className="legend-number">37</span> → Y=25, I=9, Q=17, N=14 → <strong>2591714</strong></span>
                      </td>
                    </tr>
                    <tr>
                      <td><strong>E, F, G, H</strong></td>
                      <td>What is the <strong>first number</strong> in the serial number on the bomb?<br/>What is the <strong>first letter</strong> in the serial number on the bomb?<br/>Look at the chart in the box on the left of this page.<br/>Use that letter to get its number from the chart.<br/>Add them together.<br/>
                        <span className="example-small">Example: <span className="legend-letter">Y</span><span className="legend-letter">I</span><span className="legend-number">5</span><span className="legend-number">20</span>-... → Y=25, first number=5 → 25+5 = <strong>30</strong></span>
                      </td>
                    </tr>
                    <tr>
                      <td><strong>I, J, K, L</strong></td>
                      <td>Find the <strong>first number</strong> in the serial. Add 1.<br/>
                        <span className="example-small">Example: YI<span className="legend-number">5</span>20-... → 5+1 = <strong>6</strong></span>
                      </td>
                    </tr>
                    <tr>
                      <td><strong>M, N, O, P</strong></td>
                      <td>What is the <strong>last number</strong> in the serial number on the bomb?<br/>What is the <strong>last letter</strong> in the serial number on the bomb?<br/>Look at the chart in the box on the left of this page.<br/>Use that letter to get its number from the chart.<br/>Add them together.<br/>
                        <span className="example-small">Example: ...-Q2<span className="legend-letter">N</span><span className="legend-number">3</span><span className="legend-number">7</span> → N=14, last number=7 → 14+7 = <strong>21</strong></span>
                      </td>
                    </tr>
                    <tr>
                      <td><strong>Q, R, S, T</strong></td>
                      <td>Find the <strong>first number</strong> in the serial.<br/>Find the <strong>last number</strong> in the serial.<br/>Add them together.<br/>
                        <span className="example-small">Example: YI<span className="legend-number">5</span>20-Q2N3<span className="legend-number">7</span> → 5+7 = <strong>12</strong></span>
                      </td>
                    </tr>
                    <tr>
                      <td><strong>U, V, W</strong></td>
                      <td>Enter all the <strong>numbers</strong> in the serial.<br/>
                        <span className="example-small">Example: YI<span className="legend-number">520</span>-Q<span className="legend-number">2</span>N<span className="legend-number">37</span> → <strong>520237</strong></span>
                      </td>
                    </tr>
                    <tr>
                      <td><strong>X, Y, Z</strong></td>
                      <td>Enter all the <strong>numbers</strong> in the serial, <strong>backwards</strong>.<br/>
                        <span className="example-small">Example: YI<span className="legend-number">520</span>-Q<span className="legend-number">2</span>N<span className="legend-number">37</span> → <strong>732025</strong></span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        
        {activeSection === 'crackcode' && (
          <div className="manual-section">
            <h3>CRACK THE CODE</h3>
            <p className="difficulty-tag">⭐⭐ A2 - Elementary</p>
            <p className="manual-intro">Ask: "What numbers are in each row?"</p>
            
            <div className="level-section">
              <h4>The Clues</h4>
              <table className="rules-table">
                <tbody>
                  <tr><td><strong>Row A:</strong></td><td>1 number is correct but in the <strong>WRONG</strong> place</td></tr>
                  <tr><td><strong>Row B:</strong></td><td>1 number is correct and in the <strong>RIGHT</strong> place</td></tr>
                  <tr><td><strong>Row C:</strong></td><td>2 numbers are correct but <strong>BOTH</strong> are in the WRONG place</td></tr>
                  <tr><td><strong>Row D:</strong></td><td><strong>NO</strong> numbers are correct</td></tr>
                  <tr><td><strong>Row E:</strong></td><td>1 number is correct and in the <strong>RIGHT</strong> place</td></tr>
                </tbody>
              </table>
            </div>
            
            <div className="level-section">
              <h4>How to Solve</h4>
              <p>Use the clues to find the 3-digit code!</p>
              <ul style={{fontSize: '0.85rem', marginLeft: '1rem'}}>
                <li>Row D numbers are ALL wrong - cross them out</li>
                <li>Row B has 1 correct in the right place - which one?</li>
                <li>Row E has 1 correct in the right place - which one?</li>
                <li>Row A has 1 correct in wrong place - find it</li>
                <li>Row C has 2 correct in wrong places - find them</li>
              </ul>
            </div>
            
            <p className="manual-example">Write down each row. Cross out wrong numbers. Find the 3-digit code!</p>
          </div>
        )}
        
        {activeSection === 'words' && (
          <div className="manual-section">
            <h3>WORD BUTTONS</h3>
            
            <div className="level-section">
              <h4>⭐ Level 1 (A1)</h4>
              <p className="manual-intro">Ask: "What words do you see?"</p>
              <p className="manual-intro">Ask: "How many letters does each word have?"</p>
              
              <p><strong>FIRST, check these rules:</strong></p>
              <table className="rules-table">
                <tbody>
                  <tr><td>If <strong>all 4 words</strong> are the same length</td><td>→ Press the <strong>BOTTOM RIGHT</strong> word</td></tr>
                  <tr><td>If <strong>2 words</strong> are the shortest</td><td>→ Press the <strong>TOP RIGHT</strong> word</td></tr>
                  <tr><td>If <strong>2 words</strong> are the longest</td><td>→ Press the <strong>BOTTOM LEFT</strong> word</td></tr>
                  <tr><td>If <strong>3 words</strong> are the same length</td><td>→ Press the one closest to <strong>A</strong></td></tr>
                </tbody>
              </table>
              
              <p><strong>If none of those rules are true, ask:</strong></p>
              <p className="manual-intro">"Which word is the SHORTEST?" (has the least letters)</p>
              <p className="manual-intro">"What is the FIRST LETTER of the shortest word?"</p>
              
              <p><strong>Use the first letter of the SHORTEST word:</strong></p>
              <table className="rules-table">
                <tbody>
                  <tr><td><strong>A, B, C, D, E</strong></td><td>→ Press the LONGEST word</td></tr>
                  <tr><td><strong>F, G, H, I, J</strong></td><td>→ Press the TOP LEFT word</td></tr>
                  <tr><td><strong>K, L, M, N, O</strong></td><td>→ Press the BOTTOM RIGHT word</td></tr>
                  <tr><td><strong>P, Q, R, S, T</strong></td><td>→ Press the SHORTEST word</td></tr>
                  <tr><td><strong>U, V, W, X, Y, Z</strong></td><td>→ Press the TOP RIGHT word</td></tr>
                </tbody>
              </table>
            </div>
            
            <div className="level-section">
              <h4>⭐⭐ Level 2 (A2)</h4>
              <p className="manual-intro">Press 2 words in order!</p>
              <p className="manual-intro">Ask: "What words do you see?"</p>
              <p className="manual-intro">Ask: "Where is each word?" (top left, top right, bottom left, bottom right)</p>
              <p className="manual-intro">Ask: "How many letters does each word have?"</p>
              
              <p><strong>FIRST word to press:</strong></p>
              <table className="rules-table">
                <tbody>
                  <tr><td>If all words are the same length</td><td>→ Press the <strong>TOP LEFT</strong> word</td></tr>
                  <tr><td>If the TOP LEFT word <strong>IS</strong> the shortest</td><td>→ Press the <strong>LONGEST</strong> word</td></tr>
                  <tr><td>If the TOP LEFT word <strong>IS NOT</strong> the shortest</td><td>→ Press the <strong>BOTTOM RIGHT</strong> word</td></tr>
                </tbody>
              </table>
              
              <p><strong>SECOND word to press:</strong></p>
              <table className="rules-table">
                <tbody>
                  <tr><td>If all words are the same length</td><td>→ Press the <strong>BOTTOM RIGHT</strong> word</td></tr>
                  <tr><td>If the BOTTOM RIGHT word <strong>IS</strong> the longest</td><td>→ Press the <strong>SHORTEST</strong> word</td></tr>
                  <tr><td>If the BOTTOM RIGHT word <strong>IS NOT</strong> the longest</td><td>→ Press the <strong>TOP LEFT</strong> word</td></tr>
                </tbody>
              </table>
            </div>
            
            <div className="level-section">
              <h4>⭐⭐⭐ Level 3 (B1)</h4>
              <p className="manual-intro">Press 3 words in order!</p>
              
              <p><strong>FIRST word:</strong> Same as Level 2</p>
              <p><strong>SECOND word:</strong> Same as Level 2</p>
              
              <p><strong>THIRD word to press:</strong></p>
              <p className="manual-intro">Find the word closest to A (the word that starts with a letter closest to A in ABC order)</p>
              <table className="rules-table">
                <tbody>
                  <tr><td>If that word is in the <strong>TOP ROW</strong></td><td>→ Press the word closest to <strong>Z</strong></td></tr>
                  <tr><td>If that word is in the <strong>BOTTOM ROW</strong></td><td>→ Press the <strong>TOP RIGHT</strong> word</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {activeSection === 'memory' && (
          <div className="manual-section">
            <h3>MEMORY</h3>
            <p className="difficulty-tag">⭐⭐ A2-B1 - Elementary/Intermediate</p>
            <p className="manual-intro">Write down what was pressed each stage! Note the <strong>place</strong> (1-4 from left) AND the <strong>number on the button</strong>.</p>
            
            <div className="level-section">
              <h4>Stage 1</h4>
              <table className="rules-table">
                <tbody>
                  <tr><td>Display: 1</td><td>Press <strong>place 1</strong> (first from left)</td></tr>
                  <tr><td>Display: 2</td><td>Press <strong>place 3</strong></td></tr>
                  <tr><td>Display: 3</td><td>Press <strong>place 4</strong> (last on right)</td></tr>
                  <tr><td>Display: 4</td><td>Press <strong>place 2</strong></td></tr>
                </tbody>
              </table>
            </div>
            
            <div className="level-section">
              <h4>Stage 2</h4>
              <table className="rules-table">
                <tbody>
                  <tr><td>Display: 1</td><td>Press button that <strong>says "3"</strong></td></tr>
                  <tr><td>Display: 2</td><td>Press <strong>place 1</strong></td></tr>
                  <tr><td>Display: 3</td><td>Press <strong>same place</strong> as Stage 1</td></tr>
                  <tr><td>Display: 4</td><td>Press button with <strong>same number</strong> as Stage 1</td></tr>
                </tbody>
              </table>
            </div>
            
            <div className="level-section">
              <h4>Stage 3</h4>
              <table className="rules-table">
                <tbody>
                  <tr><td>Display: 1</td><td>Press button with <strong>same number</strong> as Stage 2</td></tr>
                  <tr><td>Display: 2</td><td>Press <strong>place 2</strong></td></tr>
                  <tr><td>Display: 3</td><td>Press <strong>same place</strong> as Stage 2</td></tr>
                  <tr><td>Display: 4</td><td>Press button that <strong>says "1"</strong></td></tr>
                </tbody>
              </table>
            </div>
            
            <div className="level-section">
              <h4>Stage 4</h4>
              <table className="rules-table">
                <tbody>
                  <tr><td>Display: 1</td><td>Press <strong>same place</strong> as Stage 1</td></tr>
                  <tr><td>Display: 2</td><td>Press button with <strong>same number</strong> as Stage 2</td></tr>
                  <tr><td>Display: 3</td><td>Press button with <strong>same number</strong> as Stage 1</td></tr>
                  <tr><td>Display: 4</td><td>Press <strong>place 4</strong></td></tr>
                </tbody>
              </table>
            </div>
            
            <div className="level-section">
              <h4>Stage 5</h4>
              <table className="rules-table">
                <tbody>
                  <tr><td>Display: 1</td><td>Press button with <strong>same number</strong> as Stage 3</td></tr>
                  <tr><td>Display: 2</td><td>Press button with <strong>same number</strong> as Stage 4</td></tr>
                  <tr><td>Display: 3</td><td>Press button with <strong>same number</strong> as Stage 2</td></tr>
                  <tr><td>Display: 4</td><td>Press button with <strong>same number</strong> as Stage 1</td></tr>
                </tbody>
              </table>
            </div>
            
            <p className="manual-example">Write on paper: "Stage 1: Place 4, Number 2" → "Stage 2: Place 3, Number 2" → etc.</p>
          </div>
        )}
        
        {activeSection === 'symbols' && (
          <div className="manual-section">
            <h3>SYMBOL PANEL</h3>
            <p className="difficulty-tag">⭐⭐⭐ B1 - Intermediate</p>
            <p className="manual-intro">Ask: "What pictures do you see?" and "What is the first number in the serial?"</p>
            <p>Pictures are numbered 1-6 (or 1-9), left to right, top to bottom.</p>
            <table className="rules-table">
              <tbody>
                <tr><td><strong>0</strong></td><td>Press picture <strong>3</strong></td></tr>
                <tr><td><strong>1</strong></td><td>Press something you can <strong>eat</strong> 🍎</td></tr>
                <tr><td><strong>2</strong></td><td>Press an <strong>animal</strong> 🐕</td></tr>
                <tr><td><strong>3</strong></td><td>Press something you can <strong>ride in</strong> 🚗</td></tr>
                <tr><td><strong>4, 5</strong></td><td>Press a <strong>plant</strong> 🌳</td></tr>
                <tr><td><strong>6</strong></td><td>Press picture <strong>6</strong></td></tr>
                <tr><td><strong>7</strong></td><td>Press an <strong>animal</strong> in position 1, 3, or 5</td></tr>
                <tr><td><strong>8</strong></td><td>Press picture <strong>3</strong> (top right)</td></tr>
                <tr><td><strong>9</strong></td><td>Press something <strong>bigger than you</strong> 🐘🚌</td></tr>
              </tbody>
            </table>
          </div>
        )}
        
        {activeSection === 'switches' && (
          <div className="manual-section">
            <h3>COLOR SWITCHBOARD</h3>
            <p className="difficulty-tag">⭐⭐⭐ B1 - Intermediate</p>
            <p className="manual-intro">Ask: "What color is the switch?" and "Which way is it pointing?"</p>
            <p>Find the color. Find the direction. Change to the NEW direction.</p>
            <table className="lookup-table">
              <thead>
                <tr>
                  <th>Color</th>
                  <th>If UP →</th>
                  <th>If DOWN →</th>
                  <th>If LEFT →</th>
                  <th>If RIGHT →</th>
                </tr>
              </thead>
              <tbody>
                <tr className="row-red"><td>🔴 Red</td><td>RIGHT</td><td>LEFT</td><td>UP</td><td>DOWN</td></tr>
                <tr className="row-blue"><td>🔵 Blue</td><td>DOWN</td><td>RIGHT</td><td>LEFT</td><td>UP</td></tr>
                <tr className="row-yellow"><td>🟡 Yellow</td><td>LEFT</td><td>RIGHT</td><td>DOWN</td><td>UP</td></tr>
                <tr className="row-green"><td>🟢 Green</td><td>UP</td><td>DOWN</td><td>LEFT</td><td>RIGHT</td></tr>
              </tbody>
            </table>
            <p className="manual-example">Example: Red switch pointing UP → Change to RIGHT</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ===== SETTINGS PANEL =====
const SettingsPanel = ({ config, setConfig, onStartGame, previousConfig }) => {
  // Module definitions with available levels
  // levels: array of available levels (e.g., [1,2,3] or [1,3] or null for no levels)
  const moduleOptions = [
    { id: 'colorWires', name: 'Color Wires', baseDifficulty: 'A1', levels: null },
    { id: 'userName', name: 'User Name', baseDifficulty: 'A1', levels: null },
    { id: 'monsterLab', name: 'Monster Lab', baseDifficulty: 'A1', levels: null },
    { id: 'guessWho', name: 'Guess Who', baseDifficulty: 'A1', levels: null },
    { id: 'worldClock', name: 'World Clock', baseDifficulty: 'A1', levels: null },
    { id: 'vendingMachine', name: 'Vending Machine', baseDifficulty: 'A1', levels: null },
    { id: 'combinationLock', name: 'Combination Lock', baseDifficulty: 'A2', levels: null },
    { id: 'symbolKeypad', name: 'Symbol Keypad', baseDifficulty: 'A1', levels: null },
    { id: 'bigButton', name: 'Big Button', baseDifficulty: 'A2', levels: null },
    { id: 'numberKeypad', name: 'Number Keypad', baseDifficulty: 'A2', levels: null },
    { id: 'crackTheCode', name: 'Crack the Code', baseDifficulty: 'A2', levels: null },
    { id: 'wordButtons', name: 'Word Buttons', baseDifficulty: 'A1', levels: [1, 2, 3], levelDifficulties: { 1: 'A1', 2: 'A2', 3: 'B1' } },
    { id: 'memory', name: 'Memory', baseDifficulty: 'A2', levels: null },
    { id: 'symbolPanel', name: 'Symbol Panel', baseDifficulty: 'B1', levels: null },
    { id: 'colorSwitchboard', name: 'Color Switchboard', baseDifficulty: 'B1', levels: null },
  ];
  
  // Default modules for first time
  const defaultModules = [
    { id: 'colorWires', level: null },
    { id: 'userName', level: null },
    { id: 'numberKeypad', level: null }
  ];
  
  // Use previous config if available, otherwise use defaults
  const getInitialModules = () => {
    if (previousConfig && previousConfig.modules) {
      // Extract unique module types from previous config
      const seen = new Set();
      return previousConfig.modules
        .filter(m => {
          if (seen.has(m.type)) return false;
          seen.add(m.type);
          return true;
        })
        .map(m => ({ id: m.type, level: m.level || null }));
    }
    return defaultModules;
  };
  
  // selectedModules now stores objects with id and level: { id: 'wordButtons', level: 2 }
  const [selectedModules, setSelectedModules] = useState(getInitialModules);
  const [timer, setTimer] = useState(previousConfig?.timer || 300);
  const [moduleCount, setModuleCount] = useState(previousConfig?.modules?.length || 3);
  const [sliderManuallyMoved, setSliderManuallyMoved] = useState(false);

  const handleStart = () => {
    let moduleSelections = [];
    
    if (moduleCount <= selectedModules.length) {
      const shuffled = shuffleArray([...selectedModules]);
      moduleSelections = shuffled.slice(0, moduleCount);
    } else {
      moduleSelections = [...selectedModules];
      const remaining = moduleCount - selectedModules.length;
      for (let i = 0; i < remaining; i++) {
        const randomPick = selectedModules[Math.floor(Math.random() * selectedModules.length)];
        moduleSelections.push({ ...randomPick });
      }
      moduleSelections = shuffleArray(moduleSelections);
    }
    
    const modules = moduleSelections.map((sel, idx) => {
      const modOption = moduleOptions.find(m => m.id === sel.id);
      let difficulty = modOption.baseDifficulty;
      if (sel.level && modOption.levelDifficulties) {
        difficulty = modOption.levelDifficulties[sel.level];
      }
      return {
        id: `module-${idx}`,
        type: sel.id,
        name: modOption.name,
        level: sel.level,
        difficulty
      };
    });
    
    const gameConfig = {
      timer,
      modules,
      difficulty: 'B1'
    };
    
    setConfig(gameConfig);
    onStartGame(gameConfig);
  };

  const toggleModule = (id) => {
    const modOption = moduleOptions.find(m => m.id === id);
    const existingIndex = selectedModules.findIndex(m => m.id === id);
    
    setSelectedModules(prev => {
      let newSelection;
      
      if (existingIndex === -1) {
        // Not selected - add it at level 1 (or null if no levels)
        const startLevel = modOption.levels ? modOption.levels[0] : null;
        newSelection = [...prev, { id, level: startLevel }];
      } else {
        const current = prev[existingIndex];
        
        if (!modOption.levels) {
          // No levels - just toggle off
          newSelection = prev.filter(m => m.id !== id);
        } else {
          // Has levels - cycle through them
          const currentLevelIndex = modOption.levels.indexOf(current.level);
          const nextLevelIndex = currentLevelIndex + 1;
          
          if (nextLevelIndex >= modOption.levels.length) {
            // Past last level - remove module
            newSelection = prev.filter(m => m.id !== id);
          } else {
            // Move to next level
            newSelection = prev.map(m => 
              m.id === id ? { ...m, level: modOption.levels[nextLevelIndex] } : m
            );
          }
        }
      }
      
      // Auto-sync module count if slider hasn't been manually moved
      if (!sliderManuallyMoved) {
        setModuleCount(newSelection.length);
      }
      
      return newSelection;
    });
  };
  
  const handleSliderChange = (e) => {
    setSliderManuallyMoved(true);
    setModuleCount(parseInt(e.target.value));
  };
  
  // Helper to render level dots
  const renderLevelDots = (modOption, selection) => {
    if (!modOption.levels) {
      // No levels - single dot
      return (
        <div className="level-dots">
          <span className={`dot ${selection ? 'active' : ''}`}>●</span>
        </div>
      );
    }
    
    // Has levels - show 3 dots
    return (
      <div className="level-dots">
        {[1, 2, 3].map(lvl => {
          const levelExists = modOption.levels.includes(lvl);
          const isActive = selection && selection.level >= lvl && modOption.levels.slice(0, modOption.levels.indexOf(selection.level) + 1).includes(lvl);
          const isSelected = selection && selection.level === lvl;
          
          // Simpler logic: dot is filled if level exists AND current selection level >= this level
          let dotClass = 'dot';
          if (!levelExists) {
            dotClass += ' unavailable';
          } else if (selection && modOption.levels.indexOf(lvl) <= modOption.levels.indexOf(selection.level)) {
            dotClass += ' active';
          }
          
          return <span key={lvl} className={dotClass}>●</span>;
        })}
      </div>
    );
  };

  return (
    <div className="settings-panel">
      <h2>⚙️ Game Settings</h2>
      
      <div className="setting-group">
        <label>Timer (seconds)</label>
        <div className="timer-selector">
          {[180, 240, 300, 360, 420].map(t => (
            <button
              key={t}
              className={`timer-btn ${timer === t ? 'active' : ''}`}
              onClick={() => setTimer(t)}
            >
              {Math.floor(t/60)}:{(t%60).toString().padStart(2,'0')}
            </button>
          ))}
        </div>
      </div>
      
      <div className="setting-group">
        <label>Modules on Bomb: {moduleCount}</label>
        <input
          type="range"
          min="1"
          max="6"
          value={moduleCount}
          onChange={handleSliderChange}
          className="module-slider"
          disabled={selectedModules.length === 0}
        />
      </div>
      
      <div className="setting-group">
        <label>Enable Modules (click to cycle levels)</label>
        <div className="module-toggles">
          {moduleOptions.map(mod => {
            const selection = selectedModules.find(m => m.id === mod.id);
            const isSelected = !!selection;
            const displayDifficulty = selection && selection.level && mod.levelDifficulties 
              ? mod.levelDifficulties[selection.level] 
              : mod.baseDifficulty;
            
            return (
              <button
                key={mod.id}
                className={`module-toggle ${isSelected ? 'active' : ''}`}
                onClick={() => toggleModule(mod.id)}
              >
                <span className="toggle-name">{mod.name}</span>
                <span className="toggle-diff">{displayDifficulty}</span>
                {renderLevelDots(mod, selection)}
              </button>
            );
          })}
        </div>
      </div>
      
      <button 
        className="start-game-btn"
        onClick={handleStart}
        disabled={selectedModules.length === 0}
      >
        🚀 START MISSION
      </button>
      
      {selectedModules.length === 0 && (
        <p className="warning-text">Select at least 1 module!</p>
      )}
    </div>
  );
};

// ===== GAME OVER SCREENS =====
const ReportScreen = ({ gameReport, onPlayAgain, onBackToMenu }) => {
  const { 
    playerId, 
    startTime, 
    endTime, 
    result, 
    timeRemaining, 
    totalTime,
    strikesUsed, 
    modules,
    loseReason 
  } = gameReport;
  
  const formatDate = (date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}/${mm}/${dd}`;
  };
  
  const formatTime = (date) => {
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');
    return `${hh}:${min}:${ss}`;
  };
  
  const formatTimeUsed = () => {
    const used = totalTime - timeRemaining;
    const mins = Math.floor(used / 60);
    const secs = used % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const formatTimeRemaining = () => {
    const mins = Math.floor(timeRemaining / 60);
    const secs = timeRemaining % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const generateReportText = () => {
    let report = '';
    report += `Mission Report\n`;
    report += `================================\n`;
    report += `Agent: ${playerId || 'N/A'}\n`;
    report += `Date: ${formatDate(startTime)}\n`;
    report += `Time: ${formatTime(startTime)}\n`;
    report += `================================\n\n`;
    report += `Result: ${result === 'win' ? 'BOMB DEFUSED! ✓' : 'MISSION FAILED ✗'}\n`;
    if (result === 'lose') {
      report += `Reason: ${loseReason === 'time' ? 'Time ran out' : 'Too many strikes'}\n`;
    }
    report += `\n`;
    report += `Time:    ${formatTimeRemaining()} remaining (${formatTimeUsed()} used)\n`;
    report += `Strikes: ${strikesUsed} of 3\n`;
    report += `Modules: ${modules.filter(m => m.solved).length}/${modules.length} solved\n\n`;
    report += `Module Results:\n`;
    report += `---------------\n`;
    modules.forEach(mod => {
      const status = mod.solved ? '✓' : '✗';
      const strikes = mod.strikes > 0 ? ` (${mod.strikes} strike${mod.strikes > 1 ? 's' : ''})` : '';
      report += `${status} ${mod.name}${strikes}\n`;
    });
    report += `\n================================\n`;
    return report;
  };
  
  const downloadReport = () => {
    const report = generateReportText();
    const yyyy = startTime.getFullYear();
    const mm = String(startTime.getMonth() + 1).padStart(2, '0');
    const dd = String(startTime.getDate()).padStart(2, '0');
    const hh = String(startTime.getHours()).padStart(2, '0');
    const min = String(startTime.getMinutes()).padStart(2, '0');
    const agentId = playerId || 'UNKNOWN';
    const filename = `ESLBombSquad_${yyyy}.${mm}.${dd}-${agentId}-${hh}${min}.txt`;
    
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  // Auto-download report on mount
  useEffect(() => {
    downloadReport();
  }, []);
  
  return (
    <div className={`game-over-screen report ${result}`}>
      {result === 'win' && <div className="confetti"></div>}
      {result === 'lose' && <div className="explosion-effect"></div>}
      
      <h1>{result === 'win' ? '🎉 BOMB DEFUSED!' : '💥 MISSION FAILED'}</h1>
      
      <div className="report-card">
        <div className="report-header">
          <p className="report-title">Mission Report</p>
          <p><strong>Agent:</strong> {playerId || 'N/A'}</p>
          <p><strong>Date:</strong> {formatDate(startTime)}</p>
          <p><strong>Time:</strong> {formatTime(startTime)}</p>
        </div>
        
        <div className="report-stats">
          <div className="stat">
            <span className="stat-label">Time</span>
            <span className="stat-value">{formatTimeRemaining()} left</span>
            <span className="stat-sub">({formatTimeUsed()} used)</span>
          </div>
          <div className="stat">
            <span className="stat-label">Strikes</span>
            <span className="stat-value">
              {[0, 1, 2].map(i => (
                <span key={i}>{i < strikesUsed ? '❌' : '⭕'}</span>
              ))}
            </span>
            <span className="stat-sub">{strikesUsed} of 3</span>
          </div>
          <div className="stat">
            <span className="stat-label">Modules</span>
            <span className="stat-value">{modules.filter(m => m.solved).length}/{modules.length}</span>
            <span className="stat-sub">solved</span>
          </div>
        </div>
        
        <div className="report-modules">
          <h3>Module Results</h3>
          <ul>
            {modules.map((mod, idx) => (
              <li key={idx} className={mod.solved ? 'solved' : 'failed'}>
                <span className="mod-status">{mod.solved ? '✅' : '❌'}</span>
                <span className="mod-name">{mod.name}</span>
                {mod.strikes > 0 && (
                  <span className="mod-strikes">({mod.strikes} strike{mod.strikes > 1 ? 's' : ''})</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      <div className="report-buttons">
        <button className="report-btn download" onClick={downloadReport}>
          📥 Download Report
        </button>
        <button className="report-btn play-again" onClick={onPlayAgain}>
          🔄 Play Again
        </button>
        <button className="report-btn menu" onClick={onBackToMenu}>
          🏠 Main Menu
        </button>
      </div>
    </div>
  );
};

// ===== PLAYER ID INPUT =====
const PlayerIdScreen = ({ role, onSubmit, onBack }) => {
  const [playerId, setPlayerId] = useState('');
  
  return (
    <div className="player-id-screen">
      <button className="back-btn" onClick={onBack}>← Back</button>
      
      <h2>Enter Agent</h2>
      <p className="id-subtitle">輸入代號 / Enter your ID</p>
      
      <input
        type="text"
        className="player-id-input"
        value={playerId}
        onChange={(e) => setPlayerId(e.target.value.toUpperCase())}
        placeholder="e.g. A01, 12345"
        maxLength={20}
        autoFocus
      />
      
      <button 
        className="menu-btn primary"
        onClick={() => onSubmit(playerId)}
        disabled={!playerId.trim()}
      >
        {role === 'defuser' ? '🎮 Continue to Settings' : '📖 Open Manual'}
      </button>
    </div>
  );
};

// ===== MAIN APP =====
export default function ESLBombSquad() {
  const [screen, setScreen] = useState('menu'); // menu, howtoplay, playerid-defuser, playerid-expert, settings, playing, manual-only, report
  const [config, setConfig] = useState(null);
  const [lastConfig, setLastConfig] = useState(null); // Preserve settings for Play Again
  const [playerId, setPlayerId] = useState('');
  const [gameReport, setGameReport] = useState(null);
  const [showManual, setShowManual] = useState(false);
  const [gameKey, setGameKey] = useState(0);
  const [gameStartTime, setGameStartTime] = useState(null);
  const [moduleResults, setModuleResults] = useState([]);
  
  const handleGameEnd = useCallback((result, timeLeft, strikes, modules, loseReason = null) => {
    const endTime = new Date();
    const report = {
      playerId,
      startTime: gameStartTime,
      endTime,
      result,
      timeRemaining: timeLeft,
      totalTime: config?.timer || 300,
      strikesUsed: strikes,
      modules: modules.map(m => ({
        name: m.name,
        solved: m.solved,
        strikes: m.strikes || 0
      })),
      loseReason
    };
    setGameReport(report);
    setScreen('report');
  }, [playerId, gameStartTime, config]);
  
  const handleStartGame = useCallback((gameConfig) => {
    setConfig(gameConfig);
    setLastConfig(gameConfig); // Save for Play Again
    setGameStartTime(new Date());
    setModuleResults(gameConfig.modules.map(m => ({ 
      id: m.id, 
      name: m.name, 
      solved: false, 
      strikes: 0 
    })));
    setScreen('playing');
  }, []);
  
  const resetGame = useCallback(() => {
    setConfig(null);
    setScreen('menu');
    setShowManual(false);
    setGameKey(prev => prev + 1);
    setPlayerId('');
    setGameReport(null);
    setGameStartTime(null);
    setModuleResults([]);
  }, []);
  
  const playAgain = useCallback(() => {
    setScreen('settings');
    setGameReport(null);
    setGameKey(prev => prev + 1);
  }, []);

  return (
    <div className="esl-bomb-squad">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;700&family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&display=swap');
        
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        
        .esl-bomb-squad {
          min-height: 100vh;
          background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #0f0f1a 100%);
          font-family: 'Share Tech Mono', monospace;
          color: #e0e0e0;
          overflow-x: hidden;
        }
        
        /* ===== MENU SCREEN ===== */
        .menu-screen {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        
        .menu-screen::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(circle at 20% 80%, rgba(255, 50, 50, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(50, 100, 255, 0.1) 0%, transparent 50%);
          pointer-events: none;
        }
        
        .game-title {
          font-family: 'Orbitron', sans-serif;
          font-size: clamp(2.5rem, 8vw, 5rem);
          font-weight: 900;
          background: linear-gradient(135deg, #ff4444 0%, #ff8800 50%, #ffcc00 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-shadow: 0 0 60px rgba(255, 100, 0, 0.5);
          margin-bottom: 0.5rem;
          letter-spacing: 4px;
          animation: titlePulse 3s ease-in-out infinite;
        }
        
        @keyframes titlePulse {
          0%, 100% { filter: brightness(1); }
          50% { filter: brightness(1.2); }
        }
        
        .game-subtitle {
          font-size: 1.2rem;
          color: #888;
          margin-bottom: 1rem;
          letter-spacing: 8px;
          text-transform: uppercase;
        }
        
        .game-version {
          font-family: 'Share Tech Mono', monospace;
          font-size: 0.75rem;
          color: #555;
          margin-bottom: 2rem;
        }
        
        .menu-buttons {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          z-index: 1;
        }
        
        .menu-btn {
          font-family: 'Orbitron', sans-serif;
          font-size: 1.2rem;
          padding: 1rem 3rem;
          border: 2px solid;
          background: transparent;
          cursor: pointer;
          transition: all 0.3s ease;
          letter-spacing: 2px;
          position: relative;
          overflow: hidden;
        }
        
        .menu-btn.primary {
          border-color: #ff4444;
          color: #ff4444;
        }
        
        .menu-btn.primary:hover {
          background: #ff4444;
          color: #000;
          box-shadow: 0 0 30px rgba(255, 68, 68, 0.5);
        }
        
        .menu-btn.secondary {
          border-color: #4488ff;
          color: #4488ff;
        }
        
        .menu-btn.secondary:hover {
          background: #4488ff;
          color: #000;
          box-shadow: 0 0 30px rgba(68, 136, 255, 0.5);
        }
        
        .menu-btn.tertiary {
          border-color: #88cc44;
          color: #88cc44;
          font-size: 1rem;
        }
        
        .menu-btn.tertiary:hover {
          background: #88cc44;
          color: #000;
          box-shadow: 0 0 30px rgba(136, 204, 68, 0.5);
        }
        
        /* ===== HOW TO PLAY SCREEN ===== */
        .howtoplay-screen {
          max-width: 800px;
          margin: 1rem auto;
          padding: 1.5rem;
          text-align: center;
        }
        
        .howtoplay-title {
          font-family: 'Orbitron', sans-serif;
          font-size: 1.8rem;
          color: #ffcc00;
          margin-bottom: 1.5rem;
        }
        
        .howtoplay-section {
          background: rgba(20, 20, 35, 0.9);
          border: 1px solid #333;
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 1rem;
          text-align: left;
        }
        
        .howtoplay-section h2 {
          font-family: 'Orbitron', sans-serif;
          color: #4488ff;
          font-size: 1.2rem;
          margin-bottom: 0.75rem;
        }
        
        .howtoplay-section .chinese {
          color: #ffcc00;
          font-size: 1.1rem;
          margin-bottom: 0.25rem;
        }
        
        .howtoplay-section .english {
          color: #aaa;
          font-size: 0.95rem;
        }
        
        .howtoplay-roles {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        
        .role-card {
          flex: 1;
          background: rgba(20, 20, 35, 0.9);
          border: 2px solid #333;
          border-radius: 8px;
          padding: 1rem;
          text-align: left;
        }
        
        .role-card.defuser {
          border-color: #ff4444;
        }
        
        .role-card.expert {
          border-color: #4488ff;
        }
        
        .role-card h3 {
          font-family: 'Orbitron', sans-serif;
          font-size: 1rem;
          margin-bottom: 0.75rem;
          color: #fff;
        }
        
        .role-card ul {
          list-style: none;
          padding: 0;
          margin: 0;
          font-size: 0.85rem;
        }
        
        .role-card li {
          margin-bottom: 0.4rem;
          padding-left: 0.5rem;
        }
        
        .role-card li:nth-child(odd) {
          color: #ffcc00;
        }
        
        .role-card li:nth-child(even) {
          color: #aaa;
          margin-bottom: 0.75rem;
        }
        
        .howtoplay-section.rules .rules-list p {
          margin: 0.75rem 0;
          font-size: 1rem;
        }
        
        .howtoplay-section.rules .chinese {
          display: inline;
          margin-right: 0.5rem;
        }
        
        .howtoplay-section.rules .english {
          display: inline;
        }
        
        /* ===== PLAYER ID SCREEN ===== */
        .player-id-screen {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          text-align: center;
        }
        
        .player-id-screen h2 {
          font-family: 'Orbitron', sans-serif;
          font-size: 1.8rem;
          color: #ffcc00;
          margin-bottom: 0.5rem;
        }
        
        .id-subtitle {
          color: #888;
          margin-bottom: 2rem;
        }
        
        .player-id-input {
          font-family: 'Orbitron', sans-serif;
          font-size: 1.5rem;
          padding: 1rem 2rem;
          background: #1a1a2e;
          border: 2px solid #4488ff;
          border-radius: 8px;
          color: #fff;
          text-align: center;
          width: 250px;
          margin-bottom: 2rem;
        }
        
        .player-id-input:focus {
          outline: none;
          border-color: #ffcc00;
          box-shadow: 0 0 20px rgba(255, 204, 0, 0.3);
        }
        
        .player-id-input::placeholder {
          color: #555;
        }
        
        /* ===== REPORT SCREEN ===== */
        .game-over-screen.report {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          text-align: center;
        }
        
        .game-over-screen.report.win {
          background: linear-gradient(135deg, #0a1a0a 0%, #1a2e1a 50%, #0f1a0f 100%);
        }
        
        .game-over-screen.report.lose {
          background: linear-gradient(135deg, #1a0a0a 0%, #2e1a1a 50%, #1a0f0f 100%);
        }
        
        .game-over-screen.report h1 {
          font-family: 'Orbitron', sans-serif;
          font-size: 2.5rem;
          margin-bottom: 1.5rem;
        }
        
        .game-over-screen.report.win h1 {
          color: #4caf50;
        }
        
        .game-over-screen.report.lose h1 {
          color: #f44336;
        }
        
        .report-card {
          background: rgba(20, 20, 35, 0.95);
          border: 2px solid #333;
          border-radius: 12px;
          padding: 1.5rem;
          max-width: 500px;
          width: 100%;
          margin-bottom: 1.5rem;
        }
        
        .report-header {
          text-align: left;
          padding-bottom: 1rem;
          border-bottom: 1px solid #333;
          margin-bottom: 1rem;
          font-family: 'Share Tech Mono', monospace;
          font-size: 0.9rem;
          color: #888;
        }
        
        .report-header .report-title {
          font-family: 'Orbitron', sans-serif;
          font-size: 1.1rem;
          color: #ffcc00;
          margin-bottom: 0.75rem;
        }
        
        .report-header p {
          margin: 0.25rem 0;
        }
        
        .report-header strong {
          color: #aaa;
        }
        
        .report-stats {
          display: flex;
          justify-content: space-around;
          padding: 1rem 0;
          border-bottom: 1px solid #333;
          margin-bottom: 1rem;
        }
        
        .stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
        }
        
        .stat-label {
          font-size: 0.75rem;
          color: #888;
          text-transform: uppercase;
        }
        
        .stat-value {
          font-family: 'Orbitron', sans-serif;
          font-size: 1.3rem;
          color: #fff;
        }
        
        .stat-sub {
          font-size: 0.7rem;
          color: #666;
        }
        
        .report-modules {
          text-align: left;
        }
        
        .report-modules h3 {
          font-family: 'Orbitron', sans-serif;
          font-size: 0.9rem;
          color: #4488ff;
          margin-bottom: 0.75rem;
        }
        
        .report-modules ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .report-modules li {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.4rem 0;
          font-size: 0.9rem;
        }
        
        .report-modules li.solved {
          color: #4caf50;
        }
        
        .report-modules li.failed {
          color: #f44336;
        }
        
        .mod-status {
          font-size: 1rem;
        }
        
        .mod-name {
          flex: 1;
        }
        
        .mod-strikes {
          font-size: 0.75rem;
          color: #ff9800;
        }
        
        .report-buttons {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          justify-content: center;
        }
        
        .report-btn {
          padding: 0.75rem 1.5rem;
          font-family: 'Share Tech Mono', monospace;
          font-size: 1rem;
          border: 2px solid;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          background: transparent;
        }
        
        .report-btn.download {
          border-color: #4488ff;
          color: #4488ff;
        }
        
        .report-btn.download:hover {
          background: #4488ff;
          color: #000;
        }
        
        .report-btn.play-again {
          border-color: #4caf50;
          color: #4caf50;
        }
        
        .report-btn.play-again:hover {
          background: #4caf50;
          color: #000;
        }
        
        .report-btn.menu {
          border-color: #888;
          color: #888;
        }
        
        .report-btn.menu:hover {
          background: #888;
          color: #000;
        }
        
        .bomb-icon {
          font-size: 8rem;
          margin-bottom: 2rem;
          animation: bombFloat 4s ease-in-out infinite;
        }
        
        @keyframes bombFloat {
          0%, 100% { transform: translateY(0) rotate(-5deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        
        /* ===== SETTINGS PANEL ===== */
        .settings-panel {
          max-width: 600px;
          margin: 2rem auto;
          padding: 2rem;
          background: rgba(20, 20, 35, 0.95);
          border: 1px solid #333;
          border-radius: 8px;
        }
        
        .settings-panel h2 {
          font-family: 'Orbitron', sans-serif;
          color: #ffcc00;
          margin-bottom: 2rem;
          text-align: center;
        }
        
        .setting-group {
          margin-bottom: 2rem;
        }
        
        .setting-group label {
          display: block;
          color: #aaa;
          margin-bottom: 0.75rem;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .timer-selector {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        
        .timer-btn {
          padding: 0.75rem 1.25rem;
          background: #1a1a2e;
          border: 1px solid #444;
          color: #888;
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'Share Tech Mono', monospace;
        }
        
        .timer-btn.active {
          background: #ff4444;
          border-color: #ff4444;
          color: #000;
        }
        
        .module-slider {
          width: 100%;
          height: 8px;
          background: #333;
          border-radius: 4px;
          appearance: none;
          cursor: pointer;
        }
        
        .module-slider::-webkit-slider-thumb {
          appearance: none;
          width: 24px;
          height: 24px;
          background: #ffcc00;
          border-radius: 50%;
          cursor: pointer;
        }
        
        .module-toggles {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 0.75rem;
        }
        
        .module-toggle {
          padding: 1rem;
          background: #1a1a2e;
          border: 1px solid #333;
          color: #666;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
          font-family: 'Share Tech Mono', monospace;
        }
        
        .module-toggle.active {
          border-color: #4caf50;
          color: #4caf50;
          background: rgba(76, 175, 80, 0.1);
        }
        
        .toggle-name {
          font-size: 0.85rem;
        }
        
        .toggle-diff {
          font-size: 0.7rem;
          opacity: 0.7;
        }
        
        .level-dots {
          display: flex;
          gap: 0.3rem;
          margin-top: 0.25rem;
        }
        
        .level-dots .dot {
          font-size: 0.5rem;
          color: #333;
          transition: color 0.2s;
        }
        
        .level-dots .dot.active {
          color: #4caf50;
        }
        
        .level-dots .dot.unavailable {
          color: #1a1a1a;
        }
        
        .start-game-btn {
          width: 100%;
          padding: 1.25rem;
          font-family: 'Orbitron', sans-serif;
          font-size: 1.2rem;
          background: linear-gradient(135deg, #ff4444, #ff8800);
          border: none;
          color: #000;
          cursor: pointer;
          transition: all 0.3s;
          letter-spacing: 2px;
          margin-top: 1rem;
        }
        
        .start-game-btn:hover:not(:disabled) {
          transform: scale(1.02);
          box-shadow: 0 0 30px rgba(255, 100, 0, 0.5);
        }
        
        .start-game-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .warning-text {
          color: #ff8800;
          text-align: center;
          margin-top: 1rem;
          font-size: 0.9rem;
        }
        
        /* ===== GAME LAYOUT ===== */
        .game-layout {
          display: flex;
          min-height: 100vh;
        }
        
        .defuser-view {
          flex: 1;
          padding: 1rem;
          display: flex;
          flex-direction: column;
        }
        
        .manual-toggle {
          position: fixed;
          top: 1rem;
          right: 1rem;
          padding: 0.75rem 1.5rem;
          background: #4488ff;
          border: none;
          color: #fff;
          font-family: 'Orbitron', sans-serif;
          cursor: pointer;
          z-index: 100;
          border-radius: 4px;
        }
        
        .manual-overlay {
          position: fixed;
          top: 0;
          right: 0;
          width: 450px;
          max-width: 90vw;
          height: 100vh;
          background: rgba(15, 15, 25, 0.98);
          border-left: 2px solid #4488ff;
          z-index: 99;
          overflow-y: auto;
          transform: translateX(100%);
          transition: transform 0.3s ease;
        }
        
        .manual-overlay.visible {
          transform: translateX(0);
        }
        
        /* ===== BOMB CONTAINER ===== */
        .bomb-container {
          background: linear-gradient(180deg, #1a1a2e 0%, #0f0f1a 100%);
          border: 3px solid #333;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 
            0 0 60px rgba(0, 0, 0, 0.8),
            inset 0 0 60px rgba(0, 0, 0, 0.3);
          position: relative;
        }
        
        .bomb-container.shake {
          animation: shake 0.5s ease-in-out;
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-10px); }
          40% { transform: translateX(10px); }
          60% { transform: translateX(-10px); }
          80% { transform: translateX(10px); }
        }
        
        /* ===== COUNTDOWN OVERLAY ===== */
        .countdown-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          border-radius: 12px;
        }
        
        .countdown-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2rem;
          margin-top: -5%;
        }
        
        .countdown-number {
          font-family: 'Orbitron', sans-serif;
          font-size: 8rem;
          font-weight: 900;
          color: #ffcc00;
          text-shadow: 0 0 40px rgba(255, 204, 0, 0.6);
          animation: countdownPulse 1s ease-in-out infinite;
        }
        
        @keyframes countdownPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        
        .countdown-loading {
          font-family: 'Share Tech Mono', monospace;
          color: #888;
          font-size: 1rem;
        }
        
        .abort-btn {
          padding: 1rem 2rem;
          background: transparent;
          border: 2px solid #ff9800;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
          min-width: 150px;
        }
        
        .abort-btn:hover {
          background: rgba(255, 152, 0, 0.2);
        }
        
        .abort-btn .abort-text {
          font-family: 'Orbitron', sans-serif;
          font-size: 1.2rem;
          color: #ff9800;
        }
        
        .abort-btn .abort-chinese {
          font-size: 0.9rem;
          color: #ff9800;
          opacity: 0.8;
        }
        
        /* ===== ABORT CONFIRMATION OVERLAY ===== */
        .abort-confirm-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 150;
          border-radius: 12px;
        }
        
        .abort-confirm-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
          text-align: center;
        }
        
        .abort-confirm-content h2 {
          font-family: 'Orbitron', sans-serif;
          font-size: 2rem;
          color: #fff;
          margin: 0;
        }
        
        .abort-confirm-chinese {
          font-size: 1.2rem;
          color: #aaa;
          margin: 0;
        }
        
        .abort-confirm-buttons {
          display: flex;
          gap: 1.5rem;
          margin-top: 1rem;
        }
        
        .abort-confirm-btn {
          padding: 1.25rem 2rem;
          border: 3px solid;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          min-width: 160px;
          background: transparent;
          font-family: 'Orbitron', sans-serif;
          font-size: 1.1rem;
        }
        
        .abort-confirm-btn .btn-chinese {
          font-family: 'Share Tech Mono', sans-serif;
          font-size: 0.9rem;
          opacity: 0.8;
        }
        
        .abort-confirm-btn.abort-yes {
          border-color: #ff9800;
          color: #ff9800;
        }
        
        .abort-confirm-btn.abort-yes:hover {
          background: #ff9800;
          color: #000;
        }
        
        .abort-confirm-btn.abort-no {
          border-color: #4488ff;
          color: #4488ff;
        }
        
        .abort-confirm-btn.abort-no:hover {
          background: #4488ff;
          color: #000;
        }
        
        .bomb-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: #0a0a0f;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          gap: 1rem;
        }
        
        .timer-display {
          font-family: 'Orbitron', sans-serif;
          font-size: 2.5rem;
          font-weight: 900;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .timer-icon {
          font-size: 1.5rem;
        }
        
        .serial-display {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .serial-label {
          font-size: 0.7rem;
          color: #666;
          letter-spacing: 2px;
        }
        
        .serial-value {
          font-family: 'Fira Code', monospace;
          font-size: 1.4rem;
          font-weight: 500;
          letter-spacing: 3px;
          background: rgba(0, 0, 0, 0.4);
          padding: 0.4rem 0.75rem;
          border-radius: 4px;
          border: 1px solid #444;
        }
        
        .serial-value .letter {
          color: #bb86fc;
        }
        
        .serial-value .number {
          color: #ff9800;
        }
        
        .serial-value .separator {
          color: #666;
        }
        
        .strikes-display {
          display: flex;
          gap: 0.5rem;
          font-size: 1.5rem;
        }
        
        .strike-indicator {
          opacity: 0.3;
          transition: all 0.3s;
        }
        
        .strike-indicator.active {
          opacity: 1;
          animation: strikeFlash 0.5s ease;
        }
        
        @keyframes strikeFlash {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.3); }
        }
        
        /* ===== MODULES GRID ===== */
        .modules-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }
        
        .module-wrapper {
          background: #1a1a2e;
          border: 2px solid #333;
          border-radius: 8px;
          position: relative;
          overflow: hidden;
          transition: all 0.3s;
        }
        
        .module-wrapper.success {
          border-color: #4caf50;
          background: rgba(76, 175, 80, 0.1);
        }
        
        .module-status-indicator {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          z-index: 10;
        }
        
        .status-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: #4caf50;
          color: #fff;
          border-radius: 50%;
          font-size: 1.2rem;
          font-weight: bold;
        }
        
        .status-dot {
          display: inline-block;
          width: 12px;
          height: 12px;
          background: #ffcc00;
          border-radius: 50%;
          animation: pulse 1.5s ease-in-out infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
        
        .module-content {
          padding: 1.5rem;
        }
        
        .module-content h3 {
          font-family: 'Orbitron', sans-serif;
          color: #ffcc00;
          margin-bottom: 0.75rem;
          font-size: 1rem;
        }
        
        .module-hint {
          color: #666;
          font-size: 0.8rem;
          margin-bottom: 1rem;
        }
        
        .module-complete {
          padding: 3rem;
          text-align: center;
          color: #4caf50;
        }
        
        .complete-icon {
          font-size: 3rem;
          display: block;
          margin-bottom: 1rem;
        }
        
        /* ===== WIRES MODULE ===== */
        .wires-container {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .wire-row {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .wire-label {
          width: 60px;
          font-size: 0.8rem;
          color: #888;
        }
        
        .wire-wrapper {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        .wire {
          width: 100%;
          height: 16px;
          border-radius: 8px;
          position: relative;
          transition: width 0.3s;
        }
        
        .wire.cut {
          width: 40%;
          opacity: 0.7;
        }
        
        .wire-left.cut {
          border-top-right-radius: 2px;
          border-bottom-right-radius: 2px;
        }
        
        .wire-right.cut {
          border-top-left-radius: 2px;
          border-bottom-left-radius: 2px;
        }
        
        .cut-mark {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 1.5rem;
        }
        
        .cut-button {
          padding: 0.5rem 1rem;
          background: #333;
          border: 1px solid #555;
          color: #fff;
          cursor: pointer;
          font-family: 'Share Tech Mono', monospace;
          transition: all 0.2s;
        }
        
        .cut-button:hover:not(:disabled) {
          background: #ff4444;
          border-color: #ff4444;
        }
        
        .cut-button:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
        
        /* ===== USERNAME MODULE ===== */
        .username-module {
          text-align: center;
        }
        
        .name-input {
          width: 100%;
          padding: 1rem;
          font-family: 'Orbitron', sans-serif;
          font-size: 1.5rem;
          text-align: center;
          background: #0a0a0f;
          border: 2px solid #444;
          color: #fff;
          text-transform: uppercase;
          letter-spacing: 4px;
          margin-bottom: 1rem;
        }
        
        .name-input:focus {
          outline: none;
          border-color: #ffcc00;
        }
        
        .name-input.correct {
          border-color: #4caf50;
          background: rgba(76, 175, 80, 0.1);
        }
        
        .name-input.wrong {
          border-color: #f44336;
          animation: inputShake 0.5s ease;
        }
        
        @keyframes inputShake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        .submit-btn {
          padding: 0.75rem 2rem;
          background: #4488ff;
          border: none;
          color: #fff;
          font-family: 'Orbitron', sans-serif;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .submit-btn:hover {
          background: #66aaff;
          transform: scale(1.05);
        }
        
        /* ===== KEYPAD MODULE ===== */
        .keypad-module {
          text-align: center;
        }
        
        .keypad-display {
          font-family: 'Orbitron', sans-serif;
          font-size: 2rem;
          padding: 1rem;
          background: #0a0a0f;
          border: 2px solid #444;
          margin-bottom: 1rem;
          color: #4caf50;
          letter-spacing: 8px;
          min-height: 60px;
        }
        
        .keypad-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 0.5rem;
          margin-bottom: 1rem;
        }
        
        .key-btn {
          padding: 1rem;
          font-family: 'Orbitron', sans-serif;
          font-size: 1.2rem;
          background: #1a1a2e;
          border: 1px solid #444;
          color: #fff;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .key-btn:hover {
          background: #ffcc00;
          color: #000;
        }
        
        .keypad-actions {
          display: flex;
          gap: 0.5rem;
        }
        
        .action-btn {
          flex: 1;
          padding: 0.75rem;
          font-family: 'Orbitron', sans-serif;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .action-btn.clear {
          background: #666;
          color: #fff;
        }
        
        .action-btn.submit {
          background: #4caf50;
          color: #fff;
        }
        
        /* ===== WORD BUTTONS MODULE ===== */
        .word-buttons-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
          transition: all 0.2s;
        }
        
        .word-buttons-grid.correct {
          box-shadow: 0 0 20px rgba(76, 175, 80, 0.5);
        }
        
        .word-buttons-grid.wrong {
          box-shadow: 0 0 20px rgba(244, 67, 54, 0.5);
        }
        
        .word-btn {
          padding: 1rem;
          font-family: 'Orbitron', sans-serif;
          font-size: 1rem;
          background: #2a2a4e;
          border: 2px solid #444;
          color: #fff;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .word-btn:hover:not(:disabled) {
          background: #4488ff;
          border-color: #4488ff;
          transform: scale(1.02);
        }
        
        .word-btn.pressed {
          background: #4caf50;
          border-color: #4caf50;
          color: #000;
          cursor: default;
          opacity: 0.7;
        }
        
        .word-btn:disabled {
          cursor: default;
        }
        
        /* ===== SYMBOL MODULE ===== */
        .symbol-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.75rem;
        }
        
        .symbol-btn {
          padding: 1.5rem 1rem;
          background: #2a2a4e;
          border: 2px solid #444;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }
        
        .symbol-btn:hover {
          background: #4488ff;
          border-color: #4488ff;
          transform: scale(1.05);
        }
        
        .symbol-emoji {
          font-size: 2.5rem;
        }
        
        .symbol-pos {
          font-size: 0.8rem;
          color: #888;
        }
        
        /* ===== SWITCHBOARD MODULE ===== */
        .switch-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }
        
        .switch-btn {
          padding: 1.5rem;
          border: 3px solid transparent;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }
        
        .switch-btn:hover {
          transform: scale(1.05);
        }
        
        .switch-btn.solved {
          border-color: #4caf50 !important;
        }
        
        .switch-arrow {
          font-size: 2.5rem;
          color: #fff;
          text-shadow: 0 2px 4px rgba(0,0,0,0.5);
        }
        
        .switch-label {
          font-size: 0.8rem;
          color: rgba(255,255,255,0.8);
          font-family: 'Orbitron', sans-serif;
        }
        
        .switchboard-submit {
          margin-top: 1rem;
          width: 100%;
        }
        
        /* ===== MONSTER LAB MODULE ===== */
        .monster-lab-module {
          text-align: center;
        }
        
        .monster-display {
          padding: 1.5rem;
          border-radius: 16px;
          margin-bottom: 1rem;
          position: relative;
          min-height: 150px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          border: 3px solid rgba(255,255,255,0.3);
        }
        
        /* Image-based monster display */
        .monster-display.monster-images {
          background: transparent;
          border: none;
          min-height: 200px;
          position: relative;
        }
        
        .monster-display.monster-images .monster-legs {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 180px;
          height: auto;
          z-index: 1;
        }
        
        .monster-display.monster-images .monster-body {
          position: relative;
          z-index: 2;
          width: 150px;
          height: auto;
          margin-bottom: 30px;
        }
        
        .monster-eyes {
          font-size: 2rem;
          letter-spacing: 0.3rem;
        }
        
        .monster-face {
          font-size: 2.5rem;
        }
        
        .monster-arms {
          display: flex;
          justify-content: center;
          gap: 3rem;
          font-size: 2rem;
        }
        
        .monster-arms .arm {
          display: inline-block;
        }
        
        .monster-arms .arm.left {
          transform: scaleX(-1);
        }
        
        .monster-label {
          margin-top: 0.5rem;
          font-size: 0.75rem;
          color: rgba(255,255,255,0.9);
          font-family: 'Share Tech Mono', monospace;
          background: rgba(0,0,0,0.3);
          padding: 0.25rem 0.75rem;
          border-radius: 4px;
        }
        
        .monster-names {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
        }
        
        .name-btn {
          padding: 1rem;
          font-family: 'Orbitron', sans-serif;
          font-size: 1.1rem;
          background: #2a2a4e;
          border: 2px solid #444;
          color: #fff;
          cursor: pointer;
          transition: all 0.2s;
          border-radius: 8px;
        }
        
        .name-btn:hover {
          background: #4488ff;
          border-color: #4488ff;
          transform: scale(1.02);
        }
        
        /* ===== GUESS WHO MODULE ===== */
        .guess-who-module {
          text-align: center;
        }
        
        .person-display {
          background: linear-gradient(180deg, #87CEEB 0%, #B0E0E6 100%);
          border-radius: 16px;
          padding: 1.5rem;
          margin-bottom: 1rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          border: 3px solid rgba(255,255,255,0.3);
          min-height: 180px;
        }
        
        .person-hair {
          width: 100px;
          height: 35px;
          border-radius: 50px 50px 0 0;
          margin-bottom: -10px;
        }
        
        .person-face {
          width: 90px;
          height: 100px;
          background: #FDBF6F;
          border-radius: 45px 45px 35px 35px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.25rem;
          border: 2px solid rgba(0,0,0,0.1);
        }
        
        .person-eyes {
          display: flex;
          gap: 20px;
          margin-top: 10px;
        }
        
        .person-eye {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          border: 2px solid #000;
        }
        
        .person-nose {
          font-size: 1rem;
          margin: 2px 0;
        }
        
        .person-mouth {
          font-size: 1rem;
        }
        
        .person-traits {
          display: flex;
          justify-content: center;
          gap: 1.5rem;
          margin-bottom: 1rem;
          font-family: 'Share Tech Mono', monospace;
          font-size: 0.9rem;
        }
        
        .trait {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(0,0,0,0.3);
          padding: 0.4rem 0.8rem;
          border-radius: 4px;
        }
        
        .trait-dot {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.5);
        }
        
        .agent-buttons {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
        }
        
        .agent-btn {
          padding: 0.75rem;
          font-family: 'Orbitron', sans-serif;
          font-size: 0.85rem;
          background: #2a2a4e;
          border: 2px solid #444;
          color: #fff;
          cursor: pointer;
          transition: all 0.2s;
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
        }
        
        .agent-btn:hover {
          background: #4488ff;
          border-color: #4488ff;
          transform: scale(1.02);
        }
        
        .agent-emoji {
          font-size: 1.5rem;
        }
        
        .agent-name {
          font-size: 0.75rem;
        }
        
        .guess-who-table {
          font-size: 0.7rem;
        }
        
        .guess-who-table th, .guess-who-table td {
          padding: 0.3rem 0.4rem;
        }
        
        /* ===== WORLD CLOCK MODULE ===== */
        .world-clock-module {
          text-align: center;
        }
        
        .module-hint-small {
          font-size: 0.75rem;
          color: #888;
          margin-top: -0.5rem;
        }
        
        .home-clock-display {
          background: #000;
          border: 3px solid #4caf50;
          border-radius: 12px;
          padding: 1rem 1.5rem;
          margin-bottom: 1rem;
          display: inline-block;
        }
        
        .home-city-name {
          font-family: 'Orbitron', sans-serif;
          font-size: 0.9rem;
          color: #4caf50;
          margin-bottom: 0.25rem;
        }
        
        .home-time {
          font-family: 'Orbitron', sans-serif;
          font-size: 1.8rem;
          color: #4caf50;
          letter-spacing: 0.1rem;
        }
        
        .clocks-row {
          display: flex;
          justify-content: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        
        .clocks-row.correct {
          animation: successPulse 0.5s ease;
        }
        
        @keyframes successPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        
        .clock-container {
          cursor: pointer;
          user-select: none;
        }
        
        .clock-container:hover .clock-face {
          border-color: #4488ff;
        }
        
        .analog-clock {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
        }
        
        .analog-clock.world-clock .clock-label {
          font-family: 'Orbitron', sans-serif;
          font-size: 0.7rem;
          color: #888;
          max-width: 80px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .clock-face {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: linear-gradient(145deg, #2a2a4e, #1a1a2e);
          border: 3px solid #444;
          position: relative;
          box-shadow: inset 0 2px 10px rgba(0,0,0,0.5);
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        
        .hour-marker {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
        }
        
        .marker-dot {
          position: absolute;
          width: 4px;
          height: 4px;
          background: #666;
          border-radius: 50%;
          top: 6px;
          left: 50%;
          transform: translateX(-50%);
        }
        
        .clock-hand {
          position: absolute;
          bottom: 50%;
          left: 50%;
          transform-origin: bottom center;
          border-radius: 2px;
          transition: transform 0.15s ease;
        }
        
        .hour-hand {
          width: 4px;
          height: 22px;
          background: #fff;
          margin-left: -2px;
        }
        
        .minute-hand {
          width: 2px;
          height: 30px;
          background: #4caf50;
          margin-left: -1px;
        }
        
        .clock-center {
          position: absolute;
          width: 8px;
          height: 8px;
          background: #ff9800;
          border-radius: 50%;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
        
        .clock-time-display {
          font-family: 'Share Tech Mono', monospace;
          font-size: 0.65rem;
          color: #666;
          margin-top: 0.25rem;
        }
        
        .world-clock-submit {
          margin-top: 1rem;
          width: 100%;
        }
        
        .clocks-row.wrong {
          animation: shake 0.3s ease;
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        /* ===== VENDING MACHINE MODULE ===== */
        .vending-machine-module {
          text-align: center;
        }
        
        .vending-display {
          background: linear-gradient(180deg, #1a1a3e 0%, #0d0d1a 100%);
          border: 4px solid #444;
          border-radius: 16px;
          padding: 1rem;
          box-shadow: inset 0 4px 20px rgba(0,0,0,0.5);
        }
        
        .vending-items {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
        }
        
        .vending-item {
          background: linear-gradient(145deg, #2a2a4e, #1a1a2e);
          border: 2px solid #444;
          border-radius: 12px;
          padding: 1rem 0.5rem;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
        }
        
        .vending-item:hover {
          border-color: #4488ff;
          transform: scale(1.03);
          box-shadow: 0 0 15px rgba(68, 136, 255, 0.3);
        }
        
        .vending-item:active {
          transform: scale(0.98);
        }
        
        .item-emoji {
          font-size: 2rem;
        }
        
        .item-name {
          font-family: 'Orbitron', sans-serif;
          font-size: 0.8rem;
          color: #fff;
        }
        
        .item-price {
          font-family: 'Share Tech Mono', monospace;
          font-size: 1rem;
          color: #4caf50;
          font-weight: bold;
        }
        
        /* ===== COMBINATION LOCK MODULE ===== */
        .combination-lock-module {
          text-align: center;
        }
        
        .locker-number {
          font-family: 'Orbitron', sans-serif;
          font-size: 0.9rem;
          color: #888;
          margin-bottom: 2rem;
        }
        
        .locker-id {
          font-size: 1.2rem;
          color: #4caf50;
          font-weight: bold;
          letter-spacing: 2px;
        }
        
        .lock-body {
          position: relative;
          display: inline-block;
          background: linear-gradient(180deg, #555 0%, #333 100%);
          border-radius: 12px;
          padding: 1.5rem 2rem 1rem;
          margin-bottom: 1rem;
          box-shadow: 0 4px 15px rgba(0,0,0,0.5);
        }
        
        .lock-body.open {
          background: linear-gradient(180deg, #4a7c4a 0%, #2d5a2d 100%);
        }
        
        /* Shackle */
        .shackle {
          position: absolute;
          top: -25px;
          left: 50%;
          transform: translateX(-50%);
          transition: transform 0.3s ease;
        }
        
        .shackle.open {
          transform: translateX(-50%) translateY(-30px) rotate(-30deg);
          transform-origin: right bottom;
        }
        
        .shackle-top {
          width: 50px;
          height: 12px;
          background: linear-gradient(180deg, #888 0%, #666 100%);
          border-radius: 6px 6px 0 0;
          margin-left: 6px;
        }
        
        .shackle-left, .shackle-right {
          position: absolute;
          width: 12px;
          height: 35px;
          background: linear-gradient(90deg, #888 0%, #666 100%);
        }
        
        .shackle-left {
          left: 6px;
          top: 8px;
          border-radius: 0 0 6px 6px;
        }
        
        .shackle-right {
          right: 0;
          top: 8px;
          border-radius: 0 0 6px 6px;
        }
        
        /* Lock face and dial */
        .lock-face {
          position: relative;
          width: 140px;
          height: 140px;
          margin: 0 auto;
        }
        
        .dial {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: linear-gradient(145deg, #222 0%, #111 100%);
          border: 4px solid #444;
          transition: transform 0.15s ease-out;
        }
        
        .dial-mark {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
        }
        
        .mark-line {
          position: absolute;
          top: 4px;
          left: 50%;
          width: 2px;
          height: 8px;
          background: #666;
          transform: translateX(-50%);
        }
        
        .mark-line.major {
          height: 12px;
          width: 3px;
          background: #999;
        }
        
        .mark-number {
          position: absolute;
          top: 18px;
          left: 50%;
          transform: translateX(-50%);
          font-family: 'Share Tech Mono', monospace;
          font-size: 0.65rem;
          color: #999;
        }
        
        .dial-center {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 50px;
          height: 50px;
          background: linear-gradient(145deg, #333 0%, #222 100%);
          border-radius: 50%;
          border: 2px solid #555;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .current-number {
          font-family: 'Orbitron', sans-serif;
          font-size: 1.2rem;
          color: #4caf50;
          font-weight: bold;
        }
        
        .dial-indicator {
          position: absolute;
          top: -8px;
          left: 50%;
          transform: translateX(-50%);
          color: #ff5722;
          font-size: 1rem;
          z-index: 10;
        }
        
        /* Stage indicators */
        .stage-indicators {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
          margin-top: 0.75rem;
        }
        
        .stage-dot {
          font-size: 0.8rem;
          color: #444;
          transition: color 0.3s;
        }
        
        .stage-dot.active {
          color: #4caf50;
        }
        
        /* Unlock button */
        .unlock-btn {
          width: 100%;
          padding: 0.75rem 1rem;
          margin-bottom: 0.75rem;
          font-family: 'Orbitron', sans-serif;
          font-size: 1rem;
          background: #2a2a4e;
          border: 2px solid #444;
          color: #fff;
          cursor: pointer;
          border-radius: 8px;
          transition: background 0.2s, border-color 0.2s;
        }
        
        .unlock-btn:hover:not(:disabled):not(.error) {
          background: #4488ff;
          border-color: #4488ff;
        }
        
        .unlock-btn.open {
          background: #4caf50 !important;
          border-color: #4caf50 !important;
          cursor: default;
        }
        
        .unlock-btn.error {
          background: #f44336 !important;
          border-color: #f44336 !important;
        }
        
        /* Turn controls */
        .turn-controls {
          display: flex;
          justify-content: center;
          gap: 0.75rem;
        }
        
        .turn-btn {
          padding: 0.5rem 0.75rem;
          font-family: 'Orbitron', sans-serif;
          font-size: 0.7rem;
          background: #2a2a4e;
          border: 2px solid #444;
          color: #fff;
          cursor: pointer;
          border-radius: 8px;
          transition: all 0.2s;
          user-select: none;
          line-height: 1.3;
          min-width: 80px;
        }
        
        .turn-btn.reset {
          padding: 0.5rem 0.75rem;
          font-size: 1.2rem;
          min-width: auto;
        }
        
        .turn-btn:hover:not(:disabled) {
          border-color: #4488ff;
        }
        
        .turn-btn.reset:hover:not(:disabled) {
          border-color: #ff5722;
          color: #ff5722;
        }
        
        .turn-btn.active {
          background: #4488ff;
          border-color: #4488ff;
        }
        
        .turn-btn.left.active {
          background: #ff9800;
          border-color: #ff9800;
        }
        
        .turn-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        /* ===== SYMBOL KEYPAD MODULE ===== */
        .symbol-keypad-module {
          text-align: center;
        }
        
        .symbol-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          max-width: 220px;
          margin: 0 auto 1.5rem;
        }
        
        .symbol-btn {
          width: 90px;
          height: 90px;
          font-size: 2.5rem;
          background: linear-gradient(145deg, #2a2a4e, #1a1a2e);
          border: 3px solid #444;
          border-radius: 12px;
          color: #fff;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Orbitron', sans-serif;
        }
        
        .symbol-btn:hover:not(:disabled) {
          border-color: #4488ff;
          transform: scale(1.05);
          box-shadow: 0 0 15px rgba(68, 136, 255, 0.3);
        }
        
        .symbol-btn.pressed {
          background: linear-gradient(145deg, #1a3a1a, #0d2a0d);
          border-color: #4caf50;
          color: #4caf50;
          cursor: default;
        }
        
        .symbol-btn:disabled {
          opacity: 0.7;
        }
        
        .press-order {
          display: flex;
          justify-content: center;
          gap: 0.75rem;
          font-size: 1.5rem;
        }
        
        .order-dot {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #1a1a2e;
          border: 2px solid #333;
          border-radius: 8px;
          color: #555;
          font-family: 'Orbitron', sans-serif;
        }
        
        .order-dot.filled {
          color: #4caf50;
          border-color: #4caf50;
        }
        
        /* Big Button Module */
        .big-button-module {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }
        
        .button-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }
        
        .big-button {
          width: 150px;
          height: 150px;
          border-radius: 50%;
          border: 6px solid #333;
          font-family: 'Orbitron', sans-serif;
          font-size: 1.2rem;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
          user-select: none;
        }
        
        .big-button:hover {
          transform: scale(1.05);
        }
        
        .big-button.holding {
          transform: scale(0.95);
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
        }
        
        .color-strip {
          width: 200px;
          height: 50px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 3px solid #333;
          animation: stripPulse 0.5s infinite alternate;
        }
        
        @keyframes stripPulse {
          from { opacity: 0.8; }
          to { opacity: 1; }
        }
        
        .strip-timer {
          font-family: 'Orbitron', sans-serif;
          font-size: 1.5rem;
          font-weight: bold;
          color: #333;
          text-shadow: 1px 1px 0 rgba(255,255,255,0.5);
        }
        
        /* Crack the Code Module */
        .crack-code-module {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }
        
        .code-clues {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          background: #1a1a2e;
          padding: 0.75rem;
          border-radius: 8px;
          border: 2px solid #333;
        }
        
        .clue-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .row-label {
          font-family: 'Orbitron', sans-serif;
          font-size: 0.9rem;
          font-weight: bold;
          color: #4488ff;
          width: 20px;
        }
        
        .row-digits {
          display: flex;
          gap: 0.3rem;
        }
        
        .clue-digit {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #333;
          border: 2px solid #555;
          border-radius: 6px;
          font-family: 'Orbitron', sans-serif;
          font-size: 1.1rem;
          font-weight: bold;
          color: #fff;
        }
        
        .drum-container {
          display: flex;
          gap: 0.5rem;
        }
        
        .drum {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
        }
        
        .drum-btn {
          width: 50px;
          height: 30px;
          background: linear-gradient(145deg, #2a2a4e, #1a1a2e);
          border: 2px solid #444;
          border-radius: 6px;
          color: #4488ff;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .drum-btn:hover:not(:disabled) {
          border-color: #4488ff;
          background: linear-gradient(145deg, #3a3a5e, #2a2a3e);
        }
        
        .drum-btn:disabled {
          opacity: 0.5;
          cursor: default;
        }
        
        .drum-display {
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #000;
          border: 3px solid #4488ff;
          border-radius: 8px;
          font-family: 'Orbitron', sans-serif;
          font-size: 1.8rem;
          font-weight: bold;
          color: #0f0;
          text-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
        }
        
        /* Memory Module */
        .memory-module {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }
        
        .memory-display {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }
        
        .stage-indicator {
          font-family: 'Orbitron', sans-serif;
          font-size: 0.9rem;
          color: #888;
        }
        
        .display-number {
          width: 100px;
          height: 80px;
          background: #000;
          border: 4px solid #333;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Orbitron', sans-serif;
          font-size: 3rem;
          font-weight: bold;
          color: #ff0;
          text-shadow: 0 0 20px rgba(255, 255, 0, 0.5);
        }
        
        .memory-buttons {
          display: flex;
          gap: 0.5rem;
        }
        
        .memory-btn {
          width: 60px;
          height: 60px;
          font-family: 'Orbitron', sans-serif;
          font-size: 1.5rem;
          font-weight: bold;
          background: linear-gradient(145deg, #2a2a4e, #1a1a2e);
          border: 3px solid #444;
          border-radius: 8px;
          color: #fff;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .memory-btn:hover {
          border-color: #4488ff;
          transform: scale(1.05);
        }
        
        .position-labels {
          display: flex;
          gap: 0.5rem;
          width: 268px;
          justify-content: space-around;
          font-family: 'Orbitron', sans-serif;
          font-size: 0.6rem;
          color: #666;
        }
        
        .position-labels span {
          width: 60px;
          text-align: center;
        }
        
        .stage-dots {
          display: flex;
          gap: 0.5rem;
        }
        
        .stage-dot {
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #1a1a2e;
          border: 2px solid #333;
          border-radius: 50%;
          font-size: 0.9rem;
          color: #555;
        }
        
        .stage-dot.active {
          border-color: #4488ff;
          color: #4488ff;
        }
        
        .stage-dot.complete {
          border-color: #4caf50;
          color: #4caf50;
        }
        
        /* Column chart in manual */
        .column-chart table {
          width: 100%;
          font-size: 1rem;
        }
        
        .column-chart th {
          background: #2a2a4e;
          padding: 0.3rem;
          font-size: 0.7rem;
        }
        
        .column-chart td {
          padding: 0.3rem;
          text-align: center;
          font-size: 1rem;
        }
        
        /* ===== PROGRESS BAR ===== */
        .progress-bar {
          height: 40px;
          background: #0a0a0f;
          border-radius: 20px;
          position: relative;
          overflow: hidden;
          border: 2px solid #333;
        }
        
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #4caf50, #8bc34a);
          transition: width 0.5s ease;
          border-radius: 18px;
        }
        
        .progress-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-family: 'Orbitron', sans-serif;
          font-size: 0.9rem;
          color: #fff;
          text-shadow: 0 1px 3px rgba(0,0,0,0.8);
        }
        
        /* ===== MANUAL ===== */
        .manual-container {
          padding: 1.5rem;
        }
        
        .manual-header {
          text-align: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #4488ff;
        }
        
        .manual-header h2 {
          font-family: 'Orbitron', sans-serif;
          color: #4488ff;
        }
        
        .manual-subtitle {
          color: #ff4444;
          font-size: 0.8rem;
          margin-top: 0.5rem;
          letter-spacing: 2px;
        }
        
        .manual-tabs {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
        }
        
        .manual-tab {
          padding: 0.75rem 1rem;
          background: #1a1a2e;
          border: 1px solid #333;
          font-size: 1.5rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .manual-tab.active {
          background: #4488ff;
          border-color: #4488ff;
        }
        
        .manual-section h3 {
          font-family: 'Orbitron', sans-serif;
          color: #ffcc00;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #333;
        }
        
        .level-section {
          margin-bottom: 2rem;
          padding: 1rem;
          background: rgba(0,0,0,0.2);
          border-radius: 8px;
          border-left: 3px solid #4488ff;
        }
        
        .level-section h4 {
          font-family: 'Orbitron', sans-serif;
          color: #4caf50;
          margin-bottom: 0.75rem;
          font-size: 1rem;
        }
        
        .level-section p {
          margin-bottom: 0.5rem;
        }
        
        .level-section .rules-table {
          margin-top: 0.5rem;
          margin-bottom: 1rem;
        }
        
        .rules-list {
          list-style: none;
          padding: 0;
        }
        
        .rules-list li {
          padding: 0.75rem;
          background: rgba(255,255,255,0.03);
          margin-bottom: 0.5rem;
          border-left: 3px solid #4488ff;
          font-size: 0.9rem;
          line-height: 1.5;
        }
        
        .rules-list strong {
          color: #ffcc00;
        }
        
        .name-table {
          font-size: 0.85rem;
        }
        
        .name-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }
        
        .name-cell {
          background: rgba(255,255,255,0.05);
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
        }
        
        .name-cell strong {
          color: #ffcc00;
        }
        
        .difficulty-tag {
          display: inline-block;
          background: linear-gradient(135deg, #2a2a4e, #3a3a5e);
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.75rem;
          color: #ffcc00;
          margin-bottom: 0.75rem;
          border: 1px solid #444;
        }
        
        .manual-intro {
          background: rgba(68, 136, 255, 0.15);
          border-left: 3px solid #4488ff;
          padding: 0.75rem;
          margin-bottom: 1rem;
          font-size: 0.9rem;
          color: #aaccff;
        }
        
        .manual-example {
          background: rgba(76, 175, 80, 0.15);
          border-left: 3px solid #4caf50;
          padding: 0.75rem;
          margin-top: 1rem;
          font-size: 0.85rem;
          color: #a5d6a7;
        }
        
        .example-small {
          display: block;
          font-size: 0.8rem;
          color: #888;
          margin-top: 0.25rem;
        }
        
        .example-small strong, .manual-example strong {
          font-family: 'Fira Code', monospace;
          letter-spacing: 1px;
        }
        
        .serial-legend {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
          padding: 0.5rem;
          background: rgba(0,0,0,0.3);
          border-radius: 4px;
          font-size: 0.8rem;
          justify-content: center;
        }
        
        .serial-legend span {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }
        
        .legend-letter {
          color: #bb86fc;
          font-family: 'Fira Code', monospace;
          font-weight: bold;
        }
        
        .legend-number {
          color: #ff9800;
          font-family: 'Fira Code', monospace;
          font-weight: bold;
        }
        
        /* Muted colors for examples - less distracting */
        .example-small .legend-letter {
          color: #8b6cb0;
          font-weight: normal;
        }
        
        .example-small .legend-number {
          color: #b07850;
          font-weight: normal;
        }
        
        .keypad-layout {
          display: flex;
          gap: 1rem;
        }
        
        .cipher-chart {
          display: flex;
          gap: 0.5rem;
          background: rgba(0,0,0,0.3);
          padding: 0.75rem;
          border-radius: 8px;
          border: 1px solid #444;
          flex-shrink: 0;
        }
        
        .cipher-column {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
          font-family: 'Fira Code', monospace;
          font-size: 0.75rem;
        }
        
        .cipher-column div {
          padding: 0.15rem 0.3rem;
          background: rgba(255,255,255,0.05);
          border-radius: 2px;
          white-space: nowrap;
        }
        
        .keypad-rules {
          flex: 1;
          min-width: 0;
        }
        
        .keypad-rules .rules-table td:first-child {
          width: 100px;
          vertical-align: top;
        }
        
        @media (max-width: 600px) {
          .keypad-layout {
            flex-direction: column;
          }
          
          .cipher-chart {
            flex-direction: row;
            justify-content: center;
          }
        }
        
        .rules-table, .lookup-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.85rem;
        }
        
        .rules-table td, .lookup-table td, .lookup-table th {
          padding: 0.75rem;
          border: 1px solid #333;
        }
        
        .rules-table td:first-child {
          color: #ffcc00;
          white-space: nowrap;
        }
        
        .lookup-table th {
          background: #1a1a2e;
          color: #888;
          font-weight: normal;
        }
        
        .row-red td:first-child { color: #e53935; }
        .row-blue td:first-child { color: #1e88e5; }
        .row-yellow td:first-child { color: #fdd835; }
        .row-green td:first-child { color: #43a047; }
        
        /* ===== GAME OVER SCREENS ===== */
        .game-over-screen {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 2rem;
          position: relative;
          overflow: hidden;
        }
        
        .game-over-screen.win {
          background: radial-gradient(circle at center, #1a3a1a 0%, #0a0a0f 70%);
        }
        
        .game-over-screen.lose {
          background: radial-gradient(circle at center, #3a1a1a 0%, #0a0a0f 70%);
        }
        
        .game-over-screen h1 {
          font-family: 'Orbitron', sans-serif;
          font-size: clamp(2rem, 6vw, 4rem);
          margin-bottom: 1rem;
        }
        
        .win h1 {
          color: #4caf50;
          text-shadow: 0 0 30px rgba(76, 175, 80, 0.5);
        }
        
        .lose h1 {
          color: #f44336;
          text-shadow: 0 0 30px rgba(244, 67, 54, 0.5);
        }
        
        .result-time, .result-reason {
          font-size: 1.5rem;
          color: #ffcc00;
          margin-bottom: 0.5rem;
        }
        
        .result-message {
          color: #888;
          margin-bottom: 2rem;
          max-width: 400px;
        }
        
        .play-again-btn {
          padding: 1rem 3rem;
          font-family: 'Orbitron', sans-serif;
          font-size: 1.2rem;
          background: linear-gradient(135deg, #4488ff, #66aaff);
          border: none;
          color: #fff;
          cursor: pointer;
          transition: all 0.3s;
          position: relative;
          z-index: 10;
        }
        
        .play-again-btn:hover {
          transform: scale(1.05);
          box-shadow: 0 0 30px rgba(68, 136, 255, 0.5);
        }
        
        .confetti {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          background-image: 
            radial-gradient(circle, #4caf50 2px, transparent 2px),
            radial-gradient(circle, #ffcc00 2px, transparent 2px),
            radial-gradient(circle, #4488ff 2px, transparent 2px);
          background-size: 60px 60px, 80px 80px, 100px 100px;
          background-position: 0 0, 30px 30px, 60px 10px;
          animation: confettiFall 3s linear infinite;
          opacity: 0.3;
        }
        
        @keyframes confettiFall {
          0% { background-position: 0 0, 30px 30px, 60px 10px; }
          100% { background-position: 0 200px, 30px 230px, 60px 210px; }
        }
        
        .explosion-effect {
          position: absolute;
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(255, 100, 0, 0.3) 0%, transparent 70%);
          animation: explosionPulse 2s ease-in-out infinite;
          pointer-events: none;
        }
        
        @keyframes explosionPulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.5); opacity: 0.2; }
        }
        
        /* ===== BACK BUTTON ===== */
        .back-btn {
          position: fixed;
          top: 1rem;
          left: 1rem;
          padding: 0.5rem 1rem;
          background: transparent;
          border: 1px solid #666;
          color: #888;
          font-family: 'Share Tech Mono', monospace;
          cursor: pointer;
          z-index: 100;
          transition: all 0.2s;
        }
        
        .back-btn:hover {
          border-color: #fff;
          color: #fff;
        }
        
        /* ===== RESPONSIVE ===== */
        @media (max-width: 768px) {
          .bomb-header {
            flex-direction: column;
            text-align: center;
          }
          
          .timer-display {
            font-size: 2rem;
          }
          
          .modules-grid {
            grid-template-columns: 1fr;
          }
          
          .manual-overlay {
            width: 100%;
          }
        }
      `}</style>
      
      {/* Menu Screen */}
      {screen === 'menu' && (
        <div className="menu-screen">
          <div className="bomb-icon">💣</div>
          <h1 className="game-title">ESL BOMB SQUAD</h1>
          <p className="game-subtitle">Communication Under Pressure</p>
          <p className="game-version">v2025.12.14.1000</p>
          <div className="menu-buttons">
            <button className="menu-btn primary" onClick={() => setScreen('playerid-defuser')}>
              🎮 DEFUSER MODE
            </button>
            <button className="menu-btn secondary" onClick={() => setScreen('playerid-expert')}>
              📖 EXPERT MANUAL
            </button>
            <button className="menu-btn tertiary" onClick={() => setScreen('howtoplay')}>
              ❓ 遊戲說明 HOW TO PLAY
            </button>
          </div>
        </div>
      )}
      
      {/* Player ID Screen - Defuser */}
      {screen === 'playerid-defuser' && (
        <PlayerIdScreen 
          role="defuser"
          onSubmit={(id) => {
            setPlayerId(id);
            setScreen('settings');
          }}
          onBack={() => setScreen('menu')}
        />
      )}
      
      {/* Player ID Screen - Expert */}
      {screen === 'playerid-expert' && (
        <PlayerIdScreen 
          role="expert"
          onSubmit={(id) => {
            setPlayerId(id);
            setScreen('manual-only');
          }}
          onBack={() => setScreen('menu')}
        />
      )}
      
      {/* How to Play Screen */}
      {screen === 'howtoplay' && (
        <div className="howtoplay-screen">
          <button className="back-btn" onClick={() => setScreen('menu')}>← Back</button>
          
          <h1 className="howtoplay-title">🎮 遊戲說明 How to Play</h1>
          
          <div className="howtoplay-section">
            <h2>🎯 目標 Goal</h2>
            <p className="chinese">拆彈員和專家必須合作，在時間內拆除炸彈！</p>
            <p className="english">The Defuser and Expert must work together to defuse the bomb before time runs out!</p>
          </div>
          
          <div className="howtoplay-roles">
            <div className="role-card defuser">
              <h3>🎮 拆彈員 Defuser</h3>
              <ul>
                <li>看著炸彈畫面</li>
                <li>Sees the bomb screen</li>
                <li>只能看到模組，但不知道怎麼解</li>
                <li>Can see the modules, but doesn't know how to solve them</li>
                <li>必須向專家描述你看到的東西</li>
                <li>Must describe what you see to the Expert</li>
              </ul>
            </div>
            
            <div className="role-card expert">
              <h3>📖 專家 Expert</h3>
              <ul>
                <li>看著手冊（英文）</li>
                <li>Looks at the manual (in English)</li>
                <li>知道怎麼解，但看不到炸彈</li>
                <li>Knows how to solve it, but can't see the bomb</li>
                <li>必須用英文告訴拆彈員該怎麼做</li>
                <li>Must tell the Defuser what to do in English</li>
              </ul>
            </div>
          </div>
          
          <div className="howtoplay-section rules">
            <h2>📋 規則 Rules</h2>
            <div className="rules-list">
              <p>❌ <span className="chinese">不能互看螢幕！</span><span className="english">No looking at each other's screens!</span></p>
              <p>💬 <span className="chinese">必須用英文溝通！</span><span className="english">Must communicate in English!</span></p>
              <p>⏱️ <span className="chinese">時間到就爆炸！</span><span className="english">When time runs out, BOOM!</span></p>
              <p>❌❌❌ <span className="chinese">三次錯誤就爆炸！</span><span className="english">Three strikes and it explodes!</span></p>
            </div>
          </div>
          
          <button className="menu-btn primary" onClick={() => setScreen('menu')}>
            👍 了解！Got it!
          </button>
        </div>
      )}
      
      {/* Settings Screen */}
      {screen === 'settings' && (
        <div>
          <button className="back-btn" onClick={() => setScreen('playerid-defuser')}>← Back</button>
          <SettingsPanel 
            key={gameKey}
            config={config}
            setConfig={setConfig}
            onStartGame={(gameConfig) => handleStartGame(gameConfig)}
            previousConfig={lastConfig}
          />
        </div>
      )}
      
      {/* Playing Screen */}
      {screen === 'playing' && config && (
        <div className="game-layout">
          <button 
            className="manual-toggle"
            onClick={() => setShowManual(!showManual)}
          >
            {showManual ? '✕ Close Manual' : '📖 Show Manual'}
          </button>
          
          <div className="defuser-view">
            <Bomb 
              key={gameKey}
              config={config}
              onGameEnd={handleGameEnd}
              onAbort={resetGame}
            />
          </div>
          
          <div className={`manual-overlay ${showManual ? 'visible' : ''}`}>
            <ExpertManual />
          </div>
        </div>
      )}
      
      {/* Manual Only Screen */}
      {screen === 'manual-only' && (
        <div>
          <button className="back-btn" onClick={() => setScreen('playerid-expert')}>← Back</button>
          <ExpertManual />
        </div>
      )}
      
      {/* Report Screen */}
      {screen === 'report' && gameReport && (
        <ReportScreen 
          gameReport={gameReport}
          onPlayAgain={playAgain}
          onBackToMenu={resetGame}
        />
      )}
    </div>
  );
}
