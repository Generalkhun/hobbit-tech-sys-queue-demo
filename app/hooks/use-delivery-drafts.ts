"use client";

import { useCallback, useState } from "react";
import { bookingToViewDraft, canCreateDeliveryNote, createDeliveryDraft } from "@/app/data/delivery-drafts";
import type {
  DeliveryDraft,
  DemoUser,
  DriverRecord,
  QueueBooking,
} from "@/app/types/queue";

export function useDeliveryDrafts({
  user,
  drivers,
  bookings,
  openBookingPage,
}: {
  user: DemoUser | null;
  drivers: DriverRecord[];
  bookings: QueueBooking[];
  openBookingPage: () => void;
}) {
  const [drafts, setDrafts] = useState<DeliveryDraft[]>([]);
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);
  const [viewBookingId, setViewBookingId] = useState<string | null>(null);

  const updateDraft = useCallback((updated: DeliveryDraft) => {
    setDrafts((current) =>
      current.map((draft) => (draft.id === updated.id ? updated : draft)),
    );
  }, []);

  const completeDraft = useCallback((draftId: string) => {
    setDrafts((current) => current.filter((draft) => draft.id !== draftId));
  }, []);

  function startNewDraft() {
    if (!user || !canCreateDeliveryNote(user)) return;
    const draft = createDeliveryDraft(user, drivers);
    setDrafts((current) => [draft, ...current]);
    setActiveDraftId(draft.id);
    setViewBookingId(null);
    openBookingPage();
  }

  function editDraft(draft: DeliveryDraft) {
    setActiveDraftId(draft.id);
    setViewBookingId(null);
    openBookingPage();
  }

  function viewBooking(booking: QueueBooking) {
    setActiveDraftId(null);
    setViewBookingId(booking.id);
    openBookingPage();
  }

  const closeForm = useCallback(() => {
    setActiveDraftId(null);
    setViewBookingId(null);
  }, []);

  function returnToList() {
    closeForm();
    openBookingPage();
  }

  const activeDraft = drafts.find((draft) => draft.id === activeDraftId);
  const viewedBooking = bookings.find((booking) => booking.id === viewBookingId);
  const formDraft =
    activeDraft ?? (viewedBooking ? bookingToViewDraft(viewedBooking) : null);

  return {
    drafts,
    formDraft,
    viewedBooking,
    startNewDraft,
    editDraft,
    viewBooking,
    returnToList,
    closeForm,
    updateDraft,
    completeDraft,
  };
}
