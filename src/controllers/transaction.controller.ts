import { Request, Response } from "express";
import dbConnect from "../config/postgres";
import {
  validateDefixId,
  validateEmail,
  getAddressUser,
  saveTransaction,
} from "../helpers/utils";
import { encrypt, decrypt } from "../helpers/crypto";
import { generateMnemonic } from "bip39";

import {
  createWalletBTC,
  isAddressBTC,
  transactionBTC,
} from "../services/btc.services";
import { transactionETH, transactionTokenETH } from "../services/eth.services";
import { transactionNEAR } from "../services/near.services";
import {
  transactionTRON,
  transactionTokenTRON,
} from "../services/tron.services";
import { transactionBNB, transactionTokenBNB } from "../services/bsc.services";

import { Wallet } from "../interfaces/wallet.interface";
import { Credential } from "../interfaces/credential.interface";
import { EnvioCorreo, getEmailFlagFN } from "../helpers/mail";
import { Frequent } from "../entities/frequent.entity";
import { User } from "../entities/user.entity";
import { Transaction } from "../entities/transaction.entity";
import { validation2FA } from "../helpers/2fa";

async function transaction(req: Request, res: Response) {
  try {
    const { fromDefix, pkEncrypt, toDefix, coin, amount, blockchain, code } =
      req.body;
    let transactionHash, fromAddress, toAddress, tipoEnvio;

    const privateKey = decrypt(pkEncrypt);

    if (
      !fromDefix ||
      !privateKey ||
      !toDefix ||
      !coin ||
      !amount ||
      !blockchain
    )
      return res.status(400).send();

    if (fromDefix.includes(".defix3")) {
      fromAddress = await getAddressUser(fromDefix, blockchain);
    } else {
      fromAddress = fromDefix;
    }

    if (toDefix.includes(".defix3")) {
      toAddress = await getAddressUser(toDefix, blockchain);
      tipoEnvio = "user";
    } else {
      toAddress = toDefix;
      tipoEnvio = "wallet";
    }

    if (!fromAddress || !toAddress) return res.status(400).send();

    const srcContract = await getTokenContract(coin, blockchain);

    if (!(await validation2FA(fromDefix, code))) return res.status(401).send();

    if (blockchain === "BTC") {
      transactionHash = await transactionBTC(
        fromAddress,
        privateKey,
        toAddress,
        coin,
        amount
      );
    } else if (blockchain === "NEAR") {
      transactionHash = await transactionNEAR(
        fromAddress,
        privateKey,
        toAddress,
        coin,
        amount
      );
    } else if (blockchain === "ETH") {
      if (coin == "ETH" && !srcContract) {
        transactionHash = await transactionETH(
          fromAddress,
          privateKey,
          toAddress,
          coin,
          amount
        );
      } else {
        transactionHash = await transactionTokenETH(
          fromAddress,
          privateKey,
          toAddress,
          amount,
          srcContract
        );
      }
    } else if (blockchain === "TRX") {
      if (coin == "TRX" && !srcContract) {
        transactionHash = await transactionTRON(
          fromAddress,
          privateKey,
          toAddress,
          coin,
          amount
        );
      } else {
        transactionHash = await transactionTokenTRON(
          fromAddress,
          privateKey,
          toAddress,
          amount,
          srcContract
        );
      }
    } else if (blockchain === "BNB") {
      if (coin == "BNB" && !srcContract) {
        transactionHash = await transactionBNB(
          fromAddress,
          privateKey,
          toAddress,
          coin,
          amount
        );
      } else {
        transactionHash = await transactionTokenBNB(
          fromAddress,
          privateKey,
          toAddress,
          amount,
          srcContract
        );
      }
    } else {
      transactionHash = false;
    }

    if (!transactionHash) return res.status(500).send();

    const resSend = await getEmailFlagFN(fromDefix, "SEND");
    const resReceive = await getEmailFlagFN(toDefix, "RECEIVE");
    const item = {
      monto: amount,
      moneda: coin,
      receptor: toDefix,
      emisor: fromDefix,
      tipoEnvio: tipoEnvio,
    };
    EnvioCorreo(resSend, resReceive, "envio", item);

    const transaction = await saveTransaction(
      fromDefix,
      toDefix,
      coin,
      blockchain,
      amount,
      fromAddress,
      toAddress,
      transactionHash as string,
      "TRANSFER"
    );
    await saveFrequent(fromDefix, toDefix);
    return res.send(transaction);
  } catch (error) {
    return res.status(500).send();
  }
}

async function saveFrequent(defixId: string, frequentUser: string) {
  try {
    const userFrequent = await Frequent.findOneBy({
      user: { defix_id: defixId },
      frequent_user: frequentUser,
    });
    if (userFrequent) return false;

    const user = await User.findOneBy({ defix_id: defixId });
    if (!user) return false;

    const frequent = new Frequent();
    frequent.user = user;
    frequent.frequent_user = frequentUser;
    frequent.save();
    return true;
  } catch (error) {
    return false;
  }
}

async function getFrequent(req: Request, res: Response) {
  try {
    const { defixId } = req.body;
    const frequents = await Frequent.find({
      where: { user: { defix_id: defixId } },
    });
    res.send(frequents);
  } catch (error) {
    return false;
  }
}

async function deleteFrequent(req: Request, res: Response) {
  try {
    const { id_frequent } = req.body;
    const result = await Frequent.delete({ id: id_frequent });
    if (result.affected === 0) return res.status(404).send();

    return res.status(204).send();
  } catch (error) {
    res.status(404).json(error);
  }
}

const getTransactionHistory = async (req: Request, res: Response) => {
  try {
    const { defixId, coin, blockchain, date_year, date_month, tipo } = req.body;

    const transactions = await (
      await Transaction.find({
        where: {
          coin: coin ? coin : undefined,
          blockchain: blockchain ? blockchain : undefined,
          date_year: date_year ? date_year : undefined,
          date_month: date_month ? date_month : undefined,
          tipo: tipo ? tipo : undefined,
        },
      })
    ).filter(function (element) {
      return element.from_defix === defixId || element.to_defix === defixId;
    });

    res.send(transactions);

    // const conexion = await dbConnect()

    // const resultados = await conexion.query("select * \
    //                                           from transactions where \
    //                                           ((from_defix = $1 or to_defix = $1) or ('%' = $1 or '%' = $1))\
    //                                           and (coin = $2 or '%' = $2)\
    //                                           and (date_year = $3 or '%' = $3)\
    //                                           and (date_month = $4 or '%' = $4)\
    //                                           and (tipo = $5 or '%' = $5)\
    //                                           ", [defixId, coin, date_year, date_month, tipo])
    // res.json(resultados.rows)
  } catch (error) {
    return res.status(500).send();
  }
};

const getTokenContract = async (token: string, blockchain: string) => {
  try {
    const conexion = await dbConnect();
    const response = await conexion.query(
      "SELECT *\
                                          FROM backend_token a\
                                          inner join backend_cryptocurrency b on b.id = a.cryptocurrency_id\
                                          where a.coin = $1 and b.coin = $2",
      [token, blockchain]
    );

    if (response.rows.length === 0) return false;
    console.log(response.rows);
    return response.rows[0];
  } catch (error) {
    return false;
  }
};

export { transaction, getTransactionHistory, getFrequent, deleteFrequent };
