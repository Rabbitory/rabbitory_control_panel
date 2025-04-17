import { useState } from "react";
import SubmissionSpinner from "../components/SubmissionSpinner";
import { Instance } from "../types/instance";

interface DeleteInstanceModalProps {
  selectedInstance: Instance;
  onClose: () => void;
  handleDelete: () => void;
  isDeleting: boolean;
}

export default function DeleteInstanceModal({
  selectedInstance,
  onClose,
  handleDelete,
  isDeleting,
}: DeleteInstanceModalProps) {
  const [inputText, setInputText] = useState("");

  return (
    <div className="fixed inset-0 backdrop-blur-xs bg-white/5 flex justify-center items-center z-50">
      <div className="bg-card text-pagetext1 p-6 rounded-md shadow-lg w-full max-w-md">
        <h2 className="font-heading1 text-xl text-headertext1 mb-4">
          Delete {selectedInstance.name}?
        </h2>
        <p className="font-text1 text-sm text-red-300 mb-6">
          Deleting this instance is permanent and will result in the loss of
          all data stored on it. This action cannot be undone.
        </p>
        <p className="font-text1 text-sm mb-2">
          Type <strong>{selectedInstance.name}</strong> to confirm deletion.
        </p>
        <input
          className="w-full p-2 border rounded-sm font-text1 text-btnhover1 border-pagetext1 focus:outline-none"
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        <div className="flex justify-end mt-6 gap-4">
          <button
            className="px-4 py-2 bg-card border border-btn1 text-btn1 rounded-sm hover:shadow-[0_0_8px_#87d9da]"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-btn1 text-mainbg1 font-semibold rounded-sm hover:bg-btnhover1 hover:shadow-[0_0_10px_#87d9da]"
            onClick={handleDelete}
            disabled={inputText !== selectedInstance.name || isDeleting}
          >
            {isDeleting ? (
              <span className="flex items-center gap-2">
                <SubmissionSpinner />
                Deleting ...
              </span>
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </div>
    </div>

  )
}
