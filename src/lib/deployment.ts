import deployment from "../../deployment.json";

export const currentContractSourceHash = "d45c7626807d0c9364b66eb4163a32edcc8e1fae60b9f6a4208010b833e1403a";
export const deploymentMatchesSource = deployment.sourceHash === currentContractSourceHash;
export const contractAddress = (deploymentMatchesSource ? deployment.contractAddress : "") as `0x${string}` | "";
export const contractExplorerUrl = contractAddress ? `${deployment.explorerBaseUrl}/address/${contractAddress}` : deployment.explorerBaseUrl;
