import { Account, Chain } from "./types";
import { getPublicClient } from "./utils/clients";
import { Execution } from "./types";
import { getNonce, getSmartClient } from "./utils/smartClients";
import { Address, Hex } from "viem";
import { ENTRYPOINT_ADDRESS_V07, getUserOperationHash } from "permissionless";
import { sepolia } from "viem/chains";

type SendUserOpParams = {
  actions: Execution[];
  account: Account;
  chain?: Chain;
  validator?: Address;
  signUserOpHash?: (userOpHash: Hex) => Promise<Hex>;
  getDummySignature?: () => Promise<Hex>;
};

const defaultChain = {
  id: sepolia.id,
  rpc: "http://localhost:8545",
  bundler: "http://localhost:4337",
};

export const sendUserOp = async ({
  actions,
  account,
  chain = defaultChain,
  validator,
  signUserOpHash,
  getDummySignature,
}: SendUserOpParams) => {
  const publicClient = getPublicClient({ chain });
  const smartClient = await getSmartClient(account, chain, publicClient);
  const nonce = await getNonce({ account, publicClient, validator });

  if (signUserOpHash) {
    smartClient.account.signUserOperation = async (userOp): Promise<Hex> => {
      const hash = getUserOperationHash({
        userOperation: userOp,
        chainId: chain.id,
        entryPoint: ENTRYPOINT_ADDRESS_V07,
      });

      return signUserOpHash(hash);
    };
  }

  if (getDummySignature) {
    smartClient.account.getDummySignature = async (): Promise<Hex> => {
      return getDummySignature();
    };
  }

  const hash = await smartClient.sendTransactions({
    account: smartClient.account!,
    transactions: actions.map((action) => ({
      to: action.target,
      data: action.callData,
      value: action.value as bigint,
    })),
    nonce,
  });

  return hash;
};
