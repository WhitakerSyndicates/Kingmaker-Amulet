// Wait until the DOM is fully loaded
document.addEventListener("DOMContentLoaded", function () {
  
// Dummy data for demonstration; replace these with actual values from your blockchain
  const currentKing = "0x1234...abcd";
  const kingOfTime = "0xabcd...1234";
  const totalHeld = "365 days";
  const kingOfUsurpers = "0x5678...efgh";
  const claimCount = 42;
  const currentPrice = "1 ETH";

  
// Update the page with fetched data
  document.getElementById("currentKing").textContent = currentKing;
  document.getElementById("kingOfTime").textContent = kingOfTime;
  document.getElementById("totalHeld").textContent = totalHeld;
  document.getElementById("kingOfUsurpers").textContent = kingOfUsurpers;
  document.getElementById("claimCount").textContent = claimCount;
  document.getElementById("currentPrice").textContent = "Current Price: " + currentPrice;

  
// Set up the event listener for the claim button
  document.getElementById("claimButton").addEventListener("click", function () {
    alert("Claiming the amulet if you dare! This will trigger a blockchain transaction.");
    // TODO: Replace with your smart contract interaction code.
    // claimAmulet();
  });
});
