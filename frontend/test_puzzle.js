// Test script để demo puzzle 368
console.log("Testing puzzle 368 solution parsing");

// Simulate the solution parsing
const solution = "1... Qa3+ 2. Kxa3 Ra1";

const parseSolution = (solution) => {
  if (!solution) return [];
  
  // Remove move numbers and extra spaces
  const moves = solution
    .replace(/\d+\.\.\./g, '') // Remove "1..." 
    .replace(/\d+\./g, '')     // Remove "1."
    .replace(/Checkmate/g, '')  // Remove "Checkmate"
    .replace(/1-0|0-1/g, '')   // Remove game results
    .trim()
    .split(/\s+/)
    .filter(move => move.length > 0);
  
  return moves;
};

const moves = parseSolution(solution);
console.log("Parsed moves:", moves);
console.log("Expected sequence:");
console.log("1. Player (Black) should play:", moves[0]); // Qa3+
console.log("2. Computer (White) should play:", moves[1]); // Kxa3
console.log("3. Player (Black) should play:", moves[2]); // Ra1