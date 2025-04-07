"use client";

import * as React from "react";
import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

export default function DeletePage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const searchParams = useSearchParams();
  const region = searchParams.get("region");
  const { name } = React.use(params);

  const [inputText, setInputText] = useState("");
  const [validInput, setValidInput] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const isValidInput = inputText === name;
    setValidInput(isValidInput);
  }, [inputText, name]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputText(value);
    console.log(inputText);
  };

  const handleDelete = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await axios.post(`/api/instances/${name}/delete?region=${region}`);
      router.push(`/`);
    } catch (err) {
      console.error("Error deleting instance:", err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md mt-6">
      <h1 className="font-heading1 text-3xl text-gray-900 mb-10">{name} </h1>
      <p className="font-text1 text-xl pb-4">
        <strong>
          By submitting the following form, this instance will be permanently
          deleted
        </strong>
      </p>
      <form className="mt-6" action="" onSubmit={(e) => handleDelete(e)}>
        <label className="font-text1 text-xl" htmlFor="instance">
          Type the instance name: 
        </label>
        <input className="font-text1 border m-3 rounded-md" type="text" name="instance" onChange={(e) => handleChange(e)} />
        <br></br>
        <button type="submit" disabled={!validInput}>
          {" "}
          Delete{" "}
        </button>
        <button type="button" onClick={() => router.push(`/instances/${name}`)}>
          Cancel
        </button>
      </form>
    </div>
  );
}
