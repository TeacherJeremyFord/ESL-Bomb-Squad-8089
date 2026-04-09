import React, { useState } from 'react';
import { MonsterLabModule } from './modules/monster-lab.jsx';

// Simple demo to test Monster Lab module
function MonsterLabDemo() {
  const [strikes, setStrikes] = useState(0);
  const [successes, setSuccesses] = useState(0);
  const [key, setKey] = useState(0);
  const serialNumber = 'AB123-X4Y56';
  
  const handleSuccess = () => {
    setSuccesses(s => s + 1);
    alert('✅ Correct! The monster has been identified!');
    // Reset for next round
    setTimeout(() => setKey(k => k + 1), 1000);
  };
  
  const handleStrike = () => {
    setStrikes(s => s + 1);
    alert('❌ Wrong! Try again or look at the manual!');
  };
  
  const reset = () => {
    setStrikes(0);
    setSuccesses(0);
    setKey(k => k + 1);
  };

  return (
    <div style={{ 
      maxWidth: '600px', 
      margin: '50px auto', 
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      background: '#f5f5f5',
      borderRadius: '10px'
    }}>
      <h1 style={{ textAlign: 'center' }}>👾 Monster Lab Demo</h1>
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-around',
        marginBottom: '20px',
        padding: '10px',
        background: 'white',
        borderRadius: '8px'
      }}>
        <div>
          <strong>✅ Successes:</strong> {successes}
        </div>
        <div>
          <strong>❌ Strikes:</strong> {strikes}
        </div>
        <button 
          onClick={reset}
          style={{
            padding: '8px 16px',
            background: '#2196f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Reset
        </button>
      </div>
      
      <div style={{ 
        background: 'white',
        borderRadius: '8px',
        padding: '20px'
      }}>
        <MonsterLabModule
          key={key}
          serialNumber={serialNumber}
          onSuccess={handleSuccess}
          onStrike={handleStrike}
        />
      </div>
      
      <div style={{
        marginTop: '20px',
        padding: '15px',
        background: '#fff3cd',
        border: '2px solid #ffc107',
        borderRadius: '8px'
      }}>
        <h3>📖 How to Play:</h3>
        <ol>
          <li>Look at the monster's features (eyes, arms, color, shape)</li>
          <li>Check the manual to identify which monster type it is</li>
          <li>Click the correct name (ZORG, BLIP, FLOP, or MEEP)</li>
        </ol>
        <p><strong>Note:</strong> The identification rules change based on the serial number!</p>
      </div>
    </div>
  );
}

export default MonsterLabDemo;
