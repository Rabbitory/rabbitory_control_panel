"use client";

import * as React from "react";
import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

import { useInstanceContext } from "../../InstanceContext";
import { useNotificationsContext } from "@/app/NotificationContext";

import Link from "next/link";

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
    if (!instance || !instance.name || !instance.id || !instance.region) return;

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
        {
          instanceId: instance.id,
          instanceName: instance.name,
          region: instance.region,
        },
      );
      return true;
    } catch (err) {
      console.error("Error deleting instance:", err);
      return false;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-card text-pagetext1 shadow-md mt-6">
      <h1 className="font-heading1 text-2xl text-headertext1 mb-10">
        {instance?.name}{" "}
      </h1>
      <p className="font-text1 text-md pb-4">
        <strong>
          By submitting the following form, this instance will be permanently
          deleted
        </strong>
      </p>

      <form
        className="mt-6"
        action=""
        onSubmit={(e) => {
          const success = handleDelete(e);
          if (!success) {
            alert("Failed to delete instance");
          } else router.push(`/`);
        }}
      >
        <label
          className="font-text1 text-headertext1 text-md"
          htmlFor="instance"
        >
          Type the instance name:
        </label>
        <input
          className="font-text1 border m-3 rounded-sm focus:text-btnhover1"
          type="text"
          name="instance"
          onChange={(e) => handleChange(e)}
        />
        <div className="font-heading1 flex justify-end gap-4 mt-6">
          <Link
            href="/"
            className="px-4 py-2 bg-mainbg1 text-headertext1 rounded-sm text-center hover:bg-mainbghover"
          >
            Cancel
          </Link>
          <button
            className="px-4 py-2 bg-btn1 hover:bg-btnhover1 text-mainbg1 font-semibold rounded-sm"
            type="submit"
            disabled={!validInput || formPending()}
          >
            {formPending() ? "Deleting..." : "Delete"}
          </button>
        </div>
      </form>
    </div>
  );
}
