import splitrixContract from "./Splitrix.arc56.json";
import algosdk from "algosdk";

export const splitrixAbi = new algosdk.ABIContract(splitrixContract);
