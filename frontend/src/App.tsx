import { useState } from "react";
import "./App.css";
import { uploadFile } from "./services/upload";
import { Toaster, toast } from "sonner";
import { Data } from "./types";
import Search from './components/Search';

const APP_STATUS = {
  IDLE: "idle",
  ERROR: "error",
  READY_UPLOAD: "ready_upload",
  UPLOADING: "uploading",
  READY_USAGE: "ready_usage",
} as const;

const BUTTON_TEXT = {
  [APP_STATUS.IDLE]: "Upload",
  [APP_STATUS.READY_UPLOAD]: "Upload",
  [APP_STATUS.UPLOADING]: "Uploading...",
  [APP_STATUS.READY_USAGE]: "Upload",
  [APP_STATUS.ERROR]: "Upload",
} as const;

type APPStatusType = (typeof APP_STATUS)[keyof typeof APP_STATUS];

function App() {
  const [appStatus, setAppStatus] = useState<APPStatusType>(APP_STATUS.IDLE);
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<Data>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [file] = e.target.files ?? [];
    if (file) {
      setFile(file);
      setAppStatus(APP_STATUS.READY_UPLOAD);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("handleSubmit");
    if (appStatus !== APP_STATUS.READY_UPLOAD || !file) return;

    setAppStatus(APP_STATUS.UPLOADING);

    const [error, newData] = await uploadFile(file);
    if (error) {
      setAppStatus(APP_STATUS.ERROR);
      toast.error(error.message);
      return;
    }
    if (newData) setData(newData);
    setAppStatus(APP_STATUS.READY_USAGE);
    toast.success("File uploaded successfully");
    console.log("Data", newData);
  };

  const showButton = appStatus !== APP_STATUS.IDLE;
  const showInput = appStatus !== APP_STATUS.READY_USAGE;

  return (
    <>
      <Toaster />
      <h2>Challenge: Upload CSV + Search</h2>
      {showInput && (
        <form onSubmit={handleSubmit}>
          <label>
            <input
              disabled={appStatus === APP_STATUS.UPLOADING}
              name="file"
              type="file"
              accept=".csv"
              onChange={handleInputChange}
            />
          </label>
          {showButton && (
            <button type="submit" disabled={appStatus === APP_STATUS.UPLOADING}>
              {BUTTON_TEXT[appStatus]}
            </button>
          )}
        </form>
      )}
      {
        appStatus === APP_STATUS.READY_USAGE && (
         <Search initialData={data} />
        )
      }
    </>
  );
}

export default App;
