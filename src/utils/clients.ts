import { http, createPublicClient, createTestClient } from "viem";
import {
  bundlerActions,
  createBundlerClient,
  ENTRYPOINT_ADDRESS_V07,
} from "permissionless";
import { pimlicoBundlerActions } from "permissionless/actions/pimlico";
import { foundry } from "viem/chains";
import { Chain } from "../types";

export const getBundlerClient = ({ chain }: { chain: Chain }) =>
  createBundlerClient({
    chain: foundry,
    transport: http(chain.bundler),
    entryPoint: ENTRYPOINT_ADDRESS_V07,
  })
    .extend(bundlerActions(ENTRYPOINT_ADDRESS_V07))
    .extend(pimlicoBundlerActions(ENTRYPOINT_ADDRESS_V07));

export const getPublicClient = ({ chain }: { chain: Chain }) => {
  return createPublicClient({
    transport: http(chain.rpc),
  });
};
