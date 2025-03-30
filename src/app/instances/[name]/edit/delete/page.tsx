"use client"

import * as React from 'react';
import {
  useState,
  useEffect,
  ChangeEvent,
  FormEvent
} from 'react';
import { useRouter } from "next/navigation";
import axios from 'axios';

interface Params {
  name: string;
}
interface DeletePageParams {
  params: Promise<Params>;
}

export default function DeletePage({ params }: DeletePageParams) {
  const { name } = React.use(params);
  const [inputText, setInputText] = useState("");
  const [validInput, setValidInput] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const isValidInput = inputText === name;
    setValidInput(isValidInput);
  }, [inputText, name])

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputText(value);
    console.log(inputText);
  }

  const handleDelete = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await axios.post(`/api/instances/${name}/delete`);
      router.push(`/`);
    } catch (err) {
      console.error("Error deleting instance:", err);
    }
  }

  return (
    <>
      <h1>{name} </h1>
      <p><strong>By submitting the following form, this instance will be permanently deleted</strong></p >
      <form action="" onSubmit={(e) => handleDelete(e)
      }>
        <label htmlFor='instance' > Type the instance name: </label>
        < input type="text" name="instance" onChange={(e) => handleChange(e)} />
        < button type="submit" disabled={!validInput}> Delete </button>
        < button type="button" onClick={() => router.push(`/instances/${name}`)}>
          Cancel
        </button>
      </form >
    </>
  )
}
