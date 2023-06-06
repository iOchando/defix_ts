import { Request, Response } from "express";
import dbConnect from "../config/postgres";
import { validateDefixId, getCryptosFn } from "../helpers/utils";

import { getBalanceBTC, getBalanceBTC_Cypher } from "../services/btc.services";
import { getBalanceETH, getBalanceTokenETH } from "../services/eth.services";
import { getBalanceNEAR, getBalanceTokenNEAR } from "../services/near.services";
import { getBalanceTRON, getBalanceTokenTRON } from "../services/tron.services";
import { getBalanceBNB, getBalanceTokenBSC } from "../services/bsc.services";

import { Wallet } from "../interfaces/wallet.interface";
import { Credential } from "../interfaces/credential.interface";
import { BalanceCrypto } from "../interfaces/balance_crypto.interface";
import { Balance } from "../interfaces/balance.interface";
import { User } from "../entities/user.entity";
import { Address } from "../entities/addresses.entity";
import { Balances } from "../entities/balances.entity";

const NETWORK = process.env.NETWORK;

const getCryptos = async (req: Request, res: Response) => {
  try {
    const conexion = await dbConnect();
    const cryptocurrencys = await conexion.query(
      "select * from backend_cryptocurrency"
    );

    const cryptos = [];

    for (let cryptocurrency of cryptocurrencys.rows) {
      const tokens = await conexion.query(
        "select * from backend_token where cryptocurrency_id = $1",
        [cryptocurrency.id]
      );
      cryptocurrency.tokens = tokens.rows;
      cryptos.push(cryptocurrency);
    }

    res.send(cryptos);
  } catch (error) {
    // console.log(error)
    res.status(400).send();
  }
};

const getCryptosSwap = async (req: Request, res: Response) => {
  try {
    const conexion = await dbConnect();
    const cryptocurrencys = await conexion.query(
      "select * from backend_cryptocurrency where swap=true"
    );

    const cryptos = [];

    for (let cryptocurrency of cryptocurrencys.rows) {
      const tokens = await conexion.query(
        "select * from backend_token where cryptocurrency_id = $1",
        [cryptocurrency.id]
      );
      cryptocurrency.tokens = tokens.rows;
      cryptos.push(cryptocurrency);
    }

    res.send(cryptos);
  } catch (error) {
    // console.log(error)
    res.status(400).send();
  }
};

const getBalance = async (req: Request, res: Response) => {
  try {
    const { defixId } = req.body;

    const addresses = await Address.find({
      where: { user: { defix_id: defixId } },
    });

    if (addresses.length === 0) return res.status(404).send();

    const cryptos = await getCryptosFn();

    const balances: BalanceCrypto[] = [];

    for (let crypto of cryptos) {
      const balanceCrypto: BalanceCrypto = {
        coin: crypto.coin,
        blockchain: crypto.blockchain,
        icon: crypto.icon,
        balance: 0,
        tokens: [],
      };

      const addressItem = addresses.find(
        (element) => element.name === crypto.coin
      );

      if (!addressItem) return res.status(404).send();

      const address = addressItem.address || "";

      switch (crypto.coin) {
        case "BTC": {
          if (NETWORK === "mainnet") {
            balanceCrypto.balance = await getBalanceBTC(address);
          } else {
            balanceCrypto.balance = await getBalanceBTC_Cypher(address);
          }
          break;
        }
        case "ETH": {
          balanceCrypto.balance = await getBalanceETH(address);
          for (let token of crypto.tokens) {
            const itemToken: Balance = {
              coin: token.coin,
              balance: 0,
              icon: token.icon,
            };

            itemToken.balance = await getBalanceTokenETH(
              address,
              token.contract,
              token.decimals
            );

            balanceCrypto.tokens.push(itemToken);
          }
          break;
        }
        case "NEAR": {
          balanceCrypto.balance = await getBalanceNEAR(address);
          for (let token of crypto.tokens) {
            const itemToken: Balance = {
              coin: token.coin,
              balance: 0,
              icon: token.icon,
            };

            itemToken.balance = await getBalanceTokenNEAR(
              address,
              token.contract,
              token.decimals
            );

            balanceCrypto.tokens.push(itemToken);
          }
          break;
        }
        case "BNB": {
          if (!address) {
            balanceCrypto.balance = 0;
            break;
          }
          balanceCrypto.balance = await getBalanceBNB(address);
          for (let token of crypto.tokens) {
            const itemToken: Balance = {
              coin: token.coin,
              balance: 0,
              icon: token.icon,
            };

            itemToken.balance = await getBalanceTokenBSC(
              address,
              token.contract,
              token.decimals
            );

            balanceCrypto.tokens.push(itemToken);
          }
          break;
        }
        case "TRX": {
          if (!address) {
            balanceCrypto.balance = 0;
            break;
          }
          balanceCrypto.balance = await getBalanceTRON(address);
          for (let token of crypto.tokens) {
            const itemToken: Balance = {
              coin: token.coin,
              balance: 0,
              icon: token.icon,
            };

            itemToken.balance = await getBalanceTokenTRON(
              address,
              token.contract,
              token.decimals
            );

            balanceCrypto.tokens.push(itemToken);
          }
          break;
        }
        default: {
          //statements;
          break;
        }
      }
      balances.push(balanceCrypto);
    }

    res.send(balances);

    balanceDataBaseFn(defixId, balances);
  } catch (error) {
    res.status(404).send();
  }
};

// UTILS

const balanceDataBaseFn = async (
  defixId: string,
  balances: BalanceCrypto[]
) => {
  try {
    const user = await User.findOneBy({ defix_id: defixId });
    if (!user) return false;

    for (let balance of balances) {
      const balanceItem = await Balances.findOneBy({
        user: { defix_id: defixId },
        blockchain: balance.blockchain,
        coin: balance.coin,
      });

      if (!balanceItem) {
        await Balances.create({
          user: user,
          blockchain: balance.blockchain,
          coin: balance.coin,
          balance: balance.balance,
        }).save();
      } else {
        const update = await Balances.findOneBy({
          user: { defix_id: defixId },
          blockchain: balance.blockchain,
          coin: balance.coin,
        });
        if (!update) break;
        update.balance = balance.balance;
        update.save();
      }

      for (let token of balance.tokens) {
        const balanceToken = await Balances.findOneBy({
          user: { id: user.id },
          blockchain: balance.blockchain,
          coin: token.coin,
        });

        if (!balanceToken) {
          await Balances.create({
            user: user,
            blockchain: balance.blockchain,
            coin: token.coin,
            balance: token.balance,
          }).save();
        } else {
          const update = await Balances.findOneBy({
            user: { defix_id: defixId },
            blockchain: balance.blockchain,
            coin: token.coin,
          });
          if (!update) break;
          update.balance = token.balance;
          update.save();
        }
      }
    }
  } catch (error) {
    console.log(error);
  }
};

export { getCryptos, getBalance, getCryptosSwap };
