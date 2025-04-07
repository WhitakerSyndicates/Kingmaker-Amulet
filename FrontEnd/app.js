document.addEventListener("DOMContentLoaded", async function () {
  // Utility function to mask addresses: show the first 6 and last 4 characters (e.g., 0x1234...abcd)
  function maskAddress(address) {
    if (!address) return address;
    return address.slice(0, 6) + "..." + address.slice(-4);
  }
  
  // Check if MetaMask is installed
  if (typeof window.ethereum !== "undefined") {
    try {
      console.log("MetaMask is available.");
      // Request user accounts from MetaMask
      await window.ethereum.request({ method: "eth_requestAccounts" });
      
      // Create a provider and signer from MetaMask using ethers.js
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      // Contract details
      const contractAddress = "0xf055A45C6e0158805c4c02227de8D152f3CdF551";
      const contractABI = [
        // Minimal ABI for our calls
        "function currentPrice() view returns (uint256)",
        "function currentKing() view returns (address)",
        "function kingOfTime() view returns (address)",
        "function kingOfUsurpers() view returns (address)",
        "function totalHeldTime(address) view returns (uint256)",
        "function claimCounts(address) view returns (uint256)",
        "function buy() payable"
      ];

      // Instantiate the contract
      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      console.log("Contract instance created:", contract);

      // Fetch current price from the contract
      const priceRaw = await contract.currentPrice();
      const currentPriceFormatted = ethers.utils.formatEther(priceRaw);
      document.getElementById("currentPrice").textContent =
        "Current Price: " + currentPriceFormatted + " ETH";

      // Fetch current king and mask the address
      const currentKing = await contract.currentKing();
      document.getElementById("currentKing").textContent = maskAddress(currentKing);

      // Fetch King of Time data and the corresponding total held time  
      const kingTime = await contract.kingOfTime();
      document.getElementById("kingOfTime").textContent = maskAddress(kingTime);
      // totalHeldTime is a mapping; we pass the king's address
      const totalTimeRaw = await contract.totalHeldTime(kingTime);
      // Here we assume the returned value is in seconds; convert to string (or format as needed)
      document.getElementById("totalHeld").textContent = totalTimeRaw.toString() + " sec";

      // Fetch King of Usurpers and the number of claims
      const kingUsurpers = await contract.kingOfUsurpers();
      document.getElementById("kingOfUsurpers").textContent = maskAddress(kingUsurpers);
      const claimCount = await contract.claimCounts(kingUsurpers);
      document.getElementById("claimCount").textContent = claimCount.toString();

      // Set up the claim button event listener
      document.getElementById("claimButton").addEventListener("click", async function () {
        try {
          // When the user clicks the claim button, MetaMask will open a prompt
          // asking them to confirm the transaction.
          // The buy() function is called with the value set to the current price.
          const tx = await contract.buy({ value: priceRaw });
          console.log("Transaction submitted. Tx hash:", tx.hash);
          // Wait for the transaction to be confirmed (mined)
          await tx.wait();
          alert("Transaction successful!");

          // Optionally, update the current price and king data after a successful transaction
          const newPriceRaw = await contract.currentPrice();
          const newPriceFormatted = ethers.utils.formatEther(newPriceRaw);
          document.getElementById("currentPrice").textContent = "Current Price: " + newPriceFormatted + " ETH";
          const newCurrentKing = await contract.currentKing();
          document.getElementById("currentKing").textContent = maskAddress(newCurrentKing);
        } catch (error) {
          console.error("Transaction failed:", error);
          alert("Transaction failed. Check console for details.");
        }
      });

    } catch (error) {
      console.error("Error connecting to MetaMask:", error);
      alert("Error connecting to MetaMask. Please ensure it is installed and try again.");
    }
  } else {
    alert("Please install MetaMask to interact with this NFT.");
  }
});
