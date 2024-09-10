require("dotenv").config();
import {
  createSmartAccountClient,
  ENTRYPOINT_ADDRESS_V07,
  getAccountNonce,
} from "permissionless";
import {
  signerToEcdsaKernelSmartAccount,
  signerToSafeSmartAccount,
} from "permissionless/accounts";
import { Address, encodePacked, Hex, http, pad, PublicClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { anvil } from "viem/chains";
import { erc7579Actions } from "permissionless/actions/erc7579";
import { Account, Chain } from "../types";
import { getBundlerClient } from "./clients";
import { createPimlicoPaymasterClient } from "permissionless/clients/pimlico";

const signer = privateKeyToAccount(process.env.PRIVATE_KEY as Hex);

// Safe Smart Client
const getSafeClient = async (
  account: Account,
  chain: Chain,
  publicClient: any,
  bundlerClient: any,
  paymasterClient: any
) => {
  const safeAccount = await signerToSafeSmartAccount(publicClient, {
    safeVersion: "1.4.1",
    signer,
    entryPoint: ENTRYPOINT_ADDRESS_V07,
    safe4337ModuleAddress: "0x3Fdb5BC686e861480ef99A6E3FaAe03c0b9F32e2",
    erc7579LaunchpadAddress: "0xEBe001b3D534B9B6E2500FB78E67a1A137f561CE",
    address: account.address,
  });

  return createSmartAccountClient({
    account: safeAccount,
    entryPoint: ENTRYPOINT_ADDRESS_V07,
    chain: anvil,
    bundlerTransport: http(chain.bundler),
    middleware: {
      gasPrice: async () => {
        return (await bundlerClient.getUserOperationGasPrice()).fast;
      },
      sponsorUserOperation: paymasterClient.sponsorUserOperation,
    },
  }).extend(erc7579Actions({ entryPoint: ENTRYPOINT_ADDRESS_V07 }));
};

// Kernel Smart Client
const getKernelClient = async (
  account: Account,
  chain: Chain,
  publicClient: any,
  bundlerClient: any,
  paymasterClient: any
) => {
  const kernelAccount = await signerToEcdsaKernelSmartAccount(publicClient, {
    signer,
    entryPoint: ENTRYPOINT_ADDRESS_V07,
    address: account.address,
  });

  return createSmartAccountClient({
    account: kernelAccount,
    entryPoint: ENTRYPOINT_ADDRESS_V07,
    chain: anvil,
    bundlerTransport: http(chain.bundler),
    middleware: {
      gasPrice: async () => {
        return (await bundlerClient.getUserOperationGasPrice()).fast;
      },
      sponsorUserOperation: paymasterClient.sponsorUserOperation,
    },
  }).extend(erc7579Actions({ entryPoint: ENTRYPOINT_ADDRESS_V07 }));
};

// Nexus Smart Client
const getNexusClient = async (
  account: Account,
  chain: Chain,
  publicClient: any,
  bundlerClient: any,
  paymasterClient: any
) => {
  const nexusAccount = await signerToEcdsaKernelSmartAccount(publicClient, {
    signer,
    entryPoint: ENTRYPOINT_ADDRESS_V07,
    address: account.address,
  });

  return createSmartAccountClient({
    account: nexusAccount,
    entryPoint: ENTRYPOINT_ADDRESS_V07,
    chain: anvil,
    bundlerTransport: http(chain.bundler),
    middleware: {
      gasPrice: async () => {
        return (await bundlerClient.getUserOperationGasPrice()).fast;
      },
      sponsorUserOperation: paymasterClient.sponsorUserOperation,
    },
  }).extend(erc7579Actions({ entryPoint: ENTRYPOINT_ADDRESS_V07 }));
};

// 7575 Reference Implementation Smart Client
const getERC7579Client = async (
  account: Account,
  chain: Chain,
  publicClient: any,
  bundlerClient: any,
  paymasterClient: any
) => {
  const erc7579Account = await signerToSafeSmartAccount(publicClient, {
    signer,
    entryPoint: ENTRYPOINT_ADDRESS_V07,
    address: account.address,
    safe4337ModuleAddress: "0x3Fdb5BC686e861480ef99A6E3FaAe03c0b9F32e2",
    erc7579LaunchpadAddress: "0xEBe001b3D534B9B6E2500FB78E67a1A137f561CE",
    safeVersion: "1.4.1",
  });

  return createSmartAccountClient({
    account: erc7579Account,
    entryPoint: ENTRYPOINT_ADDRESS_V07,
    chain: anvil,
    bundlerTransport: http(chain.bundler),
    middleware: {
      gasPrice: async () => {
        return (await bundlerClient.getUserOperationGasPrice()).fast;
      },
      sponsorUserOperation: paymasterClient.sponsorUserOperation,
    },
  }).extend(erc7579Actions({ entryPoint: ENTRYPOINT_ADDRESS_V07 }));
};

export const getSmartClient = async (
  account: Account,
  chain: Chain,
  publicClient: any
) => {
  const bundlerClient = getBundlerClient({ chain });

  const paymasterClient = createPimlicoPaymasterClient({
    transport: http(chain.bundler),
    entryPoint: ENTRYPOINT_ADDRESS_V07,
  });

  switch (account.type) {
    case "safe":
      return getSafeClient(
        account,
        chain,
        publicClient,
        bundlerClient,
        paymasterClient
      );
    case "kernel":
      return getKernelClient(
        account,
        chain,
        publicClient,
        bundlerClient,
        paymasterClient
      );
    case "erc7579-implementation":
      return getERC7579Client(
        account,
        chain,
        publicClient,
        bundlerClient,
        paymasterClient
      );
    case "nexus":
      return getNexusClient(
        account,
        chain,
        publicClient,
        bundlerClient,
        paymasterClient
      );
    default:
      throw new Error(`Unknown account type: ${account.type}`);
  }
};

export const getNonce = async ({
  publicClient,
  account,
  validator,
}: {
  publicClient: PublicClient;
  account: Account;
  validator?: Address;
}) => {
  return await getAccountNonce(publicClient, {
    sender: account.address,
    entryPoint: ENTRYPOINT_ADDRESS_V07,
    key:
      account.type === "kernel"
        ? BigInt(
            pad(
              encodePacked(
                ["bytes1", "bytes1", "address"],
                [
                  "0x00",
                  "0x00",
                  validator || "0x503b54Ed1E62365F0c9e4caF1479623b08acbe77",
                ]
              ),
              {
                dir: "right",
                size: 24,
              }
            )
          )
        : BigInt(
            pad(validator || "0x503b54Ed1E62365F0c9e4caF1479623b08acbe77", {
              dir: "right",
              size: 24,
            })
          ),
  });
};
