"use client";

import * as React from "react";
import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useInstanceContext } from "../../InstanceContext";
import { useNotificationsContext } from "@/app/NotificationContext";

export default function DeletePage() {
  const { instance } = useInstanceContext();
  const { addNotification, formPending } = useNotificationsContext();

  const [inputText, setInputText] = useState("");
  const [validInput, setValidInput] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const isValidInput = inputText === instance?.name;
    setValidInput(isValidInput);
  }, [inputText, instance?.name]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputText(value);
  };

  const handleDelete = async (e: FormEvent<HTMLFormElement>) => {
    if (!instance || !instance.name) return;

    e.preventDefault();
    addNotification({
      type: "deleteInstance",
      status: "pending",
      instanceName: instance.name,
      path: "instances",
      message: `Deleting ${instance.name}`,
    });
    try {
      await axios.post(
        `/api/instances/${instance.name}/delete?region=${instance.region}`,
      );
      router.push(`/`);
    } catch (err) {
      console.error("Error deleting instance:", err);
    }
  };

  return (
    <>
      <h1>{instance?.name} </h1>
      <p>
        <strong>
          By submitting the following form, this instance will be permanently
          deleted
        </strong>
      </p>
      <form action="" onSubmit={(e) => handleDelete(e)}>
        <label htmlFor="instance"> Type the instance name: </label>
        <input type="text" name="instance" onChange={(e) => handleChange(e)} />
        <button type="submit" disabled={!validInput || formPending()}>
          {formPending() ? "Deleting..." : "Delete"}
        </button>
        <button
          type="button"
          onClick={() => router.push(`/instances/${instance?.name}`)}
        >
          Cancel
        </button>
      </form>
    </>
  );
}
