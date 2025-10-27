const address = "620 SOUTH 4TH AVE MANSFIELD TX 76063";

// Test extraction
const stateMatch = address.match(/\b([A-Z]{2})\b/);
console.log("Address:", address);
console.log("State match:", stateMatch);
console.log("Extracted state:", stateMatch ? stateMatch[1] : null);
