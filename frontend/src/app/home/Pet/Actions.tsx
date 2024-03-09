"use client";

import { Dispatch, SetStateAction, useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Pet } from ".";
import { getAptosClient } from "@/utils/aptosClient";
import {
  NEXT_PUBLIC_CONTRACT_ADDRESS,
  NEXT_PUBLIC_ENERGY_CAP,
  NEXT_PUBLIC_ENERGY_DECREASE,
  NEXT_PUBLIC_ENERGY_INCREASE,
} from "@/utils/env";

const aptosClient = getAptosClient();

export type PetAction = "feed" | "play";

export interface ActionsProps {
  pet: Pet;
  selectedAction: PetAction;
  setSelectedAction: (action: PetAction) => void;
  setPet: Dispatch<SetStateAction<Pet | undefined>>;
}

/**
 * Actions コンポーネント
 * @param param0 
 * @returns 
 */
export function Actions({
  selectedAction,
  setSelectedAction,
  setPet,
  pet,
}: ActionsProps) {
  const [transactionInProgress, setTransactionInProgress] =
    useState<boolean>(false);
  const { account, network, signAndSubmitTransaction } = useWallet();

  const handleStart = () => {
    switch (selectedAction) {
      case "feed":
        handleFeed();
        break;
      case "play":
        handlePlay();
        break;
    }
  };

  /**
   * Feed ボタンを押した時の処理
   * @returns 
   */
  const handleFeed = async () => {
    if (!account || !network) return;

    setTransactionInProgress(true);

    try {
      // feedメソッドを呼び出す。
      const response = await signAndSubmitTransaction({
        sender: account.address,
        data: {
          function: `${NEXT_PUBLIC_CONTRACT_ADDRESS}::main::feed`,
          typeArguments: [],
          functionArguments: [NEXT_PUBLIC_ENERGY_INCREASE],
        },
      });
      await aptosClient.waitForTransaction({ transactionHash: response.hash });

      setPet((pet) => {
        if (!pet) return pet;
        if (
          pet.energy_points + Number(NEXT_PUBLIC_ENERGY_INCREASE) >
          Number(NEXT_PUBLIC_ENERGY_CAP)
        )
          return pet;

        return {
          ...pet,
          energy_points:
            pet.energy_points + Number(NEXT_PUBLIC_ENERGY_INCREASE),
        };
      });
    } catch (error: any) {
      console.error(error);
    } finally {
      setTransactionInProgress(false);
    }
  };

  /**
   * Playボタンを押した時の処理
   * @returns 
   */
  const handlePlay = async () => {
    if (!account || !network) return;

    setTransactionInProgress(true);

    try {
      // スマートコントラクトのplayメソッドを呼び出す
      const response = await signAndSubmitTransaction({
        sender: account.address,
        data: {
          function: `${NEXT_PUBLIC_CONTRACT_ADDRESS}::main::play`,
          typeArguments: [],
          functionArguments: [NEXT_PUBLIC_ENERGY_DECREASE],
        },
      });
      await aptosClient.waitForTransaction({
        transactionHash: response.hash,
      });

      setPet((pet) => {
        if (!pet) return pet;
        if (pet.energy_points <= Number(NEXT_PUBLIC_ENERGY_DECREASE))
          return pet;

        return {
          ...pet,
          energy_points:
            pet.energy_points - Number(NEXT_PUBLIC_ENERGY_DECREASE),
        };
      });
    } catch (error: any) {
      console.error(error);
    } finally {
      setTransactionInProgress(false);
    }
  };

  const feedDisabled =
    selectedAction === "feed" &&
    pet.energy_points === Number(NEXT_PUBLIC_ENERGY_CAP);
  const playDisabled =
    selectedAction === "play" && pet.energy_points === Number(0);

  return (
    <div className="nes-container with-title flex-1 bg-white h-[320px]">
      <p className="title">Actions</p>
      <div className="flex flex-col gap-2 justify-between h-full">
        <div className="flex flex-col flex-shrink-0 gap-2 border-b border-gray-300">
          <label>
            <input
              type="radio"
              className="nes-radio"
              name="action"
              checked={selectedAction === "play"}
              onChange={() => setSelectedAction("play")}
            />
            <span>Play</span>
          </label>
          <label>
            <input
              type="radio"
              className="nes-radio"
              name="action"
              checked={selectedAction === "feed"}
              onChange={() => setSelectedAction("feed")}
            />
            <span>Feed</span>
          </label>
        </div>
        <div className="flex flex-col gap-4 justify-between">
          <p>{actionDescriptions[selectedAction]}</p>
          <button
            type="button"
            className={`nes-btn is-success ${
              feedDisabled || playDisabled ? "is-disabled" : ""
            }`}
            onClick={handleStart}
            disabled={transactionInProgress || feedDisabled || playDisabled}
          >
            {transactionInProgress ? "Processing..." : "Start"}
          </button>
        </div>
      </div>
    </div>
  );
}

const actionDescriptions: Record<PetAction, string> = {
  feed: "Feeding your pet will boost its Energy Points...",
  play: "Playing with your pet will make it happy and consume its Energy Points...",
};
