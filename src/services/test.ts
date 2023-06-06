import Wallet from "ethereumjs-wallet";

const test = async () => {
  console.log("Connecting to");
  const privateKey =
    "0x64a0c662f57dc25fac5dd9ff24b9c6b6c100e2d3a0501e2ec94eb792e8e9dd6d";
  const wallet = Wallet.fromExtendedPrivateKey(privateKey);
  console.log(wallet);
  const mnemonic = wallet.getAddressString();
  console.log(mnemonic);
};

test();

// import {
//   // swap methods
//   constructPartialSDK,
//   constructEthersContractCaller,
//   constructAxiosFetcher,
//   // limitOrders methods
//   constructBuildLimitOrder,
//   constructSignLimitOrder,
//   constructPostLimitOrder,
//   // extra typess
//   SignableOrderData,
//   LimitOrderToSend,
// } from "@paraswap/sdk";

// const buildLimitOrderFn = async () => {
//   try {
//     console.log("Building");
//     const account = "0x1DcfE2e21dD2a7a80d97b6cc3628240f87CFee46";

//     const fetcher = constructAxiosFetcher(axios);

//     // provider must have write access to account
//     // this would usually be wallet provider (Metamask)
//     const provider = ethers.getDefaultProvider(1);
//     const contractCaller = constructEthersContractCaller(
//       {
//         ethersProviderOrSigner: provider,
//         EthersContract: ethers.Contract,
//       },
//       account
//     );

//     // type BuildLimitOrderFunctions
//     // & SignLimitOrderFunctions
//     // & PostLimitOrderFunctions

//     const paraSwapLimitOrderSDK = constructPartialSDK(
//       {
//         chainId: 1,
//         fetcher,
//         contractCaller,
//       },
//       constructBuildLimitOrder,
//       constructSignLimitOrder,
//       constructPostLimitOrder
//     );

//     console.log(paraSwapLimitOrderSDK);

//     const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
//     const HEX = "0x2b591e99afe9f32eaa6214f7b7629768c40eeb39";

//     const orderInput = {
//       nonce: 1,
//       expiry: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // week from now, in sec
//       makerAsset: DAI,
//       takerAsset: HEX,
//       makerAmount: (1e18).toString(10),
//       takerAmount: (8e18).toString(10),
//       maker: account,
//     };
//     console.log(orderInput);

//     const signableOrderData: SignableOrderData =
//       await paraSwapLimitOrderSDK.buildLimitOrder(orderInput);

//     console.log(JSON.stringify(signableOrderData));

//     console.log("MAKN");

//     const signature: string = await paraSwapLimitOrderSDK.signLimitOrder(
//       signableOrderData
//     );

//     console.log("SALIO");

//     const orderToPostToApi: LimitOrderToSend = {
//       ...signableOrderData.data,
//       signature,
//     };

//     const newOrder = await paraSwapLimitOrderSDK.postLimitOrder(
//       orderToPostToApi
//     );
//     console.log(newOrder);
//   } catch (error) {
//     console.log(error);
//     console.log("Error funcion 1");
//   }
// };

// buildLimitOrderFn();
