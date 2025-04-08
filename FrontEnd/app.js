document.addEventListener("DOMContentLoaded", async function () {
  // Utility function: mask long addresses to show the first 6 and the last 4 characters
  function maskAddress(address) {
    return address ? address.slice(0, 6) + "..." + address.slice(-4) : "";
  }

  // Check if MetaMask is installed
  if (typeof window.ethereum !== "undefined") {
    try {
      // Request account access from MetaMask
      await window.ethereum.request({ method: "eth_requestAccounts" });
      console.log("MetaMask is connected.");

      // Create a provider and signer using ethers.js (v5 UMD is loaded in index.html)
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      // Set your contract address (verified one)
      const contractAddress = "0x2159c1D73619595D0BDA4408296E87D0C377D683";
      
      // Define the contract ABI (ensure this is current)
      const contractABI = [
        "function currentPrice() view returns (uint256)",
        "function currentKing() view returns (address)",
        "function kingOfTime() view returns (address)",
        "function kingOfUsurpers() view returns (address)",
        "function totalHeldTime(address) view returns (uint256)",
        "function claimCounts(address) view returns (uint256)",
        "function buy() payable",
        "function tokenURI(uint256) view returns (string)"
      ];

      // Create a contract instance with the verified address and ABI
      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      console.log("Contract instance created.");

      // Fetch the current price and current king from the contract
      const priceRaw = await contract.currentPrice();
      const currentPrice = ethers.utils.formatEther(priceRaw);
      document.getElementById("currentPrice").textContent = 
        "Current Price: " + currentPrice + " ETH";
      
      const currentKing = await contract.currentKing();
      document.getElementById("currentKing").textContent = maskAddress(currentKing);

      // Fetch additional data if desired:
      const kingTime = await contract.kingOfTime();
      document.getElementById("kingOfTime").textContent = maskAddress(kingTime);
      const totalTimeRaw = await contract.totalHeldTime(kingTime);
      document.getElementById("totalHeld").textContent = totalTimeRaw.toString() + " sec";

      const kingUsurpers = await contract.kingOfUsurpers();
      document.getElementById("kingOfUsurpers").textContent = maskAddress(kingUsurpers);
      const claimCount = await contract.claimCounts(kingUsurpers);
      document.getElementById("claimCount").textContent = claimCount.toString();

      // (Optional) Fetch token metadata if you want to display more info:
      const tokenUri = await contract.tokenURI(1);
      console.log("Token URI:", tokenUri);
      // You can then fetch the metadata from tokenUri as follows:
      // let metadataResponse = await fetch(tokenUri);
      // let metadata = await metadataResponse.json();
      // Update your DOM with metadata info if desired.

      // Set up the claim button to call the buy() function on the contract
      document.getElementById("claimButton").addEventListener("click", async function () {
        try {
          // Send a transaction to buy the NFT by passing the current price value
          const tx = await contract.buy({ value: priceRaw });
          console.log("Transaction submitted. Hash:", tx.hash);
          await tx.wait();
          alert("Transaction successful!");

          // Optionally, refresh data after the transaction
          const newPriceRaw = await contract.currentPrice();
          const newPrice = ethers.utils.formatEther(newPriceRaw);
          document.getElementById("currentPrice").textContent = "Current Price: " + newPrice + " ETH";
          const newCurrentKing = await contract.currentKing();
          document.getElementById("currentKing").textContent = maskAddress(newCurrentKing);
        } catch (error) {
          console.error("Transaction failed:", error);
          alert("Transaction failed. Check the console for details.");
        }
      });
    } catch (error) {
      console.error("Error connecting to MetaMask:", error);
      alert("Error connecting to MetaMask. Make sure it is installed and try again.");
    }
  } else {
    alert("Please install MetaMask to interact with this NFT.");
  }
});
