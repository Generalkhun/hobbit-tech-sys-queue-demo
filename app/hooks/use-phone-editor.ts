import { useState } from "react";
import { validateContactPhones } from "@/app/data/driver-checkin";

export function usePhoneEditor(
  contactPhones: string[],
  onContactPhonesChange: (phones: string[]) => void,
) {
  const [isEditing, setIsEditing] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [phoneDrafts, setPhoneDrafts] = useState(contactPhones);

  function startEditing(): void {
    setPhoneDrafts(contactPhones);
    setPhoneError("");
    setIsEditing(true);
  }

  function cancelEditing(): void {
    setPhoneDrafts(contactPhones);
    setPhoneError("");
    setIsEditing(false);
  }

  function updateDraft(index: number, value: string): void {
    const nextPhones = [...phoneDrafts];
    nextPhones[index] = value;
    setPhoneDrafts(nextPhones);
    setPhoneError("");
  }

  function removeDraft(index: number): void {
    setPhoneDrafts((current) => current.filter((_, phoneIndex) => phoneIndex !== index));
    setPhoneError("");
  }

  function addDraft(): void {
    setPhoneDrafts((current) => [...current, ""]);
  }

  function save(): void {
    const { phones, error } = validateContactPhones(phoneDrafts);
    if (error) {
      setPhoneError(error);
      return;
    }
    setPhoneError("");
    onContactPhonesChange(phones);
    setIsEditing(false);
  }

  return {
    isEditing,
    phoneError,
    phoneDrafts,
    startEditing,
    cancelEditing,
    updateDraft,
    removeDraft,
    addDraft,
    save,
  };
}

export type PhoneEditor = ReturnType<typeof usePhoneEditor>;
