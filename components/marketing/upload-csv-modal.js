import Link from "next/link";
import Papa from "papaparse";
import { useState } from "react";
import { logger } from "@/lib/utils";
import { toast } from "react-hot-toast";
import { addClients } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";

const UploadCSVModal = ({ onClose }) => {
  const router = useRouter();
  const [CSVData, setCSVData] = useState([]);
  const [waiting, setWaiting] = useState(false);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => {
      const reader = new FileReader();

      reader.onload = () => {
        Papa.parse(reader.result, {
          header: true,
          complete: (results) => {
            try {
              const rawData = results.data;

              let uniqueEmails = {};
              let parsedData = [];

              rawData.forEach((data) => {
                const email = data.email?.trim();
                const list = data.list?.trim();

                if (!email || !list) {
                  return;
                }

                if (!uniqueEmails[email]) {
                  uniqueEmails[email] = true;

                  const subscribedBool = data.subscribed.toLowerCase() === "true" || data.subscribed === "";

                  let parsedDateOfBirth = null;

                  if (data.date_of_birth) {
                    const [day, month, year] = data.date_of_birth.split("/");
                    parsedDateOfBirth = new Date(year, month - 1, day);
                  }

                  let newData = {};

                  Object.keys(data).forEach((key) => {
                    if (data[key] !== "" && key !== "subscribed") {
                      if (key === "date_of_birth") {
                        newData[key] = parsedDateOfBirth;
                      } else if (key === "email") {
                        newData[key] = data[key].toLowerCase();
                      } else if (key === "website") {
                        newData[key] = data[key].toLowerCase();
                      } else {
                        newData[key] = data[key];
                      }
                    }
                  });

                  newData.subscribed = subscribedBool;
                  parsedData.push(newData);
                }
              });

              setCSVData(parsedData);
            } catch (error) {
              toast.error("The CSV could not be parsed.");
            }
          },
          error: (error) => {
            toast.error("The CSV could not be parsed.");
          },
        });
      };

      reader.readAsText(acceptedFiles[0]);
    },
    onDropRejected: (fileRejections) => {
      toast.error(fileRejections[0].errors[0].message);
    },
    accept: {
      "text/csv": [".csv"],
    },
    multiple: false,
    noDrag: true,
  });

  const closeUploadCSVModal = () => {
    setCSVData([]);
    onClose();
  };

  const handleUploadCSVSubmit = async () => {
    try {
      if (CSVData.length === 0) {
        toast.error("Please upload a CSV file first.");
        return;
      }

      setWaiting(true);
      const response = await addClients(CSVData);


      if (response.status === "ERROR") {
        setWaiting(false);
        logger("addClients()", response.message);
        toast.error("Unable to add clients.");
        return;
      }

      toast.success("Clients have been added.");
      setWaiting(false);
      closeUploadCSVModal();
      router.refresh();
    } catch (error) {
      setWaiting(false);
      logger("addClients()", error);
      toast.error("Something went wrong.");
    }
  };

  return (
    <div className="modal fade" id="upload-csv-modal" tabIndex="-1" aria-hidden="true">
      <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Upload CSV</h5>
            <button type="button" className="btn-close" onClick={closeUploadCSVModal}></button>
          </div>
          <div className="modal-body">
            <div className="container">
              <div className="row">
                <div className="col">
                  <form className="dropzone dz-clickable">
                    <div {...getRootProps()}>
                      <input {...getInputProps()} />
                      <p className="mb-0">Click to select a CSV file</p>
                    </div>
                  </form>
                  <p className="mt-3 mb-0">Any duplicates or existing emails will be skipped. {CSVData.length > 0 && "Total of " + CSVData.length + " clients will be added."}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer d-flex justify-content-between">
            <Link className="btn btn-outline-primary" href="https://yyuevjdymcyyjsszdsnv.supabase.co/storage/v1/object/public/ibm/docs/Upload-CSV-Template.csv" download>
              Download template
            </Link>
            <button type="button" disabled={waiting} className="btn btn-primary" onClick={handleUploadCSVSubmit}>
              {waiting ? (
                <div className="spinner-border spinner-border-sm" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              ) : (
                "Save"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadCSVModal;
