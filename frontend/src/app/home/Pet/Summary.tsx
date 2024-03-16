"use client";

import { useTypingEffect } from "@/utils/useTypingEffect";
import { Pet } from ".";

export interface SummaryProps {
  pet: Pet;
}

export function Summary({ pet }: SummaryProps) {
  let text = `${pet.name} is doing great! 😄`;

  if (pet.energy_points >= 8) {
    text = `${pet.name} needs some exercise, play with them! 🏃`;
  } else if (pet.energy_points >= 6) {
    text = `${pet.name} is doing great! Play with them! 😄`;
  } else if (pet.energy_points >= 4) {
    text = `${pet.name} is getting a little hungry 😕. You should consider feeding them...`;
  } else if (pet.energy_points >= 2) {
    text = `${pet.name} is really hungry 😖. You should feed them as soon as you can...`;
  } else {
    text = `${pet.name} has died. RIP. 🪦`;
  }

  const typedText = useTypingEffect(text);

  return (
    <div className="nes-container is-dark with-title h-[180px]">
      <p className="title">Summary</p>
      <p>{typedText}</p>
    </div>
  );
}
