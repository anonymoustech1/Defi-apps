import { ethers } from "ethers";

export const toWei = (num) => ethers.parseEther(num.toString());
export const fromWei = (num) => ethers.formatEther(num);
export const delay = (ms) => new Promise((res) => setTimeout(res, ms));