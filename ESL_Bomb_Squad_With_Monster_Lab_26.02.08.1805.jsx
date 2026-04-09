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

// ===== MONSTER LAB MODULE =====
// Monster images embedded as base64 data URIs
const monsterImages = {
  bodies: {
    "hairy_1": "data:image/png;base64,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",
    "robot_1": "data:image/png;base64,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",
    "tentacles_1": "data:image/png;base64,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",
  },
  legs: {
    "hairy": "data:image/png;base64,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",
    "robot": "data:image/png;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8LCwkMEQ8SEhEPERETFhwXExQaFRERGCEYGh0dHx8fExciJCIeJBweHx7/2wBDAQUFBQcGBw4ICA4eFBEUHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCAIvBAADASIAAhEBAxEB/8QAHQABAAEEAwEAAAAAAAAAAAAAAAEFBgcIAgQJA//EAGIQAAEDAwEEBAcJDAcEBwYEBwEAAgMEBREGBxIhMRNBUWEIFCIycYGRFRZCUlaUobHRFyMzU1VicoKSk8HSCSRDVKKywiU04fBERUZjc6PDJjVkg4TxGCeks9M3ZXR1heL/xAAYAQEBAQEBAAAAAAAAAAAAAAAAAQIDBP/EACMRAQEAAgEFAAMBAQEAAAAAAAABAhEhEhMxQVEDMmEiQnH/2gAMAwEAAhEDEQA/ANykARAgFFKjKAmEU4QQgU4RBGEKnChAwhUnkiCMJhSmEEIQpUYQEARSgjCBThEEYTCJhAQKVGEBMKcIOSAmETCCMIpRAwowpRARECAiIghSiYQEwhRAwmERATCIgjClEQEwiIGFClEDChThEDCJhEDCYREEYQKcIgjCnCJhBGEKnCIIwpREDCgqUQMJhMIggKURAUKUQQinCYQMJhEQMJhEQCiYRAwiIgYTCYRBGFKIgJhEQMJhMIgJhEQRhThEQDyTCJhAQJhEEYRSiBhDyREEYTCYRARMKUEYTCnCYQRhFKYQRhCpwiCMJhThMIIRMJhAwiKcIIwgClByQQUwmFJQQFOETCBhERAPJQpPJQgIiBAU4UIglEHJEA8kPJEQETCgoCnKIghMqcIghSmEQMplEQFGVKjCCUyiICIiAiIEBByQ8l0ay62yhe2OuuVJSvcMhs07WEjt4lB3kVL98Ng/Lls+dx/anvh0/wDl22fO4/tQVRDyVM98Nh/Lls+dM+1R74bD+XLZ87j+1BVByRUz3w6f/Lls+dx/ao98On/y7bPncf2oKoipfvh0/wDl22fO4/tT3w6f/Lts+dx/agqiKl++HT/5dtnzuP7U98Ng/Lls+dx/agqiKl++LT/5ctfzuP7U98On/wAu2z53H9qCqIqX74dP/l22fO4/tT3w6f8Ay7bPncf2oKoipfvg0/8Aly2fO4/tT3waf/Lls+dx/agqiKl++HT/AOXbZ87j+1PfDp/8u2z53H9qCqJlUv3w6f8Ay7bPncf2odQ6f/Lls+dx/agqiKl++HT/AOXbZ87j+1PfDp/8u2z53H9qCqIeSpfvh0/+XbZ87j+1T74dP/ly2fO4/tQVNFS/fDp/8u2z53H9qe+DT/5ctnzuP7UFURUv3w2H8uWz53H9qe+HT/5dtnzuP7UFUTKpfvg0/wDly2fO4/tT3w6f/Lts+dx/agqiKljUWn/y5bPncf2p74dP/l22fO4/tQVRFTPfDp/8uWz53H9qj3xaf/Lls+dM+1BVEVL98Nh/Lls+dx/ap98On/y5bPncf2oKmipfvi0/+XLZ86Z9qe+Gwfly2fO4/tQVRFS/fDp/8u2z53H9qe+HT/5dtnzuP7UFURUv3w6f/Lts+dx/anvh0/8Al22fO4/tQVRFS/fDp/8ALts+dx/anvh0/wDl22fO4/tQVRMql++HT/5dtnzuP7U98Ng/Lls+dx/agqiKl++HT/5dtnzuP7U98Ng/Lls+dx/agqiKl++HT/5dtnzuP7U98Ng/Lls+dx/agqiKme+HT/5ctnzuP7VHvh0/+XbZ87j+1BVEVL98On/y7bPncf2p74dP/l22fO4/tQVTKKl++DT/AOXLZ87j+1PfDYPy5bPncf2oKoipfvh0/wDl22fO4/tT3w6f/Lts+dx/agqiKl++HT/5dtnzuP7U98On/wAu2z53H9qCqHkipfvh0/8Al22fO4/tT3w2D8uWz53H9qCqJlUv3xaf/Llr+dx/anvg0/8Aly2fO4/tQVRFS/fDp/8ALts+dx/anvi0/wDly1/O4/tQVRFS/fDp/wDLts+dx/anvh0/+XbZ87j+1BVEPJUv3xaf/Llr+dx/anvi0/8Aly1/O4/tQVRFS/fFp/8ALlr+dx/anvi0/wDly1/O4/tQVRF0aK62yue6OhuVHVPA3i2GdryBnGcAntXdBQSiIOSAoUqEEnkiIgDkmUUIGUUoOSAoKlEBERAREQFClEBEHJEBERAREQCoUlQgIiIJUIFKAiYRAREQETCICIiAiIgIiYQEREBERATCIgIiICIiCHeavLHwhai6Xzb7qttRJJV1TrxLSQAnjutfuRsGeWAAF6ndS8utqLt3wlb87s1Q4/8A6gIm9Oqdhm1Zv/Y2r/fw/wA6fcN2rfI6q/fw/wA63nmvlt6V/wB+f5x+Ae1fL3etv45/7BXXocu7Wj33Ddq3yNqv38P86fcM2rfI6q/fw/zreAX62/jH/sFT7u238Y/9gqdB3a0e+4btW+RtV+/h/nUfcN2rfI2q/fw/zreL3dtv4x/7BUe7tt/GP/dFOg7taPfcN2rfI2q/fw/zp9w3at8jqr9/D/Ot4fd22/jH/sFPd22/jH/uynQd2tH/ALhm1X5HVX7+H+dR9w3ar8jqr9/D/Ot4fd22/jH/ALsqPd62/jn/ALBToTu1pB9w3at8jqr9/D/On3DNq3yOqv38P863gN9tv45/7BQX62/jH/sFOg7taP8A3DNq3yOqv38P86fcM2rfI6q/fw/zreD3etv45/7BT3etv45/7BToO7Wj/wBwzat8jqr9/D/On3DNq3yOqv38P863h93rb+Mf+7Kj3etv4yT9gp0HdrR/7hm1b5HVX7+H+dR9w3ar8jqr9/D/ADreH3etf4x/7sp7v238c/8AdlOg7taPfcN2q/I6q/fw/wA6n7hm1b5HVX7+H+dbw+71t/HP/YKe79t/HP8A3ZToO7Wj33C9q3yNq/38P86fcN2rfI6q/fw/zreD3etv45/7BT3ftv4x/wCwU6Du1o99w3at8jar9/D/ADp9wzat8jav9/D/ADreH3etv4x/7op7vW38ZL+wU6F7taP/AHDdq3yOqv38P86j7hu1X5HVX7+H+dbw+71t/GP/AHZT3dtv4x/7BToTu1o99w3at8jar9/D/On3Ddq3yNqv38P863i93rb+Mf8Auynu7bfxj/2CnQd2tHfuG7VvkbVfv4f50+4btW+R1V+/h/nW8Zv1t/GP/YKj3dtv45/7BToO7Wjo2G7VfkdVfv4f50+4btV+R1V+/h/nW8Pu9bvxj/2Cnu7bfxj/AN0U7Z3a0f8AuGbVvkdVfv4f50+4ZtW+R1V+/h/nW8Pu7bfxj/2Cgv1t/GP/AGCnQvdrR0bDdq3yOqv38P8AOn3DNq3yOq/38P8AOt4hfbb+Mf8AsFPd22/jH/sFOg7taO/cM2rfI6r/AH8P86fcM2rfI6r/AH8P863i93bb+Mf+wU93rb+Of+wU6E7rR37hu1b5G1f7+H+dPuG7VvkbV/v4f51vEb7bfxj/ANgp7vW38Y/9gp0HdrR37h21X5HVf7+H+dPuG7VfkdVfv4f51vD7vW38Y/8AYKj3dtv4x/7BToO7Wj/3Ddq3yNqv38P86fcN2rfI2q/fw/zreD3dtv4x/wCwVPu7bfxz/wBgp0L3a0eGw3at8jqr9/D/ADp9w3at8jar9/D/ADreH3dtv4yT92VHu7bfxj/2CnQndrR8bDdq3yOqv38P86fcN2rfI2q/fw/zreH3dtv4x/7sob7bfxj/ANgp0HdrR/7hm1X5HVX7+H+dPuG7VvkdVfv4f51vB7vW38Y/92U937b+Mf8AsFOg7taP/cM2rfI6q/fw/wA6HYZtX+R1V+/h/nW8Hu/a/wAZL+6Ke71t/GSfsFOhe7Wj33Ddq3yNqv38P86DYbtW+R1V+/h/nW8Pu9bfxj/3RQX62/jH/uinQndrR77hu1b5G1X7+H+dPuG7VvkbVfv4f51vF7vW38c/90U93rb+Mf8AuynQd2tHvuG7VvkdV/v4f50Gwzat8jqr9/D/ADreH3ftv4yX92VHu9bfxz/2CnQd6tHxsM2rfI6q/fw/zp9wzat8jqr9/D/Ot4Pd62/jH/uyhv1r/GP/AGCnQd2tH/uG7VvkdVfv4f50+4btW+R1V+/h/nW8Hu9bfxj/AN2U93rb+Mf+7KdB3a0e+4btW+RtV+/h/nT7hu1b5G1X7+H+dbwm+238Y/8AYKe71u/GP/YKdC92tHvuG7VfkdVfv4f51I2G7VvkdVfv4f51vB7vW38Y/wDdlBfbb+Mf+6KdCd2tHvuG7VvkdVfv4f51P3Ddq3yOqv38P863gN9tv4x/7BT3etv4x/7op0L3a0f+4btW+R1V+/h/nT7hu1b5HVX7+H+dbwe71t/GP/dFQb9bfxj/AN0U6Du1o/8AcN2rfI2q/fw/zoNhu1Zz933nVWT/AN/D/Ot4Bfrb+Mf+6K+kN6tvSs++P5j4B7U6Du1ovsGrbtp3bvpTxeR9JVC+QUU4B+C+URyMOOBGCQvVMBeV+hXb3hFWBw806vpz/wDrGr1QC5usTlERFEPJEPJAREwgIiICIiAiIgIiICIiAiYRAREQEREBEQ8kA8lCk8lCAEREEoiICHkiIGUREBETKAmURAREQEyiICIiAiZRAymURAREQEREAryv2uSth8IvUckjmtazUkriScAATr1QPJefHhgbFL1pXVF92ge6VsfYrpXGaIS1G5U9LIcmIRkeWQd4+ST5IJOMFBlV2qtN9K//AG9bOZ/6Uzt9K4O1Xpf5QWz50z7Vphpqx3TUV4htVnpXVFXLndaCAGgDJcSeAA7Sr6+4ftA/uVD88YuszyviON/HjPNbKHVmmflBbPnTPtUDVmmflBbPnTPtWtv3DdoH9xofnjE+4ZtA/uNH88YnVl8Tox+tkvfbpn5QWz50z7U99mmflBbPnTPtWtp2G7QP7lQ/PWKPuG7QP7lQ/PWJ1ZfDox+tlPfZpn5QWz50z7VB1Xpn5QWz5yz7VrZ9wzaB/caP54xPuG7QP7jQ/PGfanVknbx+tk/fXpn5QWz50z7VPvs0z8oLZ86Z9q1tGw3X/wDcqH54xUHWmgL7o2ClkvzaGLxkkRMjqWyPcAOLsDqHb3hOu/Fn48b4ra46r0z8oLZ86Z9qkar0z8oLZ86Z9q05vdgrrOyi90IWQvrKcVEUe9l4YTgFw+DnHWqhZtDagvFtjuFDSwup5C4NLpmtLsHBIB6sj6FJnfi9rGe223vr0z8oLZ86Z9qDVemflBbPnTPtWqR2aaq/u1N84aqVqPSl6sFPFUXKnY2GR24HMkDgDjkccleu/E7eN9twvfXpn5QWz5yz7VB1Vpn5QWz50z7VqFZNJXi8W9tdb2U8sRcWnMzQWkdRHUu1Ls/1NHC+TxOJ24CcNmaSeHV2qdd+Hbn1tmdWaZ+UFs+dM+1PfZpn5QWz50z7VpPHDvPY3eY3fIGXHAHHme5XwNkWtHeU2lonNPIirYQR280md+Hax+toBqvTPygtnzln2p769M/KC2fOWfatXxsi1t/cqT50z7VI2Q62/uVJ86Z9qvVl8O3j9bP++vTPygtnzln2odWaZ+UFs+dM+1aw/cg1t/cqT52xR9yHW39ypPnTE678O3j9bPjVmmflBbPnTPtUjVemflBbPnLPtWoOrNI3vTEtLHeIIYXVO90ZbM1wOCM5xy5hXYdhm0LzfEqHgcf74xJnfUO3j9bJDVel/lBbPnTPtT326X+UFs+dM+1a1/cP2gfk+j+ex/ag2H7QPyfR/O2fanVl8O3j9bKe+zTPygtnzpn2p769M/KC2fOmfata/uG7Qf7hR/PGfap+4ZtC/J9H88Z9qdWXw7eP1sp77NM/KC2fOmfaoOrNM/KC2fOmfatbPuG7QvyfR/PGfapGw3aF+T6L56z7U6svidvH62S99ul/lBbPnTPtUjVml/lBavnTPtWtf3DdoX5PovnjPtT7hm0L8n0fzxn2p1ZfF6MfrZT316X+UFs+dM+1SdV6Z+UFs+dM+1a1fcN2hf3Cj+eM+1PuG7QfyfR/PGfanVl8OjH62VOrNM/KC2fOmfao99mmflBbPnTPtWtf3DNoP9yofnjPtU/cM2hf3Cj+eMTqy+HRj9bJe+zTPygtnzpn2oNWaZ+UFq+dM+1a2fcN2hf3Ci+eM+1PuG7Q/wAn0Xzxn2p1ZfE7eP1sp77NM/KC1fOmfah1Xpf5QWz50z7VrX9w3aF/cKL54z7VP3DNoX9wo/njPtTqy+L0Y/Wyfvs0z8oLZ86Z9qg6r0z8oLZ86Z9q1t+4ZtC/uND88Z9qj7hm0H8n0Xzxn2p1ZfDow+tkhqzS/wAoLZ86Z9qn32aZ+UFs+dM+1a2fcN2hf3Cj+eM+1PuG7Qv7hR/PGfanVl8OjH62SGrNM/KC2fOmfanvr0v8oLZ86Z9q1t+4dtC/uFH88Z9qfcO2hf3Cj+eM+1OrL4nbx+tkxqzTPygtnzpn2p769L/KC2fOmfatazsO2gf3Gi+eMUjYftA/J9F88Z9qdWXxe3j9bJ++rTPygtnzln2qDqvTPygtnzln2rW0bDtoDnBrbfR8f/jGK2NNaLvmoq2tpbXFTyy0RDZ96ZrWg5I4Hr80qdV+L28frbn316Z+UFs+cs+1SNV6Z+UFs+cs+1awHZBrb+5Unzpifch1t/caT50xXrvxO3j9bP8Avr0z8oLZ85Z9qe+vTPygtnzln2rV87Idbf3Kl+dMT7kOtv7pSfOmJ134dGP1s/77NM/KC2fOmfauXvq0z8oLZ86Z9q1eGyLWhPGjpG95qmAKx54OhmljMkT+jcWl0bt5rscMg9Y71Ou/Fn4sfrdgar0z8oLZ86Z9qDVemflBbPnTPtWpcegNTOYJPEo25AOHTtBHcV1L1pO8Wei8cuEUEUW8Gj7+0ucT1AdavXfidvH62/8AfXpn5QWz50z7VB1Xpn5QWz50z7Vp7p3St61BTy1FtpmPiicGOc6QNGcZwMqrt2aaq/utN84anXfi9vH62rGq9M/KC2fOWfanvr0z8oLX86Z9q1LvWhdQWe2y3CupYfF4sb5ZM1xAJxnAVPs1irbwyr9zYhO+jpzUSxhwDzGDglo+FjPEBTrvxO1PTcX316Z+UFs+dM+1BqvTP5etnzln2rU3RWgr9rJlS6xCjmNMR0rH1LY3gEcHYPV1Z7VcJ2GbQf7hQ/PGfar134dvH3WyPvr0z8oLZ86Z9qHVmmflBbPnTPtWtn3DdoH9yofnjE+4btA/uND88YnVl8Tt4fWyfvs0z8oLZ86Z9qe+zTPygtnzpn2rW37hm0D+5UPz1ifcM2gf3Gh+esTqy+L28frZP32aZ+UFs+dM+1QNV6Z+UFs+dM+1a2/cN2gf3Gh+eMT7hu0D+40PzxidWXw6MfrZT306Z+UFs+dM+1cmat0y17f9vWzmD/vTO30rWg7D9oDf+hUPzxn2qxtTWK6acvE1pvFK6nqosEjIIcDycDyIPaFLlfcWfjxvirr2cytqPCC01JG5rmP1XTOa4HIINW05Xqu3zV55eCHsTvGstUWTXXuhb4rFaLi2eYMqA6p6aFwe2MxgeTkhp8ojyTw5r0NXN2SiHkiAiIOSAiIgIiZQETKhBOURByQMoOSIgIiICIiAiIgIiICIiAeShSoQETKIJRQpQEUKUBERAREQMIiICIiAiIgZTKIgKFKICIiAiIgIihyDoX+7W6w2WrvF2rIqSho4XTVE8hw1jAMkrzO29bUr5tm2gMqo6eaK3Ru8XtFtBy5rSfOcBwMjuGccBwHEDJyV4cG2f32Xt+z/AE3Vb1jtkwdXzxvOKupbnyOHAsZ35y7j8EFdXwbNm81vig1RdKX/AGlVjFBC/nDGR+EPY53H0N9JCsm6zllqbXtsL2XN0rauhk3JbxVgPrKgAbsY/FtPxR9J9QGR77Z6e308UkMz3OLt0hxBzw5q5bXSQ0NI2Nvnc3uPWcc/QrVvtd49Wukb+CZ5LPR2+tdsY8+V3zVOwpQphbYFBXJQQhtBXEtXML6Afot+hDyo2pb3b9O2SqvF0m6Kmpm7zj1uPU0d5PALAGi6K4bUNd1GstRQtFup3BsMGSWkt4siHa1ucuPDJPLicdnaBd6ra1r2HTNjmxYaBxe6doyHY4Om7+e60dfPrWVLRbaOy2+noaGNsNJTNAa3ngDrz2nmT1lcbd3+O0/zP61w2w3R102i3R0bulbA8UsWBnzBgj9rKzbaqGO22qkt8PBtNCyP2Djx9K180l0l417QyVDsvqK4Ty45E72+fqWxe99KmP1fycajgY3fnK09pldQ0ukLg2qbFN0jRHHESCS8ngcd3P1LHVTT37XO0CttdLXAOEkoiE0jmxsjYTwwM9XdzV0wbDK5zPv2oqZjusNpnOH1hXdvgmMx1bXT2P2muhstReJN9tJUydFGOolvN3049RV+Mfu/pK7bJZKO06fprLC3fp6eER5cBl/a495PFUO62x1ve529vU/HDz1cORSTTNy6qw5tT062jqPdqk3W09Q/dnjGBuyHjvDuPX3+lXZsI1tvdFpO6SHeAPiEzjzH4o/w9nYrHnlrtfatFPHI6KkYCWA8oogfOI+MeHrPcutrTTU2m61klPJK+kkIMExI3mvHwSRjj1g/Ys/2OnrVbTgKMqw9kOu26mtnufcpGC8UzfL6unYP7QDt7e/jwyr8XSXbhlNXRlTlQmUGJfCXpd6y2msPOOofF6nNz/pWca29U9t0adRVm86nioRUybvNw3AcD0rFO3+lbUbOppvhU1TFLnuLtz/WFemhWU+tNiFvt9RM9sVZbDSSygeU1zcxlw7w5uVmea3f1lWSzW21eaxe/COz2Rtm3TOKLDumdBnzs5yeHXnv3epZb0zd6XUGn6G9UbXNhrIRK1rsZbkeae8EYWJhpnbDDp/3lxtsbrYIjTNuXSYkEOMY555cPNz3nmssaUstPp3TtvstK5z4qOERBzsAvPW71kkrWO0zs1wqiYUoujlsTC5IhtwwpXIIiuOHJhciiDjhMLllEHEhMLkFKDgAmFyQoOGFKkhQibRhThFIRZUFqghcioQ2p+oLlS2Wy1t4rN7xejgdM8N84gDkPSsQR622rzWT34Q2mye426ZxQ4JmMGfOznPLrznr3epZc1RaYb9p+ustVI5kNZA+Fzm4y3PIj0c1iKHTW2Gn0+7R9M2wvtwhNMy4OkLXiLGMc8jhw8wnvPNc8t7dMLNMq6fv1LeNJU+pKNpZTzUxqA12MsIBy0ntBBCwd4M9K7xK913lO6SSKLOesAu/1LKepqel0LsTrbfRzZbQ218LJXDBfI7hvY73O+lWN4PVH4vs/wDGPhVdXLJ6gAz/AElZvmLOMbpkVCiLTAoLVKsXa3ruPStt8Tt8jHXipbmMEZELPxh+nd7+0BS3S4zfC19uut3U/S6VtMnlvaPH5mnzAf7Id56+7h2qz9lenmVlR7tVW46Gnfuwx896QY8o9w6u/wBHGk6N03Nqa4Sy1EkraRhJnnzl73njgE58o8yT/FdmlfWaE1f0MkhlpngF+OUkRPnY7Rx9h7VjfO67cSanll97/wA5WLtftddVWCG8R75pKSbo5BnABfydj0jH6yyRaLW64Std5tOPOkHWMcgriu9mo7lYqmyzR7lNUQmI7uMtHUR6DxWrNucurtjrZbW0NVpChjpeihfADHLECAQ8c3H9LIPrV4Nid526sa1mw6uaz+q6gppXdQkp3N+kE/UrYpaa+6D2gUNrqK5hc+SLpBBI4xvjecYIIHV3c0lsauPVeKzZcqCG5W2qt8zfIqYXRHq5jA/gsF7Jbo6z7Q7TJIXRNkm8VlGMHy/Jwf1sLPzju+pa4a6idbdd3MU7nMdHVmZh+KSd8Y9GVMvp+P3GStdW24bNdZ0+uNMxhtFI/dngHCNjnedGQPgO5jsPqWfdL3636osVNerXJv0tQ3IB5sd1sPeDwVu1dHS3i2S0tdCJqarjw9h5FpGVinRF0rNj+0CWw3aR79O3BwcJyODRybKO8ea4dnHsWpxU/aNi91AF9CWuY1zXNc0jII4gjHNcCurijClSiG0AKCHLkpHNNG1SsVohuFPLJNM9jwd0BuOHDgSsc7cNmbdUWfxdzWRXakBfQ1B4NeOtjj8U/QcHtByFZK3xGtbI78E/yX+jt9Sui50sNwpOhk9LHjjunHNYy/rWN1zGjewzaRfNjO0h1wdS1DqUnxW8W4uIMjA7mBy6RvNpPaRkBxXplpu92zUVior5Z6plTb62Fs1PMw8HtP8AzxHUVon4SWzma4U8uorbS/7Vo24q4mc54QPOA63N9pb24AXHwKNtDtGajZofUVVu6eusxNNK88KOpdjHM8I38j2Owe0rjlNPTjlMpt6AZUqApHJRoREQEREBERBClEQEwiICIiAiIgZREQEREBERAREQDyUKTyUICIEQSg5KFKAOSIOSICIiAiIgIiICIiAiIgIiICIiAiIgIoUoC158M7bL9z/SnvYsNUxuprxERkHyqOmOQ6X9I4LW57z1YWYNpWsrPoHRlx1RepNykoot7dHnSvPBkbfznOIAXmPWVuqtsW1CWsrphUXa7zlz3AERU8YHIDjuxsbwAyTw5knJJVb2BbP26rvrrpcoWvslvcN9ruU8uMiP0DOT3YHWt09NW51LF4xM3dmkHAYxuN7Fb2zDSVvstqpbfQw7tDQNDW5AzI/mXO7STxKvO51UdHSPqJOrkPjE9S64zXDz5Zbqk6nuHRxeJwu8t4y8jqb2ev6lbamaSSaV00jt57zknvXELpI5pU4Qc1CqChSowiiw94QWuailhZojT7nvu1ww2p6IZdHE7lGOxzvob6cq9tqesqXROl5bpM1slXIeio4OJ6SXHX+aOZPq5kLFOxXTNVUVEuutQOfUXCtLn0xlwTh3OXuJ5DsHpC55Zb4jphNf6q8tmmlafSOnG0bdx9bPiSrlHHefjzR+a3kPWetVy6ybtsq3dlO8/wCEr7r4V8fSUVVG3znwvaPTunCmmd7vLWLZQxrtd2ze6t8/4CtgAPLb6R9a182VSdHr6197nN9rHLYQu3VMPDp+TywzsQraWPaVUVVVURQNkp5y0yuDQXOIwOPWtiI3NkZ0kbmuZ2g5Cwxftldrrqqaqt9dLRPleXdE5okjac8cDgcd2VZeobBqTQb4aynuzmRSvLY5aWZ7DvAZ8pv/ANwpN4rZMrxWzwCpmrw73pXbo27z/Epd0d+4V9tP3GO7WKhukbt4VNOyXh2kcR7crtSNbIx0cjd9jwWuHaMcQteXPxWu+xYx9Lcz/a7kYHoy7P8ABX3d6GnulvloaqPfhkGD2g9o7wsa3Shrtm2unxujfPSOB6Jx4dPAT2/GHX3jvWRLTe7PdKds1LcIT2tc4Me094Kzj41W8pq7jEVdR3bRuoopI5nRVEDukpqhg4PHb/AgrYzZ1q2j1hZPGo92Kriw2qp+uN2OY/NPUfV1LGO0m4abksj6OoqGTVow6BsBDnMd3nkB255hY50xqGu03eorpbHBssYLXNdktlYebXdxU3qta6o25K4kqi6P1Hb9TWdlyt8m813kyRHG/E/HFrv+eIVaAXX+uFmryo2tKD3U0ldaH4UtLIG9fENyD7QFTfBZuDqrZ3LRu50VdIwfouDXj6S5XfH5/m7zesdo7FjHwej73dpuptGzbzYnh0kGXZ/Bv4esseD+qs+5XTGbxsZ6Dt5SWrHu3bUF4sdqtVv07UMpK68V7KQVLhnomkcweokkccHAz6VaFW7UmzS8WSudqq43y33CsZSVdNXPc85d8NmSSMcfXzWurSTDc2zei5OHlu7iQuK25VyCkriFIRYkqERARECCUUIglByUZRBJUIpygjKYREBCmUQcUUhS0IkQQuBO6sLRe720fVGoHO1RcbFbrRWPoqamoJSxzi0kb78YznGfoGMcbo2KXm9XCnvNj1BWNrquyVxphVgYMrOrP5wx6e3J4nEy3XS4am1K8KC4+K7NfE/hV1bFF6m5kP0tau3s9t3uToq00LmhhZTMc8Dlvu8px9pKtLwjHyX7aBpnRcLn7pAln3ccDK/GfS1jHH19ayeWt81rd1vUOwdizP2rWXGMjgCuQUEKjau1Fb9M2eW6XKTdYPJYwY35X9TW9/1BWsSb4dXaJq2h0jZHVk27NVy5ZS0/XI/HM9jR1n1da1xoqS7ay1HLNNM59RM7pKmocODB24+gBfHVmo67U19lutycN9wDGRtzuxsB4NHdz9ZKyHs2uOnI7Iyjp6hsFb51QJyGukf1kHkW9g6hzXPe67a6YuS00VPa7fFQ0ce5DGMDtJ6ye8qxtsxhd7mO/tcSj9Xyf4q87tebPbYemrK6FreprXb73dwAWPrXQ120nXUcMcb4aRgAkcOPQQA888t4/We5avjTOM53Ww+j2uj0faWyN3X+JRb3p3QqkVEbWxtbHG3dYwBrR1AY4Bda910drstbcpHNApoHy5PLg3h9OFfDn5r7vc2Nm9I7db1knAWvW3atpXbRaWqo5ophHSwFxicHAOa93Dh18lSLBYdTa+lqKqa7OeyJ4EktXM53lHJw0cfZwAV72DZVbaGqhqq64S1r4nB/RtYGMcQeGeZws22uskw81keQeW70n61r5tcY1uvrju/CDHH07gWwAK182sS9Jr26Z+A5jB6mNVy8J+Py2dszt6z0Tu2mj/yBUjaHpin1dp99vk3WVMZ6SlmPwJMcj+aeRH2BVm2s6O20ke75kDB/hC7CuuGN6qw/B91vVOc/QOonOhuNFltH0vBzmN5xHtLeJHa30LM61/22aZqI3xa2sLnw3GhLX1Do8A7reIk9LeGe0ehZV2VaxpdbaUiuUe7FVxnoayEDHRy4zkfmnmD6uoq43XFXOb/1F1opwmV0c9JCg81KFBxVxaZr+ki8Tkd5bBlh7R2er6lbxCmKSSGVskfkvYQQe9S8k4XLqO2eOU/TQt+/Rjh+eOxaYbe9AR6VvbbtbadrLNcXENa3gKebiTHjqaRxHrHUFvFbKqOspGVEfk/GHxT2KztpOlrbeLVVUNdT79vr2lkjRzjfzDh2EHiD2rnlN8OmGXS+vgXbZvf5pc6R1BVMdqOzxDcc53lVdMMASfpN813qPWtil5Rsn1Rsf2oQ1VDUNiulqnEsEpaejqIz2jrY9uQRnt4gjK9Mtl+trPtA0PbtVWWQ+LVkeXROI3oZBwfG785pyO/nyIXJ6JyurKKAVKKIiICIiAiIgImUQEREDCIiAiIgIiICJlEBERAPJQpPJQgIEQIAUoiAiJlAREQETKICIiAiIgIiICIiBlMooCCUTCICgqVgvwxtqztnOzl1vtNQ1mob5mnpORdBF/azYz1A7o/OcOeCEGsvhs7Wvf1rj3p2eoa/T1ilLd5vEVNXgh8metrQSwfrHjkYurwcdnbrFZI7hVQtF5urQXbw4wQcwz1+cfUOpYf8H3QjdUal91LhDv2m2uDnh3KWbm1mOsdZ7sDrW6mmKF1PSeNTN+/Tjhn4Ler2reOPty/Jl6iq0kMdLTsp4W7rGDA7Se1Wnf6/x6r3Y3feY+De89qq+p6/xen8VjduyyjietrP+KtYLtJ7cbfScIpHNSqy4opKhAXzq6qno6SWqqpmQ08DDJK9xwGNAyT6lzKwV4Quray7XOn2dad3paid7DW9GR5RPFsXoHnO9Xes5XUawx3VvsfVbY9pT7lVRzRadtw3Y4t4jyM8Gfpv5uI5AYzwCzRuNaxrY2ta0AAADAAxywqTovT9HpfT8Npo91255c0uOMsh5uP0Y7BhVgLEjWWW+I4r6M8/ylwQ8lWWprx719eub5YbbriR3ljX/wAW/WtjSN7zfKb1HtHasLbfbU6369fWbruiuEDJg7qLgN1w+gH1rJmz27tvWkqGqd+FYzoZu57OH0jB9axjxdOufOMqutasX7a9QUtQyLTVLG2oqWzNklcASY3AYDG/nHPHuWTLm2qdaqttvc1tWYX9ATy393h9KxBsMdZ266c2+b/uhukUfTeaJs+VvZ47/Z6+vCuV9M4T38Zb2SWS6WHRVPb7s5vTb75WwjB6BruO5ntzknsJV3YXEOVFi1dpyS++4kd4pnXDGejDjgnPm73m735ucqzUYu8rt2tSaftOo7a633ilbUQ53mniHxnta7mD9fesU3nYg7pne5N+HRcMNqosuH6zfsWaQ1ybqtxlXHKzw1+pdmENHV9Hda58zozxjjbuA9xPE49GFWNS6RobvamUtPHFSzU4xTuaAA380/mn61lq8WiOuZvN8iZgw09R7irRnhkp5XRyNcxwOCD1FZ6Y311hLSt7vWhdRvmjjLJWER1VJIfJlb2HHXxyHDl7Qdl9L3226ks8V0tc2/C/LXNdwfG8c2uHUR9PMLFeu9Nw36k6aHdiuEQxFLyDx8R3d2HqWONKakvWidQPmha5rgRHVUsvBsgzyPeOp3V3gkGS2NamU3PLa0uWHNoVZ7z9s9j1Z5lNUBvjBGeIH3uQ4HPyC095WSdJahtuprOy5WubfYeD2O4PifjzXDt+g9StvbpYXXbQstVC1xmtzxUgDGSzk/2A5/VVvM3GMeMtVkfXmkbXraxe5N0klY0PEsFRCQHxvHwhnI4jgR1g9XAq17Hsskj1BRXbU2qLhqB1vIdRQTDEbCOTncTkjnnhkgZ5KsbE9Q++TZ7b6qSQOqaZvilTx477BgE/pN3XetXNd7nQ2milrrlWQ0lNFxfNI4Brc/8APrW9SzbO7OHbBU5VsaT17pLVNW+jsd6iqqlgLuhdE+N7h2gPAz6ldC3LKzZZ5SFKgc1IRBERAymUTKAiIgEIhRACIECAmURAITKZUEoIXElS5Wxq3Xmk9K1DKW+XiKlqHgOELWPkeB2kNBIHpwlsnkmNvhb+otmDqjUVXfdN6krtPVdd/vbYBmOU9bscMH28cnhkq5NBaTtujLIbbb5J5nyzGaoqZ3AySyH4R9HZ9ZJKqlku1vvFviuFrrIauklzuyxOyCez0jrB4hUHa9qFumdntzuDXbtTIzxamHWZZOAI9Ay49wWLJOXTdvDD2iKt2stt951R59JRhwp35yAPwcftaHOWZA5Y82DWF1r0QysmbuzXGUz8eYjxhntGT61dOrNQW3TNqfcrpNuRDyWNbgvkf8Vo6z9A61meFy5uo7Gp79bdN2eW6XSbcgZhrWgZdI/qa0dZP0DiVrNq2/XrXWomTSRuc95MdLSRnLY29g7+su4Z7gBj56s1HeNbX9k00biSejpKWLi2ME8h2k9buv0AAZG0HpuGw0/TTbstwlGJZeYYPiN7u09ax+1b1MJv25aZ0hQ2e1PpaiOKqmqB/WXOaCCPij80fX6lRK7ZjDVVe7aayWHpDwikbvgeg8Dj05WSIIpKiVscbXPceAACuy0WiOhZ0knGoeOJ6mjsC3qMdeXliWz7DndM33Uvw6LrbSwYJP6TuH0LK+mtPWfTdtbb7PStp4s7zjnL5D8Zzus/88FU91Rh3YkkiXK3ylytTarZrpqDRVXbbS5vjD3MfuEgCUNdncz1Z4Ed4A4Lvz6r07Dem2WS8UzbgRnoS/kewnkHdxOe5VcuV8pzjdsEbF9QUtC+bTddD4rUSzl8cjgQXP4AxuzycMcPZ6csOa5Ya27T2Oo1q2O0xvNwazdrnR+a+XPkgdrwOZ9A5grLlmZWNslE24O3q0QM6cjjl+7xWcfjWc8V9lrhUk6m1w5sbnYuNwDGHHENc/A4dwIWdNe3Ztl0rXV29uy9EY4e97hgfxPqWK9g1qdcNfw1DmnoqGJ87jjhnG60e12fV3KZc2RrCalrZZ278Hzer0LgVC5DmtuSN1rt5rmtc0jBB4gjsWFal9Zsd2kMu1DDPNp24gtliB4bmcujHVvM5tJ5g4zzKzXlUfWNgo9TafqLTWeS1+HRS8zE8ea8ej6RlSzfhrHLXF8L/oqunrqKGso5mTU87BJFK05a9pGQfWvqVgbwftU1ljvdRs31F96ljlcaPeOQ1/N0eex3nN9faFnhbxu4zlj01IUlQOakLTIoClRhBULFX+I1f3x33mTAd3d6uuqhjqqd8Mjd5jxg/arDIVz6ZrvGKfxWR332McO9v/BSz21jfTB3hF7PZNQWV9VSw5vNrBdDjgZ4ubmf6h35HWrO8Cva23QOuve3eqjc09fZWsc5wJFNUnDWSdzT5rv1TwAK2h1RbfGqTxqH8NEOrmW/8Oa008IbRDdO6l92qGFrLXdCThuAIp+bm47CPKHr7Fyynt1/Hn6r08UrAfgY7WfugaB9w7xUB+orExsU5Oc1EHKOX0/Bd3jPDIWfFzdhETKAmUyiAihCgkckREBERAREQEREBEwiAiYRAREQDyUKTyUIAREQAVKIgDkiDkg5ICIiAiIgIiICIiAiIgJhEQEREBERB0b1c6GzWmrutyqGU1FRwvnqJnnAYxoy5x9AXl5tZ1petsW1qovEdPK+StlbSWykOMxQAno2dg5lxOcZc7jhbK/0gu091DbaXZnaahzaisayruhYcbsOT0cR/ScN4jsaOo8cR+C9o3yJdZ1kTi5+9TW9mAQeOHyDvzlg/W7sXGbrOV6ZtnfZRoyj0/YqKw0vl09I3fqZOuWQnyj6z7AFkitnjp6d80nksYMnH1LqWSj8Rt4hd+FPlPPf/wAFRdU1/TVHicbvIjOXd7uz1LtJ6ea5e6pVXPJVVD6iTz3nl1Adi+QCLmFthxwoXIoiuKZUnmvnK+OGJ800jWMY0uc5xwGgDiUFp7WtZQ6J0lNcvJdXSkw0URBIdKRzP5rRxPqHWsYbDNKzU9PLq28b8lyuG86EyOJcI3HJefznHPHnj0lUeaWTa/tSfWSdK3TlsAbG05aHMzwGOp0hyTyO6MdQWaQ1rWNa1rWtAwAOAA7Fy/a7db/nHXsRSFKrntAULkiG2PtumnXXrRrqynj36u3O6doAGXR4w9vsw79VYz2J39tDe5LPUSbsNbxiJ4BsoH+ocPSAtjCPIc13lNPAgjgR2LWPaxpGbSOpeko2vbbqlxlpHg+Yc8WZ7W9XdjvWMpq7dsLMpqs8byxdtZ0dNUTO1FZY3dMzDqmKPmcf2je8dft7VceznVLNSWrdncBcacAVDPjj447j19hV2Ba4sc5bhWFZNZ661fRQafo3Oe/cDZn0oLZJgOuR2cNHLPIH14VUi2QVHuPvOukfumeIZukw8vNzz/Wx6llWCKGnz0MLIt85duNDd49pwvoHbqmvrVzvpYGw3VOoJtSy6Zu1c6rp4qeUt6Q7z2PY4DAdzI588rMr3rW3Rt6t+mdrlwrLpMaelE1VE53RudjLjjgAT2dSzJS7RtEVDd5uoqZo699r2HHoc0JjeOWs8fkWhtC2o3q16oqNP2G3000sBDXSvY6RznFuSGtaRyz3qxLrqPX1DcKe/X7x3o5cxtjnbuwuGc7m6PNPYcZ4daqGy9zr9tMrr5I13ATVRzx3C92Gt9jvoWWbjRUtwopaGuhZNTyjDmO4g9/p71JN8lymPGlpWu+2u5Wf3UjqGQws/DdKQDEceaf+eKxtqqqfrDUUNPZ7e57wCxjsYfIM8z2NHVnl68Kv3HZTdI7n0dtroX295B353EPYOwtA8ojqI+hX9pfTlt0zROhoWmWaT8NUPAL5O7ub2AfTzTVqbmPMYasty1BoPUcrqf8Aq9XF5E8MuXRyjsIB4jrBB9BWw2idZ2XWFsf0O7FUbhbU0MhG80EcSPjNPaPXhYY2zXy31lbFbaWGKWqpj9+qQOLP+7B6+09h9asW3C6Q792t7atgo3N36qAOAhLshuXDzc4IGTx4qb6XTp6pus2bFrhJorahc9D1kjvFKw/1Vzs+U9vGN3Z5TCQe8BXP4RrP9n6crK6GWayU90Y+4tYCfI7+7G8PScdawFf9XXS+VFurqxrG3SgwI62Ebj3gHLd4ct5p4gjHPktgbDtu0TXWqKO/NqaWokhDaqI0nSxF2PKHDOW57lqZTWmcsbLKt/Vdfpe+aw0dDoPxSW7R3GORz6GExhlOPODjgdQOQeOM9vHPjj5fk9v0LGemNdbHrfLL7h11ptksg8sigkpy4dm8WD61dNJrXSdY/dpdTWeZ3Y2rZn61rGxzy38XESgXSgudvm/B3Ckf+jO0/wAV22PbJ+Dc1/oIK3uMac0Qtd8V3sKgH4yqJRRlMoJyhREBEQFARCVBKCSoyoUhrviu9hUDKZXF7mt85zWekgLrTXC3w/hK6kZ+lO0fxTcXTuBYFsFXpey7Q9Yt154tFc56x0lPPWwl7HUxyWtbwIHk7vpAxxwcZYrdZaTo37tVqS0wu7HVbAfrVr6o1tsiuD4vd64Wa5uj4MJpX1Jb62sKxlY3huelH8HtrXVGqay0wvh09UXAG3tc0gEjO8QOzG7w6uXUrc253Co1htHtOg6GT+r0hDqlw+DI4ZcT+izl3uKu27baNB22zyx2OSaomghIpYGUT4497Hkg5AwM46lr3p/V9yslwuF2p2xTXat3g6rnBcWBxJeQ3lvE44nOMcuKxcprTeMttrYzWOrrDouyxdN5cu4GUlHGRvvAGB+i0dZP0rXi9XPUWvNRxOqP6xVyeRBBGC2OIdjQTwHWST61RLnJdKxwu1ydVTeMvcG1MoJEjm43gHHgcZHAcshXxscv1vt9bPbayOKKaqI6GpIAJP4snqB5jv8AUpbvhqY9M2pOmqmTR2o5qe8W8scQI3uxmSMZ85va09eOf0LJFzvtrttnbdpKhktPIPvPRkEyHHIf8eSq+pLBa9SUXi9wjxKwHop2YEkZ7u7uPBWDQ7J7i65tjrrlTtt4JPSQk9I4dgaRhpOOfFa1ZxGdzLmqRb9Ta8rLnUX6xurWsgxGWU7d+NoPwd053j2nGfRwV+bPNqt6u2pqaw3630rJZ3Fgmia6NzHbpOHNJI446sK8LXb6O12+Kht9OKeniGGtb39ZPWT1nrWKNr4msev7ZfoW7x3Ipm8cbz4n8R7N32qWWcksy402Ha5YZ286r1BS6ih07aa59JTyU0b39Ad2SR73OGN7mBwHAK+qvaJomnb0kmoqQg8QI96Q47CGArC+ur1b9UbVLfVWmZ1RSufTQhxYW5IcM8Dx61bUwxu+YqLdkNV7kOc66Re6fMRAfev0d7nnvxjuVPh1trjSFFPYa5rg8xlsElUC6SHj5zHg4cBxxzAPows3PO9velfGeGGoY1tRDFK1hBaHtDgD28U18Sfk+sY7JdGyQzM1Feo3dM/LqaGTiRn+0d39nt7FlMFcVa20bVUembPvQuabhOC2mYertee4fSVf1iW3OrE236gbXXWKx07h0NF5cx7ZSOXqH0k9iyNsG086z6P90KiPcq7k4SnI4tiAwwevi79ZYg2X6Vm1fqXdquldQwHpa2Xe4uGfNz8Zx+jJW0LGNaxrY2ta0AAAcABjkpjN3bed1NRKIi047ERMojGO3LSkldRRaqtO+y5W7BlMZLXOiByHjr3mHiOOcZ7AslbJNZQ600lDcHbja6AiGtjAIDZQPOA+K4cR6x1LmRveS7ymnmDxBHYsKslm2Q7UmV0LZXaeuYLZGjJAjJ4j9KM8R17px1lT9bt0n+pr22WUjmuEEsdREyaGRr4pGhzHNOQ4EcCuS6uaQpUAKcIIPNfSlmkp6hlRH57Dkdh7iuCIL7o6iOop2VEfmvHs7ljjavo+hv1lrbHVN3aWsbvQPHOKQHLXfqn2g47VcemK7oajxWR3kSnye53/ABVbvNH49RPh+GPKYew/8eSxZ6a37aG7MtW3zY/tYpbx0L2VFuqDT3ClP9tATiRnVzHFp5ZDTxC9R7DdaG+WekvFrqGVNDWwNnp5mHIexwyCvPvwoNGOmii1lQwu6SHFPcGgDzfgSeo+Sf1ewrJ/9H1tPdNT1ey+7VG86APrLQ5x5sJ++w+onfHpd2LjlNXT043qm24g5IowpUaEREBERAREQEREBERAREQEREBERAREQDyUKTyUIAREQFKIgJlMIgIiICImUBEyiBlERAREQEREBEUIJVC11qe16N0jc9TXqYRUVvgM0hzguPU0d7jgAdZKrhK0o/pCtpXjVyt+zO2zHoqbdrrmWuIDpCD0UR48cDyyCOZZ1jgGu4dqDa5tSlqq6ZjrneakzVMrYyGQsxxwPitaAACeoDPWt1dBWKlo4qeGlhbFRUETYoGcMZA4D1Dj6Vg3wW9HuobFLqaqpz47cz0VKCMFsAPPlw3ne0NB61s/baZtHRMp27vDi49p6yuuM1HDPLd0+N5rW0NE6T+1PksHfjn6lZZPl73nd/f2rv32t8erXOa7eij8lnYRnn610FuTTjlRTlQi0icqEUnmioWFvCR1dM2np9B2Vz33C4lhqhHzEZPkx57XHGR2c+BWT9b6jo9K6aq75XeVFTt8lnHMjycNYPSfYMnqWEdi9nrL9eq3aDfndNVVEzxTZxguPBzx3DzB2ce5YyvqOmE1zV+bP9M0+ldNQ2uNzXzfhKmTh98lI4n0DGB3BV9TlSss27u0BSiKsiIoKAVSdVact+prJNa7k370/BY9uN6N45Ob3jPrHBVSqnp6OklqqqZkNPA0vle84DGgc1Zlv2r6JrLm2hbXTQb7t1s00BZGT3n4PpICWzw3jjfMYOu1rv2z/VQbI7oamLyoZm8Y5mdveDyI6vpWXdE6ztupqdsfk09xY3MtMev85nxh9IV6axsFr1Ran226Q77ObJG4EkTscHNPb9BWr2r7TJpnVFRbYbg2ofSOG7PFlpacZx3OHcVj9XWazbIF64LDmldqFdS7tPfI/G4sYE7ABKPT1O6uw+lZKsWqNP3hg8RukJf+KkPRvHqdj6MrUsrncLi6WoNB6evdU+srIZoaiTG9NBJulxHcQRn1KkSbJLD/AGdzubfT0bv9IWQQPI/5wo3lLjCZZLf0hpK36Xp5o6OaaZ87gZJJMZIGcNAHVxKrwX0I3Wbzt1rR1k4CtfUGuNN2fejkrvGqgf2NN5Zz2E8h6yrNSJzlVzA/GWMdo+0GOHftOn5g+U5bPVt4hg7Gfnfnch1d1oax11d7/v0sX9SoX8OgiJy8fnnr9AwF8G6ZmtVifer+19Ox/kUtLykleRzPxWjmevh6M4uW/DrjhrmrZ8peivgb7Mo9M7EmOvlDFLV6kJraqCeMOAhc0CKMgj4vlEHkXnsWoPgubNXbT9qdJbayF7rLQAVlzeBgGNpGIyeovdwxzxvY5ZHp1G1rGBjGtaxowABgAdiy6Rr7rnwR9luoqt1Za/dPTczskx0ErTA49vRvBx6Glo7ljS7eBJWtle606+pzF8FlVbzn1ua/+C3QwoJQ8tArh4Ge0+GV7qO8aXqYx5pNTNG4+oxkfSreuXgn7aKXe6Gx26ux1wXKIZ9G+Wr0fTKGnmFUeDltsh/CaArT+hUQP/yvKp1Tse2xWtvlaJ1HFj8TE53+QlepqlF08o/cDa9Qt/8AcuuaVo/+Fq2AfQuvLddp1H+GuWsafHx5qho+leseE3VdpqPJhu0TX1K/o3apvDHjgRJM4kftLsM2q7Qm+bqqt9YYfrC9XXMjd5zWu9Iyvi+goX+dR07s88xNOU3TpjysG1zaJ8qaj1wxH/SuQ2vbRvlPL66eH+RepTrJZ3edabe700zD/BcPcCx/kW2/NWfYm6dMeW52vbRvlPL6qeH+RR91zaJ8qKn1QxD/AEr1JFhsf5FtvzVn2Lm2zWdvm2uh+bs+xN06Z8eV8m1faE7ztVVnqDB9TV8fui7QKx/Rt1ReHvPwYpSD/hXq6yio4/wdLTt9EYC+zWNb5rWt9AATdOmPKGO4bVKz8DXazqM/EfUuH0L7HT216ubve4eu6rPX4pVv/gvVoBThNmo8sabY9tiunm6J1HLn8dGW/wCchVCn8HLbZN+D0BWt/TqIGf5nhenyHkorzht3gnbZ6r8NZLbQ/wDj3KI/5C5V+j8DLafI9njV40tTRHzsVUz3N9XRAH2rf8qETTSy2+BJcnPY64a/pGM+G2ntzicdgLn/AMFkvQ/gibMbDVsrLxJc9STMwRHWStjgBzz6NgBPoc4juWxCIaYD8MHZhFqbYg+LT9vihqtOOFbR09PEGgxNaRJGAB8QlwA5lg7V50Bq9kXta9ha5oLSMEHiCCvMrwqtmn3MtqVVR0cL22S55rLaceSxhPlRDHxDwxz3S3tyhXy2aa+j3GWnUE245oDYKt3Jw6mv7+x3t7VlUf8APoWvEOmZrtp/3YsLXVHQ+RWUnOSN2POb8Zp7OY7+r7aP11edP7lK7+u0I4dBMTlg7Gn4Po4juW5lry55fj3zGwJKoOsdK0OqqSGGummhfC8vY+PGRkcQQeo/wXV09rrTd23Y213ilQ7+xqhuHPYHeafblXUPKZvN3XN+M3iFeK56uNY5Zsgsbfwl2uLu4Bg/gVW7BoLTtjqmVlLTzTVMeejkqJN4tPLOAAM+pXSXNUlquoXLL6+YO6uQKot81LYbKx3j10p2P+I077z+q3JWN9U7U6yo3qeww+LM4g1EoBkP6I5N9eT6EuUhjhayFrXWFr0zSObI5tRcHtzDStPE/nO+K36T1LDlBb9QbQNVubH/AFirm8qR7uEcLO381o6h9apumrdNqTVFLb5rgIZayXBqJyXnOOfeTyHaVtNozTtr0zam2+1w7rTgyzPwZJXfGcf4cgs/s6XWHh8tH6at+l7LFa7e3eaPKlkIG9K/HFx/gOoKshWVc9q+iaG5PoXV1RMY3Fr5oYC6MEHjx6/SArzo6mlrqKGso5mTU87Q+KVpyHA9a1LPDllL5rmiHmirAiIjQrf1/pmn1Vpqa1ybrJvwlNJjjHKOXqPI9xKuBE8kurtYPg46tqGsn0DfN+K4W8vNKJSc7gPlRZ7WniO7lyWa1rtttslVZ7rSbQLC4wVdNKwVJZgbrgfIkPp8w88jHes16D1LR6u0vSXyj3Q2Vu7NH1xSDzmeo+0YTG+q1nN8xXgVK45Ugro5pPJQUCEIIz+r9avGyVvj1E1zvwrPJf6e31qziF3bJW+I1oc533p/kv8AR2+pSzay6c9c2alqmTR1ELZaKtY6KoYQMHIwR6wtJrhDftk+1KOagm6K4WiqbUUU5HCRmctJ5cHN4OHpC9Aq+mbWUj6d3wxwPYeorWbwoNHOuWnW6ip6f/aFoyyowOLqfPH07rjnuBcueU3HXDLV19bqbN9W2vXOibVqq0yNdTXCASYzkseOD2Hva4EH0K41o/8A0fG0r3Pvtbs2ulRu09xLqy2lxPCcNHSRjj8Jo3gAObXdq3gC5O4iIgImUPJAREQEREBERAREygIiICJhEBERAPJQpPJQgIiIAKlQpQEREBEPJEBERAHJAiICIiAiIgIiIITClCgtvaRqu26H0PdtVXSRrKa305lIJx0j+TGDvc4taO8rzBsVHeNqW1B0lyqXy1d0qX1VfUDiWMzl5Gc4AHktHIcAtjP6QzaN4xX23Zrb5HblPuXC5Oa4gF5BEUR48cDLyCMcWdY4W74MOj/c3Tj9SVVP/Xrr5NPkcW04PD0bzhnvAarjN1nLLU2zpoe2Qx7ro4WxU9I0RQMHAN4cB6gqxqeu8VpPF43ffZeHob1n+C71DTx2+3sjc5rWxtJkd39ZVm3OrdXVb6h29ung0dg6gu0eWuuCiItoIpyoQEUhWHtv1n7zdHyyUsjW3OtJgpB1sOPKk/VH0kKZXU2uM3dRjHa1cqraNtMpdFWub/ZlukJqJW8Rvj8I/wDVHkDvz2rK1BSU9DRQ0dLG2KngYI4mDk1oHAKxdh+k/e/pptwrId24XECR2Rxji+Cz1+cfSOxZBK54/W8r6npC5Ii1pjYiIqouK5KCsi0dsVDXXLZ7caO2xvlm8iQxM4mRrXgkDt7cdeFYWstZ6X1Ds6pdN2S3vkucnQxwUraYgwOaRkgjhyBHAnOeKzSQvgyio46h1RHS07Jn85WxNDj6TjKljWOevK2NU3x2jdnsVVWOEtdHAynhaSDvz7v1DiT3BWNsd066O1VF+uTelqrjndMvlExZ4k5+MeJ7QAuhqOtdtJ2jsttPM42O3ggvYeDmg+U8HtcfJHd61lRjY42NjjaGMYA1rRwAGOSk5rVvTNe6sXUOy+x3J7pqBz7ZMeqMb0RP6PV6iFYl32Zaoo3noaeGui6nQSAOx1eS7B9mVnXKgq3GVmZ5Rrk6LWFp+9tbe6Jo+IZWt+jguPu/q6QdG27Xl3cJpM/atj1xwp0/1vu/xrxHZ9ZXrzqO7VffOX49rirjsOyq91W666VFPb4+toIkk+jgPb6lmTC5byTHTN/Jb4W/pzRen9Os8Yp4elmYC51VUkFzR28gGgdw9aw9r29VGrNTMbQxzTU4cIKGBjS57yTjIbzLnHq58grz2x6v3WO0zb5PKODWPaeQ6o/XzPdw6ysxeAlsgdXVrdqGoKU+K0znR2aF44SScnT+hvFre/J6gs2+o6YS+az94MeyyHZbs3p7XUNa69VpFVdJAcjpS0DowfitAx3nJ61ldEWXQREQEREBERAREQEREBERBGFKIgIiICIiAiIgKFKIIwpREArFXhNbLodqWzSqtMLWtvFGTVWyUnAEwaRuE/FcCWnsOD1LKqIPJPQd3qtJ6oLq6OaCHeNPXQPaQ9mDgkt+M0jkRnmOtZl1JorTupGeMTQ9FUPAc2qpiA5wxwJ5h3rCvfw7tjzqWodtS07SuMMpbHeoIwMRu5NqPQeDXd+D2rCuxzWHm6ZuEnLJo3uOeH4v+I9nYtY31XPOXzFKv+yq90u8611ENwi6mkiOT6eB9qtqW0awsr91tJdqTvgL8D1t4LYoneUFq10uc/JZ5a3uvuqo/vbrxeWO7DUSA/WvrFHrC7Yj/wBt1jT8Z0jm/TwWxjQuSdP9a7n8YLs2zHU1c/8ArEMNvi6zPKCcdzW5Ptwr6sGy6x217Jq6R9znHwXgCIH9Hr9ZI7lfY8lTlWYxi/ktY52xaddNaIL5bYxFUW3G8YsNIi55GPiniOwEq+9Hahk1ls/lqKVwZcXU76eYDhuT7uM+g5BHp7l2X7rmOjc1r2PBBB4gjHJYq0/VybNdo7qOaRzbHcQBvOJIY0nyXelp4HuPoUvFan+pr3FU0DrbS2ltAVWm7/b5YrnC6ZtRTOpsmpLicZPLkQPK7OCvTYtQ3C17O6GluEb4pXvklbG8YLGOdkA9meePzlc0tDRzVDaqSjp5ZmY3ZXRNc5voOMrsgKyJlnucOYKKApVYERETYiIiPjW0tPXUs1HVRtlp52GOVjuTmkYI+lYm2XXGo2a7T6jR90m/2Vc3DoJZOA3j+Ck7s+Ye/wBCy+rB216UdqLS7qqljzcLfmWMDm9nw2fRkd471LPbphfVZqwg5qwthmtPfho1jqqTeudARBV9r+HkyfrDn3gq/iuku+Wcpq6GoSoCkKsoKHmpCILp0zW+MUni8jvvsXD0t6j/AAVL1lbo5N6aSFssNQ0xzMI4O4cvWF0rfUuo6tlQ3q4OHaOxXhWQw3C3uj3mubI3LXdQPUVi8LOXn/qy13TZftLxbKqaGot87Ky21XAOczOWOPUeRaeGDg8MFem2y3WFv19oG0artpHRV9OHuZzMUg4PjPe1wI9S008JzSTrppRt8p4f69Zyel7XQHzx+qfK9G8ql/R67R/c/UFfs3uU2Ke471bbi53mztaOkZz+Ewbwx1sPauWU1XqwvVNt4cplAiy0KFOEQEREBERAREQEREBERAREQEREA8lClQgImUQSiIOSAiIgIiICIiAiIgIiIB5IiICIiAqNrXUNv0npK56kukm5R26mfUS9pDR5o7ycAd5VYJWoP9IhtAbT2y1bN6Goc2WrLbjcQ3l0TSREw9XF4LscxuN7RkNYLdHetrG1Z1RdJi+tvFW6orJmggRs5u3c5wGtG6Ac9S3a0fboY5WNhjbFT0jA2JgHAcMNHqCwB4KemG09krdWVEf36scaamJwcRNPlEel4x+otnLZDHb7U103k+SZJT15/wCeC64zUcPyXddTVdb0cTaNrvKk8qT9HPL1q2V9ayeSqqH1EnnPOcdg7F8l0k042pHNQpyoVE4QlQpyg4yPbGx0kjmsYwElxOABjmtbRL91na3LcpGvfp62ANia8YD2A+S0g9b3ZceHLgVe3hJ6wda7BFpe2yb1xuoAlazJe2DOCAO17vJHdvLt7NdMx6V0rT29zW+Nyffatw45kI5Z7G8h6Fyyu7p0x/zjv2uglQuK5KxkRERkREQSAm6rC2l3e9Ovtk0fYaz3PqrqXOkrOOY2Dqb38HcuPAcs5XQhOoNA62s1rrNQVN8tN5eYv62S6SKTgMgkk8yO7GeCm3SYbm2TQ1Y8256q97+mvc2jk3a+4tLG4JBji5Pdnt+CPSexX5eq6ltNsqrlXSdFS0zDJI7BOABy9J5DvWDNGMrNea4qtXXiMClp3AQQ5y1rgPIYM9TRxPLJPepfi4Y+6ujZlpv3vafDahu7XVOJajOMsOODPV9ZKuo81JQrUmmMru7QFOERGTCYREXRuqz9pOrI9N2/o6dwfcagHoGcwwfHPo6u0+gqtau1HQ6bs766q8t58mCEc5H45dw7T1exYg0TprVG1zaFFaLa3xi41pL5pHcI6aIEbzz2MbkcOs4HElZyydMMN81cHg2bJbltc170NV4wyxUjumu1bniQTwjaTze4+wZPp9MrTb6G02ymtttpYqSipYmwwQRNDWRsaMNaB2AK2tkuz7T+zXRlLpnT8O7FH5dRO8DpKmUjypHnrJxw6gAAOAV3rm9CUREBERAREQEREBERAREQEREBERARMplAREQEREBERAREQETKjCDrXSho7nb6i33CniqaSpidFNDK3ebIxwwWkdYIXmd4S2yO4bI9dbtH4w/T9Y4y2usySW4PGJx6nt+kYPbj07PJWntV0HYdo+jKzS+oIS6nnG9FMz8JTyjzZGH4w9hGQeBKDRXZrqpupbb0c26y404HTs5b46nj09fYfSrw3Fg7XGmNTbIdos9nrvvNwoiJIJmj73VQEnDx2sdggjqII5hZb0nqKh1JZ211L5Dx5M8J5xvxy9HYetdMctvPnjrlVcKELkWnPSQhKhENBVtbRdM++bT74YW/12nJlpj8Z3Wz9YfThXKubHbqljWN1drd2HaqbfNPus9dJ/tO3ANw4+VJDyDvSD5J9XasiOCwVr6Cq0XrOl1nZY/vM0n9YjHktLz5zTjqeOPpHoWabLcKW9W2luVDJ0tPUsEjD3dh7xxB70l9NZT3HbBUrGkkN+13r282aj1BU2O1WUsY7xVxbLK85GTgg44HrxwHDrVQ2c3O9Q6ivOjb9We6FRawySGrxxew44O7/KHPjz5pMkuHC+0RFXMRERdCkKEQjC9VK7ZLtahulPG5mn7mCJY2Dg1hI32gdrHYcOHI4HWtkonxzRNkjc17HgOa5pyHAjmsY7RtMx6q0vUW3db40z77SvPDdlA4DPYeR9Pcqf4NWr5LhYpdJ3JxFwtWRCx4w8wZxunPWx3k9wIUl1dOl/1jv3GYApBUHmmV1cnJFARAKuLStZ0kTqOR3lMy5n6OeXqVuFfWknkp6hk0fnMOfT3KUd7WNuhdK50kbX09S0slaRwPDBHrC0ivtHdtl21EOttQ9lXaatlVQTn+0ZneYTjGQRwcOR4hb9XGJtytTnR+VwEjPSBy/gtavCk0o2ssNJqylj3p7eRDUkAZdA48HHrO68+oOK55Tc26/jy1dfW72gdTUGstG2nU9re11LcaZszevdJ5t9IcCD6FXlp5/R47QGyQ3bZvXTeVHm420OJPkHAmjHZg7rsZ47zuwrcPK5PQIiICIiAiIgIiICIiAiIgIiICIiAeShSeShARAgQFKYRARByRAREQEREBByREBERAREQEREHWuVXT0NvqK6skbFT08TpZXnk1jRkn2ZXldri+Xja9tjrLpHG5tReawMpYnHIhhHBjeZ81gBOOGcrfPw0L3NY/B41AaZ25LXmGgzjPkSyAPHrZvD1rz82b3+5aZ1H7qWezxXOuED44WPje8R5Iy/DMHlkc+tWJbrw3FsdBT2e1Ulro27tPSQthiHcBjPrVx3i9urqdsLY+ibwLuPM9noWsL9oO2eqZvQ2Olgafi0mP8zyuv77NuDnb3i8Te7chH8V16p8cOi322SIXFa7s11tsp/wlspZvTBG7/K5c2bX9qFC//aWkaKZnXu0kzT7WvI+hXriduthsqFgy2eENStldHetK1FO4czTVIcc9m68Nx7Ve9j2w7Pbo9sfu0aGY8m1kLox+35o9ZCvVEuGS/TzXXudbS2221FyrpGw01NE6WZ5+C0DiuUNRDURNmp5GSxHk5jgQfWFhfwmNSzS09BoS170tbcHslqGNHEs3vvbM8uLhn9UdqZXUMcd3S29nMNZr/aPcNd3aHdp6aUeLw53mseB5DBn4jcE8BxIKzKFStHWGn0zp2ks9Px6JuZH/AB5CfKdnvP0YVWWMZpcruiIirIiIjIiIjS1teaSj1NT00kddNb7lRPMlLVxc4zjiOo45HgQchU7T2i7lHqWn1Fqm/wAt7q6NpFI3o9yOM9uPsxx7cK+SrO2qauj0np0zQuY641OY6WM9Rxxf6G/ScKWTy1jbeIsrbRqCs1RqOn0JZPKZHKHVTwSAZBnyT+awcTz49443nYbXS2e1U9to27sUDQ0HgC89bj3k5Ks/ZJpmS20Dr1cmv90K4b3l8XMjJzx73cz6u9X8Exntc8vUSERFWBERXYKn6gu9DY7ZLcLhJuQx8MDiXnqaO8r63a5UNpt8tdXTNhp4hlzj9AHaT1BYK1Le7xrzUtPR0NLNL0jxDQ0MILnOJPYObj19nqWcstN4Y7/8cJX6l2la0prfbaGWtuNY/oaKiiIw0c90E4HIElxwOZOBy9F/By2PWnZLo/xOPcq73WgPuVdu8XuA4RtPMRt44HWcnrVB8FbYXQ7LLD7rXaOKp1ZXRYqpuDhSsPHoYz2fGcPOI7AFnFcnok0KURAREQETKZQEyihBKIiAOSIiAiIgIiICIiAiIOSAiIgIiICZQ8kQMoiIGUREBERBi7wi9kNo2taP8Sm3KS9Ue9Jba/HGJ5HFjjzMbusdwPUvORkmptm+tKmhuVHLRXKjf0NbRzHg4c90kZB4EEOGeYIyF614WD/Cl2E0G1Sxe6VqbFS6roYsUk5Aa2pYMnoZD2c913wSewlE1trtp28UN8tkVwt8m/FJkEHg5jutp7x9KqQWAtOXS9aB1NUUddR1ED4pDDX0EwLHAjnwPJw6j/ArO9ruFDdrfDcLfUNmp5Rlrhw49h7COsLrjltwyw6a+yKSoVYEREHSvdtpbtbKi31jd+Gdu67lkdjh3g8QrI2QXqr0vqeo0NeXbsUkpdSSEnG+eofmvHEdh9KyIrG2saWkvFsF2t7f9o0Q3hu8HSRgklue0cx6+1TKe41hZ+tXRqDRdwk1FLqLS+opbJcKlgZVfe+kjlHbjt4Dnn613tCaRbptlbVVVwmudzrnh9VVS8C/HIDnw4nr+oLrbKNXN1Zp0STOa25UmGVTfjdknod9eVeASSeYW5TigUqMqVWRERARERkWHNp0FZoPaFbde2ePMU78VEe9hr5MeU09z2ZPI4LSVmMc1TNXWOl1Jp2rs9VwbO3yH/EeOLXZ7j9GUs23hdVe1rr6O6WyluVDIJaapibLC4dbTxGV2Fg/waNRVFN7oaCuzXQ1dA981Ox/No3sSs9TvK58d4rNdRU09LE6aomZDEzzpHuAA9ZWpluGWOrp9VI5rH982xbP7W98fuw6ulZ8GjidIP28BvsJVl3Hwh6Vz2x2XStRUE8vGKkMOf0WBxPtCXOHRkzphSAtejte2p3B/wDs/SdFCzqzSSk+1zwPoXyk1ztuqPwdtpYfRDG3/M5Tri9u/Wz1qvXiNO6F0bntBy3jyPZ6Fb15pae6W+rt9ZG19PVxPimbjhuuGCtevfRtxa/ecyJ3diAj619ma/2y0bN6ax0s7R8al3v8rws9U+HRfqwtL3i+bI9rVPco279bY60iSPfLWzx8nNz2OYeHZkcOC9UrNcaW7WqkulDIJaWrhZNC8cnMcAQfYV5R7SNQ3DVGo23K7WmK2V3i7IpmMY9okxnD913EHHDn1Bb+eBNeai8eD1ZG1UjpZbfLPQ7x+IyQ7g9THNHqXOvRL9ZtyoTCnCiiIiAiIgIiICZRQgKURAREQEREA8lCk8lCAEBQIEAFSg5IgIiICIiAiIgIiICIiAiIgIeSLWzwxdvVZs5p6fSek5mM1LWRCaaodFvijgOQ1wzwMjiOAOcAEkcRkMjeE9pdusNiWorK2aKKp6EVNKZHNaDLE4SNbk8PK3S31rzy2Ualp7DfX+OTdFQ1kYjmcQSGOBy13D1j1r5mLaZtHqHVE02odR77iTJPNJJHkHqLzujGeQ5KvWrYPtBqmb1RDbrb3VNY1xx/8vfVkvpjKzxV21W0XR8b3N91jL+jTyEf5V1ful6T/vlR82cvnT+DpeHN/rGprew9e5TvePbkL7f/AIcKxv8A2upvmLv51v8A38c9YfXOLaLo93nXKRn6VNJ/AFVSk1jpaoGYb/QtHY9/Rn/FhUCo8Ha8NZ951NQvd2Op3tH1lUOu2C65hY50Mlpq8ZwI6lzSf22gfSn+vhrH6yY+W13KLdc6irWHqO5IP4q3b1s/0vcmf+7xRS9T6Y9GR6uI9oWNarZXtFt/352m6vyOO9BIyQj9hxXTtuptXabqjTyVNWx8eN+lrWuIb3FruI9WFN/YvTrxV3xWjWuzmd120vcpauhbkzU5BLSOvfjzhw7xxHcu7sjqvfltSueqrxUQeOsYZYKYHkXeSNzPwWN4frD11PRm0W13h7KO4Nbb655w0FxMUh7A7q9B9pVJ2h6TqLbV++rSbn0lXTu6WaGDyS09b2D628iPXlx6Xd8VnAlQrP2aa1pdX2re8iG4wACpgHUfjj80/QrvC3LtxssuqlEU4QQiFQUZWjrLXlt07c2WmOjrbnc3tD/FqVm8WNx1n+AycLs6J1jbdV083ibZqeppnbtRTTtxJHx5+jgVZtyr5NCbUrrqK7W+aa2XWJrY6yGPeMJAblpPVnHLr4di7uzltZqLaJeNbR22a32yemFNAJW7rqh3keX38G8+XEceBWZeXa4zpZCuVdS222VFwrpmw0tPGXyvPUPt6sdqwdYaao2j64qNSXaH/ZNIQyGB3EcOLY+/nvO7Se9fXaVqGq1zqiLSWn5M2+GTM8zc7sjm8C89rG9XafUsi2G30tntVPbaNu7DA3A7XHrce8nin7VP0n9ruuXEBcyVxwtOSERCUaThda6VdLbbfLXVkzYaeIb0j3dQ7Mdvd1rhdLlR2uilrq6ZsNPEMucfq7yeoDmsGax1RctZXaKlp4ZvFzII6OiiBc97ycAkDznuzgAcuQ7TMstN449T5a01LcdY3qKnpYJ/F+lEdHSRgue95OAcDznnkAPQO/d7wR/B/j2d29mqtV08cuq6qPyIsh7bdGR5gPIyH4ThwHIdZPy8EzweKfQVPDrDWNLFPquZmaenOHstjCOQPIykc3DkPJHWTskFz27yamgckRFFEREBEyg5ICIiAiIgIiICIiAiIgIiICIiAiIgIiICHkiICIiAiIgIiICImEBERBr94V+wSl2kWx+o9NwxU+raWPA5NbXMH9m8/G+K4+g8OWi+kdTXbRd6mpaqnnZE2Ux1lFK0tex4OCcHG68cuPPke71pwtcPCz8HmDaFSS6t0jBFBqunZ99gG6xlyYPgk8AJR8FxOD5p6i1ssl8sN2m4Ut0t8VdQzNmp5Rlrh9I7iOsdS7awDo/UV00TeJaWrp6gQiQsraCZpY9jxwJwfNeO/nyPURna13CjulvirrfUNqKeUZa4cPUewjrHUuuOW3myx6XYRMoqyLk1y4qQUSMW6op6zZ/rKn1ZZYW+59S7cqIBwbk+dH3B2N4HqI9RzVaLlR3i1U90t83TU1Q0PY7u6wewjkR2q3rxQ0t0tlRb66NstPO3dcOv0jvBGQe1Y22fXuq2fatl0rfqhvuVUu3oZiPJY4nDZB2NOMOHUevgc58V0v8Aqf2Mo611ja9KU8Lq5s1RUVDt2CmgaDI854n0LraQ15bdQXV9nkoa61XMNLxTVce6XNx1fYccFQNpIrLDtBsmt/c6a426kpzT1DImBzoT5Z3+7O/z5eTz4hdanvDtoG02yXiy22oht1nY/pqyZoaZCRwYO3HDhnPFyb5WYy4srHmijK5ALTmhFOFCJpAUgqMK0Npes6XSFq6TyJbhOCKaA9Z+OfzR9KW6XGbuosjbBUx6R2i2nVlnqqcXMgPqKUk5eAMbzgPgublp49Qx14ps1o1vtGqm3TVFwfRUJwYYACAB+ZFnh1+U7ie9drZ5pSouFa7VWqt+rrah3SwxTcePDD3D6m8gOrlitay2i2uyvfS29rbjcBwLQ4iOM/nO6z3D2hY/tdd3xHOzbO9MW1nlUPjr+t9Sd/Pq4D6FcLJrXa4t1viVEwdgZGB9SwPc9Tat1JWthbWVcr5CQylow4A8OQa3i715XepdlW0a4ffG6arDn4U8rI/pe4J1fIdO/NZaqtZaVh/DagonfoP6Q/4cqmS7RdHt825Sv9FLJ/EBWxRbAtczMa6aa00mcZbJVFxH7DSPpVcpvB1uzm/ftTULD+ZTPcPaSFf9fDpwnt9TtL0n/fKj5s5fen2jaRkc1vuoWfpU8gH1L5DwcKz5XU3zF38y+NR4Ot2a3+r6moXn86me0e3JTn4aw+rG2s6jpb9fYm0MjZaKjiLYpAPPc7i53o5Aeheg3gqaabpPYZp+1umilq5IjV1fRva7clmd0hYS0kZaCG8/grRS57B9e0sRkpW2y4YPBtPVhriO374Gj6VQJbZtK2e5rI/fBp5meNRSVL4mgnhxfE7HHgOJ4rF37bxseruVK1f8DPbzdNeS1Gi9ZVjKi+08Rnoqro9w1UQxvNdjhvtzngBkdXAlbQZUbEREBERAREQEREBERAREQEREAqFJ5KEDKIiCcIoClAREQEREBERATKKEEoiICIiDoX250dls9XdrhM2Gko4HzzvPANY0ZJ9gXljfbjfNsG12avqPIrr5WZDc7zaaLqHVkMYO7OO9bseHpq2TT+xQ2elkcyov1WyjJacEQgGST1HdDT3OK1k8E7Tjqi73HUjm58XaKOmHDjI/BcfU3A/WKuM3Uyuptsho7T1PDaoqOla6noaRghha0DkB/wA5SuidS1stO5zXbhHEdYwrxp6eO30TI/gRMy49p6yrIlkdUVD5pPOkcXHu7l6MXkygChcgCEKsoKYQhcUHC41tLbbZVXKskaynpoXSyuPDda0ZJWuWzG0Q69vt+1hqilZVRVcrooonZ3Q8gE45HyG7rQfSr28J/UTrboWKzwybs10nDHAOweiZ5Tsel24D3HvVU0HZY9P6St9pa3D4oQZu+R3lOPtK5Zc5adsf847+sKbS9l9dYWy3Ky9LXWxvF7TgywDv+M3vA4dfauvs82gS29zLbfZpJaL+zqDlz4e49bm/SPRwWyDWtWHdrmzGONkuoNL0rWtA3qqhiGBgDi+MfW0ersWbjrmNY5dU1VG1hp6u0ldotZ6ScGU4w+WOLixgPXgc43dY6vZjLmiNV2/VlnZcKPyJR5NRAecT8cu8dh6x61g/Z5rv3Dp32u7NfUWwtJjwN50Zx5uOtp7Ooq0au5Se61W6wtq7ZBWHc8WgncS4H4JxjIJ6uKb0109XlsNrDaZpnT730/jDrhWs5wU3ENPYX+aPRknuWNLhtu1NJMfEaG3UkXUHMdI71kkD6AqHYtl+s7tuO9zRQwvGRJVvEfq3eLvoV0xbC7i5v3zUFM13Y2ncR7cpvKpMccfKkR7Z9ZNf5Trc/udTcPoKunTW2yGZ7Y9QWp0LeuekcXAd+47j7CfQrZvWxjVlCx0lD4pc2D4MMm5J7HYHsJKx9caCst9W+lrqWalqGedHI0tI7+Km7F6ccm31ju1rvlvbXWmsirac9bc5aexwPFp7iAse7aNcTUNP71LE577tWAMmMeS6Jjvgj8530D0hYR0vqG7adufuhaap0MuC1w5teMcnDkfX1rI2xa20dwlq9Q1lZ47dulLXCUkujBHnknmXcePpVl6uGeiY8rl2d6Uj0zat2TdfcJ8OqHjHA/EHcPpOe7F1Bct1QQtyOVtvNApBUZQFBywujfbjQ2W2PuFwmbDCzr5lx+KB1kr5agv9t0/b3V1ym3ByYxvF0jvitH/ICwpdbjqLaFqikoaOjnqqqpkEVDb6YF2Ceodp7XHHDsAUyy03jht19VX+8a2vUNHS0sz2OkDKOigBe57icDgPOef/ALLdzwUPB3pdntPT6u1bTsqNWSx5ihdh8dtaRxa3GQZSMgvBIA4DmSav4MPg+2vZjb4r5fI4bhq2eMdJNgOjogRxji7+ov6+rA555wuW9vRJoHJECICIiAiIOSAiIgIiICImUBERAyiIgIiICIiAiIgZTKIgIiICIiAiIgImVCCcoiICIiAiIgIiINfPCp8H6j2jUMupNMww0mrYI+rDWV7QODH9Qf2P9R4Yxozp2+3zQmoKigrqWeLo5DHXUE4LHNcOvB5OHavWhYL8J3wf7TtStj7xZ2w2/VlPFiCoxiOrAHCKX+D+Y7xwV2mt+WvthulDereyut83TQv9RafikdRCqGFgC3VWptnOq6u311HNSVtJL0Ndb6nIBPYR244teMjByMg8c36bvtt1BbG11vk3m8pYncHxux5rvt5FbmW3DLDTvohKZWnJBVs7QdMQ6ms7oWtaytgy6mkOBg4809zuHrwepXMpa3eSxrG65WpsZ1lNWMdpS+77LtRgtiMvB0rG82n85v0jtwsjXOut9pon11yqoaSmj86WVwAB7B39w4rDm2a20NvFFqajrDRXhszWM3Dh0uPhcORbjmeY4dixvq/VN61RXNqrtVdLuABkMeWxx9uG9p45PP6Fnq1w7dEy5ZY1Ptqoad7odP299bj+3qCY2epvnH14VpS7aNZO833Nib2NpuH0krH1FS1VdVMpaWCWoqJDhkcTS5zj3ALIVk2M6trmNkrm01sZnlNKHyEdu6zOPWQe5Z3a1rGeX2odtmqI5R45R22qi6wI3RuPoIP8Csi6R2qaZvj4qeomNqq3kARVPmOPYH8vbjKsp2wq4bnk3+nc7s8XcB7cq2dQbK9Y2ljpG0LLhCMkvpXhxAH5pw72BJcolmGTPOuNXW3SNn8erPvssmW00DTxldjl3N7T9oWKdG2G4asvUus9VOD4Tl0ETxhjgOXA8o29Q6+fpxtR1vRXWk92o6iugpHbjqaWRwLWg+YM+bx6leGv9d+7VKy12ffpbduDpsjdLzjzMdTR2dfoTq35Tp6fD7bRNfyVT5bZp+RzKbiJaoZDpO5vY3v5nuHP5bN9mNw1E2K5XR0tBanjLCMCWYfm55D84j0A81dGyTZlHO2K/aopd6J/lUtFI3g8fHkHZx4NPpKzO5rfgt3W93JWY75qXLU1GFtqVkh0RUWDVOlaVtE+gmETg3Ja5wy5rnccnI3mkk8QRxWx1nuFLeLPSXahdvU9XCyaI9zhnB+pY+1xZo79pK4WlzfLnhPRd0gO8w+0BUXwWdQurtFVVkmkDpbbUHox1iKTiB+0HrWPGWmb/rHfxmQhcVAKnK6uQiJlB9qCHxqrip97c3zjPPC5ausFO62S08zfGKGpYYZ2PAOQ4Y+ldeOR0MrJo/OYQ4enPJXpURR11vdH8CVmQezhwKzYsef9vqr1sn2sQV1LI03CxVwe08hOzs68NewkHrAd2heqOnLrQ36wUF6tsjZaOvp2VEDwchzHtBB+leePhXabdT3K3aka3d6cGiqRw4PZksPrbkfqhbL+ANqyS/bFTZaqRz6iwVj6Vpc7JMLvvjPUN5zR2BoXDKar1Y3c22IRQpUaEQckQEREBETKAiIgIiDkgIiIB5KEKICIiCTyREQEHJEQEREBERAREQEREBCigoNCP6RDUklw2sWrTjJB4tabY2QgZBE0ziXZ/UbHjhw49qvbwWrE226Csu81rX1AfcJCOsvOGf4Qxa9eFDePfF4QGrainc+ZrLgaOIYOQYgIy0frNK3I2d0TaG3+Lxt3WQRR07cdjWreE525/kviKzqifobU9vwpSGD0df0Kzwq9rCb77Tw9gLz7cfaqCu2LzZXkARSOSjCoFQGqSjfPa3tOEPLXzao33zeEFZ7Dvb9Lbo4zKzmAeMr8jvG4D3ALKg5LEeyyf3ybYtU6m6RssI6RsJHWHyBrD+wz6Vl8hcp7rrn6jjlBI5qEKz9q2p/evpSaqhd/Xag9BTdzyPO/VGT6cK3iMYy26YS2ue4ceu66Owta2BuPGGsx0bZ8nf3O7l68rYnY3s8s9h0vb7lVW1ovFTTtkqHygGSMuGS3PUOXAY9fNYS8HXRkeptWm5XKHftlrxK8OGWyy58hh7RzcfQO1bUXi50NpttRdLlUCnpKZhkkkdnyQPrPYOtZxnuuuV1xHyuFDb4aSWoqHMpYo2lz5nODQwdpJ4e1Yd1Ftf0ja6p9PQzVN23HFvS08W7GcdYL8Z9IHtVMg99+3jUrqeF01p0nBJutjGDvkHPEZ8uQg54+Swd/PN1o2PaT0nZOmobTQ1E0TfLnqIhLM7jxO+4fUAFd2+E1J5YTo9uWn5Jg2otdxgYT5w3HAd/PKuaeHRe06yva2aKqdGCGyNG5U0xP6QyPQcgq97lYbDcIjDcLLb6mI9UlMw/TjgsSa72WVFlmOpNnlRU0lZAd91I1+cjmejJ+ljsg9XYmr7J0+uGH9eaVuGkbw631m7Kx4LoKhow2VvaOwjrHV7F1dHX+q07fYbjT5c0eTNH1SMPNp+sd4CyzFcaPajo2elqGx094pwHFreTHjk9ufgu5EdXbyKwjPHJTzPhljLJWOLXNIwWkHBC53jmOsu+K2opKiGqpIqqnk6WGVgexw5OBGQV9Fj3YleJKzTUttldvPopMN4kkRu4gH0Hex/wWQGuXTe5twymrpyLfiq29baoodM2/pqr77UyA9BTg4c89vc3tP1r5691tQ6Zp/F4WsqbnIMshzwYPjP7uwcz3c1jfQOitYbYtce5tra+rq5MPqqqXhFSxZ85x5AdjRxPUOazll6XHDd5Uu10GsdqWsorbaaGa63WcHooIuDImDmfKOGNHWSQMnnkr0F8G/YTY9k9r8cmdFc9TVLd2puDmDEbccYoetrOHE83HnwwBcGxDZFpfZPpv3Nssbqitnw6uuMzW9NUuzwBI5Mbng0cB3kknIoWHoEREBQpRBClEQEREBERAREQMIiICIiAiIgIiICIiAmERAREQEREBERAUKUQQpwiICIiAiIgIiIIUjkiICYREGI/CH2Iaf2sWbpvvdu1HTsxSXJjAXOAziKXrdHk+kHiOsHz2v1t1lss1vNa7tSy2250+N+N3GOeM8nAjg9h6iOsdRBx6y4WOtuGyXTO1fTXuXeovF62HLqG4xNBmpncMgE82HA3m8j3EAglm2nOi9VUOpbf0lO4RVMYHT05OXMPaO1vYVcYCwftD0NrLZBrj3NuzZKSpbl9HWQ8YqqPPnNPIjtaeI6xyzkfQOtaPUlO2lmaymubBl8OeEg+Mzu7uY7+a6Y5bcMsNcxdYC41NRT0dJLVVUgihiaXvceTQBklS8qwNtt3ko9LsoY3br62UMdxwdxoyfad0K26TGbumK9aagqdRX2W4Tuc1nmwR54Rs6h6es96++gtKXLV17FtoW7jQN+oqHDLIWfGPaTyA5k+gkW/DG6aVscbXPe8hrWtGS4nkAFnZtzo9lGhWU9O2OovNZkta7k5+OL3fmN5AdfrJXOc+Xe3U1F30tDofZfZ2ukqIaV8gAdPK3fqag+hozjuAwFbNdtx0/HKY6W13GoaDjeO4wEe3KaC2W1l8qPfNtGqKqqqpzvsoXPwS3qMhHIcchjcY4Z6wsu26wWG3xCG32W30kfxY6Zgz6eH1rclrlenfPLGNh2xaRuVQ2GudV2reIG/PEXsHf5GT9Cy/brfbayiirKWsbW08rQ6KaJ4cx47QRlda4bINL6stLpqy00MT5AdyaGIRSjB577R29uVheopdXbBtR9I10100vUSBs8JON0nkccmv4cHDg7kerF3Z5OnG+GRdq+zqy37S9yqqe1tmvEFM99K9mBI54HktzwyO48FrfskNhfriibqBrX07siFr8GMzZG4H93P14W4tmvFDeLVTXa21DaikqWCSF4yMj0cwRyIPEFau+Eno9tg1b7tUMLWW66kvIaMCOf4bQOw+cPSexTKe4uF3xWe3SOd53nKCVZeyDUztTaSikqnb1dSHoKgnm8gcH+sc+8FXoAtSuVll0glYq2YMbpnwh7nZ95zKa5xS9E3OAS7EreHdhwHdlZYAWIdrc/vb2r6V1TvbkXkNmOOqOTD/AGsfj1KX63h7jYsNRTId17m9hIUBdHEREVIgq7NMT9JbGtd50Tiz1cx9atRVzSU39Ynh7Wh49R/4qVqMc+E/Ym3LQV6a1rd+CNlfEcciw+V7W7w9asb+jw1HJb9rV1065zRS3a2OfjHEywuBbjs8h0mfUs96/oo663+LyeZOx8Ds9jmrTHwars7TfhAaSqJt+L/aTaOVvLjLmLB9bh7Fxzjv+K+Y9TEUBSsOoiIgJlEQEREBMIiAiIgIiIBUKTyUICIiCUUBSeSAeSIiAiIgIiICIiAiIgLhK9sbHSOdhrASfQuapWrJjT6XutQ3g6OimeD3iNxQeV+kZJtVbYLfWVDR0txvIq5hzHlS9I4fWt+dKx9Hamu+FI9zj7cLQ/YGze2u6f7pnu9kT1vzYm7tqp/0f4rph4cfy+Yt3Uz+kvD2/EaG/R/xVOXau7t661Tv+9I/59i6q7R5wFMoiLBdK+VHidnraze3eip3yA9hDScruhWztWmdT7NdQyNdgi3TAHsJbjh7VL4XGcsP+DPTNbp261m75UlU2LPaGsBx/iWWgsd+D1B0ezpkn42rlf8A5W/wWRAuc8NZ3/VSFr14RF2dXavitccn3m3wDeA/Gv8AKJ9m6Pb2rYUfXwWql03tVbTZoekd/tK6iBrhzDHSbg9jcLOTX4/O2zuxPTTdM7OrbTyR7lXVt8bqTjB33jIH6rd0epWFt5uNw1VrO07NbPJuNe5k9Y8cgSCRvcuDW+VjrJHWFngMj3Gxt3WRDAHY0dX0LAewlvvm2hap1tM1xa95ip97Hkh7s49IY1g9BK1fUMbzbWw2y+zWnTulYqejjip6WnaYm5wN1o5k/nOOST1ldPWur6Olopaisrorfaosb0srt0O48M+nqaOKp+Hbm613Pqzwytb9Q1tRtP2gVUfjUrdOW1xbCIzhshBwHfpO4nPU3sVyuvCYzq8slTbadA+MdG2urXN+OKN+79v0K5qfUNtuWn3Xiz10NXSlp3XsJ4HHIg4LT3EArXrWemafR9dS3yhp2Vdqe8Rz0tQOkDcjlk9RA4HmD2rs1zfeJqCku1pqJXaeumBPDvEtA4Hl14HlDr4ELMt9t3GWcOWtGSaS1rSaqoY92mq3FtVG3ADifPH6w8r0hUHa/a46XVprIfwNwhbUMcOTjydj2A+tZF2o0MdZoqt8lrnU+Khh/RPE+tpKsLV9Q24bN9N3CTjLE99MSeJwAR9O4Cs2Ljd6r4bJL9b7BeKuS6VBhpJ6YjIY55Lw4bvBoPUXK5dVbVKVtO+GwQSSzHgJ52YawdobzJ9PD08lUPB+2CXLbBYbhdrfqKitTKKrFNJFPTukLssDt4YI7cY7lnvQ/gXaXoaiOo1hqauvW4STTUkYpon9zjlz8egg9/Up1Xw10y3dax7ENlOrNsGqHw0bpYqCN4dcbtOC9kXdxPlvPU0HvOAvRzZboDTOznTEVh0zQtp4Rh08zsGapkxgySO+E4+wcgAqvpfTtj0vZ4bPp210lst8Gdynp4gxoJPE4HMnmSeJKqoUbSiIgIiICIiAiIgIiICJlEBERAREQERMoCIiAiIgIiICIiAiZRAREQEREBERAREygIiICIiAiIgIiICIiAiIgtXaboLTO0TTUth1Rb21VOSXRSjhLTvx58bvguHsPI5XnFtz2S6s2P6oZHWPmmt0r8267wAsbLw5cD5Eg62k94yF6jlUvUlgsupLPNZ79a6S52+cDpKepiD2Owcg4PWCMg8wUHmxpXanTup2U9/ikZMBg1ELctf2Et5g+jh6Fbu1q/2/UFyonWuo6alggPlFjmnfc7iMOA6g1bZ638C7SddUS1OkdSXCyb5y2mqWCphZ3A5D8ekk96wJ4QGwC47ItOUF6uGpKO6srKwUjI4aZ0Zadxzt4kuPxcY71blbNM9Ml3Fi7HrTHXasZVTfgaGE1DieQcODfrJ/VVwaSbJrDXFbqisj36KjIZSsdxAI8wY7hl3pKpOiZ22/Z7qa5Nc4SyblO1w5gkYH0vKv3ZRQR0eh6R261r6gvncfSeB/ZAVxjGV1usrT3+22vTUV4vFdDSUoYA6V5PEgcgBkuPcASrVj216B8Y6N1ZXbn400jsent+hYsoy3XeoK27XaaVunLUCIIN4hrgOPLqJA3ndfIKmaR03HrG4VF4qoW0Nsjf0cNPTNDM447uccgCMnmSepa6r6SYSeW2+i9YUNRRRVVvrIq62TnIfG7IaevHYe1p4qobS7Xa79pqWGsjZUU84ETuR32O7O8HiOwrVOz1VRsw11TSQ1Ex05cnbk7HkkM7/S3gQeZGQtjR5m65zt3qGeGVZdsZTp8MNbD7hcNIa6ueza7TCWEl09FISQHOwD5I7HM8rGeBaeeVkLbHppuqNntyo2xh9VTsNVTcBkSM44HpbvN9ax3t+jdp/WGl9bUrXB8DxFNunBcGO3w31tMg9GFnpgj3G/DYcehwP/AATHxYuV5ljUzwe7p7n639z5JMQ3GnLN3qL2+U0+wOHrWxJWqkrPehtLdDvPay1XUsBPMxsk5+tv1rat3wu4kKY/D8k9ixT4S1P0mlbbWbueirdwnsDmO/lWVCVYO36HpNmlW78VUQP/AMW7/qVynDOH7MuaeqvHrFb67e3unpopM9pLAcrvYVr7JJem2Z6ck3v+r4m+sNx/BXSuk8RjKciIippBVR04/dvEX54LfoVPIXZtJ3bnTu/70fWgr+qY+ktjnfCje1w9q0I174xpva1daildiejuxqoOwHf6RvsyF6A3tu9aqj9HP0rQrwgI+j2tXv8A7x0bv/KauOfh2/F5eqkErZoWTR8WSNDm+ghfVUbRE3jGjLLUfjLfA7PeY2qs5XN3EQckQEREBERAREQEREBERAPJQpPJQgBAgCBBKKFKAiIgIiICIoQTlETCAiIgKia8Djom+7vne51Rj925VtdG/U/jlkrqP8fTSR/tNIQeW3g9lrdrtj73ygenonLfay/+6qX9ALz/ANhszYdrGnpHOxmpLPW5jmj61v8AWM71qp/0cewrpj4cPyrTuH/vOo/8V31r4Bdi6DdutU3/AL131rrrs4gCIiArL23u3dlWoHf/AAuPa9qvQBWhtpi6bZbqFvZRud7CD/BTLw1j5ix9hH/8srb3yTn/AMxyvolWHsHfvbMqFvxJZm/+YT/FX0VjHwuX7VJO75S1c2MMbJtS0+2TzfGw71gEhbQg/WFqxohzrDtStTZvJ8UurIZSeGB0m476MrOXmOn4/Fbl3OV0dnq5G+cymkI9O4Vh3wVQ33m3V3wjcAPUImLNj4GyRPp5PJa9pY70EYWCvBimkoffHpuqbuVdHVB725zxGY3Aegt+kLV8s4/rWW7/ACSQ6fuE0fnx0srm4553CsC7DII26VqJm+e+sId6AxuAtg52xzRPhkbvMkaWOHaCMFa1aIrm6G1TddJ36ZlPEJcx1DhhriBgO68BzcHuPBTLzDHnGyLp2qtj94Vz6bzQIy39LpG4Voaua12xq0um88dB0eefmu/gu1r6/R6vq6TSunZPGInzB9RUAEM4enHkt4knrOMZXX1fJDqe+2zRtic19FRkdNM3iGhowT2eS32k4Wa1OJF03pznbOql03nG2He/drGFwd/+U9ua78pPx6N1yydtRqI7foita3db0obTxjuJ5D0NBWNdWQuodC6et7s78m/UEY4jPH/UpkuDbH+jaa73j6pd8E3OMevogtszyWtH9HjZ5qHYzX3KXzbnd5Xx8PgRsYzP7Qctlll1FKIgIiICIiBlERAUIpQDyREQByREQEREBEUIClMIghSOSDkiAiIgImUQEHJQpQEREBERAREQERQglQmFKAiIgIiICIiAeSKMIEEoiICIiAiIgLVP+kjDvudaZd8H3Xd7ehctrMrXH+kHsrrlsMiuUbTm1XWCd/cx4dEf8T2oNJ7W533J7u1v5Qiz6PJ/4LKmnJHN2b0nR+cLYMeno1i3R0TrhorUdsbnfYxlS0Dmd05/049ayRsnq467Q9I2Tde6AvgeO4HgP2SFrFzz8LV0aGt2O3t0Xnkz7/b5jf4K7dk0bfeFb+j6zKXenpHf8Fa2lH0+l9QXXR98c1lDW5ME8nAOBG6CTy8ocM8gWr66DvcekK6r0rqCToYhLv09QQSzjjj3NdwOeQOcrUZym5VT23wRu0hFM7z46tm762uys6WB7pLFb5JPPfSxE57dwLX7XNY3W+o7VpGwTMqWmbemqI/KY04wXA8iGtyT2ngOK2LibHDEyGNu6yNoa0dgAwArjzWbxjIxR4UzW+8W2u+ELiAPQYpPsCy7ZpHOsVvc7zjSxE+ncCwz4T07qq36fsNO10tXV1jnxRjGXEN3APWX4WcIqZsNPFSx+bEwRjvAGFcfNP8AmNOdtwa3atqDd/vAPrLG5WzkTt6JjvhFoPrwtWtpMsl42oXnxdu86a4vgj/OIduD24W0zRu+S3zRwCzj5rX5PEclZG3If/lfd/TB/wDvMV6qydubv/yvube10A/81i1l4c8P2i7Ng8jpNkthc7qge31CV4V8qythsHQ7J9Pt7acv/ae538Ve2FrHxEy/aoCIi0yL7UB/rtP/AOK3618V97aN64U7f+8H1oLsvB/2ZVf+EfqWh3hElrtq913epsQPp6Nq3wvZ3bVUf+Hj6VoJt1k6baxqB29nE7W+yNo/guWfh2/F5en2zZrm7P8AT7XecLbT/wD7bVcAVO0zT+K6ctlK4Y6KjijI9DAFUsLk7iIiAiIgIiICIiAiIgIiIB5KFJ5KEBECIClEQEREBERAREQEREBERAUKUPJB5P6hpW6H2zV1P0b4orLfn7oAweijny3HcWAeorffTkjXWzdb/ZvcPUeK1B8NqyusvhC3uTjuXKGCtbwAGHMDDj9Zh9eVsfsZv0d60vbqprv96oYpOefLDcOHp4fQt4OX5He1CN28Td+HfQum1VfVcW7cIZPjxY9hVJAXaPOYQoVBcqCoO0SmdXaFvtG3zpbfO0encKrmVxlgbVRPp5PNlaWH0EYUs4J5YJ8HOo6bQs0PwoK949Raw/asmYWIPBulmp336y1EfRTU8rHuaTxDvKY4eotCzA5c54dM5/oAatY9tNt9y9otw3W7jandqmYGPOHH/ECtmjyWI/CNsrZrVRagj3RNTSdBKeALmOyR3nDs8Pzipl4X8d50zzpi6R37TVtvULt5lZTMlPcSOI9uVhbWTm7O9vUGopmuZab5FuzyY4MJwJPY5rHnuPWuPg263bS6XqbDXNleyjnL4C0Z3GSZOD+sHH1q5tq0lr1npp9p8XeyUOEtPUSYBieOvHYRwI7PQrveJ+uVl8L4vFxho6TzmulePIA4g9/oWLtZ6Xteqot6ua9lUPMqY8dI3rx3t48j6sKzNG62rLPKzTur+lhfTgRwVEvlbjeprufk9jhwx7Vk6JzZomyQua9j+Ic0ggjtym+pmy41iiLZRWRzu6PULWRHIJbC4Et7POV86R0vbdN0joaFrnyyfhJ34L5O7uA7B9Kr5Zusc53ktHMngFj3WuvWw71n0u51bcZj0fTRDebGfzfjO9HAepTUjW8suFP2hVTtVawodJ0Lt6np5N6pe3qdjyv2W8PSVa20+5R1mq5o4d3xeiYKaIA8AW8/pJHqVzU1PDs/0vNcqpzJb9Wgxszx3CeOAewcyes47ljekqqinqIrhH+FhmbI2R7A8b4O8Mggg8RnBzlYrpJ8eqGwrSnvI2R6c0y6PcmpaNpqBjH355L5OH6TnK91r54Im3O5bVqS5WfUVLTRXu1sZKZqcFsdTE4kb26Sd1zTgHjg5HLktgxyUdBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERATCIgIiICIiAiIgIiICIiAiIgIiICIiAiIgYVo7YtMN1nsv1Fpno2vfX0EjIctDsSgb0ZGesODSO9XcsEeFptwrNktpttDY6Omqr7dd90TqjJjp4m4BeWjG8SSABkDnzxhBodszukNv1XTmo3fF6ppppgeWHcvpwFdeh5naP1rW6WrnObS1Lg6mkfwyfgH9YcPSFji911XdrnW3qs8qWuqZJ5ntj3WGV7i9wAHAcSeA5LIz4odomkIqqFzGagt46N3HBkHUCex3MHqOVca52L31bpq26kpGw10bmvjz0c7MCRnd6D1gqw5tlVdJK1rtQtfEzgzfhJLR2Ab2FVdEa8a5zbLqhzqS4RHo+mmBAkP55+C7vPArIe5vMa5vlNPIjiCt6lc95Y8KJonTVt0mzpKHMlWRh9VIBvuHxR2N7hz68rJtquMddFvN3Wyjzmk8u/0KyJ5I4YnSSOaxg5ucQAB3lY11friquMr7BpB0s01QDHNURcPJ62tPDget3LHLtV3MUkuVXLp2Ru0Tb0btDiaz6fjHRP5se5pO4fW8ucO5qzZqG6x2PT9wu1Q7dZR075vWG8B7cLHWyA2PR2mm2mbfZVyPMtTUbpc2R+OrHEADgBj61b3hI62pZtK09htcj3ePTB07y0gGOM53ePa7dPqTeptb/rKSeGLdkNudeNotsbJmVsUpq5nOOT5Azn9rC2fLVh3wb7M2G311/kaDLO/wAWj5EtY3Bd7Tj9lZhBcpjOD8l504rHPhDVTYdn/Q73GorImDvADnfwCyThYh8JSd0lLZLPC1z5J53ytaOZIwwDHeXFXK8M4ftGaNmFM6l2e6fp5G7r47fCHDv3B/xVxrr0cHidJDSt82BjYx6GjH8F9t5dJOGbd1Kk8lATKqBXesDOkvEPcS76F0VVdJs3rhLJ8SI4HpPNS+BWNRPb7n9H+Me1vqzlaD09NHrbbHFRtc6WK+X9sIcM56OWfH0NPsW5+1y+Ns+nK+s3v9zopZjjnndOFrF4GFldevCF095LXRW8S1sgLcjDIyB/ic1cc74d/wAXuvS4BSoCnKw7CIiAiIgIiICIiAiIgIiIB5KFJ5KEABERAUoiAiIgIiICIiAh5IoQSiIgKMKUQadf0jWjJJqLT2vKeHPQE2yrcGZO67L4iT1AO6Qel/tx14NGurLR6cbpm7XSGhrYKh7qPpnGMPY8g4D+W9vF3DOTngt7dd6Ws+tNJXDTF/p/GLfXxdHK0cHNOQWvaepzSAQeogLzh8IrZDHshvtLbnaqobx460ywwNjdHUxxAkB0jeIAJGAc8SDgcDi43TOWPVNNqZJJJvvjpHS55OLicj0r5uc1aQWLWWqrBuOs9+uNJE3gI2zOMXo3Dlp59ive0betZ0u62uht1xAGC58RY93flhA+hdZ+Se3G/hvptLlFgO2eEVHvhtw0s9jfjU9Xk59Dmj61cFF4QGj5v94obtT97omOH+FxWpniz28oy5hSDurGse3HZ+7zqyuZ6aN5+pH7btnv5Uq/mcn2J1T6nRl8WHbo49N+EjdqJzXMgujZHsGeDjIGyj/ECsvAb3mrX/bDrnT941pY9S6ZkqJamiAbUb7HRh4Y/eYPXvPB7sLoau2vaguzH01pb7j0r+BMTy6Zw48C/hj9UA9657k263C3TMmu9d2HScToZpPG7jjMdHCfK/XPJg9PHsC1/wBQ3vUuvL82ORr6iQnFPSQZEcQ7hy9Lj7eQXc0joS9agf41WF9BSuO86ecEveSeOG8z6TgelX3dblpnZvbTR2unZUXORoyCQZH/AJ0juodgGO4LPN8mMmN45rGGn7xdtG3qaGWncMO3Kmlecb2O/t7CM+tZrsF5tt6t7ay31DXs5OaeDoz2EdSsmy7OtUa2ZU37UFY+hlnb/VRLHlz+zLc+QznjrPPHWbNvFj1Voe5tkqoaihlziKojdmOQdzhwOcZ3Tx7Qk3GssZl/6zHqKx2u/U/Q3Cla9wyGSjhIz0O/hyVmHQV6t7nNseqKinizwZvvjI9JacfQqZbdp9yhY1twttPVfnMcYye/rH1KpSbUqHc8m01O/wBhlbhXcSTKcPo3Q2pLgOjvGrJpYTzaZZZcjsw4gKusotKbP7Z45J5dW4ENc/Dp5T8VvxR6MDtKsa57T7xMx0dvpYaLIxvE9I4d/EAfQqHZ7TqLV1yMkLZqt5OJKmd53GdeC4+nkPYpv4avtF5r7xrLUbSyF0s0p3KemYfJjb2DPtJP0LK/vVp7Ps3uFnha2aaSmfJLKW/hJd3PDuGOCq+itIW3S9I7o92prpBiapc0AkfFb8Vvd19ar8tM2oifC7zZGlntGFZizc96kWl4Alx8R8ICKn3sNr7XU057/MkA9sYXoq1eXfgt1zbP4QGjqiZzmZuHQOGccZGOjA9rgvURYd0jkmVClAyiIgIiICIiAiKEEoiICIiAiIgIiZQEQ8kQEyiICIiAiIgIiIGUyg5IgZREQEREBERATKJhAyiIOSAiIgIiICIiAmVClAREQEREA8l53/0gNydXbe/Fd7LbfaaeADOQCS+Q/wCdeh5Xl54VVwbdPCD1jUNk32NrhC3jnHRxtZgesFBctNpalvGzK32iZrYJRTsljkDRmOUjO9684PaCsU26ovGi9Su3o9yoi8mSF3FkrD1eg8wVsXTUvi9PFD+LY1nsGFRNaaStupqHo5v6vVxg9BUtaCWfmntb3exdLj8cJnq6qhCm0ntAt3jW7uVbGgOc3DZ4j2H4zezmPQqG/QupLf8Ae7PqqdkPU0SyQ4HZhpIVlXuzai0jcBNI2anIOI6qncdx/ocPqPsVZte067U7GsuFLDW4HnA9G495IyPoU3PbWr6VkaCvVw3fdzU1RPFni3ffIf8AEcfQrw09YLXYqfobfTgOcAJJXcZH+k/w4BWgzalb93yrXV73YHtIVNuW064TMLbfbYKb857zIfT1D603CzK8VkW+3O32eidWXCoELOTRzLz2Adaw7qa8XHV94hpaSkdub25TU7RlxJ6ye3t6h9K52eyao1xci6nbUVzwcPqJnYiiHe7kOfIce5XlfdmuotGxU1+03XS11RTg+MtiiAcztIbnymdRHE9fol3TGTH/ANWfY7tqbQN/fHHv08g/DUs3GKZvbjkeXBw4jt5hZ80Hr+w6qiZDHI2iuO7l9JMeOfzHcnD0ce0BWTZLxpnaJavc68U8VPcWA4aDhw/Pid9bfoPNWLrDQV6sMrqih37hSMO8JoWkSR8etvP1jh6FfHgsmV1Wzpc1vnLEV8jbqTwjrJbm7z4bc2J0gB4NLN6Y59ZaCrL0lta1FaGMp7li8UzeA6d5EoH6fHP6wKqGyfXFhtev7zqrU0lTFNVtc2nbHH0gYHvyQevg1rWjuJTcujHCzdbVnylGFjeLbds9+Fcqz5lJ9iiTbls9b5tZXP8ARRvC6dWP1y6MvjJKkFYjrfCA0bGfvNDeKj9GFjR/icFQbn4RVK127bdMTSt+NUVQZj1NafrV68Tt5M+KWvdD98bI6LHwgSMetatXXb/rCp3m0NHbKFpGMiJ0jge0Fxx9Csa+6x1XqFr3Xi/XKrjOA6MzOEI7txuGjPoWb+Semp+K+2bfCP17ZajSk2nLXdYa+4VM7BVdC8vEcbTkgu5bxc1oxnOMq+f6OLRzm++LXlRC7ysWulcWkcMtklI7f7Md2CsG+Dvsidte1LU2mPU1DZ2UcQnmje10lRJHvAF0bOAIHIne4EjhxC9HtAaTsuh9IW/S9hp+hoKKPcZnBc85y57j1ucSST2lcsru7dscdTSvgKURRoREQEREBERARECAiIgIiIB5KFJ5KEBAERBKHkiICIiAiIgIOSIgIiICIiAiIg4u5Lyj266prNZbXNRXuuqHSNdXyQ0/MiOCNxZG0Anh5IBIHDJPLK9XHfxC8naq3Qw7Y5rbXRiWCPURp52O4h7RU7rgfSMolrKGlrpoyez09ptddRPhY3cEE4DXPPWS1/Mnmea7lVobStZDvSWWma13woW9H/lwq7qTwf8ARddK+S21VwtD+PkxuE0ec/Fdx9jsKz6vYjra07vvf1hE9o5NMstNgD0bw/gumr8cty+K+Vbsq0vN+BdXUvcyYEf4gVSanZBR/wDR71UN7nwNP0ghd19j25W17muofdBg4A78Em938CHe1daS+bVKH/fdFzP/AEKOT/SSpx8P9eqpjtkNV8G+s9dMR/qRmyCq/LkXzYn/AFKoHX+qqf8A3zRNU30xys+tpXxftVr2+T71ntd2dO7+RP8AK7yfej2P0bf98vkz+6KBrfrJ+pXDQaN0rpun8cdTxfehk1NY4OLSOvjwB9AVmXXalqGGJu7YoqHpM7j5w92e3GcAqq2zZ7rXVlW2q1hcn0NODkQkh7wPzWA7rfSePcrNeksy911b1rm53y4e42iqOaomkH+8bpDiO1oPmgcPKd7BzV27OtmNLaZm3bUTmXS6uIeA/wAuOI9vHz3Z+EeA6u1XxprTll03b/E7PRshaQN+U4Mkh7XO5n6h2Kplqsx+s3PXEci7eXyqoYaynfT1UMVRBIC18UrA9rh2EHgVKoWsdV23StFFUXDpZZZn9HBTwtzJK7sA/ie5Vibt4Uu7bLdE3BzpPct9E89dLIYwPQ3i36FiNmjLT91Ot0nNVVvikQJjkDmiR3kNcMndx1nqWW9L7QKG9XptlrLbXWe4SN34Yaxm6ZR3ew8x7VZmrYPEfCEt8nmtqYY3HvzG5v1tWLp1x6pvaq27Z3pWhe13ue6peOGal5eD6uA+hXRT08NPE2GnhZDEwYbGxoa1o7ABwC7JaoIWpNOVyt8uAX0Y7d8pcCuBKowDb6xundsFLcJHbjLdf2VBPINaycOz7AvWdeRu02Po9d3Zv/fB3taD/FetVsn8atlLVD+2hZJ7Wg/xXKvVPDsoiKKIiICIh5IChSiAiIgIiICIiBlDyREBQpRBClEQMIiICIiAiIghFKIGEREBERAREQFClEEKURAHJERAREQEREEKURAwiIgIiICZREEOXkxqSqjvm2C51bfKZcdQSyg8wRJUE/xXrDXTNp6KaodyiY559QyvI7Z1F02t7TH/APEB3sGf4KxL4bKyO3t53/PNfJyhp8hcgurybfKaCOaJ0c0bJWPGHNe0EOHYQVa1z2d6Vrn73uf4s93XTSFgHq5fQrwDVLQpZtZlZ4YQn0Za27U6DScNVV+KThhlkJaZGksc44O7jqHUsu2bZZom17rnW99wePhVcpeD37ow36FZmnIvHvCHq3ec2mieQezETR9ble2rdd2+x3f3Hp6Guu1zDQ99NRxF5jb+d7Rw49XasyR1tt1Iu6mip6WnZT0tPFTwxgBkUTA1rB2ADgFyDt1W7o3Vtt1VSzSUPSw1FO7cqKadu7JEe8e32FXAtzlyy3LyxztF2Y0N6lddLC5lsuoJf5A3Y5Xc8nHmuz8Iesdas6ya3u2n6/3D1tRzRSMH+8FuXgdROPPHA+UPpWeQFT9Q6fsuoLf4neKGKqZx3XEYfGT1tdzb6lLNeG8c+NVYFfo7SeqKfx5sMR6XiKqjcGlx7eHAn0hW7WbH6HyvFb5UM7BLA131EfUvvddnOrtK1T6zRd0lq4ScmAuDJCOwtPkP9PA9ypFr2l6om6WOSwNrnwHExgjeCw568ZA5LO57jUmXqjtkFT8G+xfNiP8AUoGyCp+FfovVTE/6l2xtRufm+9SXe7Olfn/Ivo3aDqmo/wB10ZVP9DJX/U0KcLvNFNsho/8ApF8qHfoU7R9ZKqtHsp0zC7emmuFT3PkDR/hAP0qmw37alcH/ANR0ZOz9Kil/1ELtMtG3K5PHR2s0LDzO9BHgdvlEn2LU18T/AF7q4KTQmlaNv3uy078dc4Mn+bK6eqbjpCjtU1pulZRMgkbuGnhaC5vYQ1nLBGQeC+dNsY2gXbe93tYRQtPwRUSz/R5I9iurT3g/6QoXtkulZX3eXraSIY857G8f8XqTV+G5PNYM2OauqNCbU7LqOhqnNipqxrJ3cQJKdzt2QEd7STg5447F6wN+peS18tUFVtTq7LR07KenkvTqOGKMYDW9NuABetTR53pK511jkOSIOSIoiIgIiHkgIiICYREBERAREQDyUKTyUIAREQTlERATCIgIiICIiAiIgImUQEREEEryr20xyWHbxqv40GoJ6lo5cDMZAPpXqqV5h+F9SupfCM1c1zN1slRHK3vDoWcfblErb61UMNy8ac6RzXA4Zu4xk9aowLv+e1VfZxN4xam1H4yGF/tYuhcY+huFRH2Sn616JXkyj4Fq5Mdu+bvNXEotI5Oe5fN43vOa32KSEHNNLtr14Xjd2XTP6NV9cSyxu7qxh4Xcf3jTsnxXTt9oZ9iyhne8pcp+1dMrvGAK5LjhFrTkFY62owV1v1Rp7VtPbZbjRWtzm1NPGMuaHfDA9ftA5c1kVAVLNtY3VYunuztom0XT1VY7XVw26zuM1RXzs3C48DuDu4AYzk5PAAZNP277tDtN0vdt7daWxsd2YZMSfoesxFyw14TVNvUVlrfxcssXtDT/AKVnWo6Y3eWmQ3ny3KMr407+miZN8dod7RlfQLTlUqC1SuTQite9r8XR69uH54jd/gH2L1M0FN4xoexVHPpLdA7P/wAtq8wNt7Wt11P300R/wr0q2JzOqNkGkpnec+0UxP7sLlXpx8LxREUaETKICIiAiIgIiICJlEBEHJEBERAREQEREBERAREQEREBERAREQEQckQEREBERAREygImUQEwiICIiAiIgIiZQEREBERBR9aSin0ZepuXR2+d3sjcvKvZPH0mvbZ+a57j6Axy9P8AbHM6n2T6qmj85lpqSP3ZXmbsWj3td0m9+KlP+FJ5Zy8VngNXLCkriSuzy6TlS13lr5krhK/o2Ok+IC71AZRVhbFi6s2paoujnbzWtljH68wx9DFV/dJ2gdpl9u14ttXNa7w1j4a6nj3+jLR5h7M5PX1N9VI8Gmnc6nvdc5xJklijJPWRvH/UszNc7zfOasybjpllq6Y52ax1V41rqDWbrfUW6317WQ00Mzd10mMZeR+rz/OKyOjzvLiOa3jNOeWW65LiSuS4qMjB5bfSPrWMfBYH/tHrDs34v88qyjEfLb6R9axT4JT+muWq5vj+Ln2ulKn/AE6YfrWwQd+j7Ap6T85cFxXXUc+qvo47y4bqlSEN7cc7qrN1t0NDFTubI5znuDXZxzxz+tU6hi6athj3eb2+zKqO0Cfxe2dN+LbJJ7G5/gpVjSjZuXXzb3p6SNvSNqtTQTHvaakPJ9mSvVUry88EynbVeERo6FzcgVrpP2YpHZ+heoa8z1yaByRMplFEREBERAREQEREBERAREQRlFJUIARAgQThFAUoIUoiAiIgJlEQEREBERAREQDyXnN4e9J4t4QdXJu7vjNupph3+SWn6WlejK0N/pHbY6Halp67jzauzdBjHXFM8k+yUexBlvYNVeOaFtNQ7zpbbTuPp3VUdRR7t4m/Pw76FZngpVzqzZrad7mynlhPH4kpA+jCvvVrN25xSfHiH1ld8a8uc1VHTKItsBUAKUQYN8LiP/YVkk7KqRv+AfYsg0zt6nid2safoVj+Fqz/ANjbTJ8W4lvtid9ivGzP6Sz0UnbTxH/AFz910v6R21yXEBclay4uUFSUUHFY18JGDpND0k34mvZn0OY8LJJc3f3fJ3uzrVibd4+k2a1zvxU0Eg/bDf8AUpfDWN/1Hd01L41pq21Df7Slid/hC7hVD2b1DZtC2l3ZTBn7JI/gq+QrGcpy4IZGx7znOa1oGSTwAGOa5mP4Xm9awztV1x49v2WyzZpOVRUsdwl/MH5vaev0c5bprHHdW5rO5O1ZrOokt8L5zUSsp6SNjTvScmtAHPLjyHevVfRtpbYdJWmyt3f6hRxU5xyy1gH8Fpn4D2xGsuF4pdp2qKMxW2my6z08zONRL1T4PwG8d3hxPEeaM7xLk9EmonKIERRERAREygIihBKIiAiIgIiICJlEBERARByRAREQEREBERBGVKhSgYRByRAREQEREBMooQApREBERAREQEREBByUKUBQpTCAiIgIiIKVq21Nvml7rZnboFbSS0+TyBc0jP0rym01XTaP1tF7pU74ZqGofTVsJ85hBLHtx2gg+xetpWlfh07FKhtbNtQ0zRvlikAF6poWZMZA/wB5/R5B2Bw87lkhEs2pbJ45mNkjc17HgFrgchw7VJWFtl+uvcvcs94kPiJOIZzx6D80/m/V6OWamN3mNc1zXNIBBByCD1rrLt58semoC6t+k8X0/cKh39nTSu/wld3Coe0OZsOhbw741K9vt4fxVvhJ5dDwbYOj0VXTO/tK8gehsbPtWTVYOwSPo9mtJJ+OqJ5P8e7/AKVfm83f3d5u92daY+Fz81yQc0RaZSVxKklFkQTus3uwErGXghw7tFqGo+NJAz2B5/isjXF3R2+pk+JA8/4SrH8EiP8A9lb1J21zG+yMfan/AFGp+tZtREXRzEBREHf083evEPcS76F0NuVX4joq61H4q3VD+/zeCq+kmb1ze74kR9uQrI8KSu8T2a3lzfONIyH95KGn6CVnJrGcxhbwEaJtV4Q9skc3e8Wo6mb0EM3Qf8S9HsLQf+jmt0k22C93LdzFSWR8ZPY+SaLH0Mct+F53rApREBERAREQEQ8kQETCICIiAiIgHkoQogBERAUqFKAiIgIiICIiAiIgIiICIiAtPv6Si2NdZtH3r4UVTUUvqe1r/wDQtwVrZ/SG2zxzYlRVzW+VQXmF5PY17JGH6S1BjTwMa/ptHml3vKp6+eP1OYx/15WadYs8ilk73N+ha3+BdX7r7vQ8uiqYJvU8OYf8q2b1ZHvWxrviSj2YIXXG+Hm/J5WmiIurmk8lxKnKgoMR+FVB0mzWnm/FXKI+jLJAqxoibxjRlnqPxlDE7/AF8vCUi6TZLXu/FVFO/wD8wN/1Lr7LJem2e2JzeqkY39nh/Bcv+nT/AIXKOa5LipC1XNKpOsrlNZ9JXS6UrWvqKamfJGCMjPUfQM5VWXyqIYainfT1EbZYpGlj2uGQ4EcQpVlYkh0C2s2Ye/aTV1092DSGt8YNQRG08+j7e7OefV1KqXuqqtRbA57lWt/rEtEJJOGN4xyDyvXu5X1dsks+PF23y9stRk3zbxUAxZznHo9We/rVya4pKen2cXiho4WRQxW2VkbGjAaAw4AWNV1uUtiytjr97QVC34j5W/8AmE/xV3y1MNLTvqKiZkUMbS573kANHaVY+xuop4dnr6iqkZDDBUSl73HAYMA5+lY/2ja0qNRVDqOj34rXG7yW8jMfjO/gOr0q9WodO8qqm0XaHNfA+12dz4bZye/k+o9PY3u6+vsWS/Ax2KWXaNcqvVGpphUWuzVLYhbMECpl3Q4GQ/ix8UczzOMg4vt+gpKfRtyvN4a+KrZTOkpqbkYwOO8/vIHBvV18eWwP9G5eT7q6wsbpBh8NPVxM68guY8/Sxc7vfLrjrxG5sEENPCyGGNkcbAGtY1oAaByAA5BfUckRGhERAREQEREBMIiAiIgIiICIiAiYRAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEHJEQEREBERAREQEREAr5TQxzROjkja9jwWua4ZDgRxBC+qINAvDQ2KWPZ5X0erNMyMpbZeKkwPtgbwp5d1zy6M/iyB5uPJPI4IAxbs619JYdy23Zz5rYT5LuJfT+gdbe7q6uxbDf0kd4c12jrG13kO8YrHjPEEbrGn15d7FrzXaAkrNF2y82fffWOpmyVFNnPSZyd5v52McOvHbzs36Yy1eKzLBU09VTsqKWRksMgDmSMIIcO0K0tr0jo9AXDyvPMTf/MasY7PtZ1mmavxOq35ba9332H4URzxc3v7R1rI21+pp6rZv41SzMmhqJ4Sx7TkOHE5+hb3uVz6dZRU9N1VTp7YRDcKJv3+GgfMzIyA57yd71b2VSYtAQybKvfx77Lt7s+KeO+M+MncBxno/jZ6s5znq6lfugaWnqtmtmpaqFk0EttibIxwyHgs4gq3DsjtXGnbfr2LUX9Ibd0w6POc4/44z354ovVJau7Q1yqLxo21XSsa1tRUU4fLwwCeWfXzVXXxpKeGjpIqWljZFDEwMiY0YDGgcAF9lqOWV5ERMq1lTdVTNp9L3WZ3wKSU/wCAq3PBOhdHs/uE3425ux6BGz7VVNpsvQ6AvznddDI31kY/ingyQdHsnpZPxtXO/wDxBv8ApUn7On/FZOwiZRdHMUZUqDzQXDo5n+9SfotWG/DGruh0PLT73+8VtPD6QGuf/BZt0lHu2x8nx5T7AAtbvDPrW+L2uj3vKlrpZQO0MaG5/wASxleK6YTmL1/o17W5sOsr07zJHU1K3hyLQ9549+8PYtyVrJ/R0251Psdu1wd/0y9SbvoZFGPrytmxyXB6RERAREQEQckQEREBERAREQEREEFERACIgQFKhSgIiICIiAiIgIoUoCIiAiIgLEfhg2d968HXVlPGWh9PTsrASM4EMrJHe1rXD1rLit7aRa471s/1BaZI+kZWW2eEtxnezGRhB53eCdcJKXXlfS7wayotzn46y+ORhH0Fy3Pv7WzWeo3fih49uVoZ4Pdb4ntXtTfg1AlgPodGf4gLfWiPjlii+F0lPun04wuuHhw/LOVkhSuI+CpC6uMSQoIXIriUFk7c6PxzZPqCL4lOJv2Htf8A6VaOwqXpNmVtbvZ6N8zD+9cf4rI+0SldWaCv1K3zpbdO0dfEsPFYk8HGo6bQtRD+Ir3j1FjCueXl0nODJyIoyjmlcURF04nkqZq4NdpS6xu66SUf4CqqQrI22XiSy6Cquhdu1Fa4UkfaA4EuP7IPrIUvhrGcxr2b3We9iPT8btykFQah+CcyOIAAPcMcu30BZH2OaToZKGHUtduVEr3OFNGRkR7rsb5/OyOHYrCt+k7pWaEumso2NbbbbWQUcjiPPklDjgfo7oz+kFk7YjVOm0e+n/u9U9o7gQ138SsY+Xb8njhed3pvGrZVU+7vdLC9ntaqD/R/13ie33xf++2epg9jo5P/AE1dMR8tvpH1rGPg6Vcel/Cd08x0joYmXeShOTjeEgfG1p9Jc1XJn8V8x6agqVClYdhMooQSiIgIiICImUBERARQpQEREBERAREQEREBByREBERAREQEREBFGVKAiIgIiICImUBERAPJEQckBERAREQEREBETCAiIgIiICHkiHkg88/6QW5eO7d4qNrju0FnghxngCXSSE47fLHsCrNmpfE7VSU+7u9FAxmOWMNCx74S9S3UnhN6hh6R0sT7nFRN/NDWsjIHoO8snSny3fFyce1bxcvy3wxttf0lQyWyo1JR7lLUQAGobjDZgTjP6XH1rGDb5WN07NYXSb9FJO2drXf2bwDkj054j/isvba6x0OinU/95qY4/SBl/wDpCxVVaWu1Poej1k6NhtVXXy29jweLZWMa8gjvDuHoKl8tYczlsxoI7uh7JG3qoIR/gCrKsPYPd5LxoWKGT8Lb3mlJ7WAAsPsOPUr+AXSOGU1aIOaIjBlERWrpZW3GZ0OzK67rt10hij9Rlbn6AVc+wGldR7IrFG7zpI5Juzg+V7h9BCsXwiqjodn7Ifx9dE30gNe7+CynszpnUez3T9PI3dfHboA4d+4MqY/s6XjBcRREyujkKMLkuJQXnp5nR2en7wXn2rTjwt7i6o1paqHd4QUBmz+dJI7+DAtyJz4nYnf93T4Hp3Vol4Rtb45tVuMf90iip/YwH+K5Z+HX8c5b1eBdaXWnwc9NNmjayWr6erdjrEkzyw/sbqzNlWrsjtIsOy3TFnBLvE7VTxZPMkRhXSuT0JTKIgIiICIiAiIgIiICIOSICIiAeShSeShACIECCRyRByRAREQERMICIiAmERAREQEREBcX+bx5dfoXJQUHk1Uwe8PbFPSudIxljvjoi4g7xjimIJ9bR9K3/wBKv3rO1vndE9zfVnP8Vpn4ZVodZ/CK1I3da1lYYqtgAwMPibn6QVtdsfusd00pSVTXZbUUsE4PWcs4ldMK4/ldOti6Gtmj+I8j1ZXxCqGpGdHe5vzyHD1hdBdtuAuK5Lig+VfD41b6in/Gwvj9rSFr34MtS11qvFHveUyeOX1OaR/pWxbDuva7vBWtmxAR2vaVquxRtw2MyBo6gIp9wD/EuWXmOmH61mhcSuRcuJVZQSqTqjUdq0zb/HrxUdDEXbjAAXOe7HID/nCq6xttdY636g0zqaqoX11pt1Q7xuJrd7dJwQ8jlwx19YHapbwuE3eVe0nr/T+orl7lwuqaKucC6Onq4+jMgA6uYPDjjOcehWR4TVRJv2Kh3vIImmI7/JaD9a7WodQW3XuvdMt0pTzyOt1QKmrrjEYwyPeBLD18cHnw49fHFC8JWf8A9orS34IpH/TIfsWLeHWYzqjK2jdHdN/R8ajrIY2OqKuufdN7HHdgnYw/4Yn+1Yk2B1DnQ3aj7HRyj15B+oLbbwdbVT3nwJqa0O++R1lsuUbgOsumnyPbwWmuw2ubDqqendI1oqKMjicZc1zSPo3lMfLec4Zmad3zlg7WVfNpza77tUrd6WkroK+EcgXNLHj6Qs3yOb5zpGNb1kuACwXthqaGs1b01vqoalgpmNkfE7LQ8F3DPLlhby8Of4vL1dhkjmhZJG7eY9oc0jrBHArmFR9EPkk0ZZJJGlr3W+AuB556NvNVkclzdgJhEQEREBERAREwgJhEQMIiICIiAiIghFKICIiAiIgIiICIiAmERACIiAiIgIiIGVGFKICIiAiIgIiICIiCEwpRAREQEREBERAXFzmtZvO4AcSexclTNVvkj0vdpId7pW0MzmY57wYcIPLmwXL3zbaJb50LmivulRcC08Szec+T6MrN2d5YF2SVdvt+rWVNyqoqWLxd7WPkOGh5wACerhniVnun6ORjZIZGSsPEOY4EELePhx/JeWMdvU+7SWuj63yPl9gA/wBSyledJxx/0eNuuFVTiOphubbqCQM/fakwtPrje0rDO3esbJqelpWyDdp6IH0Oc5xI9gatwtt1ojsvgNy2d3lNpLNb4+PaJIcevKzfLeH6tX/Bmnf41e6He8ncimDewguafrCvzV20Cw6buXuXN43W3AAOdT0ke+5gxnjxA5ccZzhYx8Gup3dW3Nvbb8+yRn2q5LNqC36C2lakm1ZTzBl1cJqKuEJkBZk+R1nhkDh8Xj1LWN4YuO7yvvSuprTqa3+PWmo6Vgduva4EPjd2EKsgrG2yoe6mrdUapoaF9FZ7hMxtM1zNwSEZy/HtOe1x71kkLpjeOXPKavCURAoztiXwmp2tsVppet9U+T2Mx/FZ+tcHitspKf8AFQMZj0NAWu23qOO6a40tYXO8qUhrgOYEsrWf6Stkj57vi5P1pj5rpl+sEyiLo5GVzp4+mqIofjvDfpXBdyws6S8U7ewl3sCC49Tv3bU9rf7RzWD1laBXWN2uNsT6WGf/AN83ttLDIBnDZJhGw9/AhbwbUrq216cqKqRzWNp6eWoJPIbrDgrUvwPrQ68eENpZnRh8VLLJVyA9QjjcQf2t1cc74j0fi916axMbGxsbG7rWgAAcgOxc8IgXN1EREBERAREQEREDCIiAiIgIiIB5KFJ5KEAIiIJREQEREA8kREBERAREQEREBEQckBDyREGh39I5ZDSbTdP35u7uXC0mnIAwd+GRxJPqlYP1VdfgmXjxzZ/ao5JN98HTUbu7ddvMH7JAVzf0itjdWbKrRfIow51uurWyuxxbHKxw59m8G+1YX8Du8dHSXe28d6mqYqwd4cNw/wCUe0LWHlj8k/y2L1jHu3CGT48WPYf+KooVxava10VLI3dc05we0Y5q3QvRPDy2JJXFclBKBha7W1rbb4TV7p2t3G1Ilx1ZLmNk+sLYfK182k7tr8JSy1jhhtXHAezJcHxfWFjP06Ye4yyoKlQ5RzMIWtcxzXNa5p4EEZBHYoVA1jrGy6TpGzXSbeleD0NPFgySYHZ1DvPBRrGW+FapqSnp2ObS08MLSckRMDQT28Fg3wmGluoLTvf3V/8AnKpuqNrep7w90dBILPTngGUxzIe4yEZ9mFSKfRWuL9/XprZcnscQ01VaXNAHbl/HHoysZXfEdccem7rarwVNu+zLSuxuxaP1Jfn2+5UhqemElLIYgHzyPHlgEcQ8LA+3zZnpPSsMOrtnutLdfdN3CvNPBBBLvzUT9zf6N7skkAcicOxjOeZpVRsirGwh0V3idLji10BAz3HJ+pWlqDRuobGwzVlA51OP7eHy2D09Y9YCmrHSZS+FY09ojUWorZDcI6infSSEgOqKhxIw7B8nB6wrl8HHTenbr4QVn0vq6jbX0XjM0RgJIjkmja4tDh1tyzi08COByqVsu1tDY6dlnusLm0hkc9lS0kmMnHAj4veOXYu3aLtHpfwirRfm1ETKWK801Q6bILTA8t6R2ezdc7imppmT/T1AY1rW7rW7rRwAXIckyg5KOgiZRAyiIOSAiIgIiICIiAiZRARByRAREQEREBETKAiZRAREQEREBERAREQEREBERAREQEREBEymUBERAREQEREBERAREQEREBDyRCg8y/Cd05puyeEBdtN6Ro2UNJ0kDTTs/BxzStBcGj4LcuGGjgBywrY1DobUGmrbVXJ1ZT+KREbzoJ3NJy4NHk4HWe1VzXlzj1R4TF7u0zmNhN8lIfveT0cDi1rs9hEYK6G0/XVPeKWWy2mPfpC5pkqXcC8g5w0dmccTz7FZ4Ys/0qewjZxpvWElRqXX2tbbp7TlBVMhn8ZqA2eseW73RsyR1DiRk4zgdaz94Uu3nZjqbZJe9FaZvUtbXVLYGwmGleIQGTRvI3nADzWkLUXTujtQX5okoaFzac/283kR+o9fqyrwg2Q1TonOmvUTZd07rWwEtJxyJyOHqSSrcpH28GmPe1Vc3dlBj/zGfYs9T0tPUM6Oop4pm5zuvYHDPbxWsVVobXFj3qyG13DohwFTRFzgR+r5WPSAqppXatqqxvbDXVHutTs8kx1bj0jfRJ53tyrLrisZY9V3GxoY1rGta1rWjkAMADuTCt/Rus7HqykdJa5tyZgBmpZcCSPv7x3jh6FX8rpHG8cJRQFIH5qMsRagY26eEpp6lcN4U4gPbgsD5frWxIWvmz/du3hL3Wqa7fZRwykHnulrWx/5itglcJ5bz9RyRQCpW2AqraUj3rg+T4kR9pKpOVX9JNb/AFqTzfNznqHHipVjGXhV3h1DoC7NjcGvlZFRtz1l7svH7AKs7+jmsbqzalfb87Bjt1q6EcOIkmkbg5/RjePWqf4Yd26S22qh3jvVVZJU47WsbujP7ay//Ry2XxXZlfb5JCGvr7qYo344uZFG36N57vpXDO8vR+KaxbTIiLLoIiIGUREBERAREQEREBERAREQDyUKTyUIATCBEEog5JhAHJETCAiIgIiICIiAiIgIiICIoJQYW8NO4WOj8Hq/096c7NcYqehjaQHPqekD48ZI4DcLj+a08+S0Z2E6tt+idavuV0dK2hno5KeXo2l5yS1zTj0tCzn/AEi2qKiq1bpvRFKJHNp6Y3CRrQCHyyudHGAOeQGO/bCtO6eDzQzPZJb9SVVF5DRLFLSdON/HEtdvt4Z6iD6VZvzGcquubbzoFzR/WLm7dGAPFXcB2BfAbddn7vOqq5vppHLFe0bY/Do3SlRfJtTPq3RyMiig8Q6ISPc7lvdIeQyeXUrS0Pol2qKSpqPdDxJkDxGPvPSb5xk/CGMcO1b6svDn0Y+2wrdt+z13/WlSz00cn2LvU+1zZ/UebqSFn6cT2/6VgmTZHUf2d8id6aYj/UV15dkt4/sblRP/AEg5v2p1ZJ0YfWylHr7Q9Vjo9XWbjyD6tjCe7yiFijwom07a3TOp7XUU8zoi+LpY5GvBLXCRg4frLG8uzDVMLfIbQzdzZ8Z/aAVLqtF6qpWO6Sx1W719HuyD/CSpcrYuOOMu5W1++2RjJo/MkAe09oIyuBC1RptQ60sJb0dyvNE0YAbK54b+y7h9Cuqx7ZdU0u62uho7iwcy9nRvPrbw+hXqiX8dZZ2lawp9H2XxhzWTV0+W0tOTjePW4/mjr7eA61gbTdm1LtI1Q9rZH1NQ/D6qrn/Bws7Tjl3NHq68cr1XXraNriLoafNXWObBS0wdlsTezOOQ4uJx2rZOjten9lOz2WZ34GkZ0k8oAbJVzEYx6SeAHUPWp5amsZ/Vt02m9B7KbIy6XKSKarGQyomiD6iV+OIiZ8H1chzKt5ms9p+umvbo3TraG3k7vjMwa7hnnvyYb6Q0HC7OynRF02sal9+Wst51uLiKOjORG5jTz/8ADHLHwj687UUdNabHb2tjp4YYY2hvmgcMch9gVk2lsnnmtSn7PNsv4b3xUrn/ABBWkerG5uqmz6r1to+ZlPrjT0j6d+G+MNa0b3oc3Mbjw5cFsnUztklfJG3cYXEhvxRnkulcaOluVDLQ11LFVUso3XwytBa8divT8Z657jV3WOmbXdra7UWjHMfDznpIhjd4ZJa34JHW32d+NnyvkxvOc7AAGTnA7PQswa80rcNlGpYr1Z3S1Gnq1+4YnO4sPE9G7tPDLXc+o9ebN2k2KnobhT3e27rrZc2dLCWjAa7HFvd2j19ixY646ep+kLj7raVtV0a5r/G6OKbeHEEuYCVVVhDwKtYw6q2GWyjdwrLETbKhuMcGAGN3rYW+sFZvWWxSiICIiAiIgJlFCBlThQpQMIiICIiAiIgIoRBKIOSYQEREBERAREQEUKcIGUwmEQEREBEQ8kBEUIClEQEREBERARMplBClRhEDCkckwiAiIgIiIC6F/rm2uyV1yk82kp5JzngMNaT/AAXfWGfDH1nDo/YZd2tkxW3ke5lKA7BzIDvuB/NYHH047UHml00he+R0jy9+d45OXZ55PeskaM0vabXbW6k1luMp8AwUsg87sLhzcT1N9vdRtmunqO5XCe6XTDbVbmdLOXjyXu6mnu6yPR2q9NC6ZrNq+qJ7vdHS0+nKB24Ig/BecZEY7CQQXO54wB1Y1Izaml1RrTWEr6XQunXsp4/I8Yc1pDO4l2GM9HFVMbOtsbvv3vkp2v59H4+4Y9QZurOluo6O10UVDb6WGkpohhkULQ1rR6F26eZsczHSN32BwLmn4QzyXTpceuTxGAZtY7TNCNa3WFj8ft7Duipbut4Z/GRgt9AcAVdHuFoHa5ZH3Kj3aa4AAPlijayphd1dIBwcPTkEcj2bDV9DZb5b3RupaeWGRpacMHLHIj+BWrm1HQV02T6i9+mjd9tDG4eN0fEsaxx9PGM8scS09eMYlmvPhZZl44rE+qtP6l2b6oja6SSnlYd+krIMiOZueYP0OafXkEZzrsw1lDrCz9NushuEGG1MAOcdjx+afoPDjzNyT0Gn9q2zyKRzf6vVt34X8DJSTAY/aaeBHWPStZrZUXrZvrp/TQtbWUUhhqICcMmYerPxSMEHHYp4v8a11TV8tpQFzBa1jpJPJYwFzj1ADrWu952x6srN5tG2ito6uihEjx635H0K1qnUWsr493SXS81ucgsjkeW/st4fQlyiY/jZb8GM0s161Rqq5TUtK6XdYHzStaAZHmR4ycdjFlmu17oilz0mrbNwOCI6tjyP2SVqZS6M1VVMbu2Ooa3qMm7H/mIVTh2Y6nmx0niUPc6bJ+gFMcrJwtxlvLYqp2u7P6fztRQv/wDCikd/BdI7b9njf+tqh3oopPsWEYtkdyd+Gu1Mz0RuK7Ldj83wr8xvopSf9QTqyZ6cPrMR257P2/8ATK53oo3L6Rbddn7d7/aFczPA/wBUfxC1+1zoSTS9tp673QNYyWbonfeOj3Tu5B849hVx7MtkVPrfS7b1DqZ1I8TPgmp/EOk6NzcY8rpBzaQeXWnVleF6MdbU/bxq+2601hT1lnqJprfT0bIWb7Czy95znHB9IHqW7ngP1tnqPB6s1LaZi+WinqIa9rsB7KgyGQg46t17SD8XHetYaDweqSnlLq3UtRVs3SGxsouhy7BwS7fdwBx1K7f6OvVUtHrXUWi6p0jY62kFdEx3ANmicGPGOeS14/YWMp7rpjZ4jeFSoCKNGFKIgImEQEREBDyUKUBERAREQEREA8lCk8lCAiIgkckREBMoiAh5IiAEREBERAREQEXynmjhidNNIyJjBvOc84DQOslay7b/AAt9M6ZdLadAR0+pbmMtdWl5FHCccwRxlPLzSB+dwwg2G1ZqbT+k7PJd9SXiitVDHwM1TKGAn4o63E9gyVqVth8MeVz5rXs0tbWswALvXjiT17kGOrqLjz+Dw4681tftK20ar6Sokueo7gfNbyhpmnsHBkTeHdnvWfNmPgz2eysiu2vK6K5zNAPicfCmjP5xPGTl3DuKsm2blI1suP3QtdXWTU1ZFqC/Vb3DNb0UkuCDwDXAYAB5AYAXYdQbUI/K8V1g39SoW7dxkt8cUVHaaOKnpYhhoY0NGOoAdQCpx/SXSfjcr+b+NLLhb9oFdTinuFv1PUwh28I54Z3tBA54dkZ5r40Vv1tb4nR0dDqGlYXbxbFBMwE458B3LdoF3xne1C53xne1O3/Tu/xpZ49tAp/7bULP0my/xC4HWWsqN27Nd7hG7slaPqcFutlcHxRu86NjvSMp279O5PjTKDaPq6N2XXJk3dJTxkfQAu9BtU1A1w6anoZR3Mc0/WtqL7Rafp7fNWXiltjKSMb0stTDHuNHfkLXbWt0sus7n73dneiLe0OI3q+OjbG8jrI4ARt7zxPYFm469tY3HL0trVO0Cov1ifbXW1lP0j2l8rZS7IHHdAI7cdauTZDpWz3bTNbVXihZN0tRuQOJIcxrRxII4jJP0KlbRtm/vO0zb66a4OqauoqDFM1rMRs8kuAb1nkeJ59gVzbCnSTaXq6dzvwdYQ0dgcxv8QpPPK5WdPDMOzbZ9pnSu7dLbQu8eniAMsr3PMbTx3W55Z6+sqwtvc1VqzaFYdnNHJuQlzKiqeDnDnA8SPzYwT3l3Us0xt6FjWt6hgexYQ2dTC8eEpqm6SNL2UcU8bCeTXNeyEfQHLdnpzxtu7fTPmmpaPTtOylo6NgpooRDHE07oY0DgAcK29p2uKGw2p94vU25EDuQU8Zy6R+PNaO3tJ5Ksnylr7tBLdY7cm2Wqy+2WWDyoSfJecBzj63PaD3NS3XhMZ1eVD1Btq1vNKyahoqe0UkvGHegMhcP0nDDvUFd2mdr96s9zp6PaBa4mUlQAYrjSg7u7jg7AyHt7d0gjsVY1HZqG+WeW11ULNx4+9HAzE/HBzezGfYsbaIpnam2f3HTtwbvVFBI4UxdxdEcZA9R3h6DhTdjc6bPDOW1FlDftLvsbZGPZWsD2vaQQOGWOHrwQe5a72QyXbZ7etO1TcVlok8aga4ZLAD5bB694frK9tjV0kuGjWQ1DnOfRSmnBJz5GA5vsBI9St6ijjpdtN1o2tDYq2GRpA699jXH6RlS3fJjxbGSf6PLU81v2pXXTMkn9Uu9vMrWknhNC4EEdXFjn59A7FvoCvL7wTq91v8ACI0hN0jmNfWOhcASMh8b249pC9QG+YsOzkOSIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIggrRD+kQ1XJXbSLPpOOR3itqoBUSgOOHTTOPMcuDGtwfzyt8DyXmB4XVdJcPCI1dI6Rz2xVLIGA/BDYmDA9eUFMvJktOz2zafo2u8dvEvjM7WjBeCfJZ7d0fqrYXZXFQ6f00yw9IxjKZpkL3EAPOPLcT6ePo9CwXWxNqNslno3N3oqOCMAdQ3WOcD7Vcu2O6yW3Rr46dzmS1sopyQcEMIJcPWBj1rpjdcuOXNkVHVG1+9Xa51FDs/tcMtLT5MtwqRwLccXYOAxvYXEk9is+x7a9bU9Q+SspaW7U0XlTbsBjLR+k3zR6QvnrKldpvQVu03b24qrjM0VBbwdKccR63Fo9Awsk6estvsdnZa6OFm4B9+cWgmV2OLndufqTm3yW4yeGQ9l2t6HUVnZeLLI7czuVFPKeMb8ea7+BHNXLqaWl1BTvpayjZ4vJCYZInEO32nmFrns4f7zduTrHS7zLZe4MthHJjsFzT6nNeB3OWwRO6tS7nLGU14YQ2DTVWkdoeoNnVdJvxML6imcTjeLQ3jj86Mg+lp5q/dpWz7TernC4XCle24QRFrZoX7hkaOO47t7usLHm0yb3E8IzS14jbhlbFDE8jhvEvfEfoLSs2k73nKYzfDWd1qxrJtU0pZbTpKGqs9G2F1PUDpnklz3scMcSew4Vr6T19WafsrbbHQRVG5K57XveRgHju4Hfk8+tXztxmkp9KspR/a1oY70NDj9eFbGzXZy3WGnLhcG3J1JVQVAhhBZvRuO6HHe6+vmOXYVi+eG8b/nl1anajqKRx6GnoYR/4RcR7SuhJtE1dI/ybm2FvYyCMD6QVemjbvaNEXIad2h6FtkrWk9HcTRskfjPBxyCJG94wR3rYewQ6frLfFXWWG2S0kg+9y0sTNwjs4D6OYVkt9mWUx9NQ49Xa2rPwN0uMv8A4LP5QuXj20KbzZtRv/RbL/ALdBscbfNja30ABct5a7d+sdyfGk9ZS66uEXQ1lHqOriyDuSwzPbkdeCFyt1v2gW+J0Ntt+p6SJ53nMp4Z42uOOZDQOPBbrbzvjO9pUfrH2lO3/Tu/xpn4ptQk/wCj6wPpbULp0LddaNuTNRUcWoLFVxPyK4RywEEnkX8M56weB71uvj9L6V3rY+h6KWjulHFVUs4w8PYHjGORB5hL+P8ApPy/xjbY14Y1VD4vadpltdUMDd03ihbh+e2SEDBzxJLCOPwezbvSWp9P6ts8d203eKK60T+AmppQ8A9YPW09x4rUHaZ4NVjvkT7toasitdSRnxRwLqaU4PAHmw+jI7gsAxzbTNjWqOmpZrrpu4cukjOYagccZByyVvcQfQFzuOnWZSvVVMrVrYh4XWn9RGGz7QoYdP3IgNbXscfE5T+dnjEefMkd45LZ6lqIaqnZUU8zJoZGhzJI3BzXDtBHAqNPvlFClAREQEREBERAREQEREA8lCk8lCAEQIgBSiICImUBEyiAiIgIoC+c0scMTpJHMZGwEuc52A0dpKD6lY42y7ZNE7Lbfv364NmucjN6mtlOQ6pl54JHwGkgjedgenksCeEL4W0NK6o07steyomwWTXtwBjYeyFpGHn888OwHmtYNH6a1NtI1BNUTXB0r5Hh1Zc7jUF3HHW5xy92OrPsRLdLq2ybc9oO1q4m39JPb7TKQ2CzW9ziHnj55ADpXHPI8OHADiTdOybwbLpdOhuWuJJbZTecLfH+GePz3cmZ7Bk47FlTZTojQuz/AHJoZILhcd0iSvmcwyOJ6m8cMb3DjyySr2uuoHVTOjp6iGGLsZKCT6St44/XPLO+nKz0+m9E20WnT9tpqdjP7GAAZPa53WfTkrqV9zqq5+9USeT1NHBoVPzH8aP2hA5v/wBl1mnC7fXKL5tP/PFcs/m/QVpHJQoy1cstQcSrR2h7Q7Domhc6um8YrntBgoInASSZ4Bx+K3gfKPYcAngrK2lbYo4ag6f0JG27XOTDRVQt6WNh7IwPwju/zR38QKLonZhI6rdqDXEzrnc5/LdTzO6RrT2yHjvu6sch38MYyz3xHTHHXNU1lu1ptcrWXTUFU+1WFjg6ngjaQ0jP9mw+ccf2ju3gDyWVtO2K06dt7aGz0cVNFzcRxc89rnc3Hh1rus8nyVz3lmYly2sXb7RurNnU8zW7xo6iKfgM8Mlh/wA6x5sFuLY6240Mjm8WsqGjt3XYd9bVm+/UMd2stba5vMqoHwnuyMA/UtWtJV82m9WxSVbXRdFI6nqmHm0ea4H0Hj6lmzV21hOrGxuwX73letYO2MtdR7cdb2+Vv32R08re9vjAP1PCzNp6obXWelm3muywBx58RwKw5fpo9G+EvS3Ko3mUV8gYxzyCGgvHRn2PY3PZkFby9M4TzGcAFrzAPc/wh9R09RwdUse6InhvZ6N4x6gfYtiS1YM2/wBgmqr1Sap0zI592oGhtQyIZL2t4hw7SOII6x6MFl9MNcz6uOaWOFj6iZ25FGC9xPIADOVjTY7M1tFqHUFR96hln3zk8Buhzz/mCtfVm0O6X6ibaXQstlO8htUWlznP48QeGQ3tA4ntXbhq6i+2yDR2kKWoZQs/3qsl4dJxy5zseaCeOM5PAYHJY3y6THU5XNsIppGaYq53tc1ktUdw9uGD+JXSYxs23eXd82CMlx7MRD7VkOxUVDp+xQ0cbmspqSI70hAGccXOPeeJWJtNV7pPfTrWo8kmJ8UAJ+HIRhvqG4Es4kTHm2qDsy1DDpHaBY9V1FK+rit1aypfBG8MLwDyBOQt4NLeGDsuuszYbrT3qxOOBv1NOJI8nvjLj6yAtItntgh1JqAUFQ6VtNHA6SV0ZwcDAAHrIXe2maIp9L0tJWUNTPNBO8xuE2CWuxkcgO9Z17bmXqvVK3VlLcaGCuoaiKopaiMSQzRuDmyMIyHA9YOV2crXTwA9UTXzYq+z1Uz5JrHXvpo952T0LgJGD0Dec0dgAHUtilG0oOSIgIiICIiAiIgZRMIgIg5IgIiICIVGUEplEQMoiIA5IiICImUBEUIJyiIgIiICIiAiZTKAiIgIiICIiAiIgImUQEQckQEREBde4VlLb6GeurqiOnpqeMyTTSuDWsYBkuJPIBdg8lrx4fGq5LDsSNopZHx1F9rGUji126RE0GR/qO61pHWHFBw1T4X+yy0yOjtUV5vzwSN6mphHHnPxpC3h3gFaO7V9SQ6y2h3vVVPRy0kVzqjUNgleHujBAGCQAD7F3tmWjKfU8VXUV1RPDTwuEbehLQXO5nOQeQwuntD07T6bvzaGldM+mlp2yMdKQSTkgjIAHMK69s750vCY9HtypHO82ogaWnqwYj9iqG3ilkdpWkqGtJZFVjf7g5pAPtCtnUtbJ4lpTWlP5T44208wzjMkTicesbw9Cy/d6S36gsUtHNuvpKyEFrhxwDxa4d44Fbk3uOeXFlY82sVMbqXTmpKf77TxVLX8OIIdh4/ylZKimjmYyaN2/E8BzXA8CCOaw1LUzaftlVozWFLO63yZNLWRDO4c5Bb8YA8cZyOIwQqdpnaBdLDSvtbI4rnTsJbTOk3gWjPDHWR2A8lNrcdzhkCYePeELpmnp+LqeNjpCOO6B0j+PqI9q2EkWDNgVkqo9QVeqNSOcy61rN2nbK3Ba08yewnAAGOAB7VnUBy3jPbnnfUYH23HxzbLom3wtc6Zj4pCAOTTUc/8BKzkD9awpZnx6w8JqquEPl0Vjgcxrxxblg3Met73ewlZivs7aG01FR8JjCG9XE8AmPumc4ka07fLg2Sot9C1zXcZKhwzxAJ3Wn6HLIGwKi8U2dU8zm7rquplm5YyM7g/yrBWsq+TUOsJXUW9M18jaalA4l4HkjHpPH1raOwUEdpslFa4/MpYGRDvwOJ9qxObtvKaxkcdQWO06gt7rfdqOKph5jIw6M/GaebT6Fih9r1pskuD7tpuqfc7EXb1RA5pLcf94wcjjH3xuO/A4HM5cuDvKW9MTLTjs52jWHXFE11DJ4rcmN3p6CR4MjOWS347fzh3ZAV3HksCa02Yb1W2+6Km9yrpEQ9sELujY49rCPMd3cj3cVWdm+2Brqr3u7QI/cq6xeR47MBHHIeyQcNxx573mnu4ZTLXFMsZeYzGpQFv/P1qMrbmlSFxJ/5woLv0lR3aO5VVC/ep5N1vW08QfUu3c2af1hbX2nUFtpqhknOGoaHNJzzaeo9nIqiF7UzH8JzfWQs2RZtgza54OVdbelumiHS1tKOJt8nGVg/McT5XoOD3lWpsZ227QNktz8RimmrbVG4tns1eXBjT+Zkb0TvQMdoPBbbWu+Oo2dHNNFNF8V7xkDsyrG2qaL0Trp75qqOGhq9wCKsjcxsrD2Hjh7e49/JcssfjtjnfFZ02MbaNE7UqEe4deKa6sZvVFqqXBtRGBjLgPhsBIG83I4jOOSyVleUOstL6i2c32GsprkRuPzR3O3VBYQ7HUWneY7HVn1lbOeD34W0NUafTu1FzKebAZFe2DEbzyxM0DyD+eOHPICw6y7bhIvjTzw1ELJoJGSRSNDmvaQWuB5EHrC+yKIiZQEREDKIiAiIgHkoUnkoQEREBSmUQEREBERAUK39daz0voiyuvGqr3SWukBw0zPAdK7Gd1jeb3cDwaCefYtLduHhaak1E+os+z+OXT9pyWmvcQaydvaOqIc+WXcjkcQg2p2vba9A7Mqdzb7dmz3Pd3o7ZSESVL+BxlvwAcc3EBaQ7a/CI15tQ3rTT71isk/3s2yhlL3VGfgySYBk/RAAPYVQtm2yHXG0iq91HRzUlDM7ekudeHOMpIBywHypD35x3rabZ3se0Ts/pWVToWVdwAw6tqeMhPY34vob7StTG1nLKRqBT7J9oVRTsqI9MVIZI0OAfLGx2O9rnAj0EBc/uP7Rvk1L85h/nW617rKWqeyOlpWRRMzggAFyppW+24381ac/ci2jN/wCzM37+I/6lxdsm2iN87S1X6nRn/Utxi1QAr24d6/GnbdnO0qn/AAem70z/AMME/UVDtL7UKf8A6n1Sz9GOY/UtxlyBU7Z3f40wdSbTof8AousIv1KkKY7jtOpfKbWasZ6XVH8VuPcayloaKWsuFZDSU8Qy+aZ4Y1o7yVhfWu23eqnWnQdA+6VT8jxp8TnMafzI8Zd6TgdxUs17bxy36YoZtH2l2t4bJqC6xOOcCpaHZ9TwV3ptomuNbMotJ1V4p6RlXKInztYITNk8A8t6u5oAJKrtu0Hdr9cPdrXF0mqpn5Jpw/LhnqLhwaOfktHrVibQ7Z739Z1ENHH4vF5E9NuEjcBGRg9xB9izdtS428NgtA6Isujbf0ke5LW7h6evmADsdePiN7s+klcKfaPoqouXiEd9h6TO6Hua5sZPc8jC6+taus1Jsbq660bzpqyjjl3Y+JLd5pkaO/AcMK0Lzftm1RsYjttLS0rrmadrIKVkP9YjqeA397GefEnPEcOOcLW9eHOY9XNZiIXFU3ScdZDpW1w1+947HSRtn3ue/ujOVUlpzosBeEDpd1vvrNQ0sZ8VrsMn7GTAf6gM+kFZ9AXUv9po75Z6q03CPfp6hu67taRycO8HiFMpuNYZdNWP4PGv6ea2OsN4qGsmgAMb3EneaBjP8D6B2q5tvWkm6w0V45a+imuFuJng3SCZGY8uMHvGCO9o7Vrnf7TetC6o6GRxiqITv087R5EzPjDuPIjqWVdF6uo9QUjWxyNp61gzLT73H9Jva36lJlxqt2au4uPZ9tLdqrSsNHJIIrtTsDKs7w3pAOHSN7j19hXfefirGOrNIVkNw98GlpnUtcCXvgYcb56y3q49bTwKmx7UY43ij1NbZ6SoZgOljacZ7Sw4I9WU39Zyw3zF7V1gstdUeMVlpoaiXre+BpJ7MnrXbpaWlo4mw0tPFTxDkyJga0eoKgO2h6RbF0nuhK780UzyfqVsXnXl5vz3W3RtpqmufwNQQC8D/Kz0k+xXciTHK8Pvta1K6SJuk7RvTVlS4NqBFxLRnhHw6z193pVo67khstmodIUsjXvgxU1z2kYdKRwHqB9mFW20FHs6on3O5TRV2o6lp6CLORFnm7jz68uPPkOsm0tH2Ws1hqbdqJJXsLumrJzxIGePHtPIf8Fi7dpJIyVsPtDqGxS3SeNwmr3DcyCCIm8j6zk+jCrW1ag90tC3BrW5fTgVDO7cPH/CSrgp4Y4YmRwxtYyNoa1o5NAHAL7TU7aqklpZMbs7HRnPLiMfxW9cacereW3U/o69QOodqF603I77zdLaZmAk/hYXjHDva9/7IW+a8vfBgvfvb8IDSdRNI+Fr64UUw6yZQY90/rFq9QhyXJ6RERATKHkiBlETCCMKcIiBhMIiAiIgZREwgKMKUQRhThEQEREBERAUKUQQpREBERAREQEyiICjClEEKURAREQEREBERBCnCIgYREQEREBaIf0iuoXV+0myaYjd95tdu8Ykw48ZZnngR3NjaQfzyt7ivMDwqb37veEBq6qjm6aOKrFHH17vRMEZaP1muRKuzZFbvc/QtJI5uH1ZdUO9BOG/4QFS9ttpdcNOsuUMe9NQO3nYBJMTuDvYcH0ZV+UVM2ht9PRt8lsETY8DkMDC4zxRzRPjmja9jwWuaeTgRyXXXGnn6tZbYM0FNDeLTX6QrJGs8Y/rFG93JkrRy9YHsyrt2T6kkp97Sl43oaumcW0/SHBIz+D9I6u70KwdYWOs0jqQNhklEW901HUDgSM8OPxhyP8AxV1OpqHaDb2V1FNFQ6hpmjpG5x0gHI9uOWHcccuxYnDtdWMrVdNT10Rp6ynhqITzZIwOafUV06HT1joahtRR2ihp5RykZA0Eeg9XqVh2fXd60+8W/V9pqnubwFQ0APPZ+a/0gq52bRtHui3nXCVn5rqZ+fqW9yuNmU4i64gutr3aS7SulZqdsjZbtOwso/K4sByDI7ubxwes4Hese3zalDI7xPTltmq6h/BskjMDl1MHF3rwvjpTStwqrn74NWSGorCQ6OCUg7p6i7q4dTRwCdW+Isx1zWVtgekPenorxq4NZFcLmRPPnAMcePIYT3DJPYXFW54Qe0GGntgsNpma6onB3ntPmtwRvD6QPST1Kk6x1ZS6fpHNmm6areMxU2/xP5x7G9/WsU2S3XrXWqPF43dLU1B3ppnDyImDm49gHDAUuWpqNybvVV2+D/pp1yv779UR/wBUt3CM9TpiOHsGT6SFn8NXQ0zZKHTtip7Tb27sMDeLjzkd1vPeVUcK4zUc8st1xwuYC4ro6mjrKjTVzp7bvCtkpZGwEc9/dOFWYotRtE0ZS3P3Pkv0PSg7pcGudG0/pgY+lNe6Ls+sLfvTbkVXuDxeuiaC5o6gfjs7s+jCszTeodmdLsZltdypaVtzEEjKilfTk1ElRxAcHY7cYORujhwwrn0JWVWntkFJXXnea+lpHy7r+YZvOMbfYWjCzLvy6XHp5jF1NtE1vs/dW6TguVJWspJDHHJI0zdDw5MJIwO4ggFUt+0jaTdJejj1FdZX4J3KYBpx24YAqfoW3u1JrWnjrt6oZJI6pqyebwPKOfSeHrV+XnZ7XWu4e7WiblNRVUZ3mwdIWkHOcNf2cuDuHeszfp03jLysyS47Tax286s1ZL6HT/wXFtJtMm82n1hL6GVJWX9EbbqijqmWXX9vloqlvkmuZEWj0vjxw5ec3I7sLNdsr6O5UTK621kNXSyDLJoXh7HD0hamO/bOWVnpp9HpjalUf9T6sf8ApRzD61J2d7TKj8Jp29u/8TI+srcclcMrXb/rHd/jTpmybaE7/stV+t8Y/wBS5fci2i/Jif8AfxfzLcPCkBTtnerTwbINo3yam+cQ/wA64VOynaFS075pNL1ZYxpcejfHI4jua1xJ9AC3HwqhZ6unpZXtqqdk0UgAOQCW96dtZ+WtW9i3hC6+2W7lpmc692WE7htde9zXQY4bsb8F0ePikFvct3NkG3DQO06GOOy3RtJdSMvtlYRHUNOOO6OTwO1pPqWL9oWyDRO0CkdVdGynrsYbV0+BI09QPb6HZ9S1Z2mbH9a7O6j3QEMtdb4Hh8dxomuBiI4hzwMmMjGc5I5cVi42OmOcr1ECLQnYf4WeptM+L2fX0MuobSMMFaHYrIG9/VKOXPDufE8lupoHW2lddWRl40neqW50jsB3RO8uI4zuvYfKY7jyIBWW1xphEygIiICIiCCiIgYTKIglEHJEBEVubQNa6Z0Hp9981Vdqe3UTDutLzl8r8E7kbRxe4gHgATwPYguFzmtZvO8kDic8MLWrb34VendItlsuhfFNR3vi19SJd6jpTjmXN/Cuz8FpA55dwwcAbf8AwltVbRnzWXT/AIxp/TT/ACegY/FTVjP9q5vIHh5DeHaXKn7GthNy1NcKas1V01ptjvvgpsYqJ2gZ/wDltOeZ48+A4FWTaWyeVnb20rbRq3xipmuOobiSA6eY4hpm8OzDIm8M4aBnsJWyOybwedN6Z3LpqqSG/XEYcGSMxTQHuafPPe7h3DryjabfpvRtnitdnt9PQ08Y8mngaAXH4xPMk9pVHutyqK5/lO3IuqJvL0966Y4uOWfxW7jqCnhZ4vb2sdgYD8Ya0dgH/IVvVNRNUP6Somc93aT9C665ArpI5XlOUUIFUSSoypVG1fqex6TtTrhfK5lOw8I4/OklPxWN5n6gpbpZN+FYJWMdoe2TT+m3vobTuXu5g7vRQSfeozn4TxnJHxRk+hY61DrXW+0yqfQ2GGWzWIEtleH43xn4cgAz+g3hx455qt6O0RZdPsZN0fjdcBxqZmjyTj4DeTfr71i5XLw3MZjzVuyWbW20SqZctY3KWiogQ6KlDd3dH5kfJvPznZPpV82DT9nsNP0Nro2Q5xvy85H+lx4n0clUwUKkmkyytQsZ7ebU2S30N6jj8uJ5p5SB8B2S3J7iD+0smgql6vtrbxpqutu75UsJ3OvDxxb9ICZTcMLqqT4OF6bUaXq7PJJvPoJy+MdYjk4/5g72q+Wad0/HcvdGOx25lZku6dtO0PB7c458efNa97D7x7k69po5JN2KuaaV2TgZcQW/4gB61ssTvKY8xvPipCIuS05oCZUogoestNWvVVqdQ3SHOMmOZuBJE7taf4citedZ6H1Fo2r8aAlmpGnMVdTggNP52OLD68d5W0OFxe1sjHNc1rmkYIIBBHYpcZWsc7j/AONcNPbS7hTtZDd6fx1nXMwhsgHo5O+hXY/U2hb5E33QdTOcOqrpyC3Pfj6iro1Lsl0rdt6ajjfaag8c0uOjzj4h4ezCsmt2HXprv6jeqGozy6SN0Z/is6sb3jefD6Pn2XUn3x0dskxxw1r5PoXQum1Clo6d1Dpa0xU7MYbK9jWNb6I2/wAT6lY+mdO1F81B7jmZlJOA/eMgJwW8xw61k6w7KrPSPbJcqiW5PHwcdHH7AST7fUk3fDV6Z5Y/sNjvmtLw+bell3nZnrJ8ljPX1nsaPoWcNNaet+nbay30LfJHlPkcBvSPx5x+zqXfpKeGlp2U9LDFDCwYaxjQGtHZhfYFWY6css9/+IDd1Cd1clBC05tdtVSVGn9pFXVUcm5UUlwFVA7Hmu3hI0+o4XrRQVMdZRQVkJzHPG2RnocMj615T7bKfoddSybv4enjk9Jxun/KvSvYbdHXrY5pK6SefUWmnc7Bzg9GAR7QuV8vXOZF6ooUqNCYREBERAREQEREBERAREQEREBETKAiZRAREQEREBERARMplARMogIiICIiAiJlAREQEREBERAREQEREBERB8aqaOnppKiR26yJhe49gAyV5KWSao1NtHhrKwtdUXC5GqqOHBxc8yP/AIr1D2x3X3E2U6pu27veK2qpkx1nEbuC8ytjVN4xrqnk3fwEMkvoO7j+KTyluoz2XbyjdXIKV2eNStSaft+orU+31zeB8pkjfOjdjzh9nWsH6hsF80XcmTb0rGtdmCtgyGu7s9R7Wn6VsIXL41UENVTvp6iFk0Ugw5j2gtcOwhTLHbpjlrz4YltW06Gop/E9SWtlSwjDpY2tLXfpRu4ew+pd+Or2ZVh6ToLdF3OjfH9HJVC/7K7LWEyW2aW3PPUB0kff5JIP0rFurNPTadvvuW6obVSbjHgxtIJ3uQx2rF3PLrj03wye3VGhrLE73PdTNcfg0lOcu9eB9JVrX/aXWTtfDZqXxNvITSEPkx245D6VXqPYbeHf79fKGn7eijdIR9SvTTeyTStp3ZKyOW7TDjmp4R57mDh7cq81N4xhjR+jdRa0rnVEfStpyczV9RvFue4/Dd3D6FsLorSlr0rbPE7fHvPfgzzvA6SU45nu7ByCrzI442NjjjaxjBhrWgANHYApwtTHTnlnb/4nKlcVOVXNK45REaUuo03p6ouXujUWS3S1mQ7p3U7S4kcjy59/NWJ4Rd48V0vSWWOTdfXzh7x/3cfH/MW+xZOJWtO3C8C7a9qY4370VCwUrcHIy3Jd/iJHqWcuI6YTd5XPsFtLW09wvUkflSOFNESOoYc72nHsWTSqRoy2tsumqG27u6Y4gZe954uPtKrBVxmoxnd1Tr7YrTfKfxe6UbJmjzX8nx+hw4hWG2y6z2eVZumjLlPV0Wd6alIzvD8+Pk/kOIwfQsmhCEuOyZ2OGz3bPYdSPZQ3hrLJcs7u7M/7zIc/BecYP5rsekrKIWB9XaHsuoGPmdGKStI4VMTRknHwm8A76+9UPT2sdb7L6hlHeoX3mw5DYyXEiMZ+A8jLT+Y7h2dqsys8rcZlzGyw5oSqLo7VVh1dbPdCx1zJmDAkiPkyRHsc3mPqPUSq0Sty7Ys0hTlcSiqPtBUTU83SQyOid2j6lcNuv9PMzobg1rMjBfjLT6ez6lbGVKlm12s/ax4PGndTb900nJDYbkcuMUTM0s/6o8w97eHPgeY1vcNpWxnVomp5rjp64sJDJ4TmGob1drJW9xBx1gFbm225VFC/da7fi5ljuXp7lVrvbtN60sstpvFvp62nkHlU87QXNPU5p5gjtHFcrg64532tbYR4WWndTsis+0DxXTl14BtcX7tFOccSXO/BHnwcSPzupbNsc17A5rgQRkEcivN3bJsGuemq6prNJulu1uHl+KkZqYWkZ5D8IBx4jB7jxK7OwDwkdV7M3xWW9snv2m2EM8VlkxPSDPHonHqA/s3cOAwW8Vix2llejiK2tnmt9Ma90+y+aVu0FwpD5L9w4fC/GdyRvNjuI4EfWrlHJRRERBBREQAiIgnKBAiAV5heEhtAuG1Ta1W1FHNUVdsgnNFZqaIlwLA7G+1o5ukPlZxkgtHUFv8A+EFqV2ktjGqb7HM2KaG3vZA48ulk+9s/xOC89vBqtrbhtPgkmb5NvpZKoDv4MH0vCsm0t1NvnoSm1dou5uuDtmldca0fgZKqgmcIe0tAGM9/NZAZti2jU72yO2d1bHj4XQTtP+VZvKj9Zy6zD5XC/kl8xhD7tusGvc6o2eVTieZJmB/yIdvF4j/DbO6pv/1Ujf8A0lm8b3wnO9pQNb8X6irq/U68fjB//wCITo/940PVxf8A132xhfSPwirT/aaXrR6Kth/0rNe5G7+zb+yFxdT07vOp4j6WAprL6dWPxhtnhE6f/tNO3MeiSM/YvuzwhtJ/Cst6b6GxH/WsryWy2yfhLfSP9MDD/BdWbTlhk/CWW2v9NLGf4Kay+m8PjGFZ4QemfEpnUVpuz6sNPQsmbG2NzurecHkgeoqyLHp68a5ufvq1tVTSxS8YabJblnUAPgR9gHE8/T3fCLtNpp9W6cstrttFQuqWl0xpqdkZfvyBjSd0DON04yr+G63yWt3WjgAOodiz5vLV1jOPZTQU9LTsp6WFkMMYw1jGgBo7MLmFxypWnNIQKEQSFxP5qErk0oNeNodsksOt6ltLvRNdIKmnLeBaHHIx6Dn2LZ3TtwhvFiortD5lXA2Xh1EjiPUchYb292xrqS33qNvlMcaaQgcwQXN9h3varj8HS8+NaXq7PJI1z6CoL2DrEcnHA/WDvaszi6dcv9YysnPe1vlOc1re0kAKA7eZ5Lt5vaOSxfWWyPXe1y5afvddURW620zX09HFIWCckNy71b3Vx5d67GzyGTT20q86Ko7hLXWmCmFTGHu3jTvyzLM/rcu4d6u2bhx/WS0QjdUZVc9JXFSFCKkFQXOTCYQa52hjqPbrUQ+a03GpHqdvkD6lkbW+oayzvobbZ6Hx67XB5bTxk+SABxJ/+4HM54LH9e5sfhAS/wD+RP0sV9a5tF2qq62ag0+6I3O1ucWQy4AkaeY+vrHM8VieK63W5t1Ka/ans+oqKzatoaRjbhkU1TSu8je+KeeeJA6uYV6AKyG0uq9Wantly1FbYbXQ2smSKAP3nSSdR59oHE9nXlXs5y3ixnrfCUXHK5AK7ZYd2/027erZWfjKZ0f7Lyf9a3h8Ci4uuHg36c6R2/JTOqaZ3cGzv3R+yWrTHb/C11Baqj4TZZGeotB/gtqf6Paq6bYTUQudnxe9VDB3Asjd/Erll5enD9Y2NClEWWhERATKZUIJyoTCnCAiIgIiICJlEBEUYQSiIgIOSIgIiICFEQEyiICIiAiIgIiICIoQSg5KMKcICIiAiIgJlEQFARSgIiICIiDD3hk3OS1+DlqqaPz54oaUDOMiWZjHf4SVopsEpt6+3Gq/FUoj/aeD/pW4v9IDVeL7Auhaf95vFNGR2gB7/wDStTdgEH9Uu1V8J742ewE/xVnljP8AWso7yAriQgK6vO5Fqs+vvep7lqOrsukrfSy+IY8Zqao+RvEeaOX8etXgHKy5qfVel9VXG7adoYbpQ3Ih81M54a5j8c+f0jnnlwUy21hr2qWh9Q1l4mrrXeKEUN2t7g2eMHIcD8If/c9XHiscama6s25wU7m7zfdClZj80bhI+tZB0HZrtT3C56i1A6JtzubgXQswRG0dX8OZ5c1ZEZ6Twgot78otPsYPsWbbqbbmpbpsEHOd7cplMKFtyTlEHJETQiKcIriXNakbmyeU1zXN7RxCx1tCikv20Ww6LrK2ahtNTA6omLHbpqXZcOjz+ry/O5ciuvBbYdBbWLVY7JXVD7ddYHuqKCWTf6AgHDx2Zx18efHsm25hwyHfa+O02Wtuk3kspIHyn1DgPatX9AW6S/a4pm1W9L99NTUE8S4Dyjn0nHtWY/CIvTaXSVPZ45GtluE43xnj0TPKPtdu+xWrsGtTW09wvUjfKe4U0ZI6hhzvad32LN5umsf842sm4XLKgqMrbk5JlccqUElcJ4oainfT1EMU0MgLXMe0Frh2EFckQYyv+nbtom6jVmiKqWFsPGWnHlbrPhcPhx9rTy5+i9qLwhdNuooXV1nujKssHTRwNjdG13XhzngkepVZwa7zt1wPMHkR2KwPB0oLX7+9R2GuttLW9FEXRGogbJuCKXcON4HGd8exTxeHSaym76XY7whtK/Bs96P6sQ/1r5u8InTnwdP3V3pkjH8Ssqx6escfm2e2t9FMwfwX3ZbLbH5tvpG+iBo/grrL6zvH4w9J4Rdlb+D0vXO9NUwf6Svi7wioZOFLoupl/wDr/sjKzWKelb5tPC30MAXLcj/Fs/ZCsxy+m8fjCI2/XST8Ds/qHf8A1j3f+kuJ246rc8Op9ATNPV5UriP8AWcNxvxW+wLkB+kmsvp14/GD5ds+0Kof0jdn9S9/DyjFO48P1Vj7XkWrNZVrbg7ZvXUNaT98mpLdOOmGPhDdwT381tmC74zvaUJUuG/azOTxGsngt6q1BoXbVbo6fxiGnqJTTXikl3o2mEZ3nPbjzmecMjOeGRkr00B3uXELSm66Jp7TtDrtVSR/1i6UzDE05wwY3Xu9Li0er0lbabM7k67aEtNY528/oBG89rmHdP1LjeHeXc2uRERFQik8lCAiIAgkckREGvnh+3F1HsAlpWu/3+6U0BHaAXSfXGFrB4KbaOGqvlZVVVLC8thhiEszWkjLnO5kdjVt34XmzK+bUNmlPa9OzQi5W+vZWxQTO3W1ADHsLM9TvLyCeHDHDORpXJ4N222Pi7QVWf0aund9UiuN1ds5Y9U02aZU07vNqIXfovBXMPb8ZrvYtT63YTtipc9Ns7vrv/Bp+k/yEroR7ONr1Hwj0HrmnaPi2iqaPoaunc/jn2f62/XLDvin2LUB2ndr1PwdY9dw+mjqx/BcDR7WofOptbMx2xVQ/gnc/idn+twT+soytPzc9qlP51Rq2L9Jsw+sL5v1ptKpfwl7v0WPjl4+sJ3E7N+txQVza5q0zbtQ2gN83VVw9bgf4L6t2rbQvlVW+xn2K9yL2b9ZI23tbVbetORux5FJT+0SzOV3lq1vumq9QXS9w3yuuk09xgaGR1Dg0OaBnA4DHWfau0deau/L1V/h+xYmTdwt02FKArXg661Z+Xqr/D9i4O1tqx3/AF9W+pw+xXrjHav1sUCuS16j1Hrib8HcLw/9EOP8F9mV20SbzXahf+jFIf4J1r2qz8Ah8n4ywJubTJPNp9Uv9EE32KPcvaZJ/wBX6ud6Keo+xOpO1/WYta2z3a0vXW/dc574i6Pnwe3ym/SFifYfd22nXtKyaTdhrmmlfk4GXYLf8QA9a+DbFtQd5tn1m70U1Sf4Lqw6B2gB7ZKfROqN8EFrmWufIOeYO76Fm5bu3THHU02E1hoez6irobhNJV2+4xANbV0cvRyY7Dz9vNdnRulrPpOlljtrZXz1BBnqZ370sh7z9OB1rAw0dtkm/wCyuvJc/wD9Pqz/AKVxds52xS+doPXb/TaKs/6FeqfE6LrW2yj5W/Gb7QuBqYfhTRN9LgFrfBse2tVXH7nOrP8A5lsmZ/maF34dge2Obzdn17H6UbW/WQnWz2v6z+a2jb51ZTt9MzR/FfJ93tMf4S7W9npqYx/FYQj8HPbVJ5uga8fpTwt+t67DPBn24O5aDn9dfSj/ANVOpe1/WX5NT6Zh8/UVnZ+lXxD/AFL5u1bpT5T2T5/F9qxTD4MO3CR+67RLo/znXGlwPZIV34PBS20SedYaKL9O4R/wJU6ztRZVVcrfUbaJbn45C2i8fLhOXjcLQMb29ywcc1lQat0y3/tBbv34Kp0fgi7YnedS2VnpuA/lX2Z4Hm153wtOt9Ne7+RJlY1cJl5ds6y0v+XqH96vm7WelW/9fUX7RP8ABcB4HG1z+8aZH/17/wD+GvozwNtrW95Vdplo/wD76Q/+mr11ntYvmdb6Ub/15Tf4j/BQ7XukW/8AXUXqa4/wVSg8DDaQ78NfNPReiWQ/6Qu5F4FGt3fhNWWFnduSn+CnWvajEu1/VFlvlpo6e11njEsdQXuwxzcDdx1hbZ/0dsDo9iVymdnEt8mI9AiiCxZH4EusHP8AL1lY2t6/vEpW2Gw/Z3Q7LtnVDpGjrH1ronvmqKpzNwzSvOXO3eO6OQAyeAHE8SpbtuTU0vlEHJFFEREBERAREQEREBERAREQEREBERAREQEPJEQEwiICYREBERAREQEREBERAREQEREBERAREQEREBERAREQa2f0h8TnbD6CRvmx32An91KFqVsf1PZbHbK6nulYKd8k4e3LXOBG7jqC9Edtmzy37UNntdpOuqn0Tpy2Wnqms3zBMw5a/dyN4cwRkZBPEc1qfJ4EmrGuPR61sj29WaeUH+Ksuks3NLaGvdIu/wCuofW1w/gnv40o7/rym/xD+CuCTwJ9aNbmPV1heewxSj+C6U3gYbRW/g79p9/68g/0q9dY7UU4a00n+XqT2n7F9BrPS35eof2ypl8DXas38HcNMu9NZIP/AEyvifA32uf3rTPz+T/+GnXU7Ufb33aYd/2gt/77CxYbtb4dtEV2bVRPovH2OM7XAsDS0Auz2DPFZKf4He15v9ppx3or3fyL4SeCJtij82nsjv0a/wD/AOVLltrHCRezNXaT+VFm+fRj+K5t1TpiR263U1kJ7BXxZ/zLHk3gnbZm+bZ7a/8ARr2cfbhdGp8FzbbH+D0iyb9C4U/+p4V62e1GWI73ZZPwd6tj/wBGrjP8V923Chd5tdSu9EzT/FYXd4Mu3JvPQkvquFIf/VXxk8G7bdH52gqv9Wrp3fVIr1J2p9ZxFTC7zZoneh4K5Mmb+Mb7QsByeD3tmj87Z/df1TG76nLpy7EdsFN5R2e6jH/h0jnf5cp1nZ/rOGsdMWfVlJFDcmysmp3b1PUwODZYj3H2cD1gdi6WktC2fTtzlukdRXXK5SNLPGqyTfe1pHED7TkrCv3NtskD91ug9dtI+Jaaoj2hqk6I2zR/9kdoDP8A/W1Y/wBKnU10Xxt8tt1591te1TI5N+GhaKVmDkZGS4/tEj1LLGi7b7i6Xobfu7r2RB0nA8Xu4u+krDM2zraNvudNoXVe8SS4utFRknrz5C7DtN7VG+dYdaN9NHVD+CTLV2tx3NM7gqSsC+421CP/AKr1g3001T9inxbahH/0PVbfTTT/AGLXW59q/WeEysCum2lQ+dHqVnpglH8FwdeNoUfnVF+b6Ynj+CdcO1frPxUrXmXV+s6f8Nd7jH1ffBj6wuI13qz8u1Psb9idUO1WxACs/YwG0/hAagjb8Okn+l8Tlika91d+Xaj2N+xdS26s1Bbb7LfKG6TU9ynaWSVDQ3ecDjIxjHUOpS5ctY4WbbwuK+ZK05dtV2hO87VVd/hH8F83bT9fO/7WXL1Px/Bb7kZ7N+tyMrkFpqzXW0Ko8qPUV7fnrbI4g+xfVl+2mVH4O4aml/Q6U/UE7s+HZv1uMGu+K72KSN34K06bDtVn8psetH+htSVzbp/a3U+bZdbzeilqnfwTuna/rcSmY2oqGQ9NFEX9crg0BXRbLJb6V7ZqyqhmfzA3gGD7Vok/ZttarsdJoHW1RnHF1oqXD2lqvrZ7oHb7YJ2No9BX6ooSfKpKqLo2Ed2+RuHvH0rNz21PxSNk9qfi8z6CaGaKVw32EMeCQOB6lkvwe6jptCPh3v8Ad62VgHYCGu+txWILZs+11WUkVQ7S9XSPkaC6GaaIOjPYcPx7Fm7Y/pm4aX01LT3RzBU1FQZjG05EY3QACe3hlYt26SaXuiIooeShSoQApREBERAwiIgYUZUogjKZUog4Pijd50bD6RlfJ1FRu86jpz6Y2ldhMIOobdb3edQ037lv2KPcy2u/6vpP3DfsXcTCDo+49p/JdD83Z9ie5Np/JtF+4b9i7yIOn7l238n0n7hv2LkLdb/7jTfuW/Yu0iDrCiox5tHT/u2r6CCnb5sMTfQ0BfVEHFrWt81oHoCnKlMIIymVKYQRlFKDkggphSiCMopTCCEUoghSiICIiAiHkiAiIgIiDkgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiJhAREQEREBERAREQEREBERAREQEyiICIeSIA5IiICIiBhQpRAUZUogjKZUoggFFKIODo43edGw+kAr5upqU+dTw+tgX3Q8kHWNDQu86jp/3bVx9zrf+T6T9y37F20QdI2y1/k+k/cN+xcDZrP8Akmh+bs+xVDCYQdIWm1/k2i/cN+xchbra3zaGlH/yW/Yu2iDreI0P9zp/3TfsXNtNTt82nhHoYAvsmEHEBrRw4ehTlSiBlQpwiCAmFKIGUREA8lGFKgoJTKgoEEplRlMoJyoTKIBUqEQSh5KMqcoA5IoymUEooygKCUUBEEog5IUBEUZQSijKZQSiZUZQSijKIJREQEUZUoCJlRlBKKEQSiJlARFCCUUEplBKZUJlBOUyoymUE5RQCmUEooymUEplRlTlARRlCUE5RFGUEooymUEooymUEoeSjKIJymVGUygnKKEyglFGUQSihMoJRRlAUEplQEyglFGUyglFGUQSijKZQSijKZQTlMqCUygnKZUJlAUqMoglMqMoglQChKIJHJByUZTKCUUZRBKIoyglFAKZQSiIEBFGVOUBFATKCUTKjKCURRlBKKEQSihTlARRlMoJRMqMoJyijKBBKKMplBKKMplBKKMoglFGUygnCghEQf/Z",
    "tentacles": "data:image/png;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8LCwkMEQ8SEhEPERETFhwXExQaFRERGCEYGh0dHx8fExciJCIeJBweHx7/2wBDAQUFBQcGBw4ICA4eFBEUHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCAQABAADASIAAhEBAxEB/8QAHQABAQABBQEBAAAAAAAAAAAAAAEIAgUGBwkDBP/EAFwQAAIBAwIDBQMGCQcFDQgBBQABAgMEEQUGBxIhCDFBUWETInEUMlKBkaEVFiNCYnKCkrEJJDNDU6LBNFaywtIXGCVERmODk6Oz0dPwJic1c3SUpOE3lVR1pcP/xAAbAQEAAgMBAQAAAAAAAAAAAAAAAQIDBQYEB//EADYRAQACAgEDAgMGBQQDAQEBAAABAgMRBAUhMRJBBhNRIjJhcZGxFIGhwdEVQuHwIzRSJBbx/9oADAMBAAIRAxEAPwDMrIDAAAIAAAAAAAJAAAAAAAAAAAACAAAAAAAAAAAAAGAADAAAAAAEAADAAAAAgEAAAAAAAAAYAAMAAAAAAAETKAAyAAAAAAAAAAAAABAAAAAAAAAAAAABGUAAAAAABAAAwAAAAAAAAAAAABgAAAAyAACYAAAAAAACQGBgAAACDAAABAAAAAAAjKACAAAAAAMAAAwwAYQADAYAAZAAAAAABEUAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAAAACIoAAAAAAACAAAAAMgAAAAAAAAAAAAAAAAAAAAYAAAAAAAADAAAAAAAAGAAAAAAACIoAAAAAAAAAAAARlAAAAAAGAAAAyAAAAAIAACYAoAAAAAAACAQAAAAEGMgAmAAAABhAAABkAEEGACAYAAABkACZKABEUABgAACZKAAJkoABAAAAADAEyUmSgACMCgAAAAABMgUAAAAABEigAAAAJkCgACNjBQAAwAAAAEZQBMlAAAAACZKAAAAAIAAAAAAIYAAAACZKAAAAAZAABgACZDZQIygAAAAAAAAAARlAAMAAAADAAmSgATJQAAAAAABkAAAAAYyAAACABDAAFfcQMAAgAGQAAAAIYAwAAAAAJAAAAACAEwUmAKAAAAAAAAATAFDJgoAAAAAAAAAEwMAGGUAAEAACCAYAYAAACJFAAAAAGAAAJgCgAAAAAAAAAATBUGAAAAAACZKRICgmCgATBQAAAABgACYAoJgoABgAGEgAYASAAAACIICkwVgAAAAAAAIACYKAAAAAAACYKAAAAJgAMAAAARoCgAAAAGAxkZAMAAAAAyGMBgAAAAAAmCgAAGAAAAJgJAAABEMDJQAAAABAAAAAGAGBgAAAAGQgAAYAERQRAUAAAAAYAAMAAAAAACAAAAAAAAAmCgAABkAAEwABMAMFAADIAAYAyBcEAAAAAgMgAAGwjYAAkyCMoAAAAABUTIAAMACMuQAAAAAAAAEwLgjGQAAABDAGQGQAAAABIjRQAIigAAgAAABgAACMoAAZAAAABkAAAAAAAAAAgADQQGQADAAAAAMAAMgAEgEAAAAINgAMgAAAAAAAAYLgCYGAAABEBQgAAGAACQAAAAAAAAAAIABgAYAABgAEAAAAAIYAMDAAEyUAECIoAIAAMDAAAAARFAAAYADAwAAAAAmQgKGAAAGAAYGAGAAAQTAQBgJlwBAMDAAYAwAQbAAAAAAMAAA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AACIygCYKAACAABgACJFAAAAAAAAAAAmAKAAAAAAAAAAIigjAYKEAAAyACDYAAAACYKgAAyAADAABgAAAAAAAAAAAAAAAATBQAAAAAAATJQAIygCJFDARsAASAAAAAAAAADIAAAAAAIigAAAAAYABsZAAAAAAAYDAAZAAAIAAMgMAZGQDYyAABMBAUAAEAgAYAbAAACZKAAAAAAAAAAAIwKAAACAAAAAEAAAAAAAMgAEAAAAAEwUAAAAGQMgEAAAIygAAAAAAAAAAAAAAAAAAAAAAAmQGCkbKAGQAAAAAAAAAAAAZGQAAQJkCsAAVdxAAAAyACYAAAAAAAAQAABAAMgAAkGAAADAyAAAAAFIkAAAAAAEgGwAAAAJgAGMAAAAAAAAAAAAAAAAAAAAAAAEwUAAAAAAAmSsmRkCgEYFAAAAAAAAAJkBkZDKACAAAAAARgUAARIoAAAAAABMlAAAEQFAAAAAARlAAAACIoBAABgAACNlAETKTAQFCAAAAARsoAEyUmQCRSZKAGAAAAAAEYBlI2MgEUAAAABGigARjJQAQAAAAACMCkyUmQKTIyUAMgAAAAAAAIAAwCICgAAAAAYbGQACDAIAAARlAMBACMoAAAmAKgAAAAAAAAAAAQAAAATJQAAAAjKAACAAAmQKRlAAAAAAAQAQAAAACICgAAGAAAAAAATJQAAAAABgARFAERQAIigAAEAAAAAAAAAAAAmSgARlAAAACMoAAAAARMCgACIIoAAAAAABEygAAAAAAAAAAAAAAmSgAAAAAwADAAABgAhkAAAgAaAYYAAIAAAAAABgAAAAAAAZAAAAAAADAAAAAAAwAAAAACJFAAAAAAAAAQAmCgAAAJgoAAAAAAAAAAAAAGMABkAAAEAYJgoAAAEAAAAAAmCgAAAAQAAAAAgADAAAAAAAAAAAAAAAADAAAAAEAAAAAAAAAACAAAAAgAJgoAAANgAAAAAAAAABgAAAAyMAABgYAMAAAEAAGQAAAH//2Q==",
  }
};

const getBodyImage = (armType, eyeCount) => {
  const key = `${armType}_${eyeCount}`;
  return monsterImages.bodies[key] || null;
};

const getLegsImage = (legType) => {
  return monsterImages.legs[legType] || null;
};

const MonsterLabModule = ({ serialNumber, onSuccess, onStrike }) => {
  // Monster features
  const eyeCounts = [1, 2, 3, 4];
  const armTypes = ['tentacles', 'robot', 'hairy'];
  const bodyShapes = ['tall', 'short', 'fat', 'thin', 'normal'];
  const skinColors = ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'white', 'black', 'brown'];
  const monsterNames = ['ZORG', 'BLIP', 'FLOP', 'MEEP'];
  
  // Arm display names for UI
  const armNames = {
    tentacles: 'TENTACLE',
    robot: 'ROBOT',
    hairy: 'HAIRY'
  };
  
  // Body shape display names
  const shapeNames = {
    tall: 'TALL',
    short: 'SHORT',
    fat: 'FAT',
    thin: 'THIN',
    normal: 'NORMAL'
  };
  
  // CSS transforms for body shapes
  const shapeTransforms = {
    tall: 'scaleY(1.25)',
    short: 'scaleY(0.75)',
    fat: 'scaleX(1.3)',
    thin: 'scaleX(0.7)',
    normal: 'scale(1)'
  };
  
  // Generate random monster
  const [monster] = useState(() => ({
    eyes: eyeCounts[Math.floor(Math.random() * eyeCounts.length)],
    arms: armTypes[Math.floor(Math.random() * armTypes.length)],
    color: skinColors[Math.floor(Math.random() * skinColors.length)],
    shape: bodyShapes[Math.floor(Math.random() * bodyShapes.length)]
  }));
  
  // Identification rules
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
  
  // Color adjustment helpers
  const getHueRotation = (color) => {
    const hueMap = {
      red: 0, orange: 30, yellow: 60, green: 120, blue: 240,
      purple: 280, white: 0, black: 0, brown: 30
    };
    return hueMap[color] || 0;
  };
  
  const getSaturation = (color) => {
    if (color === 'white') return '0%';
    if (color === 'black') return '0%';
    if (color === 'brown') return '50%';
    return '100%';
  };
  
  const getBrightness = (color) => {
    if (color === 'white') return '200%';
    if (color === 'black') return '30%';
    return '100%';
  };

  const bodyImageSrc = getBodyImage(monster.arms, monster.eyes);
  const legsImageSrc = getLegsImage(monster.arms);
  
  const filterStyle = `hue-rotate(${getHueRotation(monster.color)}deg) saturate(${getSaturation(monster.color)}) brightness(${getBrightness(monster.color)})`;

  return (
    <div className="module-content monster-lab-module">
      <h3>👾 MONSTER LAB</h3>
      <p className="module-hint">What is this monster's name?</p>
      
      <div className="monster-container" style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
        <div 
          className="monster-display"
          style={{ 
            position: 'relative',
            width: '300px',
            height: '350px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: shapeTransforms[monster.shape]
          }}
        >
          {legsImageSrc && (
            <img 
              src={legsImageSrc} 
              alt="monster legs"
              style={{ 
                position: 'absolute',
                bottom: 0,
                width: '100%',
                height: 'auto',
                zIndex: 1,
                filter: filterStyle
              }}
            />
          )}
          {bodyImageSrc && (
            <img 
              src={bodyImageSrc} 
              alt="monster body"
              style={{ 
                position: 'relative',
                width: '100%',
                height: 'auto',
                zIndex: 2,
                filter: filterStyle
              }}
            />
          )}
        </div>
      </div>
      
      <div className="monster-label" style={{
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
      
      <div className="monster-names" style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '10px',
        marginTop: '20px'
      }}>
        {shuffledNames.map((name, idx) => (
          <button
            key={idx}
            className="name-btn"
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
