// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {Script, console} from "forge-std/Script.sol";
import {Helper} from "../L0/Helper.sol";
import {Oracle} from "../../src/Oracle.sol";

contract DeployOracleAdapter is Script, Helper {
    Oracle public oracle;

    function run() public {
        vm.createSelectFork(vm.rpcUrl("hedera_mainnet"));
        console.log("balance before: ", vm.envAddress("PUBLIC_KEY").balance);
        vm.startBroadcast(vm.envUint("PRIVATE_KEY"));
        oracle = new Oracle(usdc_usd);
        console.log("address public usdc_usd_adapter =", address(oracle), ";");
        oracle = new Oracle(usdt_usd);
        console.log("address public usdt_usd_adapter =", address(oracle), ";");
        oracle = new Oracle(eth_usd);
        console.log("address public eth_usdt_adapter =", address(oracle), ";");
        oracle = new Oracle(btc_usd);
        console.log("address public btc_usdt_adapter =", address(oracle), ";");
        if(block.chainid == 295) {
            oracle = new Oracle(hbar_usd);
            console.log("address public hbar_usdt_adapter =", address(oracle), ";");
        }
        vm.stopBroadcast();
        console.log("balance after: ", vm.envAddress("PUBLIC_KEY").balance);

        (uint80 idRound, uint256 priceAnswer, uint256 startedAt, uint256 updated, uint80 answeredInRound) =
            oracle.latestRoundData();
        console.log("idRound =", idRound);
        console.log("priceAnswer =", priceAnswer);
        console.log("startedAt =", startedAt);
        console.log("updated =", updated);
        console.log("answeredInRound =", answeredInRound);
    }
}
// 29425523810000000000
// RUN
// forge script DeployOracleAdapter --broadcast -vvv --verify --verifier etherscan --etherscan-api-key $ETHERSCAN_API_KEY
// forge script DeployOracleAdapter --broadcast -vvv --verify --verifier sourcify --verifier-url https://server-verify.hashscan.io
// forge script DeployOracleAdapter --broadcast -vvv --skip-simulation --slow
// forge script DeployOracleAdapter --broadcast -vvv
// forge script DeployOracleAdapter -vvv
