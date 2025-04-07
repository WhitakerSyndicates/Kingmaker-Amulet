document.addEventListener("DOMContentLoaded", async function () {
  // Check if MetaMask is installed
  if (typeof window.ethereum !== "undefined") {
    try {
      // Request account access from MetaMask
      await window.ethereum.request({ method: "eth_requestAccounts" });
      
      // Create a provider and signer using ethers.js (using ethers v5 here)
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      // Set your NFT contract's address and ABI (we use a minimal ABI for our example)
      const contractAddress = "0xf055A45C6e0158805c4c02227de8D152f3CdF551";
      const contractABI = [
        // These are the functions we'll interact with:
        "function currentPrice() view returns (uint256)",
        "function currentKing() view returns (address)",
        "function buy() payable"
        // You can add more functions here if needed (e.g., kingOfTime(), kingOfUsurpers(), etc.)
      ];

      // Create an instance of your contract
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      // Fetch data from the contract
      const priceRaw = await contract.currentPrice();
      // Format the price from Wei to ETH
      const currentPrice = ethers.utils.formatEther(priceRaw);
      document.getElementById("currentPrice").textContent =
        "Current Price: " + currentPrice + " ETH";
      
      const currentKing = await contract.currentKing();
      document.getElementById("currentKing").textContent = currentKing;

      // Set up the claim button event listener to trigger the buy() function
      document.getElementById("claimButton").addEventListener("click", async function () {
        try {
          // Call the buy() method with the appropriate ETH value
          const tx = await contract.buy({ value: priceRaw });
          await tx.wait(); // Wait for the transaction to be mined
          alert("NFT claimed successfully!");
          // Optionally, re-fetch updated data to reflect any changes
          const updatedPriceRaw = await contract.currentPrice();
          const updatedPrice = ethers.utils.formatEther(updatedPriceRaw);
          document.getElementById("currentPrice").textContent = "Current Price: " + updatedPrice + " ETH";
          const updatedCurrentKing = await contract.currentKing();
          document.getElementById("currentKing").textContent = updatedCurrentKing;
        } catch (error) {
          console.error("Transaction failed:", error);
          alert("Transaction failed. Check the console for details.");
        }
      });
    } catch (error) {
      console.error("Error connecting to MetaMask:", error);
      alert("Error connecting to MetaMask. Please make sure MetaMask is installed and try again.");
    }
  } else {
    alert("Please install MetaMask to interact with this NFT.");
  }
});
