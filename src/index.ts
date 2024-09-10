import { Address } from "viem";
import { sendUserOp } from "./sendUserOp";
import { AccountType } from "./types";

const main = async () => {
  const erc7579Account = {
    address: "0x7227dcfb0c5ec7a5f539f97b18be261c49687ed6" as Address,
    type: "erc7579-implementation" as AccountType,
    deployedOnChains: [11155111],
  };

  const safeAccount = {
    address: "0xc2b17e73603dccc195118a36f3203134fd7985f5" as Address,
    type: "safe" as AccountType,
    deployedOnChains: [11155111],
  };

  const kernelAccount = {
    address: "0xee0cbe5e9c49a2cc31881ab9c26e662be68e85dd" as Address,
    type: "kernel" as AccountType,
    deployedOnChains: [11155111],
  };

  const nexusAccount = {
    address: "0xD13D10447C8684D7793715272A57C2E35ae63823" as Address,
    type: "nexus" as AccountType,
    deployedOnChains: [11155111],
  };

  const sepolia = {
    id: 11155111,
    bundler: `https://api.pimlico.io/v2/sepolia/rpc?apikey=${process.env.PIMLICO_API_KEY}`,
    rpc: `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
  };

  const hash = await sendUserOp({
    account: erc7579Account,
    actions: [
      {
        target: "0xF7C012789aac54B5E33EA5b88064ca1F1172De05",
        value: 0n,
        callData: "0x",
      },
    ],
    chain: sepolia,
  });

  console.log("tx hash: ", hash);
};

main();
